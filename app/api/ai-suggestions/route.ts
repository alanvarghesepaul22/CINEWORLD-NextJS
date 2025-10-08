/**
 * AI Suggestions API Route - Movie/Series recommendation service
 * Generates personalized movie and series suggestions using AI
 */

import { NextResponse } from "next/server";
import {
  getGeminiService,
  type AISuggestionResponse,
} from "@/lib/geminiService";
import { createClient, RedisClientType } from "redis";
import { isIP } from "net";

// Rate limiting configuration
const RATE_LIMIT_REQUESTS = 5; // 5 requests per hour for suggestions
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

// CORS configuration
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',').map(origin => origin.trim()) || [];
const isDevelopment = process.env.NODE_ENV === 'development';

// ⚠️ WARNING: In-memory store is ONLY for local development!
// In production, this breaks in serverless (per-instance memory) and causes memory leaks.
// Use Redis, Vercel KV, or database for production deployments.
// Global flags to prevent duplicate signal handler registration during development hot reloads
declare global {
  var __aiSuggestionsDevCleanupRegistered: boolean | undefined;
  var __aiSuggestionsRedisShutdownRegistered: boolean | undefined;
}

interface MemoryRateLimitEntry {
  count: number;
  resetTime: number;
  lastAccess: number;
}

class DevelopmentRateLimitStore {
  private store = new Map<string, MemoryRateLimitEntry>();
  private readonly maxEntries = 1000; // Prevent unbounded growth
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Start cleanup interval for development
    if (
      typeof process !== "undefined" &&
      process.env.NODE_ENV !== "production"
    ) {
      this.startCleanup();
    }
  }

  private startCleanup() {
    // Clean expired entries every 15 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 15 * 60 * 1000);

    // Guard against duplicate signal handler registration during hot reloads
    if (!global.__aiSuggestionsDevCleanupRegistered) {
      // Cleanup on process termination
      process.on("SIGTERM", () => this.stopCleanup());
      process.on("SIGINT", () => this.stopCleanup());
      
      // Mark development cleanup handlers as registered to prevent duplicates
      global.__aiSuggestionsDevCleanupRegistered = true;
    }
  }

  private stopCleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    
    // Reset the flag so handlers can be re-registered if needed
    // Note: We don't remove the actual event listeners here since they may be shared
    // The flag just prevents duplicate registrations during hot reloads
  }

  private cleanup() {
    const now = Date.now();
    let deletedCount = 0;

    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key);
        deletedCount++;
      }
    }

    console.log(
      `[DEV] Rate limit cleanup: removed ${deletedCount} expired entries`
    );
  }

  private evictLRU() {
    if (this.store.size <= this.maxEntries) return;

    // Find least recently accessed entry
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.store.entries()) {
      if (entry.lastAccess < oldestTime) {
        oldestTime = entry.lastAccess;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.store.delete(oldestKey);
      console.log(
        `[DEV] Rate limit eviction: removed LRU entry for ${oldestKey}`
      );
    }
  }

  get(key: string): MemoryRateLimitEntry | undefined {
    const entry = this.store.get(key);
    if (entry) {
      entry.lastAccess = Date.now();
    }
    return entry;
  }

  set(key: string, value: Omit<MemoryRateLimitEntry, "lastAccess">) {
    this.evictLRU(); // Ensure we don't exceed max entries

    this.store.set(key, {
      ...value,
      lastAccess: Date.now(),
    });
  }
}

// Development-only store with proper memory management
const devRateLimitStore = new DevelopmentRateLimitStore();

/**
 * Redis connection management for distributed rate limiting
 * Implements connection pooling and retry logic
 */
class RedisRateLimitManager {
  private client: RedisClientType | null = null;
  private isConnecting = false;
  private connectionPromise: Promise<RedisClientType> | null = null;

  private async createConnection(): Promise<RedisClientType> {
    const redisUrl = process.env.REDIS_URL;

    if (!redisUrl) {
      throw new Error(
        "Redis connection URL not configured. Set REDIS_URL or KV_URL environment variable."
      );
    }

    const client = createClient({
      url: redisUrl,
      socket: {
        connectTimeout: 5000,
        reconnectStrategy: (retries) => {
          if (retries >= 3) {
            console.error("[Redis] Max reconnection attempts reached");
            return false;
          }
          // Exponential backoff: 500ms, 1s, 2s
          return Math.min(retries * 500, 2000);
        },
      },
      // Use database 0 for rate limiting
      database: 0,
    });

    // Error handling
    client.on("error", (err) => {
      console.error("[Redis] Connection error:", {
        message: err.message,
        name: err.name,
        timestamp: new Date().toISOString(),
      });
    });

    client.on("connect", () => {
      console.log("[Redis] Connected successfully");
    });

    client.on("reconnecting", () => {
      console.log("[Redis] Attempting to reconnect...");
    });

    await client.connect();
    return client as RedisClientType;
  }

  private async getClient(): Promise<RedisClientType> {
    if (this.client && this.client.isOpen) {
      return this.client;
    }

    if (this.isConnecting && this.connectionPromise) {
      return this.connectionPromise;
    }

    this.isConnecting = true;
    this.connectionPromise = this.createConnection();

    try {
      this.client = await this.connectionPromise;
      return this.client;
    } finally {
      this.isConnecting = false;
      this.connectionPromise = null;
    }
  }

  /**
   * Implement sliding window rate limiting using Redis Lua script
   * Atomic operation prevents race conditions
   */
  async checkRateLimit(
    key: string,
    limit: number,
    windowMs: number
  ): Promise<{
    allowed: boolean;
    remainingRequests?: number;
    resetTime?: number;
  }> {
    try {
      const client = await this.getClient();

      // Optimized Lua script for atomic sliding window rate limiting with batched operations
      const luaScript = `
        local key = KEYS[1]
        local limit = tonumber(ARGV[1])
        local window = tonumber(ARGV[2])
        local now = tonumber(ARGV[3])
        local expireTime = tonumber(ARGV[4])
        
        -- Remove expired entries in one operation
        redis.call('ZREMRANGEBYSCORE', key, '-inf', now - window)
        
        -- Count current requests in window
        local current = redis.call('ZCARD', key)
        
        if current < limit then
          -- Add current request with unique timestamp-based score
          -- Use atomic counter to guarantee uniqueness
          local score = now
          local member = now .. ':' .. redis.call('INCR', key .. ':counter')
          redis.call('ZADD', key, score, member)

          -- Set TTL on counter key to prevent memory leak
          redis.call('EXPIRE', key .. ':counter', expireTime)

          -- Set TTL efficiently (only if key is new or TTL is low)
          local ttl = redis.call('TTL', key)          
          -- Set TTL efficiently (only if key is new or TTL is low)
          local ttl = redis.call('TTL', key)
          if ttl < expireTime / 2 then
            redis.call('EXPIRE', key, expireTime)
          end
          
          -- Return success with remaining requests and accurate reset time
          local oldestScore = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
          local resetTime = now + window
          if #oldestScore > 0 then
            resetTime = oldestScore[2] + window
          end
          
          return {1, limit - current - 1, resetTime}
        else
          -- Rate limit exceeded - calculate accurate reset time
          local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
          local resetTime = now + window
          if #oldest > 0 then
            resetTime = oldest[2] + window
          end
          
          return {0, 0, resetTime}
        end
      `;
      const now = Date.now();
      const expireTimeSeconds = Math.ceil(windowMs / 1000) + 60; // Add buffer for safety

      const result = (await client.eval(luaScript, {
        keys: [`rate_limit:ai_suggestions:${key}`],
        arguments: [
          limit.toString(),
          windowMs.toString(),
          now.toString(),
          expireTimeSeconds.toString(),
        ],
      })) as [number, number, number];

      return {
        allowed: result[0] === 1,
        remainingRequests: result[1],
        resetTime: result[2],
      };
    } catch (error) {
      console.error("[Redis] Rate limit check failed:", {
        message: error instanceof Error ? error.message : "Unknown error",
        name: error instanceof Error ? error.name : "UnknownError",
        timestamp: new Date().toISOString(),
        key: key.substring(0, 10) + "...", // Log partial key for debugging
      });

      // Fail securely - deny request on Redis error
      return {
        allowed: false,
        remainingRequests: 0,
        resetTime: Date.now() + windowMs,
      };
    }
  }

  /**
   * Health check for Redis connection
   */
  async healthCheck(): Promise<{ healthy: boolean; latency?: number }> {
    try {
      const start = Date.now();
      const client = await this.getClient();
      await client.ping();
      const latency = Date.now() - start;

      return { healthy: true, latency };
    } catch {
      return { healthy: false };
    }
  }

  /**
   * Graceful shutdown
   */
  async disconnect(): Promise<void> {
    if (this.client && this.client.isOpen) {
      await this.client.disconnect();
      this.client = null;
    }
  }
}

// Global Redis manager instance with connection pooling
const redisManager = new RedisRateLimitManager();

// Graceful shutdown handling - guard against duplicate registration during hot reloads
if (typeof process !== "undefined" && !global.__aiSuggestionsRedisShutdownRegistered) {
  process.on("SIGTERM", async () => {
    console.log("[Redis] Graceful shutdown initiated");
    await redisManager.disconnect();
  });

  process.on("SIGINT", async () => {
    console.log("[Redis] Graceful shutdown initiated");
    await redisManager.disconnect();
  });
  
  // Mark Redis shutdown handlers as registered
  global.__aiSuggestionsRedisShutdownRegistered = true;
}

/**
 * Distributed rate limiting for production environments
 * Uses Redis with sliding window algorithm and atomic operations
 */
async function checkDistributedRateLimit(
  key: string
): Promise<{
  allowed: boolean;
  remainingRequests?: number;
  resetTime?: number;
}> {
  try {
    // Use Redis-based sliding window rate limiting
    const result = await redisManager.checkRateLimit(
      key,
      RATE_LIMIT_REQUESTS,
      RATE_LIMIT_WINDOW
    );

    return result;
  } catch (error) {
    console.error("[RateLimit] Distributed rate limiting error:", {
      message: error instanceof Error ? error.message : "Unknown error",
      name: error instanceof Error ? error.name : "UnknownError",
      timestamp: new Date().toISOString(),
    });

    // Fail closed for security - deny request on error
    return {
      allowed: false,
      remainingRequests: 0,
      resetTime: Date.now() + RATE_LIMIT_WINDOW,
    };
  }
}
/**
 * Development rate limiting with proper memory management
 * ⚠️ DO NOT USE IN PRODUCTION - memory is per-instance in serverless
 */
function checkDevelopmentRateLimit(key: string): {
  allowed: boolean;
  remainingRequests?: number;
  resetTime?: number;
} {
  const now = Date.now();
  const userLimit = devRateLimitStore.get(key);

  if (!userLimit || now > userLimit.resetTime) {
    // Reset or create new limit window
    const resetTime = now + RATE_LIMIT_WINDOW;
    devRateLimitStore.set(key, {
      count: 1,
      resetTime,
    });
    return {
      allowed: true,
      remainingRequests: RATE_LIMIT_REQUESTS - 1,
      resetTime,
    };
  }

  if (userLimit.count >= RATE_LIMIT_REQUESTS) {
    return {
      allowed: false,
      remainingRequests: 0,
      resetTime: userLimit.resetTime,
    };
  }

  userLimit.count += 1;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { lastAccess, ...userLimitWithoutLastAccess } = userLimit;
  devRateLimitStore.set(key, userLimitWithoutLastAccess);
  return {
    allowed: true,
    remainingRequests: RATE_LIMIT_REQUESTS - userLimit.count,
    resetTime: userLimit.resetTime,
  };
}

/**
 * Main rate limiting function - routes to appropriate implementation
 */
async function checkRateLimit(
  key: string
): Promise<{
  allowed: boolean;
  remainingRequests?: number;
  resetTime?: number;
}> {
  if (process.env.NODE_ENV === "production") {
    return await checkDistributedRateLimit(key);
  } else {
    return checkDevelopmentRateLimit(key);
  }
}

/**
 * Validate if a string is a well-formed IPv4 or IPv6 address
 * Uses Node.js built-in net.isIP() for reliable validation
 */
function isValidIpAddress(ip: string): boolean {
  if (!ip || typeof ip !== "string") return false;
  
  // net.isIP returns:
  // 0 for invalid IP
  // 4 for IPv4
  // 6 for IPv6
  return isIP(ip) > 0;
}

/**
 * Extract and validate client IP from request headers
 * Handles proxy chains and validates IP format
 */
function extractClientIp(request: Request): string {
  // Strategy 1: Parse x-forwarded-for header (comma-separated list)
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    // Split by comma and take the leftmost (original client) IP
    const ips = forwardedFor.split(",").map((ip) => ip.trim());
    for (const ip of ips) {
      if (ip && isValidIpAddress(ip)) {
        // Additional security: reject private/local IPs in production
        if (
          process.env.NODE_ENV === "production" &&
          (ip.startsWith("127.") ||
            ip.startsWith("10.") ||
            ip.startsWith("169.254.") ||
            ip.startsWith("192.168.") ||
            ip.match(/^172\.(1[6-9]|2[0-9]|3[01])\./) ||
            ip.startsWith("fc") ||
            ip.startsWith("fd") ||
            ip.startsWith("fe80:") ||
            ip === "::1")
        ) {
          continue; // Skip private IPs in production
        }
        return ip;
      }
    }
  }

  // Strategy 2: Check x-real-ip header
  const realIp = request.headers.get("x-real-ip");
  if (realIp && isValidIpAddress(realIp.trim())) {
    const cleanIp = realIp.trim();
    // Same comprehensive private IP check for production (unified with x-forwarded-for)
    if (
      process.env.NODE_ENV === "production" &&
      (cleanIp.startsWith("127.") ||
        cleanIp.startsWith("10.") ||
        cleanIp.startsWith("169.254.") ||
        cleanIp.startsWith("192.168.") ||
        cleanIp.match(/^172\.(1[6-9]|2[0-9]|3[01])\./) ||
        cleanIp.startsWith("fc") ||
        cleanIp.startsWith("fd") ||
        cleanIp.startsWith("fe80:") ||
        cleanIp === "::1")
    ) {
      return "unknown"; // Fallback for private IPs in production
    }
    return cleanIp;
  }

  // Strategy 3: Fallback to 'unknown' (but this should trigger alternative rate limiting)
  return "unknown";
}

/**
 * POST /api/ai-suggestions
 * Generate AI-powered movie/series recommendations
 */
export async function POST(request: Request) {
  try {
    // Get client IP for rate limiting using secure extraction
    const ip = extractClientIp(request);

    // Check rate limit (now async for distributed stores)
    const rateLimitResult = await checkRateLimit(ip);
    if (!rateLimitResult.allowed) {
      // Calculate dynamic retry-after based on reset time
      const retryAfterSeconds = rateLimitResult.resetTime
        ? Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
        : 3600; // Fallback to 1 hour

      return NextResponse.json(
        {
          error: "Rate limit exceeded. Please try again later.",
          success: false,
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.max(1, retryAfterSeconds).toString(), // Ensure at least 1 second
            "X-RateLimit-Limit": RATE_LIMIT_REQUESTS.toString(),
            "X-RateLimit-Remaining": "0",
            // Only include X-RateLimit-Reset when resetTime is available
            ...(rateLimitResult.resetTime && {
              "X-RateLimit-Reset": Math.floor(rateLimitResult.resetTime / 1000).toString()
            }),
          },
        }
      );
    }

    // Initialize Gemini service
    const geminiService = getGeminiService();

    // Generate suggestion
    const result: AISuggestionResponse =
      await geminiService.generateSuggestion();

    if (!result.success) {
      return NextResponse.json(
        {
          error:
            result.error ||
            "Failed to generate suggestion. Please try again later.",
          success: false,
        },
        { status: 500 }
      );
    }

    // Success response with rate limit headers
    return NextResponse.json(
      {
        suggestion: result.suggestion,
        success: true,
      },
      {
        headers: {
          "X-RateLimit-Limit": RATE_LIMIT_REQUESTS.toString(),
          "X-RateLimit-Remaining": (
            rateLimitResult.remainingRequests || 0
          ).toString(),
          "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600", // Cache for 30 minutes
        },
      }
    );
  } catch (err) {
    // Log error details safely for debugging and monitoring
    // Only log safe properties, never the full error object or sensitive data
    const safeErrorLog = {
      timestamp: new Date().toISOString(),
      message: err instanceof Error ? err.message : "Unknown error occurred",
      name: err instanceof Error ? err.name : "UnknownError",
      // Only include stack trace if it's a standard Error (avoid potential sensitive data)
      stack:
        err instanceof Error && err.stack
          ? err.stack.split("\n").slice(0, 5).join("\n")
          : undefined,
      // Include HTTP status if present (common for API errors)
      status:
        err && typeof err === "object" && "status" in err
          ? err.status
          : undefined,
      // Include error code if present (common for API errors)
      code:
        err && typeof err === "object" && "code" in err ? err.code : undefined,
      endpoint: "/api/ai-suggestions",
    };

    console.error("AI Suggestions API Error:", safeErrorLog);

    return NextResponse.json(
      {
        error: "Internal server error. Please try again later.",
        success: false,
      },
      { status: 500 }
    );
  }
}

/**
 * Determine the allowed CORS origin based on environment and origin validation
 */
function getAllowedCorsOrigin(requestOrigin: string | null): string | null {
  // In development, allow all origins for easier local development
  if (isDevelopment) {
    return '*';
  }

  // In production, validate against allowed origins list
  if (!requestOrigin || ALLOWED_ORIGINS.length === 0) {
    return null; // No origin header or no allowed origins configured
  }

  // Check if the request origin is in the allowed list
  if (ALLOWED_ORIGINS.includes(requestOrigin)) {
    return requestOrigin;
  }

  return null; // Origin not allowed
}

/**
 * OPTIONS - CORS handling and health check
 */
export async function OPTIONS(request: Request) {
  // Check if this is a health check request
  const url = new URL(request.url);
  if (url.searchParams.has("health")) {
    try {
      const healthResult = await redisManager.healthCheck();
      return NextResponse.json(
        {
          redis: healthResult,
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV,
        },
        {
          status: healthResult.healthy ? 200 : 503,
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
          },
        }
      );
    } catch {
      return NextResponse.json(
        {
          redis: { healthy: false },
          error: "Health check failed",
          timestamp: new Date().toISOString(),
        },
        { status: 503 }
      );
    }
  }

  // Standard CORS response with origin validation
  const requestOrigin = request.headers.get('origin');
  const allowedOrigin = getAllowedCorsOrigin(requestOrigin);
  
  const corsHeaders: Record<string, string> = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  // Only set Access-Control-Allow-Origin if we have an allowed origin
  if (allowedOrigin) {
    corsHeaders["Access-Control-Allow-Origin"] = allowedOrigin;
  }

  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

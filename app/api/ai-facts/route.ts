/**
 * AI Facts API Route - Server-side Gemini API integration
 * Handles movie and series fact generation with rate limiting and error handling
 */

import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { isIP } from "net";
import * as ipaddr from "ipaddr.js";
import {
  getGeminiService,
  type MovieData,
  type AIFactsResponse,
} from "@/lib/geminiService";
import { securityLogger, shutdownLogger } from "@/lib/logger";

// Rate limiting - simple in-memory store (in production, use Redis or database)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_REQUESTS = 10; // 10 requests per hour
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

// Cleanup configuration
const CLEANUP_INTERVAL = 10 * 60 * 1000; // 10 minutes
let cleanupInterval: NodeJS.Timeout | null = null;

// Track handler registration to prevent duplicates under Next.js HMR
let handlersRegistered = false;

// Store handler functions for cleanup
let sigtermHandler: (() => void) | null = null;
let sigintHandler: (() => void) | null = null;

// Track shutdown state to prevent multiple concurrent shutdowns
let shutdownInProgress = false;

/**
 * Lazy cleanup - removes expired entry for a specific key
 */
function lazyCleanupEntry(key: string): void {
  const entry = rateLimitStore.get(key);
  if (entry && Date.now() > entry.resetTime) {
    rateLimitStore.delete(key);
  }
}

/**
 * Periodic cleanup - removes all expired entries
 */
function periodicCleanup(): void {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Initialize cleanup interval
 */
function initializeCleanup(): void {
  if (!cleanupInterval) {
    cleanupInterval = setInterval(periodicCleanup, CLEANUP_INTERVAL);
  }
  
  // Shared cleanup function to avoid duplication
  const clearCleanupInterval = () => {
    if (cleanupInterval) {
      clearInterval(cleanupInterval);
      cleanupInterval = null;
    }
  };
  
  // Register signal handlers only once to prevent duplicates under HMR
  if (!handlersRegistered && typeof process !== 'undefined') {
    sigtermHandler = () => {
      // Ignore duplicate signals during shutdown
      if (shutdownInProgress) {
        return;
      }
      shutdownInProgress = true;

      // Start async shutdown sequence
      (async () => {
        try {
          clearCleanupInterval();
          // Gracefully shutdown logger
          await shutdownLogger();
          process.exit(0);
        } catch (error) {
          console.error('Error during SIGTERM shutdown:', error);
          process.exit(1);
        }
      })();
    };
    
    sigintHandler = () => {
      // Ignore duplicate signals during shutdown
      if (shutdownInProgress) {
        return;
      }
      shutdownInProgress = true;

      // Start async shutdown sequence
      (async () => {
        try {
          clearCleanupInterval();
          // Gracefully shutdown logger
          await shutdownLogger();
          process.exit(0);
        } catch (error) {
          console.error('Error during SIGINT shutdown:', error);
          process.exit(1);
        }
      })();
    };
    
    process.on('SIGTERM', sigtermHandler);
    process.on('SIGINT', sigintHandler);
    handlersRegistered = true;
  }
}

/**
 * Extract client IP for logging purposes (safe for logging, may include private IPs)
 */
function getClientIpForLogging(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp.trim();
  }
  
  return 'unknown';
}

/**
 * Validate if an IP address is public and suitable for rate limiting
 * Rejects private, loopback, multicast, and special-use addresses
 */
function isValidPublicIP(ipString: string): boolean {
  if (!ipString || typeof ipString !== 'string') {
    return false;
  }

  const trimmedIp = ipString.trim();
  
  // Basic IP format validation using Node.js built-in
  const ipVersion = isIP(trimmedIp);
  if (ipVersion === 0) {
    return false; // Invalid IP format
  }

  try {
    // Parse and normalize the IP address
    const addr = ipaddr.process(trimmedIp);
    
    // Check for various private/special ranges
    if (addr.kind() === 'ipv4') {
      // IPv4 private and special ranges
      return !(
        addr.match(ipaddr.IPv4.parse('127.0.0.0'), 8) ||      // Loopback (127.0.0.0/8)
        addr.match(ipaddr.IPv4.parse('10.0.0.0'), 8) ||       // Private Class A (10.0.0.0/8)
        addr.match(ipaddr.IPv4.parse('172.16.0.0'), 12) ||    // Private Class B (172.16.0.0/12)
        addr.match(ipaddr.IPv4.parse('192.168.0.0'), 16) ||   // Private Class C (192.168.0.0/16)
        addr.match(ipaddr.IPv4.parse('169.254.0.0'), 16) ||   // Link-local (169.254.0.0/16)
        addr.match(ipaddr.IPv4.parse('224.0.0.0'), 4) ||      // Multicast (224.0.0.0/4)
        addr.match(ipaddr.IPv4.parse('240.0.0.0'), 4) ||      // Reserved (240.0.0.0/4)
        addr.toString() === '0.0.0.0' ||                      // Unspecified
        addr.toString() === '255.255.255.255'                 // Broadcast
      );
    } else if (addr.kind() === 'ipv6') {
      // IPv6 private and special ranges
      return !(
        addr.match(ipaddr.IPv6.parse('::1'), 128) ||          // Loopback (::1/128)
        addr.match(ipaddr.IPv6.parse('::'), 128) ||           // Unspecified (::/128)
        addr.match(ipaddr.IPv6.parse('fc00::'), 7) ||         // Unique local (fc00::/7)
        addr.match(ipaddr.IPv6.parse('fe80::'), 10) ||        // Link-local (fe80::/10)
        addr.match(ipaddr.IPv6.parse('ff00::'), 8) ||         // Multicast (ff00::/8)
        addr.range() === 'teredo' ||                          // Teredo tunneling
        addr.range() === '6to4' ||                            // 6to4 tunneling
        addr.range() === 'reserved'                           // Reserved ranges
      );
    }
    
    return false; // Unknown IP kind
  } catch {
    // IP parsing failed - invalid format or parsing error
    return false;
  }
}

// Initialize cleanup when module loads
initializeCleanup();

/**
 * Validate origin against allowed origins from environment variable
 * Missing Origin headers are allowed (same-origin, direct navigation, server-to-server)
 * Only validates when Origin header is present
 */
function validateOrigin(origin: string | null): { allowed: boolean; origin: string | null } {
  // Allow requests without Origin header (same-origin, direct navigation, server-to-server)
  if (!origin) {
    return { allowed: true, origin: null }; // No Origin header, allow request
  }

  const allowedOrigins = process.env.ALLOWED_ORIGINS || "";
  if (!allowedOrigins) {
    // No allowlist configured - reject cross-origin requests when Origin is present
    return { allowed: false, origin };
  }

  const allowedOriginsList = allowedOrigins.split(",").map(o => o.trim());
  
  // Check if the origin is in the allowlist
  if (allowedOriginsList.includes(origin)) {
    return { allowed: true, origin };
  }
  
  return { allowed: false, origin }; // Origin present but not allowed
}

/**
 * Rate limiting middleware
 */
function checkRateLimit(ip: string): {
  allowed: boolean;
  remainingRequests?: number;
} {
  const now = Date.now();
  
  // Lazy cleanup - remove expired entry for this IP
  lazyCleanupEntry(ip);
  
  const userLimit = rateLimitStore.get(ip);

  if (!userLimit || now > userLimit.resetTime) {
    // Reset or create new limit window
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remainingRequests: RATE_LIMIT_REQUESTS - 1 };
  }

  if (userLimit.count >= RATE_LIMIT_REQUESTS) {
    return { allowed: false };
  }

  userLimit.count += 1;
  rateLimitStore.set(ip, userLimit);
  return {
    allowed: true,
    remainingRequests: RATE_LIMIT_REQUESTS - userLimit.count,
  };
}

/**
 * Extract reliable client identifier for rate limiting
 * Uses robust IP validation to prevent spoofing and ensures only public IPs are used
 * Returns { identifier, type } or { error, status } for invalid requests
 */
function getClientIdentifier(request: NextRequest): 
  | { identifier: string; type: 'ip' | 'fingerprint' }
  | { error: string; status: number } {
  
  // Strategy 1: Try to get real IP from proxy headers with proper validation
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  
  if (forwardedFor) {
    // x-forwarded-for can be comma-separated list, take the first (original client)
    const clientIp = forwardedFor.split(',')[0].trim();
    // Only accept public IPs to prevent spoofing with private/local addresses
    if (isValidPublicIP(clientIp)) {
      return { identifier: `ip:${clientIp}`, type: 'ip' };
    }
  }
  
  if (realIp && isValidPublicIP(realIp.trim())) {
    return { identifier: `ip:${realIp.trim()}`, type: 'ip' };
  }
  
  // Strategy 2: Create cryptographic fingerprint from multiple request attributes
  const userAgent = request.headers.get("user-agent");
  const acceptHeaders = request.headers.get("accept");
  const acceptLanguage = request.headers.get("accept-language");
  const acceptEncoding = request.headers.get("accept-encoding");
  const connection = request.headers.get("connection");
  const secFetchSite = request.headers.get("sec-fetch-site");
  const secFetchMode = request.headers.get("sec-fetch-mode");
  
  // Get client IP for additional entropy (safely handle missing values)
  const clientForwardedFor = request.headers.get("x-forwarded-for");
  const clientRealIp = request.headers.get("x-real-ip");
  const clientIp = clientForwardedFor?.split(',')[0]?.trim() || clientRealIp || '';
  
  if (userAgent && acceptHeaders) {
    // Create entropy pool from multiple stable request attributes
    const entropyComponents = [
      userAgent,                    // Already validated as non-null
      acceptHeaders,                // Already validated as non-null
      acceptLanguage || '',
      acceptEncoding || '',
      connection || '',
      secFetchSite || '',
      secFetchMode || '',
      clientIp || '', // Include IP if available for additional entropy
    ];
    
    // Create SHA-256 hash for cryptographic strength
    const entropyString = entropyComponents.join(':');
    const hash = createHash('sha256').update(entropyString).digest('hex');
    
    // Truncate to fixed length and add algorithm prefix
    const fingerprintId = hash.substring(0, 32); // First 32 hex chars
    
    return { identifier: `fingerprint:sha256:${fingerprintId}`, type: 'fingerprint' };
  }
  
  // Strategy 3: If all else fails, require proper headers
  return {
    error: "Unable to identify client. Please ensure your request includes proper IP headers or use a supported browser.",
    status: 400
  };
}

/**
 * Input validation
 */
function validateMovieData(data: unknown): { valid: boolean; error?: string } {
  if (!data || typeof data !== "object") {
    return { valid: false, error: "Invalid request body" };
  }

  const movieData = data as Record<string, unknown>;
  const { title, name } = movieData;
  if (!title && !name) {
    return { valid: false, error: "Title or name is required" };
  }

  const movieTitle = title || name;
  if (typeof movieTitle !== "string" || movieTitle.trim().length < 2) {
    return {
      valid: false,
      error: "Title must be a valid string with at least 2 characters",
    };
  }

  return { valid: true };
}

/**
 * POST /api/ai-facts
 * Generate AI-powered facts about movies or TV series
 */
export async function POST(request: NextRequest) {
  try {
    // Validate origin
    const origin = request.headers.get("origin");
    const originValidation = validateOrigin(origin);
    
    if (!originValidation.allowed) {
      // Log security event for origin validation failure
      securityLogger.warn('Origin validation failed', {
        origin: origin || 'none',
        clientIp: getClientIpForLogging(request),
        userAgent: request.headers.get('user-agent') || 'unknown'
      });
      
      return NextResponse.json(
        {
          error: "Origin not allowed",
          success: false,
        },
        { status: 403 }
      );
    }

    // Get reliable client identifier for rate limiting
    const clientResult = getClientIdentifier(request);
    if ('error' in clientResult) {
      return NextResponse.json(
        {
          error: clientResult.error,
          success: false,
        },
        { status: clientResult.status }
      );
    }

    const { identifier: clientId, type: identifierType } = clientResult;

    // Check rate limit using the reliable identifier
    const rateLimitResult = checkRateLimit(clientId);
    if (!rateLimitResult.allowed) {
      // Log security event for rate limit exceeded
      securityLogger.warn('Rate limit exceeded', {
        clientId: clientId.replace(/^(ip:|fingerprint:sha256:)/, ''), // Remove sensitive prefixes for logging
        identifierType,
        clientIp: getClientIpForLogging(request)
      });
      
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Please try again later.",
          success: false,
        },
        {
          status: 429,
          headers: {
            "Retry-After": "3600", // 1 hour
            "X-RateLimit-Limit": RATE_LIMIT_REQUESTS.toString(),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = validateMovieData(body);

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error, success: false },
        { status: 400 }
      );
    }

    const movieData: MovieData = body;

    // Initialize Gemini service
    const geminiService = getGeminiService();

    // Generate facts
    const result: AIFactsResponse = await geminiService.generateFacts(
      movieData
    );

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Failed to generate facts. Please try again later.",
          success: false,
        },
        { status: 500 }
      );
    }

    // Log successful fact generation
    securityLogger.info('AI facts generated successfully', {
      clientId: clientId.replace(/^(ip:|fingerprint:sha256:)/, ''), // Remove sensitive prefixes for logging
      identifierType,
      factsCount: result.facts.length,
      movieTitle: (body.title || body.name || 'unknown').substring(0, 50) // Truncate for logging
    });

    // Success response with rate limit headers
    const responseHeaders: Record<string, string> = {
      "X-RateLimit-Limit": RATE_LIMIT_REQUESTS.toString(),
      "X-RateLimit-Remaining": (
        rateLimitResult.remainingRequests || 0
      ).toString(),
      "X-Client-Identifier-Type": identifierType,
      "Cache-Control":
        "public, s-maxage=3600, stale-while-revalidate=86400", // Cache for 1 hour
    };

    // Only set Access-Control-Allow-Origin when origin is present
    if (originValidation.origin) {
      responseHeaders["Access-Control-Allow-Origin"] = originValidation.origin;
    }

    return NextResponse.json(
      {
        facts: result.facts,
        success: true,
        count: result.facts.length,
      },
      {
        headers: responseHeaders,
      }
    );
  } catch {
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
 * OPTIONS - CORS handling
 */
export async function OPTIONS(request: NextRequest) {
  // Validate origin
  const origin = request.headers.get("origin");
  const originValidation = validateOrigin(origin);
  
  if (!originValidation.allowed) {
    // Log security event for OPTIONS origin validation failure
    securityLogger.warn('OPTIONS origin validation failed', {
      origin: origin || 'none',
      clientIp: getClientIpForLogging(request),
      userAgent: request.headers.get('user-agent') || 'unknown'
    });
    
    return new NextResponse(null, {
      status: 403,
    });
  }

  const corsHeaders: Record<string, string> = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  // Only set Access-Control-Allow-Origin when origin is present
  if (originValidation.origin) {
    corsHeaders["Access-Control-Allow-Origin"] = originValidation.origin;
  }

  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

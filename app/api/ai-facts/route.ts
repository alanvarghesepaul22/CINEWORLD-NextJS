/**
 * AI Facts API Route - Clean Gemini API integration
 */

import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { getGeminiService, type MovieData } from "@/lib/geminiService";
import { securityLogger } from "@/lib/logger";

// Rate limiting configuration
const RATE_LIMIT_REQUESTS = 30; // Increased for production use
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Allowed origins (from env or defaults)
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map(origin => origin.trim())
  : ["http://localhost:3000"];

/**
 * Cleanup expired rate limit entries
 */
function cleanupRateLimitStore() {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Get client IP for logging (supports various production environments)
 */
function getClientIP(request: NextRequest): string {
  // Check multiple headers used by different hosting platforms
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfConnectingIp = request.headers.get("cf-connecting-ip"); // Cloudflare
  const trueClientIp = request.headers.get("true-client-ip"); // Cloudflare Enterprise
  const xClientIp = request.headers.get("x-client-ip");
  
  if (cfConnectingIp) return cfConnectingIp.trim();
  if (trueClientIp) return trueClientIp.trim();
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  if (realIp) return realIp.trim();
  if (xClientIp) return xClientIp.trim();
  
  return "unknown";
}

/**
 * Create client identifier for rate limiting
 */
function getClientIdentifier(request: NextRequest): string {
  const ip = getClientIP(request);

  // Use IP if available and not localhost/private
  if (ip !== "unknown" && !ip.startsWith("127.") && 
      !ip.startsWith("192.168.") && !ip.startsWith("10.")) {
    return `ip:${ip}`;
  }

  // Fallback to request fingerprint
  const userAgent = request.headers.get("user-agent") || "";
  const accept = request.headers.get("accept") || "";
  const acceptLanguage = request.headers.get("accept-language") || "";

  const fingerprint = createHash("sha256")
    .update(`${userAgent}:${accept}:${acceptLanguage}`)
    .digest("hex")
    .substring(0, 16);

  return `fingerprint:${fingerprint}`;
}

/**
 * Check rate limit for client
 */
function checkRateLimit(clientId: string): { allowed: boolean; remaining?: number } {
  // Cleanup old entries periodically (on-demand in serverless)
  if (rateLimitStore.size > 1000) {
    cleanupRateLimitStore();
  }

  const now = Date.now();
  const userLimit = rateLimitStore.get(clientId);

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitStore.set(clientId, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return { allowed: true, remaining: RATE_LIMIT_REQUESTS - 1 };
  }

  if (userLimit.count >= RATE_LIMIT_REQUESTS) {
    return { allowed: false };
  }

  userLimit.count += 1;
  return { allowed: true, remaining: RATE_LIMIT_REQUESTS - userLimit.count };
}

/**
 * Get CORS headers based on request origin
 */
function getCorsHeaders(request: NextRequest): Record<string, string> {
  const origin = request.headers.get("origin") || "";
  const isAllowedOrigin = ALLOWED_ORIGINS.some(allowed => 
    origin.startsWith(allowed.replace(/\/$/, ""))
  );

  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  // Set origin header if it's in allowed list, otherwise allow all for same-origin
  if (isAllowedOrigin || !origin) {
    headers["Access-Control-Allow-Origin"] = origin || "*";
  }

  return headers;
}

/**
 * Validate movie data input
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
    return { valid: false, error: "Title must be at least 2 characters" };
  }

  return { valid: true };
}

/**
 * POST /api/ai-facts - Generate AI-powered facts using Gemini API
 */
export async function POST(request: NextRequest) {
  const corsHeaders = getCorsHeaders(request);

  try {
    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY) {
      securityLogger.error("GEMINI_API_KEY not configured");
      return NextResponse.json(
        { error: "AI service not configured. Please contact administrator.", success: false },
        { status: 503, headers: corsHeaders }
      );
    }

    // Rate limiting
    const clientId = getClientIdentifier(request);
    const rateLimitResult = checkRateLimit(clientId);

    if (!rateLimitResult.allowed) {
      securityLogger.warn("Rate limit exceeded", {
        clientId: clientId.replace(/^(ip:|fingerprint:)/, ""),
        clientIp: getClientIP(request),
      });

      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later.", success: false },
        {
          status: 429,
          headers: {
            ...corsHeaders,
            "Retry-After": "3600",
            "X-RateLimit-Limit": RATE_LIMIT_REQUESTS.toString(),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    // Input validation
    const body = await request.json();
    const validation = validateMovieData(body);

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error, success: false },
        { status: 400, headers: corsHeaders }
      );
    }

    // Generate facts using Gemini API
    const movieData: MovieData = body;
    const geminiService = getGeminiService();
    
    securityLogger.info("Starting AI facts generation", {
      clientId: clientId.replace(/^(ip:|fingerprint:)/, ""),
      movieTitle: (body.title || body.name || "unknown").substring(0, 50),
    });

    const result = await geminiService.generateFacts(movieData);

    if (!result.success) {
      securityLogger.error("Gemini API failed to generate facts", {
        error: result.error,
      });

      return NextResponse.json(
        { 
          error: result.error || "Failed to generate facts. Please try again later.", 
          success: false 
        },
        { status: 500, headers: corsHeaders }
      );
    }

    // Success response
    const responseHeaders: Record<string, string> = {
      ...corsHeaders,
      "X-RateLimit-Limit": RATE_LIMIT_REQUESTS.toString(),
      "X-RateLimit-Remaining": (rateLimitResult.remaining || 0).toString(),
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    };

    securityLogger.info("AI facts generated successfully", {
      clientId: clientId.replace(/^(ip:|fingerprint:)/, ""),
      factsCount: result.facts.length,
      movieTitle: (body.title || body.name || "unknown").substring(0, 50),
    });

    return NextResponse.json(
      {
        facts: result.facts,
        success: true,
        count: result.facts.length,
      },
      { headers: responseHeaders }
    );
  } catch (error) {
    securityLogger.error("AI facts generation failed", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      { error: "Internal server error. Please try again later.", success: false },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * OPTIONS - CORS preflight
 */
export async function OPTIONS(request: NextRequest) {
  const corsHeaders = getCorsHeaders(request);
  
  return new NextResponse(null, {
    status: 200,
    headers: {
      ...corsHeaders,
      "Access-Control-Max-Age": "86400", // Cache preflight for 24 hours
    },
  });
}

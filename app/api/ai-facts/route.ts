/**
 * AI Facts API Route - Clean Gemini API integration
 */

import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { getGeminiService, type MovieData } from "@/lib/geminiService";
import { securityLogger } from "@/lib/logger";

// Rate limiting
const RATE_LIMIT_REQUESTS = 10;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Cleanup expired entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 10 * 60 * 1000);

/**
 * Get client IP for logging
 */
function getClientIP(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");

  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  if (realIp) return realIp.trim();
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
  try {
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
        { status: 400 }
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
      return NextResponse.json(
        { error: "Failed to generate facts. Please try again later.", success: false },
        { status: 500 }
      );
    }

    // Success response
    const responseHeaders: Record<string, string> = {
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
    });

    return NextResponse.json(
      { error: "Internal server error. Please try again later.", success: false },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS - CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

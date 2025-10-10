/**
 * AI Suggestions API Route - Clean and secure Gemini API integration
 */

import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import {
  getGeminiService,
  type AISuggestionResponse,
} from "@/lib/geminiService";

// Rate limiting configuration
const RATE_LIMIT_REQUESTS = 5;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Cleanup expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 10 * 60 * 1000); // 10 minutes

/**
 * Get client IP for logging (safe for all environments)
 */
function getClientIP(request: NextRequest): string {
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
 * Create client identifier for rate limiting
 * Uses IP when available, falls back to request fingerprint
 */
function getClientIdentifier(request: NextRequest): string {
  const ip = getClientIP(request);
  
  // Use IP if available and not localhost/private
  if (ip !== 'unknown' && !ip.startsWith('127.') && !ip.startsWith('192.168.') && !ip.startsWith('10.')) {
    return `ip:${ip}`;
  }
  
  // Fallback to request fingerprint
  const userAgent = request.headers.get("user-agent") || '';
  const accept = request.headers.get("accept") || '';
  const acceptLanguage = request.headers.get("accept-language") || '';
  
  const fingerprint = createHash('sha256')
    .update(`${userAgent}:${accept}:${acceptLanguage}`)
    .digest('hex')
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
    // Reset or create new limit window
    rateLimitStore.set(clientId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT_REQUESTS - 1 };
  }

  if (userLimit.count >= RATE_LIMIT_REQUESTS) {
    return { allowed: false };
  }

  userLimit.count += 1;
  return { allowed: true, remaining: RATE_LIMIT_REQUESTS - userLimit.count };
}

/**
 * Validate origin for CORS
 */
function validateOrigin(origin: string | null): boolean {
  // Allow requests without origin (same-origin, direct navigation)
  if (!origin) return true;

  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()) || [];
  
  // If no allowlist configured, allow all origins (for development)
  if (allowedOrigins.length === 0) return true;
  
  return allowedOrigins.includes(origin);
}

/**
 * POST /api/ai-suggestions - Generate AI-powered suggestions
 */
export async function POST(request: NextRequest) {
  try {
    // Origin validation
    const origin = request.headers.get("origin");
    if (!validateOrigin(origin)) {
      return NextResponse.json(
        { error: "Origin not allowed", success: false },
        { status: 403 }
      );
    }

    // Rate limiting
    const clientId = getClientIdentifier(request);
    const rateLimitResult = checkRateLimit(clientId);
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later.", success: false },
        { 
          status: 429,
          headers: {
            "Retry-After": "3600",
            "X-RateLimit-Limit": RATE_LIMIT_REQUESTS.toString(),
            "X-RateLimit-Remaining": "0",
          }
        }
      );
    }

    // Generate suggestion
    const geminiService = getGeminiService();
    const result: AISuggestionResponse = await geminiService.generateSuggestion();

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to generate suggestion. Please try again later.", success: false },
        { status: 500 }
      );
    }

    // Success response
    const responseHeaders: Record<string, string> = {
      "X-RateLimit-Limit": RATE_LIMIT_REQUESTS.toString(),
      "X-RateLimit-Remaining": (rateLimitResult.remaining || 0).toString(),
      "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
    };

    if (origin) {
      responseHeaders["Access-Control-Allow-Origin"] = origin;
    }

    return NextResponse.json(
      {
        suggestion: result.suggestion,
        success: true,
      },
      { headers: responseHeaders }
    );
    
  } catch (error) {
    console.error('AI suggestions generation failed:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
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
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin");
  
  if (!validateOrigin(origin)) {
    return new NextResponse(null, { status: 403 });
  }

  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (origin) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  return new NextResponse(null, { status: 200, headers });
}

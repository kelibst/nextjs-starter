import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialize Redis client (will be null in development without Upstash)
let redis: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

/**
 * Rate limiter for login attempts
 * Limit: 10 attempts per 15 minutes (generous for now)
 */
export const loginRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "15 m"),
      analytics: true,
      prefix: "@/ratelimit/login",
    })
  : null;

/**
 * Rate limiter for registration attempts
 * Limit: 5 attempts per hour (generous for now)
 */
export const registerRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 h"),
      analytics: true,
      prefix: "@/ratelimit/register",
    })
  : null;

/**
 * Rate limiter for password reset requests
 * Limit: 5 attempts per hour (generous for now)
 */
export const passwordResetRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 h"),
      analytics: true,
      prefix: "@/ratelimit/password-reset",
    })
  : null;

/**
 * Rate limiter for email verification requests
 * Limit: 5 attempts per hour (generous for now)
 */
export const emailVerificationRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 h"),
      analytics: true,
      prefix: "@/ratelimit/email-verification",
    })
  : null;

/**
 * General API rate limiter
 * Limit: 200 requests per minute (very generous for now)
 */
export const apiRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(200, "1 m"),
      analytics: true,
      prefix: "@/ratelimit/api",
    })
  : null;

/**
 * Check rate limit and return appropriate response
 */
export async function checkRateLimit(
  limiter: Ratelimit | null,
  identifier: string
): Promise<{
  success: boolean;
  limit?: number;
  remaining?: number;
  reset?: number;
}> {
  // If no Redis/Upstash configured, allow all requests (development mode)
  if (!limiter) {
    return { success: true };
  }

  const { success, limit, remaining, reset } = await limiter.limit(identifier);

  return {
    success,
    limit,
    remaining,
    reset,
  };
}

/**
 * Get rate limit identifier from request (IP address)
 */
export function getRateLimitIdentifier(request: Request): string {
  // Try to get real IP from headers (for proxies/load balancers)
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfConnectingIp = request.headers.get("cf-connecting-ip");

  const ip =
    cfConnectingIp || realIp || forwarded?.split(",")[0] || "127.0.0.1";

  return ip.trim();
}

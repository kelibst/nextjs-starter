import { SignJWT, jwtVerify } from "jose";
import {
  TokenPayload,
  JWT_ACCESS_SECRET,
  JWT_ACCESS_EXPIRY,
  JWT_REFRESH_SECRET,
  JWT_REFRESH_EXPIRY,
} from "./constants";
import { randomBytes } from "crypto";

/**
 * Convert time string (e.g., "15m", "7d") to seconds
 */
function parseExpiryTime(expiry: string): number {
  const match = expiry.match(/^(\d+)([smhd])$/);
  if (!match) {
    throw new Error(`Invalid expiry format: ${expiry}`);
  }

  const value = parseInt(match[1]!, 10);
  const unit = match[2];

  switch (unit) {
    case "s":
      return value;
    case "m":
      return value * 60;
    case "h":
      return value * 60 * 60;
    case "d":
      return value * 60 * 60 * 24;
    default:
      throw new Error(`Invalid expiry unit: ${unit}`);
  }
}

/**
 * Generate a JWT access token
 *
 * @param payload - Token payload containing userId and role
 * @returns Promise resolving to JWT access token string
 */
export async function generateAccessToken(payload: TokenPayload): Promise<string> {
  const secret = new TextEncoder().encode(JWT_ACCESS_SECRET);
  const expirySeconds = parseExpiryTime(JWT_ACCESS_EXPIRY);

  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + expirySeconds)
    .sign(secret);

  return token;
}

/**
 * Generate a JWT refresh token
 *
 * @param payload - Token payload containing userId and role
 * @returns Promise resolving to JWT refresh token string
 */
export async function generateRefreshToken(payload: TokenPayload): Promise<string> {
  const secret = new TextEncoder().encode(JWT_REFRESH_SECRET);
  const expirySeconds = parseExpiryTime(JWT_REFRESH_EXPIRY);

  // Generate unique JWT ID to prevent token collisions
  const jti = randomBytes(16).toString('hex');

  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setJti(jti) // Add unique JWT ID
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + expirySeconds)
    .sign(secret);

  return token;
}

/**
 * Verify and decode a JWT access token
 *
 * @param token - JWT access token to verify
 * @returns Promise resolving to decoded token payload
 * @throws Error if token is invalid or expired
 */
export async function verifyAccessToken(token: string): Promise<TokenPayload> {
  try {
    const secret = new TextEncoder().encode(JWT_ACCESS_SECRET);
    const { payload } = await jwtVerify(token, secret);

    return {
      userId: payload.userId as string,
      role: payload.role as TokenPayload["role"],
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Invalid access token: ${error.message}`);
    }
    throw new Error("Invalid access token");
  }
}

/**
 * Verify and decode a JWT refresh token
 *
 * @param token - JWT refresh token to verify
 * @returns Promise resolving to decoded token payload
 * @throws Error if token is invalid or expired
 */
export async function verifyRefreshToken(token: string): Promise<TokenPayload> {
  try {
    const secret = new TextEncoder().encode(JWT_REFRESH_SECRET);
    const { payload } = await jwtVerify(token, secret);

    return {
      userId: payload.userId as string,
      role: payload.role as TokenPayload["role"],
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Invalid refresh token: ${error.message}`);
    }
    throw new Error("Invalid refresh token");
  }
}

/**
 * Get expiry date for refresh token
 *
 * @returns Date object representing when refresh token will expire
 */
export function getRefreshTokenExpiry(): Date {
  const expirySeconds = parseExpiryTime(JWT_REFRESH_EXPIRY);
  return new Date(Date.now() + expirySeconds * 1000);
}

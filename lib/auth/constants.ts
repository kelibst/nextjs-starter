import { Role } from "@prisma/client";

/**
 * JWT Access Token Configuration
 */
export const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
export const JWT_ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || "15m"; // 15 minutes

/**
 * JWT Refresh Token Configuration
 */
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
export const JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || "7d"; // 7 days

/**
 * Cookie Configuration
 */
export const COOKIE_NAMES = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
} as const;

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === "true" || process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  domain: process.env.COOKIE_DOMAIN,
};

/**
 * Token Payload Interface
 */
export interface TokenPayload {
  userId: string;
  role: Role;
}

/**
 * Validate that required JWT secrets are set
 */
export function validateJWTSecrets(): void {
  if (!JWT_ACCESS_SECRET || JWT_ACCESS_SECRET.length < 32) {
    throw new Error(
      "JWT_ACCESS_SECRET must be set and at least 32 characters long in environment variables"
    );
  }

  if (!JWT_REFRESH_SECRET || JWT_REFRESH_SECRET.length < 32) {
    throw new Error(
      "JWT_REFRESH_SECRET must be set and at least 32 characters long in environment variables"
    );
  }
}

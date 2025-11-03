import { randomBytes } from "crypto";

/**
 * Generate a secure random token for email verification or password reset
 * @param bytes Number of random bytes (default: 32)
 * @returns Hex string token
 */
export function generateToken(bytes: number = 32): string {
  return randomBytes(bytes).toString("hex");
}

/**
 * Generate verification token expiry (24 hours from now)
 */
export function getVerificationExpiry(): Date {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 24);
  return expiry;
}

/**
 * Generate password reset token expiry (1 hour from now)
 */
export function getPasswordResetExpiry(): Date {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 1);
  return expiry;
}

/**
 * Check if a token has expired
 */
export function isTokenExpired(expiresAt: Date | null): boolean {
  if (!expiresAt) return true;
  return new Date() > expiresAt;
}

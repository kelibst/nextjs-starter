/**
 * Two-Factor Authentication Utilities
 *
 * Handles TOTP (Time-based One-Time Password) operations for 2FA:
 * - Generate secret keys
 * - Verify TOTP tokens
 * - Generate QR codes for authenticator apps
 * - Generate and verify backup codes
 */

import { authenticator } from "otplib";
import QRCode from "qrcode";
import { hashPassword, verifyPassword } from "./password";

// Configure TOTP settings
authenticator.options = {
  window: 1, // Allow 1 step before/after for time drift (30s window)
};

/**
 * Generate a new TOTP secret for a user
 * @returns Base32 encoded secret
 */
export function generateTwoFactorSecret(): string {
  return authenticator.generateSecret();
}

/**
 * Generate OTPAuth URL for QR code
 * @param username - User's username
 * @param secret - TOTP secret
 * @returns OTPAuth URL
 */
export function generateOtpAuthUrl(username: string, secret: string): string {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "Next.js Auth";
  return authenticator.keyuri(username, appName, secret);
}

/**
 * Generate QR code as data URL
 * @param otpAuthUrl - OTPAuth URL
 * @returns Promise<string> - Data URL for QR code image
 */
export async function generateQRCode(otpAuthUrl: string): Promise<string> {
  try {
    return await QRCode.toDataURL(otpAuthUrl);
  } catch (error) {
    throw new Error("Failed to generate QR code");
  }
}

/**
 * Verify TOTP token
 * @param token - 6-digit TOTP token
 * @param secret - User's TOTP secret
 * @returns boolean - True if token is valid
 */
export function verifyTwoFactorToken(token: string, secret: string): boolean {
  try {
    return authenticator.verify({ token, secret });
  } catch (error) {
    return false;
  }
}

/**
 * Generate backup codes for 2FA recovery
 * @param count - Number of backup codes to generate (default: 10)
 * @returns Promise<{codes: string[], hashed: string[]}> - Plain and hashed codes
 */
export async function generateBackupCodes(
  count: number = 10
): Promise<{ codes: string[]; hashed: string[] }> {
  const codes: string[] = [];
  const hashed: string[] = [];

  for (let i = 0; i < count; i++) {
    // Generate 8-character alphanumeric code
    const code = generateBackupCode();
    codes.push(code);

    // Hash the code for storage
    const hashedCode = await hashPassword(code);
    hashed.push(hashedCode);
  }

  return { codes, hashed };
}

/**
 * Generate a single backup code (8 characters, alphanumeric)
 * @returns string - 8-character backup code
 */
function generateBackupCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed ambiguous chars
  let code = "";
  const randomBytes = crypto.getRandomValues(new Uint8Array(8));

  for (let i = 0; i < 8; i++) {
    code += chars[randomBytes[i] % chars.length];
  }

  // Format as XXXX-XXXX for readability
  return `${code.slice(0, 4)}-${code.slice(4)}`;
}

/**
 * Verify backup code
 * @param code - Backup code to verify
 * @param hashedCodes - Array of hashed backup codes
 * @returns Promise<{valid: boolean, index: number}> - Validation result and index of used code
 */
export async function verifyBackupCode(
  code: string,
  hashedCodes: string[]
): Promise<{ valid: boolean; index: number }> {
  for (let i = 0; i < hashedCodes.length; i++) {
    const isValid = await verifyPassword(code, hashedCodes[i]);
    if (isValid) {
      return { valid: true, index: i };
    }
  }

  return { valid: false, index: -1 };
}

/**
 * Format TOTP secret for display (in groups of 4)
 * Example: JBSWY3DPEHPK3PXP -> JBSW Y3DP EHPK 3PXP
 * @param secret - TOTP secret
 * @returns Formatted secret
 */
export function formatSecretForDisplay(secret: string): string {
  return secret.match(/.{1,4}/g)?.join(" ") || secret;
}

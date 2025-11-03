/**
 * Two-Factor Authentication Validation Schemas
 *
 * Zod schemas for validating 2FA-related operations
 */

import { z } from "zod";

/**
 * TOTP token validation (6 digits)
 */
export const totpTokenSchema = z.object({
  token: z
    .string()
    .length(6, "TOTP code must be 6 digits")
    .regex(/^\d{6}$/, "TOTP code must contain only digits"),
});

/**
 * Backup code validation (format: XXXX-XXXX)
 */
export const backupCodeSchema = z.object({
  code: z
    .string()
    .regex(
      /^[A-Z0-9]{4}-[A-Z0-9]{4}$/,
      "Backup code must be in format XXXX-XXXX"
    ),
});

/**
 * 2FA verification (TOTP or backup code)
 */
export const twoFactorVerifySchema = z.object({
  code: z.string().min(6, "Code must be at least 6 characters"),
  isBackupCode: z.boolean().optional().default(false),
  userId: z.string().optional(), // For login flow
});

/**
 * Enable 2FA request (verify token before enabling)
 */
export const enableTwoFactorSchema = z.object({
  token: z
    .string()
    .length(6, "TOTP code must be 6 digits")
    .regex(/^\d{6}$/, "TOTP code must contain only digits"),
});

/**
 * Disable 2FA request (verify password before disabling)
 */
export const disableTwoFactorSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

// Type exports
export type TotpTokenInput = z.infer<typeof totpTokenSchema>;
export type BackupCodeInput = z.infer<typeof backupCodeSchema>;
export type TwoFactorVerifyInput = z.infer<typeof twoFactorVerifySchema>;
export type EnableTwoFactorInput = z.infer<typeof enableTwoFactorSchema>;
export type DisableTwoFactorInput = z.infer<typeof disableTwoFactorSchema>;

/**
 * POST /api/users/me/2fa/setup
 *
 * Generate 2FA secret and QR code for user
 * Returns secret (for manual entry) and QR code (data URL)
 */

import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import {
  successResponse,
  unauthorizedResponse,
  handleApiError,
  conflictResponse,
} from "@/lib/api/response";
import {
  generateTwoFactorSecret,
  generateOtpAuthUrl,
  generateQRCode,
  formatSecretForDisplay,
} from "@/lib/auth/two-factor";
import { userRepository } from "@/lib/repositories";

export async function POST(request: NextRequest) {
  try {
    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return unauthorizedResponse();
    }

    // Check if 2FA is already enabled
    if (user.twoFactorEnabled) {
      return conflictResponse("Two-factor authentication is already enabled");
    }

    // Generate new secret
    const secret = generateTwoFactorSecret();

    // Generate OTPAuth URL for QR code
    const otpAuthUrl = generateOtpAuthUrl(user.username, secret);

    // Generate QR code as data URL
    const qrCodeDataUrl = await generateQRCode(otpAuthUrl);

    // Return secret and QR code
    // Note: Secret is not saved yet - only saved when user verifies and enables 2FA
    return successResponse({
      secret: secret,
      secretFormatted: formatSecretForDisplay(secret),
      qrCode: qrCodeDataUrl,
      message:
        "Scan the QR code with your authenticator app, then verify with a code to enable 2FA",
    });
  } catch (error) {
    return handleApiError(error);
  }
}

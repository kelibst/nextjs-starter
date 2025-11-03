import { Resend } from "resend";

// Email service is optional - only initialize if API key is present
// This allows admins to disable email features via system settings
const RESEND_API_KEY = process.env.RESEND_API_KEY;

export const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

// Default sender email (update with your verified domain)
export const FROM_EMAIL =
  process.env.FROM_EMAIL || "onboarding@resend.dev";

// App URL for email links
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

/**
 * Check if email service is configured
 */
export function isEmailConfigured(): boolean {
  return resend !== null;
}

import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY environment variable is not set");
}

export const resend = new Resend(process.env.RESEND_API_KEY);

// Default sender email (update with your verified domain)
export const FROM_EMAIL =
  process.env.FROM_EMAIL || "onboarding@resend.dev";

// App URL for email links
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

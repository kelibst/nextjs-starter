import { render } from "@react-email/components";
import { resend, FROM_EMAIL } from "./resend";
import { VerificationEmail } from "@/emails/verification-email";
import { PasswordResetEmail } from "@/emails/password-reset-email";

export interface SendEmailOptions {
  to: string;
  subject: string;
  react: React.ReactElement;
}

/**
 * Send an email using Resend
 */
export async function sendEmail({
  to,
  subject,
  react,
}: SendEmailOptions): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      react,
    });

    if (error) {
      console.error("Email send error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Email send exception:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send verification email
 */
export async function sendVerificationEmail(
  to: string,
  username: string,
  verificationUrl: string
): Promise<{ success: boolean; error?: string }> {
  return sendEmail({
    to,
    subject: "Verify your email address",
    react: VerificationEmail({ username, verificationUrl }),
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  to: string,
  username: string,
  resetUrl: string
): Promise<{ success: boolean; error?: string }> {
  return sendEmail({
    to,
    subject: "Reset your password",
    react: PasswordResetEmail({ username, resetUrl }),
  });
}

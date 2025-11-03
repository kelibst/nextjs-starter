"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2, Mail } from "lucide-react";
import Link from "next/link";

type VerificationStatus = "verifying" | "success" | "error" | "resending";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<VerificationStatus>("verifying");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token provided");
      return;
    }

    verifyEmail(token);
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    try {
      const response = await fetch(
        `/api/auth/verify-email?token=${verificationToken}`
      );
      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage(data.message || "Email verified successfully!");
        if (data.user?.email) {
          setEmail(data.user.email);
        }
      } else {
        setStatus("error");
        setMessage(data.error || "Verification failed");
      }
    } catch (error) {
      setStatus("error");
      setMessage("An error occurred during verification");
    }
  };

  const resendVerification = async () => {
    if (!email) {
      setMessage("Email address not available. Please try again from the registration page.");
      return;
    }

    setStatus("resending");

    try {
      const response = await fetch("/api/auth/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Verification email sent! Please check your inbox.");
        setTimeout(() => setStatus("error"), 3000);
      } else {
        setStatus("error");
        setMessage(data.error || "Failed to resend verification email");
      }
    } catch (error) {
      setStatus("error");
      setMessage("An error occurred. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {status === "verifying" && (
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
            )}
            {status === "success" && (
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            )}
            {status === "error" && (
              <XCircle className="h-16 w-16 text-destructive" />
            )}
            {status === "resending" && (
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {status === "verifying" && "Verifying Email..."}
            {status === "success" && "Email Verified!"}
            {status === "error" && "Verification Failed"}
            {status === "resending" && "Sending Email..."}
          </CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "success" && (
            <div className="space-y-2">
              <p className="text-center text-sm text-muted-foreground">
                Your email has been verified successfully. You can now access all features.
              </p>
              <Button asChild className="w-full">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-2">
              <p className="text-center text-sm text-muted-foreground">
                The verification link may have expired or is invalid.
              </p>
              {email && (
                <Button
                  onClick={resendVerification}
                  variant="default"
                  className="w-full"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Resend Verification Email
                </Button>
              )}
              <Button asChild variant="outline" className="w-full">
                <Link href="/register">Back to Registration</Link>
              </Button>
            </div>
          )}

          {status === "verifying" && (
            <p className="text-center text-sm text-muted-foreground">
              Please wait while we verify your email address...
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

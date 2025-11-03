"use client";

import { useState } from "react";
import { AlertCircle, Mail, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface VerificationNoticeProps {
  email: string;
}

export function VerificationNotice({ email }: VerificationNoticeProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isResending, setIsResending] = useState(false);

  if (!isVisible) return null;

  const resendVerification = async () => {
    setIsResending(true);

    try {
      const response = await fetch("/api/auth/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Verification email sent! Please check your inbox.");
      } else {
        toast.error(data.error || "Failed to send verification email");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="relative rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-950">
      <button
        onClick={() => setIsVisible(false)}
        className="absolute right-2 top-2 rounded-md p-1 text-yellow-600 hover:bg-yellow-100 dark:text-yellow-400 dark:hover:bg-yellow-900"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-start gap-3 pr-8">
        <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1 space-y-2">
          <div>
            <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">
              Email Not Verified
            </h3>
            <p className="mt-1 text-sm text-yellow-800 dark:text-yellow-200">
              Please verify your email address to access all features. Check your inbox for the verification link.
            </p>
          </div>
          <Button
            onClick={resendVerification}
            disabled={isResending}
            size="sm"
            variant="outline"
            className="border-yellow-300 bg-white text-yellow-900 hover:bg-yellow-100 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-100 dark:hover:bg-yellow-900"
          >
            <Mail className="mr-2 h-4 w-4" />
            {isResending ? "Sending..." : "Resend Verification Email"}
          </Button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangleIcon, RefreshCwIcon, HomeIcon } from "lucide-react";

/**
 * Custom Error Boundary (500 Server Error)
 *
 * Catches unhandled errors in the app and displays a user-friendly message.
 * Provides options to retry or return home.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/error
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to error reporting service (e.g., Sentry)
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="mx-auto max-w-md text-center">
        {/* Error Icon */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangleIcon className="h-8 w-8 text-destructive" />
        </div>

        {/* Error Message */}
        <h1 className="text-3xl font-semibold tracking-tight">
          Something Went Wrong
        </h1>
        <p className="mt-4 text-muted-foreground">
          We encountered an unexpected error while processing your request.
          Don't worry, our team has been notified and we're working on it.
        </p>

        {/* Error Details (Development Only) */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-6 rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-left">
            <p className="text-sm font-semibold text-destructive">
              Error Details (Development Only):
            </p>
            <pre className="mt-2 overflow-x-auto text-xs text-muted-foreground">
              {error.message}
            </pre>
            {error.digest && (
              <p className="mt-2 text-xs text-muted-foreground">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button onClick={reset} size="lg">
            <RefreshCwIcon className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Button asChild variant="outline" size="lg">
            <a href="/">
              <HomeIcon className="mr-2 h-4 w-4" />
              Go Home
            </a>
          </Button>
        </div>

        {/* Support Link */}
        <p className="mt-8 text-sm text-muted-foreground">
          If this problem persists, please{" "}
          <a
            href="mailto:support@example.com"
            className="text-primary hover:underline"
          >
            contact support
          </a>
          .
        </p>
      </div>
    </div>
  );
}

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldAlertIcon, HomeIcon, LogInIcon } from "lucide-react";

/**
 * Unauthorized Access Page (401)
 *
 * Displayed when a user tries to access a protected route without authentication
 * or when their session has expired.
 */
export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="mx-auto max-w-md text-center">
        {/* Icon */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <ShieldAlertIcon className="h-8 w-8 text-destructive" />
        </div>

        {/* Error Message */}
        <h1 className="text-3xl font-semibold tracking-tight">
          Authentication Required
        </h1>
        <p className="mt-4 text-muted-foreground">
          You need to be logged in to access this page. Your session may have
          expired or you might not have an account yet.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg">
            <Link href="/login">
              <LogInIcon className="mr-2 h-4 w-4" />
              Login
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/">
              <HomeIcon className="mr-2 h-4 w-4" />
              Go Home
            </Link>
          </Button>
        </div>

        {/* Sign Up Link */}
        <p className="mt-8 text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link href="/register" className="text-primary hover:underline">
            Sign up for free
          </Link>
        </p>
      </div>
    </div>
  );
}

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldXIcon, HomeIcon, ArrowLeftIcon } from "lucide-react";

/**
 * Forbidden Access Page (403)
 *
 * Displayed when a user tries to access a resource they don't have
 * permission to view (e.g., admin panel as a regular user).
 */
export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="mx-auto max-w-md text-center">
        {/* Icon */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <ShieldXIcon className="h-8 w-8 text-destructive" />
        </div>

        {/* Error Message */}
        <h1 className="text-3xl font-semibold tracking-tight">
          Access Denied
        </h1>
        <p className="mt-4 text-muted-foreground">
          You don't have permission to access this page. This area is
          restricted to users with specific roles or permissions.
        </p>

        {/* Info Box */}
        <div className="mt-6 rounded-lg border bg-muted/50 p-4 text-sm text-muted-foreground">
          <p className="font-medium">Need access?</p>
          <p className="mt-1">
            Contact your administrator if you believe you should have access to
            this resource.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg">
            <Link href="/dashboard">
              <HomeIcon className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="javascript:history.back()">
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Go Back
            </Link>
          </Button>
        </div>

        {/* Help Text */}
        <p className="mt-8 text-sm text-muted-foreground">
          If you believe this is a mistake, please{" "}
          <a
            href="mailto:admin@example.com"
            className="text-primary hover:underline"
          >
            contact an administrator
          </a>
          .
        </p>
      </div>
    </div>
  );
}

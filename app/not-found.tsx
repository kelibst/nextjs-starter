import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HomeIcon, ArrowLeftIcon } from "lucide-react";

/**
 * Custom 404 Not Found Page
 *
 * Displayed when a route doesn't exist.
 * Provides helpful navigation options to get users back on track.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="mx-auto max-w-md text-center">
        {/* 404 Number */}
        <h1 className="text-9xl font-bold text-primary">404</h1>

        {/* Error Message */}
        <h2 className="mt-4 text-3xl font-semibold tracking-tight">
          Page Not Found
        </h2>
        <p className="mt-4 text-muted-foreground">
          Sorry, we couldn't find the page you're looking for. The page might
          have been moved, deleted, or never existed.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg">
            <Link href="/">
              <HomeIcon className="mr-2 h-4 w-4" />
              Go Home
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="javascript:history.back()">
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Go Back
            </Link>
          </Button>
        </div>

        {/* Helpful Links */}
        <div className="mt-12 text-sm text-muted-foreground">
          <p className="mb-2">Or try one of these:</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/login"
              className="hover:text-foreground transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="hover:text-foreground transition-colors"
            >
              Register
            </Link>
            <Link
              href="/dashboard"
              className="hover:text-foreground transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

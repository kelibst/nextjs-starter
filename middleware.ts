import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Role } from "@prisma/client";
import {
  checkAuth,
  isProtectedRoute,
  isPublicRoute,
  isAdminRoute,
  redirectToLogin,
  redirectToDashboard,
  hasRole,
} from "./lib/auth/middleware";

/**
 * Next.js Middleware
 * Handles authentication and authorization for all routes
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check authentication status
  const authResult = await checkAuth(request);

  // Handle protected routes
  if (isProtectedRoute(pathname)) {
    // Not authenticated - redirect to login
    if (!authResult.authenticated) {
      return redirectToLogin(request, "Please log in to continue");
    }

    // Check admin-only routes
    if (isAdminRoute(pathname)) {
      const userRole = authResult.role as Role;

      if (!hasRole(userRole, [Role.ADMIN, Role.SUPER_ADMIN])) {
        // User is authenticated but doesn't have admin access
        // Redirect to dashboard with error
        const url = new URL("/dashboard", request.url);
        url.searchParams.set("error", "You do not have permission to access this page");
        return NextResponse.redirect(url);
      }
    }
  }

  // Handle public auth pages (login, register)
  // If already authenticated, redirect to dashboard
  if (isPublicRoute(pathname) && pathname !== "/" && authResult.authenticated) {
    return redirectToDashboard(request);
  }

  // Allow request to continue
  return NextResponse.next();
}

/**
 * Middleware configuration
 * Specify which routes should run through middleware
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes - handled separately)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

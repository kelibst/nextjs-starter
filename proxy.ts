import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Role } from "@prisma/client";
import {
  checkAuth,
  isProtectedRoute,
  isAdminRoute,
  redirectToLogin,
  hasRole,
} from "./lib/auth/middleware";
import { ADMIN_BASE_PATH } from "./lib/auth/constants";

/**
 * Next.js Proxy (formerly Middleware)
 * Handles authentication and authorization for all routes
 * Runs at the Edge Runtime as a network boundary proxy
 */
export async function proxy(request: NextRequest) {
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
  // If already authenticated, redirect to appropriate dashboard based on role
  const authPages = ["/login", "/register"];
  if (authPages.includes(pathname) && authResult.authenticated) {
    const userRole = authResult.role as Role;

    // Redirect admins to admin panel, regular users to dashboard
    if (hasRole(userRole, [Role.ADMIN, Role.SUPER_ADMIN])) {
      return NextResponse.redirect(new URL(ADMIN_BASE_PATH, request.url));
    }

    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Allow request to continue
  return NextResponse.next();
}

/**
 * Proxy configuration
 * Specify which routes should run through proxy
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

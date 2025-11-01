import { NextRequest, NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { verifyAccessToken } from "./jwt";
import { COOKIE_NAMES } from "./constants";

/**
 * Auth middleware result
 */
export interface AuthMiddlewareResult {
  authenticated: boolean;
  userId?: string;
  role?: Role;
  error?: string;
}

/**
 * Check if request is authenticated
 * Extracts and verifies JWT access token from cookies
 *
 * @param request - Next.js request object
 * @returns Promise resolving to auth middleware result
 */
export async function checkAuth(request: NextRequest): Promise<AuthMiddlewareResult> {
  try {
    const accessToken = request.cookies.get(COOKIE_NAMES.ACCESS_TOKEN)?.value;

    if (!accessToken) {
      return {
        authenticated: false,
        error: "No access token found",
      };
    }

    // Verify access token
    const payload = await verifyAccessToken(accessToken);

    return {
      authenticated: true,
      userId: payload.userId,
      role: payload.role,
    };
  } catch (error) {
    return {
      authenticated: false,
      error: error instanceof Error ? error.message : "Invalid token",
    };
  }
}

/**
 * Check if user has required role
 *
 * @param userRole - User's role
 * @param allowedRoles - Array of allowed roles
 * @returns Boolean indicating if user has required role
 */
export function hasRole(userRole: Role, allowedRoles: Role[]): boolean {
  return allowedRoles.includes(userRole);
}

/**
 * Protected route patterns that require authentication
 */
export const PROTECTED_ROUTES = ["/dashboard", "/profile", "/admin"];

/**
 * Public route patterns that don't require authentication
 */
export const PUBLIC_ROUTES = ["/", "/login", "/register"];

/**
 * Admin-only route patterns
 */
export const ADMIN_ROUTES = ["/admin"];

/**
 * Check if a path is protected
 *
 * @param path - Request path
 * @returns Boolean indicating if path is protected
 */
export function isProtectedRoute(path: string): boolean {
  return PROTECTED_ROUTES.some((route) => path.startsWith(route));
}

/**
 * Check if a path is public
 *
 * @param path - Request path
 * @returns Boolean indicating if path is public
 */
export function isPublicRoute(path: string): boolean {
  return PUBLIC_ROUTES.some((route) => path === route || path.startsWith(route));
}

/**
 * Check if a path requires admin role
 *
 * @param path - Request path
 * @returns Boolean indicating if path requires admin
 */
export function isAdminRoute(path: string): boolean {
  return ADMIN_ROUTES.some((route) => path.startsWith(route));
}

/**
 * Create redirect response to login page
 *
 * @param request - Next.js request object
 * @param reason - Reason for redirect (optional)
 * @returns NextResponse redirect to login
 */
export function redirectToLogin(request: NextRequest, reason?: string): NextResponse {
  const url = new URL("/login", request.url);
  if (reason) {
    url.searchParams.set("error", reason);
  }
  url.searchParams.set("from", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

/**
 * Create redirect response to dashboard
 *
 * @param request - Next.js request object
 * @returns NextResponse redirect to dashboard
 */
export function redirectToDashboard(request: NextRequest): NextResponse {
  return NextResponse.redirect(new URL("/dashboard", request.url));
}

/**
 * Create unauthorized response
 *
 * @param message - Error message
 * @returns NextResponse with 401 status
 */
export function unauthorizedResponse(message: string = "Unauthorized"): NextResponse {
  return NextResponse.json({ error: message }, { status: 401 });
}

/**
 * Create forbidden response
 *
 * @param message - Error message
 * @returns NextResponse with 403 status
 */
export function forbiddenResponse(message: string = "Forbidden"): NextResponse {
  return NextResponse.json({ error: message }, { status: 403 });
}

import { NextRequest, NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { verifyAccessToken, verifyRefreshToken } from "./jwt";
import { COOKIE_NAMES, ADMIN_BASE_PATH } from "./constants";

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
 * Attempt to verify refresh token for authentication
 * Used as fallback when access token is missing or invalid
 *
 * @param request - Next.js request object
 * @returns Promise resolving to auth middleware result
 */
export async function checkRefreshToken(request: NextRequest): Promise<AuthMiddlewareResult> {
  try {
    const refreshToken = request.cookies.get(COOKIE_NAMES.REFRESH_TOKEN)?.value;

    if (!refreshToken) {
      return {
        authenticated: false,
        error: "No refresh token found",
      };
    }

    // Verify refresh token (can't refresh here, but at least check if valid)
    const payload = await verifyRefreshToken(refreshToken);

    return {
      authenticated: true,
      userId: payload.userId,
      role: payload.role,
    };
  } catch (error) {
    return {
      authenticated: false,
      error: "Refresh token invalid or expired",
    };
  }
}

/**
 * Check if request is authenticated
 * First tries access token, then falls back to refresh token verification
 * Note: This doesn't automatically refresh tokens (middleware can't set cookies)
 * Client must call /api/auth/refresh to get new tokens
 *
 * @param request - Next.js request object
 * @returns Promise resolving to auth middleware result
 */
export async function checkAuth(request: NextRequest): Promise<AuthMiddlewareResult> {
  try {
    const accessToken = request.cookies.get(COOKIE_NAMES.ACCESS_TOKEN)?.value;

    if (!accessToken) {
      // No access token - check if refresh token is valid
      return await checkRefreshToken(request);
    }

    // Verify access token
    const payload = await verifyAccessToken(accessToken);

    return {
      authenticated: true,
      userId: payload.userId,
      role: payload.role,
    };
  } catch (error) {
    // Access token invalid/expired - check refresh token
    return await checkRefreshToken(request);
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
 * Note: ADMIN_BASE_PATH is added dynamically in isProtectedRoute()
 */
export const PROTECTED_ROUTES = ["/dashboard", "/profile"];

/**
 * Public route patterns that don't require authentication
 */
export const PUBLIC_ROUTES = ["/", "/login", "/register", "/invite"];

/**
 * Check if a path is protected
 *
 * @param path - Request path
 * @returns Boolean indicating if path is protected
 */
export function isProtectedRoute(path: string): boolean {
  // Check if path starts with admin base path (configurable)
  if (path.startsWith(ADMIN_BASE_PATH)) {
    return true;
  }
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
 * Uses configurable ADMIN_BASE_PATH from environment
 *
 * @param path - Request path
 * @returns Boolean indicating if path requires admin
 */
export function isAdminRoute(path: string): boolean {
  return path.startsWith(ADMIN_BASE_PATH);
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
 * Determine where to redirect user after successful authentication
 * Checks 'from' query param, then uses role-based defaults
 *
 * @param from - The page user was trying to access (from query param)
 * @param userRole - User's role
 * @returns Redirect path
 */
export function getPostLoginRedirect(from: string | null, userRole: Role): string {
  // Check if there's a 'from' parameter (where user was trying to go)
  if (from && from !== "/login" && from !== "/register") {
    // Validate that user has permission to access 'from' route
    if (from.startsWith(ADMIN_BASE_PATH)) {
      // Admin route - only allow if user has admin role
      if (hasRole(userRole, [Role.ADMIN, Role.SUPER_ADMIN])) {
        return from;
      }
      // User doesn't have admin access, redirect to dashboard
      return "/dashboard";
    }
    // Non-admin protected route - allow access
    return from;
  }

  // No 'from' param - use role-based default
  if (hasRole(userRole, [Role.ADMIN, Role.SUPER_ADMIN])) {
    return ADMIN_BASE_PATH;
  }

  return "/dashboard";
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

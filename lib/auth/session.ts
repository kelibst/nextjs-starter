import { cookies } from "next/headers";
import { User, Role } from "@prisma/client";
import prisma from "@/lib/db/prisma";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  getRefreshTokenExpiry,
} from "./jwt";
import { COOKIE_NAMES, COOKIE_OPTIONS, TokenPayload } from "./constants";

/**
 * User session data (without sensitive fields)
 */
export interface SessionUser {
  id: string;
  username: string;
  email: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Convert Prisma User to SessionUser (remove password)
 */
export function toSessionUser(user: User): SessionUser {
  const { password: _, ...sessionUser } = user;
  return sessionUser;
}

/**
 * Create a new session for a user
 * Generates access and refresh tokens, stores refresh token in database,
 * and sets httpOnly cookies
 *
 * @param userId - User ID to create session for
 * @param role - User role
 * @returns Promise resolving to void
 */
export async function createSession(userId: string, role: Role): Promise<void> {
  const payload: TokenPayload = { userId, role };

  // Generate tokens
  const accessToken = await generateAccessToken(payload);
  const refreshToken = await generateRefreshToken(payload);

  // Store refresh token in database
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId,
      expiresAt: getRefreshTokenExpiry(),
    },
  });

  // Set cookies
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAMES.ACCESS_TOKEN, accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: 15 * 60, // 15 minutes
  });

  cookieStore.set(COOKIE_NAMES.REFRESH_TOKEN, refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

/**
 * Destroy the current session
 * Deletes refresh token from database and clears cookies
 *
 * @returns Promise resolving to void
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(COOKIE_NAMES.REFRESH_TOKEN)?.value;

  // Delete refresh token from database
  if (refreshToken) {
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
  }

  // Clear cookies
  cookieStore.delete(COOKIE_NAMES.ACCESS_TOKEN);
  cookieStore.delete(COOKIE_NAMES.REFRESH_TOKEN);
}

/**
 * Get the current authenticated user from the session
 *
 * @returns Promise resolving to SessionUser or null if not authenticated
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(COOKIE_NAMES.ACCESS_TOKEN)?.value;

    if (!accessToken) {
      return null;
    }

    // Verify and decode access token
    const payload = await verifyAccessToken(accessToken);

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      return null;
    }

    return toSessionUser(user);
  } catch (error) {
    // Token is invalid or expired
    return null;
  }
}

/**
 * Refresh the current session
 * Verifies refresh token, generates new access token, and rotates refresh token
 *
 * @returns Promise resolving to true if session was refreshed, false otherwise
 */
export async function refreshSession(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get(COOKIE_NAMES.REFRESH_TOKEN)?.value;

    if (!refreshToken) {
      return false;
    }

    // Check if refresh token exists in database and is not expired
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      // Token doesn't exist or is expired
      if (storedToken) {
        await prisma.refreshToken.delete({ where: { id: storedToken.id } });
      }
      return false;
    }

    const payload: TokenPayload = {
      userId: storedToken.userId,
      role: storedToken.user.role,
    };

    // Generate new access token
    const newAccessToken = await generateAccessToken(payload);

    // Generate new refresh token (rotation)
    const newRefreshToken = await generateRefreshToken(payload);

    // Delete old refresh token and create new one
    await prisma.$transaction([
      prisma.refreshToken.delete({ where: { id: storedToken.id } }),
      prisma.refreshToken.create({
        data: {
          token: newRefreshToken,
          userId: storedToken.userId,
          expiresAt: getRefreshTokenExpiry(),
        },
      }),
    ]);

    // Set new cookies
    cookieStore.set(COOKIE_NAMES.ACCESS_TOKEN, newAccessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60, // 15 minutes
    });

    cookieStore.set(COOKIE_NAMES.REFRESH_TOKEN, newRefreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Require authentication - throws error if not authenticated
 *
 * @returns Promise resolving to SessionUser
 * @throws Error if not authenticated
 */
export async function requireAuth(): Promise<SessionUser> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized - Please log in");
  }

  return user;
}

/**
 * Require specific role(s) - throws error if user doesn't have required role
 *
 * @param allowedRoles - Array of allowed roles
 * @returns Promise resolving to SessionUser
 * @throws Error if not authenticated or doesn't have required role
 */
export async function requireRole(...allowedRoles: Role[]): Promise<SessionUser> {
  const user = await requireAuth();

  if (!allowedRoles.includes(user.role)) {
    throw new Error(`Forbidden - Requires one of: ${allowedRoles.join(", ")}`);
  }

  return user;
}

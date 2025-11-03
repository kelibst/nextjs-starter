/**
 * Google OAuth Callback
 * GET /api/auth/oauth/google/callback
 * Handles the callback from Google after user authorization
 */

import { NextRequest, NextResponse } from "next/server";
import { google, isGoogleConfigured, type GoogleUserInfo } from "@/lib/auth/oauth";
import { isGoogleOAuthAllowed } from "@/lib/settings";
import { createSession } from "@/lib/auth/session";
import { userRepository } from "@/lib/repositories";
import { Role } from "@prisma/client";
import { logAuth, ActivityAction } from "@/lib/utils/activity-logger";

export async function GET(request: NextRequest) {
  try {
    // Check if Google OAuth is enabled
    const isAllowed = await isGoogleOAuthAllowed();
    if (!isAllowed) {
      return NextResponse.redirect(
        new URL("/login?error=oauth_disabled", request.url)
      );
    }

    // Check if Google is configured
    if (!isGoogleConfigured() || !google) {
      return NextResponse.redirect(
        new URL("/login?error=oauth_not_configured", request.url)
      );
    }

    // Get authorization code and state from URL
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");

    // Get stored state and code verifier from cookies
    const storedState = request.cookies.get("google_oauth_state")?.value;
    const storedCodeVerifier = request.cookies.get("google_code_verifier")?.value;

    // Validate state (CSRF protection)
    if (!code || !state || !storedState || state !== storedState) {
      return NextResponse.redirect(
        new URL("/login?error=invalid_state", request.url)
      );
    }

    if (!storedCodeVerifier) {
      return NextResponse.redirect(
        new URL("/login?error=missing_verifier", request.url)
      );
    }

    // Exchange authorization code for tokens
    const tokens = await google.validateAuthorizationCode(code, storedCodeVerifier);

    // Fetch user info from Google
    const userInfoResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokens.accessToken()}`,
        },
      }
    );

    if (!userInfoResponse.ok) {
      return NextResponse.redirect(
        new URL("/login?error=failed_to_fetch_user", request.url)
      );
    }

    const googleUser: GoogleUserInfo = await userInfoResponse.json();

    // Check if Google account has verified email
    if (!googleUser.verified_email) {
      return NextResponse.redirect(
        new URL("/login?error=email_not_verified", request.url)
      );
    }

    // Check if user exists by Google ID
    let user = await userRepository.findByGoogleId(googleUser.id);

    if (user) {
      // Existing Google user - just log in
      await createSession(user.id, user.role);

      // Log activity
      await logAuth(ActivityAction.LOGIN, user.id, {
        method: "google",
        googleId: googleUser.id,
      });

      // Clear OAuth cookies
      const response = NextResponse.redirect(
        new URL("/dashboard", request.url)
      );
      response.cookies.delete("google_oauth_state");
      response.cookies.delete("google_code_verifier");

      return response;
    }

    // Check if user exists by email (for account linking)
    user = await userRepository.findByEmail(googleUser.email);

    if (user) {
      // Link Google account to existing user
      await userRepository.linkGoogleAccount(
        user.id,
        googleUser.id,
        googleUser.picture
      );

      // Update email verification status (Google verified)
      await userRepository.updateById(user.id, {
        emailVerified: true,
      });

      // Create session
      await createSession(user.id, user.role);

      // Log activity
      await logAuth(ActivityAction.LOGIN, user.id, {
        method: "google",
        googleId: googleUser.id,
        linked: true,
      });

      // Clear OAuth cookies
      const response = NextResponse.redirect(
        new URL("/dashboard", request.url)
      );
      response.cookies.delete("google_oauth_state");
      response.cookies.delete("google_code_verifier");

      return response;
    }

    // Create new user with Google account
    const username = await generateUniqueUsername(googleUser.email);

    const newUser = await userRepository.createUser({
      username,
      email: googleUser.email,
      password: null, // OAuth users don't have passwords
      role: Role.USER,
      googleId: googleUser.id,
      avatarUrl: googleUser.picture,
      emailVerified: true, // Google verified
      registrationMethod: "google",
    });

    // Create session
    await createSession(newUser.id, newUser.role);

    // Log activity
    await logAuth(ActivityAction.REGISTER, newUser.id, {
      method: "google",
      googleId: googleUser.id,
    });

    // Clear OAuth cookies
    const response = NextResponse.redirect(
      new URL("/dashboard", request.url)
    );
    response.cookies.delete("google_oauth_state");
    response.cookies.delete("google_code_verifier");

    return response;
  } catch (error) {
    console.error("Google OAuth callback error:", error);
    return NextResponse.redirect(
      new URL("/login?error=oauth_failed", request.url)
    );
  }
}

/**
 * Generate a unique username from email
 * If username is taken, append random numbers
 */
async function generateUniqueUsername(email: string): Promise<string> {
  // Extract username from email (part before @)
  let baseUsername = email.split("@")[0].toLowerCase();

  // Remove special characters, keep only alphanumeric and dots
  baseUsername = baseUsername.replace(/[^a-z0-9.]/g, "");

  // Remove trailing dots
  baseUsername = baseUsername.replace(/\.+$/g, "");

  // Start with base username
  let username = baseUsername;
  let suffix = 1;

  // Keep trying until we find a unique username
  while (await userRepository.usernameExists(username)) {
    username = `${baseUsername}${suffix}`;
    suffix++;

    // Safety limit
    if (suffix > 9999) {
      username = `${baseUsername}${Date.now()}`;
      break;
    }
  }

  return username;
}

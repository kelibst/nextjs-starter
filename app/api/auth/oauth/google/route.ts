/**
 * Google OAuth Initiation
 * GET /api/auth/oauth/google
 * Redirects user to Google's authorization page
 */

import { NextRequest, NextResponse } from "next/server";
import { google, isGoogleConfigured } from "@/lib/auth/oauth";
import { isGoogleOAuthAllowed } from "@/lib/settings";
import { errorResponse } from "@/lib/api/response";
import { generateState, generateCodeVerifier } from "arctic";

export async function GET(request: NextRequest) {
  try {
    // Check if Google OAuth is enabled in settings
    const isAllowed = await isGoogleOAuthAllowed();
    if (!isAllowed) {
      return errorResponse("Google OAuth is not enabled", 403);
    }

    // Check if Google is configured
    if (!isGoogleConfigured() || !google) {
      return errorResponse("Google OAuth is not configured", 500);
    }

    // Generate state and code verifier for PKCE
    const state = generateState();
    const codeVerifier = generateCodeVerifier();

    // Create authorization URL
    const scopes = ["openid", "profile", "email"];
    const url = google.createAuthorizationURL(state, codeVerifier, scopes);

    // Store state and code verifier in httpOnly cookies (temporary, for callback)
    const response = NextResponse.redirect(url);

    response.cookies.set("google_oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 10, // 10 minutes
      path: "/",
    });

    response.cookies.set("google_code_verifier", codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 10, // 10 minutes
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Google OAuth initiation error:", error);
    return errorResponse("Failed to initiate Google OAuth", 500);
  }
}

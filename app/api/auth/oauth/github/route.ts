/**
 * GitHub OAuth Initiation
 * GET /api/auth/oauth/github
 * Redirects user to GitHub's authorization page
 */

import { NextRequest, NextResponse } from "next/server";
import { github, isGithubConfigured } from "@/lib/auth/oauth";
import { isGithubOAuthAllowed } from "@/lib/settings";
import { errorResponse } from "@/lib/api/response";
import { generateState } from "arctic";

export async function GET(request: NextRequest) {
  try {
    // Check if GitHub OAuth is enabled in settings
    const isAllowed = await isGithubOAuthAllowed();
    if (!isAllowed) {
      return errorResponse("GitHub OAuth is not enabled", 403);
    }

    // Check if GitHub is configured
    if (!isGithubConfigured() || !github) {
      return errorResponse("GitHub OAuth is not configured", 500);
    }

    // Generate state for CSRF protection
    const state = generateState();

    // Create authorization URL
    const scopes = ["user:email"];
    const url = github.createAuthorizationURL(state, scopes);

    // Store state in httpOnly cookie (temporary, for callback)
    const response = NextResponse.redirect(url);

    response.cookies.set("github_oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 10, // 10 minutes
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("GitHub OAuth initiation error:", error);
    return errorResponse("Failed to initiate GitHub OAuth", 500);
  }
}

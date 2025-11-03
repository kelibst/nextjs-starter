/**
 * GitHub OAuth Callback
 * GET /api/auth/oauth/github/callback
 * Handles the callback from GitHub after user authorization
 */

import { NextRequest, NextResponse } from "next/server";
import {
  github,
  isGithubConfigured,
  type GitHubUserInfo,
  type GitHubEmail,
} from "@/lib/auth/oauth";
import { isGithubOAuthAllowed } from "@/lib/settings";
import { createSession } from "@/lib/auth/session";
import { userRepository } from "@/lib/repositories";
import { Role } from "@prisma/client";
import { logAuth, ActivityAction } from "@/lib/utils/activity-logger";

export async function GET(request: NextRequest) {
  try {
    // Check if GitHub OAuth is enabled
    const isAllowed = await isGithubOAuthAllowed();
    if (!isAllowed) {
      return NextResponse.redirect(
        new URL("/login?error=oauth_disabled", request.url)
      );
    }

    // Check if GitHub is configured
    if (!isGithubConfigured() || !github) {
      return NextResponse.redirect(
        new URL("/login?error=oauth_not_configured", request.url)
      );
    }

    // Get authorization code and state from URL
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");

    // Get stored state from cookie
    const storedState = request.cookies.get("github_oauth_state")?.value;

    // Validate state (CSRF protection)
    if (!code || !state || !storedState || state !== storedState) {
      return NextResponse.redirect(
        new URL("/login?error=invalid_state", request.url)
      );
    }

    // Exchange authorization code for tokens
    const tokens = await github.validateAuthorizationCode(code);

    // Fetch user info from GitHub
    const userInfoResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokens.accessToken()}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!userInfoResponse.ok) {
      return NextResponse.redirect(
        new URL("/login?error=failed_to_fetch_user", request.url)
      );
    }

    const githubUser: GitHubUserInfo = await userInfoResponse.json();

    // GitHub email might be null if user set email as private
    // Fetch email from emails endpoint if not available
    let email = githubUser.email;

    if (!email) {
      const emailsResponse = await fetch("https://api.github.com/user/emails", {
        headers: {
          Authorization: `Bearer ${tokens.accessToken()}`,
          Accept: "application/vnd.github.v3+json",
        },
      });

      if (emailsResponse.ok) {
        const emails: GitHubEmail[] = await emailsResponse.json();

        // Find primary verified email
        const primaryEmail = emails.find((e) => e.primary && e.verified);

        if (primaryEmail) {
          email = primaryEmail.email;
        }
      }
    }

    // Email is required
    if (!email) {
      return NextResponse.redirect(
        new URL("/login?error=email_required", request.url)
      );
    }

    // Check if user exists by GitHub ID
    let user = await userRepository.findByGithubId(githubUser.id.toString());

    if (user) {
      // Existing GitHub user - just log in
      await createSession(user.id, user.role);

      // Log activity
      await logAuth(ActivityAction.LOGIN, user.id, {
        method: "github",
        githubId: githubUser.id,
      });

      // Clear OAuth cookie
      const response = NextResponse.redirect(
        new URL("/dashboard", request.url)
      );
      response.cookies.delete("github_oauth_state");

      return response;
    }

    // Check if user exists by email (for account linking)
    user = await userRepository.findByEmail(email);

    if (user) {
      // Link GitHub account to existing user
      await userRepository.linkGithubAccount(
        user.id,
        githubUser.id.toString(),
        githubUser.avatar_url
      );

      // Update email verification status (GitHub verified)
      await userRepository.updateById(user.id, {
        emailVerified: true,
      });

      // Create session
      await createSession(user.id, user.role);

      // Log activity
      await logAuth(ActivityAction.LOGIN, user.id, {
        method: "github",
        githubId: githubUser.id,
        linked: true,
      });

      // Clear OAuth cookie
      const response = NextResponse.redirect(
        new URL("/dashboard", request.url)
      );
      response.cookies.delete("github_oauth_state");

      return response;
    }

    // Create new user with GitHub account
    // Use GitHub username if available, otherwise generate from email
    const username = githubUser.login || (await generateUniqueUsername(email));

    const newUser = await userRepository.createUser({
      username,
      email,
      password: null, // OAuth users don't have passwords
      role: Role.USER,
      githubId: githubUser.id.toString(),
      avatarUrl: githubUser.avatar_url,
      emailVerified: true, // GitHub verified
      registrationMethod: "github",
    });

    // Create session
    await createSession(newUser.id, newUser.role);

    // Log activity
    await logAuth(ActivityAction.REGISTER, newUser.id, {
      method: "github",
      githubId: githubUser.id,
    });

    // Clear OAuth cookie
    const response = NextResponse.redirect(
      new URL("/dashboard", request.url)
    );
    response.cookies.delete("github_oauth_state");

    return response;
  } catch (error) {
    console.error("GitHub OAuth callback error:", error);
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

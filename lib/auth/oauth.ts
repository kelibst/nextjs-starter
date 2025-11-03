/**
 * OAuth Providers Configuration
 * Using Arctic library for OAuth 2.0 flows
 */

import { Google, GitHub } from "arctic";

/**
 * Google OAuth Provider
 * Requires GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables
 */
export const google =
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? new Google(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/oauth/google/callback`
      )
    : null;

/**
 * GitHub OAuth Provider
 * Requires GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET environment variables
 */
export const github =
  process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
    ? new GitHub(
        process.env.GITHUB_CLIENT_ID,
        process.env.GITHUB_CLIENT_SECRET,
        `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/oauth/github/callback`
      )
    : null;

/**
 * Check if Google OAuth is configured
 */
export function isGoogleConfigured(): boolean {
  return google !== null;
}

/**
 * Check if GitHub OAuth is configured
 */
export function isGithubConfigured(): boolean {
  return github !== null;
}

/**
 * OAuth Provider Types
 */
export type OAuthProvider = "google" | "github";

/**
 * OAuth User Profile (normalized across providers)
 */
export interface OAuthProfile {
  id: string; // Provider user ID
  email: string;
  name: string;
  avatarUrl?: string;
}

/**
 * Google User Info Response
 * https://www.googleapis.com/oauth2/v2/userinfo
 */
export interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}

/**
 * GitHub User Info Response
 * https://api.github.com/user
 */
export interface GitHubUserInfo {
  id: number;
  login: string; // GitHub username
  email: string | null; // May be null if private
  name: string | null;
  avatar_url: string;
}

/**
 * GitHub Email Response (for fetching primary email if not public)
 * https://api.github.com/user/emails
 */
export interface GitHubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
  visibility: "public" | "private" | null;
}

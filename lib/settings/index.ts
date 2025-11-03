/**
 * System Settings Service
 * Manages admin-configurable system-wide settings
 */

import prisma from "@/lib/db/prisma";

// ============================================================================
// Types
// ============================================================================

export interface AuthSettings {
  // Authentication methods
  allowPasswordAuth: boolean;
  allowGoogleOAuth: boolean;
  allowGithubOAuth: boolean;

  // Registration requirements
  requireUsername: boolean;
  requireEmail: boolean;

  // Security options
  emailVerificationRequired: boolean;
  twoFactorRequired: boolean;
  allowSelfRegistration: boolean;
}

export type SettingKey = "auth_settings";

// ============================================================================
// Default Settings
// ============================================================================

const DEFAULT_AUTH_SETTINGS: AuthSettings = {
  // Authentication methods
  allowPasswordAuth: true, // Password auth ON by default
  allowGoogleOAuth: false, // OAuth OFF by default (requires setup)
  allowGithubOAuth: false, // OAuth OFF by default (requires setup)

  // Registration requirements
  requireUsername: true, // Username required by default
  requireEmail: true, // Email required by default

  // Security options
  emailVerificationRequired: false, // Email verification OFF (opt-in)
  twoFactorRequired: false, // 2FA OFF (opt-in)
  allowSelfRegistration: true, // Public registration allowed
};

// ============================================================================
// Settings Service
// ============================================================================

/**
 * Get authentication settings
 */
export async function getAuthSettings(): Promise<AuthSettings> {
  try {
    const setting = await prisma.systemSettings.findUnique({
      where: { key: "auth_settings" },
    });

    if (!setting) {
      // Return defaults if not set
      return DEFAULT_AUTH_SETTINGS;
    }

    // Type guard to ensure value is an object
    if (typeof setting.value !== "object" || setting.value === null || Array.isArray(setting.value)) {
      return DEFAULT_AUTH_SETTINGS;
    }

    return setting.value as unknown as AuthSettings;
  } catch (error) {
    console.error("Error fetching auth settings:", error);
    // Return defaults on error
    return DEFAULT_AUTH_SETTINGS;
  }
}

/**
 * Update authentication settings
 */
export async function updateAuthSettings(
  settings: Partial<AuthSettings>,
  updatedBy: string
): Promise<AuthSettings> {
  const currentSettings = await getAuthSettings();
  const newSettings: AuthSettings = {
    ...currentSettings,
    ...settings,
  };

  await prisma.systemSettings.upsert({
    where: { key: "auth_settings" },
    create: {
      key: "auth_settings",
      value: newSettings as any,
      updatedBy,
    },
    update: {
      value: newSettings as any,
      updatedBy,
    },
  });

  return newSettings;
}

/**
 * Check if email verification is required
 */
export async function isEmailVerificationRequired(): Promise<boolean> {
  const settings = await getAuthSettings();
  return settings.emailVerificationRequired;
}

/**
 * Check if 2FA is required
 */
export async function isTwoFactorRequired(): Promise<boolean> {
  const settings = await getAuthSettings();
  return settings.twoFactorRequired;
}

/**
 * Check if self-registration is allowed
 */
export async function isSelfRegistrationAllowed(): Promise<boolean> {
  const settings = await getAuthSettings();
  return settings.allowSelfRegistration;
}

/**
 * Check if password authentication is allowed
 */
export async function isPasswordAuthAllowed(): Promise<boolean> {
  const settings = await getAuthSettings();
  return settings.allowPasswordAuth;
}

/**
 * Check if Google OAuth is allowed
 */
export async function isGoogleOAuthAllowed(): Promise<boolean> {
  const settings = await getAuthSettings();
  return settings.allowGoogleOAuth && !!process.env.GOOGLE_CLIENT_ID;
}

/**
 * Check if GitHub OAuth is allowed
 */
export async function isGithubOAuthAllowed(): Promise<boolean> {
  const settings = await getAuthSettings();
  return settings.allowGithubOAuth && !!process.env.GITHUB_CLIENT_ID;
}

/**
 * Check if username is required for registration
 */
export async function isUsernameRequired(): Promise<boolean> {
  const settings = await getAuthSettings();
  return settings.requireUsername;
}

/**
 * Check if email is required for registration
 */
export async function isEmailRequired(): Promise<boolean> {
  const settings = await getAuthSettings();
  return settings.requireEmail;
}

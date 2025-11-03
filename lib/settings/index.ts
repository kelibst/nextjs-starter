/**
 * System Settings Service
 * Manages admin-configurable system-wide settings
 */

import prisma from "@/lib/db/prisma";

// ============================================================================
// Types
// ============================================================================

export interface AuthSettings {
  emailVerificationRequired: boolean;
  twoFactorRequired: boolean;
  allowSelfRegistration: boolean;
}

export type SettingKey = "auth_settings";

// ============================================================================
// Default Settings
// ============================================================================

const DEFAULT_AUTH_SETTINGS: AuthSettings = {
  emailVerificationRequired: false, // Default to OFF (opt-in)
  twoFactorRequired: false, // Default to OFF (opt-in)
  allowSelfRegistration: true, // Allow public registration
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

import { test, expect } from "@playwright/test";

/**
 * Dashboard and Profile E2E Tests
 * Tests user dashboard, profile viewing, and profile updates
 */

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto("/login");
    await page.getByLabel(/Email or Username/i).fill("admin");
    await page.getByLabel(/^Password$/i).fill("Admin123!");
    await page.getByRole("button", { name: /Sign in/i }).click();
    await expect(page).toHaveURL("/dashboard");
  });

  test("should display user dashboard with stats", async ({ page }) => {
    // Check welcome message
    await expect(page.getByText(/Welcome back/i)).toBeVisible();

    // Check stats cards are visible
    await expect(page.getByText(/Username/i)).toBeVisible();
    await expect(page.getByText(/Email/i)).toBeVisible();
    await expect(page.getByText(/Role/i)).toBeVisible();
    await expect(page.getByText(/Member Since/i)).toBeVisible();

    // Check admin username is displayed
    await expect(page.getByText(/admin/i)).toBeVisible();
  });

  test("should display navigation sidebar", async ({ page }) => {
    // Check sidebar links
    await expect(page.getByRole("link", { name: /^Dashboard$/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /^Profile$/i })).toBeVisible();
  });

  test("should navigate to profile page from sidebar", async ({ page }) => {
    await page.getByRole("link", { name: /^Profile$/i }).click();
    await expect(page).toHaveURL("/dashboard/profile");
    await expect(page.getByText(/Profile Settings/i)).toBeVisible();
  });

  test("should display user navbar with dropdown", async ({ page }) => {
    // Check navbar is visible
    await expect(page.getByRole("button", { name: /admin/i })).toBeVisible();

    // Open user menu
    await page.getByRole("button", { name: /admin/i }).click();

    // Check dropdown menu items
    await expect(page.getByRole("menuitem", { name: /Profile/i })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: /Settings/i })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: /Log out/i })).toBeVisible();
  });

  test("should navigate to profile from navbar dropdown", async ({ page }) => {
    await page.getByRole("button", { name: /admin/i }).click();
    await page.getByRole("menuitem", { name: /Profile/i }).click();
    await expect(page).toHaveURL("/dashboard/profile");
  });
});

test.describe("Profile Management", () => {
  test.beforeEach(async ({ page }) => {
    // Login and navigate to profile page
    await page.goto("/login");
    await page.getByLabel(/Email or Username/i).fill("admin");
    await page.getByLabel(/^Password$/i).fill("Admin123!");
    await page.getByRole("button", { name: /Sign in/i }).click();
    await page.goto("/dashboard/profile");
  });

  test("should display profile information", async ({ page }) => {
    await expect(page.getByText(/Profile Settings/i)).toBeVisible();
    await expect(page.getByText(/Account Information/i)).toBeVisible();

    // Check user details are displayed
    await expect(page.getByText(/admin/i)).toBeVisible();
    await expect(page.getByText(/admin@example\.com/i)).toBeVisible();
    await expect(page.getByText(/SUPER_ADMIN/i)).toBeVisible();
  });

  test("should display password change form", async ({ page }) => {
    await expect(page.getByText(/Change Password/i)).toBeVisible();
    await expect(page.getByLabel(/Current Password/i)).toBeVisible();
    await expect(page.getByLabel(/New Password/i)).toBeVisible();
    await expect(page.getByLabel(/Confirm New Password/i)).toBeVisible();
  });

  test("should change password successfully", async ({ page }) => {
    const newPassword = "NewAdmin123!";

    // Fill password change form
    await page.getByLabel(/Current Password/i).fill("Admin123!");
    await page.getByLabel(/New Password/i).fill(newPassword);
    await page.getByLabel(/Confirm New Password/i).fill(newPassword);

    // Submit form
    await page.getByRole("button", { name: /Change Password/i }).click();

    // Wait for success toast
    await expect(page.getByText(/Password updated successfully/i)).toBeVisible({ timeout: 5000 });

    // Logout
    await page.getByRole("button", { name: /admin/i }).click();
    await page.getByRole("menuitem", { name: /Log out/i }).click();
    await expect(page).toHaveURL("/login");

    // Login with new password
    await page.getByLabel(/Email or Username/i).fill("admin");
    await page.getByLabel(/^Password$/i).fill(newPassword);
    await page.getByRole("button", { name: /Sign in/i }).click();
    await expect(page).toHaveURL("/dashboard");

    // Change password back to original
    await page.goto("/dashboard/profile");
    await page.getByLabel(/Current Password/i).fill(newPassword);
    await page.getByLabel(/New Password/i).fill("Admin123!");
    await page.getByLabel(/Confirm New Password/i).fill("Admin123!");
    await page.getByRole("button", { name: /Change Password/i }).click();
    await expect(page.getByText(/Password updated successfully/i)).toBeVisible({ timeout: 5000 });
  });

  test("should validate current password when changing password", async ({ page }) => {
    // Fill with wrong current password
    await page.getByLabel(/Current Password/i).fill("WrongPassword123!");
    await page.getByLabel(/New Password/i).fill("NewPassword123!");
    await page.getByLabel(/Confirm New Password/i).fill("NewPassword123!");

    await page.getByRole("button", { name: /Change Password/i }).click();

    // Should show error
    await expect(page.getByText(/Current password is incorrect/i)).toBeVisible({ timeout: 5000 });
  });

  test("should validate new password requirements", async ({ page }) => {
    await page.getByLabel(/Current Password/i).fill("Admin123!");
    await page.getByLabel(/New Password/i).fill("weak");
    await page.getByLabel(/Confirm New Password/i).fill("weak");

    await page.getByRole("button", { name: /Change Password/i }).click();

    // Should show validation error
    await expect(
      page.getByText(/Password must be at least 8 characters/i)
    ).toBeVisible();
  });

  test("should validate new password confirmation match", async ({ page }) => {
    await page.getByLabel(/Current Password/i).fill("Admin123!");
    await page.getByLabel(/New Password/i).fill("NewPassword123!");
    await page.getByLabel(/Confirm New Password/i).fill("DifferentPassword123!");

    await page.getByRole("button", { name: /Change Password/i }).click();

    // Should show mismatch error
    await expect(page.getByText(/Passwords do not match/i)).toBeVisible();
  });

  test("should require all password fields", async ({ page }) => {
    // Click submit without filling fields
    await page.getByRole("button", { name: /Change Password/i }).click();

    // Should show validation errors
    await expect(page.getByText(/Current password is required/i)).toBeVisible();
    await expect(page.getByText(/New password is required/i)).toBeVisible();
  });
});

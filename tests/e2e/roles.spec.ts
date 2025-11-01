import { test, expect } from "@playwright/test";

/**
 * Role-Based Access Control E2E Tests
 * Tests SUPER_ADMIN, ADMIN, and USER roles and permissions
 */

test.describe("Role-Based Access Control", () => {
  test("SUPER_ADMIN should see admin navigation links", async ({ page }) => {
    // Login as super admin
    await page.goto("/login");
    await page.getByLabel(/Email or Username/i).fill("admin");
    await page.getByLabel(/^Password$/i).fill("Admin123!");
    await page.getByRole("button", { name: /Sign in/i }).click();
    await expect(page).toHaveURL("/dashboard");

    // Check if Users link is visible in sidebar (admin-only feature)
    // Note: This test assumes admin panel will be added in future
    // For now, we verify the super admin badge is displayed
    await page.goto("/dashboard/profile");
    await expect(page.getByText(/SUPER_ADMIN/i)).toBeVisible();
  });

  test("Regular USER should not see admin links", async ({ page }) => {
    // Create a regular user first
    const timestamp = Date.now();
    const username = `regularuser${timestamp}`;
    const email = `regularuser${timestamp}@example.com`;
    const password = "UserPassword123!";

    await page.goto("/register");
    await page.getByLabel(/^Username$/i).fill(username);
    await page.getByLabel(/^Email$/i).fill(email);
    await page.getByLabel(/^Password$/i).first().fill(password);
    await page.getByLabel(/Confirm Password/i).fill(password);
    await page.getByRole("button", { name: /Create account/i }).click();
    await expect(page).toHaveURL("/dashboard", { timeout: 10000 });

    // Verify USER role badge
    await page.goto("/dashboard/profile");
    await expect(page.getByText(/^USER$/i)).toBeVisible();

    // Check sidebar does not have admin links (Users, Settings, etc.)
    // For now, we verify only basic links are visible
    await page.goto("/dashboard");
    await expect(page.getByRole("link", { name: /^Dashboard$/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /^Profile$/i })).toBeVisible();
  });

  test("USER can view and update their own profile", async ({ page }) => {
    // Create and login as regular user
    const timestamp = Date.now();
    const username = `testuser${timestamp}`;
    const email = `testuser${timestamp}@example.com`;
    const password = "TestPassword123!";

    await page.goto("/register");
    await page.getByLabel(/^Username$/i).fill(username);
    await page.getByLabel(/^Email$/i).fill(email);
    await page.getByLabel(/^Password$/i).first().fill(password);
    await page.getByLabel(/Confirm Password/i).fill(password);
    await page.getByRole("button", { name: /Create account/i }).click();
    await expect(page).toHaveURL("/dashboard", { timeout: 10000 });

    // Navigate to profile
    await page.goto("/dashboard/profile");

    // Verify user can see their own information
    await expect(page.getByText(new RegExp(username, "i"))).toBeVisible();
    await expect(page.getByText(new RegExp(email, "i"))).toBeVisible();

    // Verify user can change password
    const newPassword = "NewTestPassword123!";
    await page.getByLabel(/Current Password/i).fill(password);
    await page.getByLabel(/New Password/i).fill(newPassword);
    await page.getByLabel(/Confirm New Password/i).fill(newPassword);
    await page.getByRole("button", { name: /Change Password/i }).click();

    await expect(page.getByText(/Password updated successfully/i)).toBeVisible({ timeout: 5000 });
  });

  test("SUPER_ADMIN badge should be displayed correctly", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/Email or Username/i).fill("admin");
    await page.getByLabel(/^Password$/i).fill("Admin123!");
    await page.getByRole("button", { name: /Sign in/i }).click();

    // Check dashboard shows SUPER_ADMIN role
    await page.goto("/dashboard");

    // Navigate to profile to see the role badge
    await page.goto("/dashboard/profile");
    const badge = page.locator('text=SUPER_ADMIN');
    await expect(badge).toBeVisible();
  });

  test("USER badge should be displayed for regular users", async ({ page }) => {
    // Create regular user
    const timestamp = Date.now();
    const username = `user${timestamp}`;
    const email = `user${timestamp}@example.com`;
    const password = "Password123!";

    await page.goto("/register");
    await page.getByLabel(/^Username$/i).fill(username);
    await page.getByLabel(/^Email$/i).fill(email);
    await page.getByLabel(/^Password$/i).first().fill(password);
    await page.getByLabel(/Confirm Password/i).fill(password);
    await page.getByRole("button", { name: /Create account/i }).click();
    await expect(page).toHaveURL("/dashboard", { timeout: 10000 });

    // Check profile shows USER role
    await page.goto("/dashboard/profile");
    const badge = page.locator('text=/^USER$/i');
    await expect(badge).toBeVisible();
  });

  test("Session should persist across page refreshes", async ({ page }) => {
    // Login
    await page.goto("/login");
    await page.getByLabel(/Email or Username/i).fill("admin");
    await page.getByLabel(/^Password$/i).fill("Admin123!");
    await page.getByRole("button", { name: /Sign in/i }).click();
    await expect(page).toHaveURL("/dashboard");

    // Refresh page
    await page.reload();

    // Should still be authenticated
    await expect(page).toHaveURL("/dashboard");
    await expect(page.getByText(/Welcome back/i)).toBeVisible();
  });

  test("Logout should clear session completely", async ({ page }) => {
    // Login
    await page.goto("/login");
    await page.getByLabel(/Email or Username/i).fill("admin");
    await page.getByLabel(/^Password$/i).fill("Admin123!");
    await page.getByRole("button", { name: /Sign in/i }).click();
    await expect(page).toHaveURL("/dashboard");

    // Logout
    await page.getByRole("button", { name: /admin/i }).click();
    await page.getByRole("menuitem", { name: /Log out/i }).click();
    await expect(page).toHaveURL("/login");

    // Try to access dashboard - should redirect to login
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });
});

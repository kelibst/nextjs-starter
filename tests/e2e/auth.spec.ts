import { test, expect } from "@playwright/test";

/**
 * Authentication Flow E2E Tests
 * Tests user registration, login, logout, and session management
 */

test.describe("Authentication Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Start each test from the home page
    await page.goto("/");
  });

  test("should display landing page with sign in and sign up buttons", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /Production-Ready Authentication/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Sign In/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Get Started/i })).toBeVisible();
  });

  test("should navigate to login page", async ({ page }) => {
    await page.getByRole("link", { name: /Sign In/i }).click();
    await expect(page).toHaveURL("/login");
    await expect(page.getByRole("heading", { name: /Welcome back/i })).toBeVisible();
  });

  test("should navigate to register page", async ({ page }) => {
    await page.getByRole("link", { name: /Get Started/i }).click();
    await expect(page).toHaveURL("/register");
    await expect(page.getByRole("heading", { name: /Create an account/i })).toBeVisible();
  });

  test("should login with default admin credentials", async ({ page }) => {
    // Navigate to login page
    await page.goto("/login");

    // Fill in login form
    await page.getByLabel(/Email or Username/i).fill("admin");
    await page.getByLabel(/^Password$/i).fill("Admin123!");

    // Submit form
    await page.getByRole("button", { name: /Sign in/i }).click();

    // Should redirect to dashboard
    await expect(page).toHaveURL("/dashboard");
    await expect(page.getByText(/Welcome back/i)).toBeVisible();
  });

  test("should show error for invalid credentials", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel(/Email or Username/i).fill("admin");
    await page.getByLabel(/^Password$/i).fill("WrongPassword123!");

    await page.getByRole("button", { name: /Sign in/i }).click();

    // Should show error message
    await expect(page.getByText(/Invalid credentials/i)).toBeVisible();
  });

  test("should validate required fields on login", async ({ page }) => {
    await page.goto("/login");

    // Click submit without filling fields
    await page.getByRole("button", { name: /Sign in/i }).click();

    // Should show validation errors
    await expect(page.getByText(/Email or username is required/i)).toBeVisible();
    await expect(page.getByText(/Password is required/i)).toBeVisible();
  });

  test("should register a new user and auto-login", async ({ page }) => {
    const timestamp = Date.now();
    const username = `testuser${timestamp}`;
    const email = `testuser${timestamp}@example.com`;
    const password = "TestPassword123!";

    await page.goto("/register");

    // Fill registration form
    await page.getByLabel(/^Username$/i).fill(username);
    await page.getByLabel(/^Email$/i).fill(email);
    await page.getByLabel(/^Password$/i).first().fill(password);
    await page.getByLabel(/Confirm Password/i).fill(password);

    // Submit form
    await page.getByRole("button", { name: /Create account/i }).click();

    // Should auto-login and redirect to dashboard
    await expect(page).toHaveURL("/dashboard", { timeout: 10000 });
    await expect(page.getByText(new RegExp(username, "i"))).toBeVisible();
  });

  test("should validate password requirements on registration", async ({ page }) => {
    await page.goto("/register");

    const timestamp = Date.now();
    await page.getByLabel(/^Username$/i).fill(`testuser${timestamp}`);
    await page.getByLabel(/^Email$/i).fill(`testuser${timestamp}@example.com`);
    await page.getByLabel(/^Password$/i).first().fill("weak");
    await page.getByLabel(/Confirm Password/i).fill("weak");

    await page.getByRole("button", { name: /Create account/i }).click();

    // Should show password validation error
    await expect(
      page.getByText(/Password must be at least 8 characters/i)
    ).toBeVisible();
  });

  test("should validate password confirmation match", async ({ page }) => {
    await page.goto("/register");

    const timestamp = Date.now();
    await page.getByLabel(/^Username$/i).fill(`testuser${timestamp}`);
    await page.getByLabel(/^Email$/i).fill(`testuser${timestamp}@example.com`);
    await page.getByLabel(/^Password$/i).first().fill("TestPassword123!");
    await page.getByLabel(/Confirm Password/i).fill("DifferentPassword123!");

    await page.getByRole("button", { name: /Create account/i }).click();

    // Should show password mismatch error
    await expect(page.getByText(/Passwords do not match/i)).toBeVisible();
  });

  test("should logout successfully", async ({ page }) => {
    // Login first
    await page.goto("/login");
    await page.getByLabel(/Email or Username/i).fill("admin");
    await page.getByLabel(/^Password$/i).fill("Admin123!");
    await page.getByRole("button", { name: /Sign in/i }).click();
    await expect(page).toHaveURL("/dashboard");

    // Open user menu and logout
    await page.getByRole("button", { name: /admin/i }).click();
    await page.getByRole("menuitem", { name: /Log out/i }).click();

    // Should redirect to login page
    await expect(page).toHaveURL("/login");
  });

  test("should redirect authenticated user from login page to dashboard", async ({ page }) => {
    // Login first
    await page.goto("/login");
    await page.getByLabel(/Email or Username/i).fill("admin");
    await page.getByLabel(/^Password$/i).fill("Admin123!");
    await page.getByRole("button", { name: /Sign in/i }).click();
    await expect(page).toHaveURL("/dashboard");

    // Try to access login page again
    await page.goto("/login");

    // Should redirect back to dashboard
    await expect(page).toHaveURL("/dashboard");
  });

  test("should redirect unauthenticated user from dashboard to login", async ({ page }) => {
    // Try to access dashboard without logging in
    await page.goto("/dashboard");

    // Should redirect to login page
    await expect(page).toHaveURL(/\/login/);
  });
});

# E2E Testing Guide

This project uses **Playwright** for end-to-end testing to ensure the authentication system works correctly from a user's perspective.

## Table of Contents

- [Test Coverage](#test-coverage)
- [Prerequisites](#prerequisites)
- [Running Tests](#running-tests)
- [Test Structure](#test-structure)
- [Writing New Tests](#writing-new-tests)
- [CI/CD Integration](#cicd-integration)
- [Troubleshooting](#troubleshooting)

---

## Test Coverage

The E2E test suite covers the complete authentication flow and user management:

### 1. Authentication Flow (`tests/e2e/auth.spec.ts`)
- ✅ Landing page display and navigation
- ✅ Login with valid credentials
- ✅ Login with invalid credentials
- ✅ Login form validation
- ✅ User registration with auto-login
- ✅ Registration form validation (password requirements, confirmation match)
- ✅ Logout functionality
- ✅ Authenticated user redirection (login page → dashboard)
- ✅ Unauthenticated user protection (dashboard → login)

### 2. Dashboard & Profile (`tests/e2e/dashboard.spec.ts`)
- ✅ Dashboard stats display
- ✅ Navigation sidebar
- ✅ User navbar with dropdown menu
- ✅ Profile page display
- ✅ Profile information viewing
- ✅ Password change with validation
- ✅ Current password verification
- ✅ New password requirements validation
- ✅ Password confirmation matching

### 3. Role-Based Access Control (`tests/e2e/roles.spec.ts`)
- ✅ SUPER_ADMIN role display and permissions
- ✅ USER role display and permissions
- ✅ Role badge display (SUPER_ADMIN, ADMIN, USER)
- ✅ User self-service profile management
- ✅ Session persistence across page refreshes
- ✅ Complete session clearing on logout

---

## Prerequisites

Before running E2E tests, ensure you have:

1. **Database Running**: PostgreSQL must be running
   ```bash
   npm run docker:up
   ```

2. **Database Migrated**: Schema must be up to date
   ```bash
   npm run db:migrate
   ```

3. **Database Seeded**: Default admin user must exist
   ```bash
   npm run db:seed
   ```

4. **Playwright Installed**: Browser binaries installed
   ```bash
   npx playwright install chromium
   ```

---

## Running Tests

### Run All Tests (Headless)
```bash
npm run test:e2e
```
Runs all tests in headless mode (no browser UI). Best for CI/CD.

### Run Tests with UI Mode
```bash
npm run test:e2e:ui
```
Opens Playwright's interactive UI where you can:
- Watch tests run in real-time
- Debug failures step-by-step
- Time-travel through test execution
- Inspect DOM and network requests

### Debug Mode (Step-by-Step)
```bash
npm run test:e2e:debug
```
Runs tests with Playwright Inspector for step-by-step debugging:
- Pause on failures
- Step through test actions
- Inspect page state
- View console logs

### Run Specific Test File
```bash
npx playwright test tests/e2e/auth.spec.ts
```

### Run Specific Test by Name
```bash
npx playwright test -g "should login with default admin credentials"
```

### Run Tests in Headed Mode (See Browser)
```bash
npx playwright test --headed
```

### Generate Test Report
After running tests, view the HTML report:
```bash
npx playwright show-report
```

---

## Test Structure

### Configuration (`playwright.config.ts`)
```typescript
- Test directory: ./tests/e2e
- Timeout: 30 seconds per test
- Base URL: http://localhost:3000
- Browser: Chromium (Desktop Chrome)
- Web Server: Auto-starts dev server before tests
- Reports: HTML report with screenshots/videos on failure
```

### Test Files

**tests/e2e/auth.spec.ts**
Authentication flow tests (login, register, logout, validation)

**tests/e2e/dashboard.spec.ts**
Dashboard and profile management tests (viewing, updating, password change)

**tests/e2e/roles.spec.ts**
Role-based access control tests (SUPER_ADMIN, ADMIN, USER permissions)

### Test Patterns

Each test file follows this structure:

```typescript
import { test, expect } from "@playwright/test";

test.describe("Feature Name", () => {
  test.beforeEach(async ({ page }) => {
    // Setup: Navigate to starting page or login
  });

  test("should do something", async ({ page }) => {
    // Arrange: Set up test data
    // Act: Perform user actions
    // Assert: Verify expected outcomes
  });
});
```

---

## Writing New Tests

### Example: Adding a New Test

```typescript
import { test, expect } from "@playwright/test";

test("should display user email on dashboard", async ({ page }) => {
  // Login
  await page.goto("/login");
  await page.getByLabel(/Email or Username/i).fill("admin");
  await page.getByLabel(/^Password$/i).fill("Admin123!");
  await page.getByRole("button", { name: /Sign in/i }).click();

  // Navigate to dashboard
  await expect(page).toHaveURL("/dashboard");

  // Verify email is displayed
  await expect(page.getByText("admin@example.com")).toBeVisible();
});
```

### Best Practices

1. **Use Semantic Selectors**: Prefer `getByRole`, `getByLabel`, `getByText` over CSS selectors
2. **Add Explicit Waits**: Use `toBeVisible()` and `toHaveURL()` with timeouts
3. **Isolate Tests**: Each test should be independent (no shared state)
4. **Clean Up**: Use `beforeEach` for setup, logout after creating test users
5. **Descriptive Names**: Test names should clearly describe what they verify
6. **Test User Perspective**: Focus on what users see and do, not implementation details

### Playwright Locator Guide

```typescript
// Recommended (Semantic)
page.getByRole("button", { name: /Sign in/i })
page.getByLabel(/Email or Username/i)
page.getByText(/Welcome back/i)
page.getByPlaceholder("Enter your email")

// Avoid (Fragile)
page.locator(".btn-primary")
page.locator("#email-input")
page.locator("div > span > button")
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_USER: authuser
          POSTGRES_PASSWORD: authpassword
          POSTGRES_DB: authdb
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run database migrations
        run: npm run db:migrate
        env:
          DATABASE_URL: postgresql://authuser:authpassword@localhost:5432/authdb

      - name: Seed database
        run: npm run db:seed
        env:
          DATABASE_URL: postgresql://authuser:authpassword@localhost:5432/authdb

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium

      - name: Run E2E tests
        run: npm run test:e2e
        env:
          DATABASE_URL: postgresql://authuser:authpassword@localhost:5432/authdb
          JWT_SECRET: test-secret-key-minimum-32-characters-long
          JWT_REFRESH_SECRET: test-refresh-secret-key-minimum-32-characters

      - name: Upload test report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

---

## Troubleshooting

### Common Issues

#### 1. **Tests Timeout**
```
Error: Test timeout of 30000ms exceeded
```

**Solutions:**
- Increase timeout in `playwright.config.ts`: `timeout: 60 * 1000`
- Check if dev server is running: `npm run dev`
- Verify database is accessible: `docker ps`

#### 2. **Database Connection Failed**
```
Error: Can't reach database server
```

**Solutions:**
```bash
# Check if PostgreSQL is running
docker ps

# Restart database
npm run docker:down
npm run docker:up

# Verify connection
npm run db:migrate
```

#### 3. **Default Admin Not Found**
```
Error: Login failed for admin user
```

**Solutions:**
```bash
# Re-seed database
npm run db:seed

# Or reset database completely
npm run db:reset
```

#### 4. **Port Already in Use**
```
Error: Port 3000 is already in use
```

**Solutions:**
```bash
# Kill existing process
lsof -ti:3000 | xargs kill -9

# Or use different port
PLAYWRIGHT_TEST_BASE_URL=http://localhost:3001 npm run test:e2e
```

#### 5. **Flaky Tests (Intermittent Failures)**

**Solutions:**
- Add explicit waits: `await expect(element).toBeVisible({ timeout: 10000 })`
- Use `page.waitForLoadState('networkidle')` after navigation
- Increase retries in `playwright.config.ts`: `retries: 2`

#### 6. **Browser Not Installed**
```
Error: Executable doesn't exist
```

**Solutions:**
```bash
# Install browsers
npx playwright install chromium

# Install with system dependencies
npx playwright install --with-deps chromium
```

---

## Test Coverage Report

To see which parts of your application are tested:

```bash
# Run tests with coverage (requires additional setup)
npm run test:e2e

# View detailed report
npx playwright show-report
```

The HTML report shows:
- Pass/fail status for each test
- Screenshots of failures
- Video recordings (if enabled)
- Trace files for debugging
- Execution time per test

---

## Debugging Tips

### 1. **Pause Test Execution**
```typescript
test("debugging example", async ({ page }) => {
  await page.goto("/login");

  // Pause test here - browser will stay open
  await page.pause();

  await page.getByLabel(/Email/i).fill("admin");
});
```

### 2. **View Test Execution Trace**
```bash
# Run with trace
npx playwright test --trace on

# View trace
npx playwright show-trace trace.zip
```

### 3. **Inspect Element During Test**
```typescript
await page.locator("button").click();
await page.screenshot({ path: "debug.png" });
console.log(await page.content()); // Full HTML
```

### 4. **Slow Down Test Execution**
```bash
npx playwright test --headed --slow-mo=1000
```

---

## Next Steps

- **Add API Tests**: Test API endpoints directly (see [API_TESTING.md](API_TESTING.md))
- **Add Visual Regression Tests**: Use Playwright's screenshot comparison
- **Add Performance Tests**: Measure page load times and Core Web Vitals
- **Add Accessibility Tests**: Integrate axe-core for a11y testing

---

## Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Test Generator](https://playwright.dev/docs/codegen): `npx playwright codegen http://localhost:3000`
- [VS Code Extension](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright)

---

**Happy Testing!** 🎭

import { test, expect } from '@playwright/test';

/**
 * Theme Settings Test
 *
 * This test verifies that theme changes persist correctly:
 * 1. Login with admin credentials
 * 2. Navigate to settings page
 * 3. Change theme from System to Dark
 * 4. Verify theme persists after page reload
 * 5. Change to Light and verify persistence
 */
test('Theme changes should persist after page reload', async ({ page }) => {
  // Navigate to login page
  await page.goto('http://localhost:3000/login');

  // Login with admin credentials
  await page.fill('input[name="emailOrUsername"]', 'admin');
  await page.fill('input[name="password"]', 'Admin123!');
  await page.click('button[type="submit"]');

  // Wait for navigation (admin users redirect to /admin, regular users to /dashboard)
  await page.waitForURL(/\/(dashboard|admin)/);
  console.log('✅ Login successful');

  // Navigate to settings page
  await page.goto('http://localhost:3000/dashboard/settings');
  await page.waitForLoadState('networkidle');
  console.log('✅ Navigated to settings page');

  // Wait for theme radio group to be visible
  await page.waitForSelector('[role="radiogroup"]');

  // Test 1: Change to Dark theme
  console.log('🌙 Testing Dark theme...');
  await page.click('label[for="dark"]');

  // Wait a moment for theme to apply
  await page.waitForTimeout(500);

  // Check if dark class is applied to html element
  const htmlClassDark = await page.getAttribute('html', 'class');
  console.log('HTML classes after selecting Dark:', htmlClassDark);
  expect(htmlClassDark).toContain('dark');

  // Check localStorage
  const themeInStorageDark = await page.evaluate(() => localStorage.getItem('theme'));
  console.log('Theme in localStorage:', themeInStorageDark);
  expect(themeInStorageDark).toBe('dark');

  // Reload page and verify theme persists
  await page.reload();
  await page.waitForLoadState('networkidle');

  const htmlClassAfterReloadDark = await page.getAttribute('html', 'class');
  console.log('HTML classes after reload (Dark):', htmlClassAfterReloadDark);
  expect(htmlClassAfterReloadDark).toContain('dark');

  const themeAfterReloadDark = await page.evaluate(() => localStorage.getItem('theme'));
  expect(themeAfterReloadDark).toBe('dark');
  console.log('✅ Dark theme persists after reload!');

  // Test 2: Change to Light theme
  console.log('☀️ Testing Light theme...');
  await page.waitForSelector('[role="radiogroup"]');
  await page.click('label[for="light"]');

  await page.waitForTimeout(500);

  const htmlClassLight = await page.getAttribute('html', 'class');
  console.log('HTML classes after selecting Light:', htmlClassLight);
  expect(htmlClassLight).not.toContain('dark');

  const themeInStorageLight = await page.evaluate(() => localStorage.getItem('theme'));
  console.log('Theme in localStorage:', themeInStorageLight);
  expect(themeInStorageLight).toBe('light');

  // Reload and verify Light theme persists
  await page.reload();
  await page.waitForLoadState('networkidle');

  const htmlClassAfterReloadLight = await page.getAttribute('html', 'class');
  console.log('HTML classes after reload (Light):', htmlClassAfterReloadLight);
  expect(htmlClassAfterReloadLight).not.toContain('dark');

  const themeAfterReloadLight = await page.evaluate(() => localStorage.getItem('theme'));
  expect(themeAfterReloadLight).toBe('light');
  console.log('✅ Light theme persists after reload!');

  // Test 3: Change to System theme
  console.log('💻 Testing System theme...');
  await page.waitForSelector('[role="radiogroup"]');
  await page.click('label[for="system"]');

  await page.waitForTimeout(500);

  const themeInStorageSystem = await page.evaluate(() => localStorage.getItem('theme'));
  console.log('Theme in localStorage:', themeInStorageSystem);
  expect(themeInStorageSystem).toBe('system');

  // Reload and verify System theme persists
  await page.reload();
  await page.waitForLoadState('networkidle');

  const themeAfterReloadSystem = await page.evaluate(() => localStorage.getItem('theme'));
  expect(themeAfterReloadSystem).toBe('system');
  console.log('✅ System theme persists after reload!');

  console.log('\n🎉 All theme persistence tests passed!');
});

/**
 * Visual verification test
 * Takes screenshots of each theme for manual verification
 */
test('Visual theme verification', async ({ page }) => {
  // Login
  await page.goto('http://localhost:3000/login');
  await page.fill('input[name="emailOrUsername"]', 'admin');
  await page.fill('input[name="password"]', 'Admin123!');
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/(dashboard|admin)/);

  // Go to settings
  await page.goto('http://localhost:3000/dashboard/settings');
  await page.waitForLoadState('networkidle');

  // Screenshot Light theme
  await page.click('label[for="light"]');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'test-results/theme-light.png', fullPage: true });
  console.log('📸 Light theme screenshot saved');

  // Screenshot Dark theme
  await page.click('label[for="dark"]');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'test-results/theme-dark.png', fullPage: true });
  console.log('📸 Dark theme screenshot saved');

  console.log('✅ Visual verification screenshots saved to test-results/');
});

const { test, expect } = require('@playwright/test');

test('Generated Test Script', async ({ page }) => {
  // Navigate to https://burando.online
  await page.goto('https://burando.online');
  await page.waitForLoadState('networkidle');
  
  // Handle initial redirects (login, fleet page, etc.)
  const currentUrl = page.url();
  console.log(`Current URL after navigation: ${currentUrl}`);

  // Login if needed
  if (currentUrl.includes('/login')) {
    await expect(page.locator('#email')).toBeVisible();
    await page.fill('#email', 'info@shipdocs.app');
    
    await expect(page.locator('#password')).toBeVisible();
    await page.fill('#password', 'Texel21');
    
    await expect(page.locator('button:has-text("Sign In")')).toBeVisible();
    await page.click('button:has-text("Sign In")');
    await page.waitForLoadState('networkidle');
  }

  // Navigate to PDF Templates
  await expect(page.locator('a:has-text("PDF Templates")')).toBeVisible();
  await page.click('a:has-text("PDF Templates")');
  await page.waitForLoadState('networkidle');

  // Edit Template
  await expect(page.locator('button:has-text("Edit Template")')).toBeVisible();
  await page.click('button:has-text("Edit Template")');
  await page.waitForLoadState('networkidle');

  // Navigate to Forms
  await expect(page.locator('a:has-text("Forms")')).toBeVisible();
  await page.click('a:has-text("Forms")');
  await page.waitForLoadState('networkidle');

  // Edit Form
  await expect(page.locator('button:has-text("Edit")')).toBeVisible();
  await page.click('button:has-text("Edit")');
  await page.waitForLoadState('networkidle');

  // Add Form Fields
  await expect(page.locator('div:has-text("🔢Number Input")')).toBeVisible();
  await page.click('div:has-text("🔢Number Input")');
  await page.waitForLoadState('networkidle');

  await expect(page.locator('div:has-text("📋Dropdown")')).toBeVisible();
  await page.click('div:has-text("📋Dropdown")');
  await page.waitForLoadState('networkidle');

  await expect(page.locator('div:has-text("📧Email Input")')).toBeVisible();
  await page.click('div:has-text("📧Email Input")');
  await page.waitForLoadState('networkidle');

  // Save Form
  await expect(page.locator('button:has-text("Save Form")')).toBeVisible();
  await page.click('button:has-text("Save Form")');
  await page.waitForLoadState('networkidle');

  // Navigate to Workflows
  await expect(page.locator('a:has-text("Workflows")')).toBeVisible();
  await page.click('a:has-text("Workflows")');
  await page.waitForLoadState('networkidle');

  // Check Workflow Items
  await expect(page.locator('td:has-text("jan")')).toBeVisible();
  await page.click('td:has-text("jan")');
  await page.waitForLoadState('networkidle');

  await expect(page.locator('td:has-text("nieuwe kantoor gozer")')).toBeVisible();
  await page.click('td:has-text("nieuwe kantoor gozer")');
  await page.waitForLoadState('networkidle');

  await expect(page.locator('td:has-text("Onboarding new crew")')).toBeVisible();
  await page.click('td:has-text("Onboarding new crew")');
  await page.waitForLoadState('networkidle');

  // Navigate to Settings
  await expect(page.locator('a:has-text("Settings")')).toBeVisible();
  await page.click('a:has-text("Settings")');
  await page.waitForLoadState('networkidle');
});
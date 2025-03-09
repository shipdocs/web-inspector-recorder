// @ts-check

/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  testDir: './',
  timeout: 360000, // 6 minutes
  expect: {
    timeout: 30000, // 30 seconds for assertions
  },
  fullyParallel: false, // Run tests in sequence
  forbidOnly: !!process.env.CI, // Fail if test.only is present
  retries: process.env.CI ? 2 : 0, // Retry failed tests in CI
  workers: process.env.CI ? 1 : undefined, // Single worker in CI
  reporter: 'html',
  use: {
    headless: false, // Run in headed mode for debugging
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    video: 'on-first-retry',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    actionTimeout: 30000, // 30 seconds for actions
    navigationTimeout: 360000, // 6 minutes for navigation
    baseURL: process.env.BASE_URL || 'https://burando.online',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
      },
    },
  ],
};

module.exports = config;
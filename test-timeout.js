const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    await page.goto('https://burando.online', { timeout: 60000 }); // 60-second timeout
    console.log('Navigation succeeded (should not happen)'); // Should timeout
  } catch (error) {
    console.error('Navigation timed out as expected:', error.message); // Expected output
  } finally {
    await browser.close();
  }
})();
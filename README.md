# Web Inspector Recorder

A tool for recording user interactions with a website and generating Playwright test scripts automatically.

## Features

- Records navigation, clicks, and input events
- Generates Playwright test scripts with proper assertions
- Handles authentication flows
- Waits for network requests to complete
- Uses smart selectors (roles, IDs, text content)
- Includes comments for better readability

## Installation

```bash
cd web-inspector-recorder
npm install
```

## Usage

1. Run the recorder:
```bash
./index.js <url>
```

2. Perform actions in the browser:
   - Navigate to pages
   - Click buttons and links
   - Fill out forms
   - etc.

3. Press Ctrl+C to stop recording and generate the test script

The tool will create a Playwright test script that includes:
- Navigation commands
- Click events
- Input field interactions
- Assertions before actions
- Network request waiting
- Comments for each step

## Example

```bash
# Record interactions with burando.online
./index.js https://example.com
```

Generated test script will be printed to the console and can be saved to a .spec.js file.

## Test Script Format

The generated test scripts follow this structure:
```javascript
const { test, expect } = require('@playwright/test');

test('Generated Test Script', async ({ page }) => {
  // Navigation
  await page.goto('https://example.com');
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveURL('https://example.com');

  // Clicks
  await expect(page.locator('button:has-text("Submit")')).toBeVisible();
  await page.click('button:has-text("Submit")');
  await page.waitForLoadState('networkidle');

  // Inputs
  await expect(page.locator('#email')).toBeVisible();
  await page.fill('#email', 'test@example.com');
});
```

## Running Generated Tests

1. Install Playwright Test:
```bash
npm install @playwright/test
```

2. Create a playwright.config.js:
```javascript
module.exports = {
  timeout: 360000, // 6 minutes
  use: {
    headless: false,
    viewport: { width: 1280, height: 720 },
    video: 'on-first-retry',
    trace: 'on-first-retry',
  },
};
```

3. Run the test:
```bash
npx playwright test recorded-test.spec.js
```

## Tips

- The tool automatically waits for network requests to complete after each action
- It uses smart selectors that prefer:
  1. Element IDs
  2. ARIA roles and labels
  3. Button/link text content
  4. CSS classes (if unique)
- Each action includes an assertion to verify the element is visible
- Comments are added to describe each action
- Input values are combined into single fill() commands

# Web Inspector Recorder

A powerful test recorder that automatically generates Playwright test scripts, designed to work seamlessly with modern development workflows, React applications, and AI-assisted development tools like Augment, GitHub Copilot, and other AI developer tools.

## 🌟 Features

- **Records browser interactions in real-time:**
  - Navigation events and redirects
  - Click events with smart targeting
  - Form input with intelligent batching
  - Network requests and responses
  - Authentication flows

- **Generates maintainable Playwright test scripts with:**
  - Smart selectors (preferring IDs, ARIA roles, text content)
  - Automatic wait states for network stability
  - Visibility assertions before actions
  - Proper error handling
  - Detailed comments for readability

- **Optimized for modern development:**
  - Works with React, Angular, Vue, and other frameworks
  - Compatible with AI development tools (Augment, GitHub Copilot, etc.)
  - Integrates with CI/CD pipelines
  - Supports headless and headed testing

## 🚀 Quick Installation

Use our automated installation script:

```bash
# Download and run the installation script
curl -o- https://raw.githubusercontent.com/shipdocs/web-inspector-recorder/main/install.sh | bash
# OR
wget -qO- https://raw.githubusercontent.com/shipdocs/web-inspector-recorder/main/install.sh | bash
```

Or install manually:

```bash
# Clone the repository
git clone https://github.com/shipdocs/web-inspector-recorder.git
cd web-inspector-recorder
npm install
```

## 🎮 Usage

1. Run the recorder:
```bash
# Using the installation script
npm run record <url>

# OR using the original method
./index.js <url>
```

2. Perform actions in the browser:
   - Navigate to pages
   - Click buttons and links
   - Fill out forms
   - Complete user flows

3. Press Ctrl+C to stop recording and generate the test script

The tool will create a Playwright test script that includes:
- Navigation commands with proper waiting
- Click events with visibility checks
- Input field interactions with smart batching
- Assertions before actions
- Network request monitoring
- Detailed comments for each step

## 📝 Example

```bash
# Record interactions with your React app
npm run record http://localhost:3000

# Record interactions with a production site
npm run record https://example.com
```

The generated test script will be saved to `tests/recorded-test.spec.js` and can be customized as needed.

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

## 🤖 Integration with AI Development Tools

The Web Inspector Recorder is designed to work seamlessly with AI-assisted development tools:

### Augment

Augment can use the recorded tests to:
- Understand user flows in your application
- Generate additional test cases based on recorded patterns
- Suggest improvements to your test coverage
- Debug issues by analyzing test failures

Example Augment workflow:
1. Record a basic user flow with Web Inspector Recorder
2. Ask Augment to analyze the generated test
3. Let Augment suggest improvements or additional test cases
4. Implement the suggestions with Augment's assistance

### GitHub Copilot

GitHub Copilot can help:
- Extend recorded tests with additional assertions
- Create test variations for edge cases
- Refactor tests for better maintainability
- Generate documentation for your test suite

### Other AI Tools

The generated tests are compatible with most AI coding assistants, allowing you to:
- Analyze test coverage
- Generate additional test scenarios
- Refactor and improve test code
- Debug failing tests

## ▶️ Running Generated Tests

After installation, the recorder automatically sets up everything you need:

1. Run the recorded test:
```bash
npx playwright test tests/recorded-test.spec.js
```

2. View the test report:
```bash
npx playwright show-report
```

3. Debug a test:
```bash
npx playwright test tests/recorded-test.spec.js --debug
```

4. Run in headed mode:
```bash
npx playwright test tests/recorded-test.spec.js --headed
```

## 💡 Tips & Best Practices

### General Tips
- The tool automatically waits for network requests to complete after each action
- It uses smart selectors that prefer:
  1. Element IDs
  2. ARIA roles and labels
  3. Button/link text content
  4. CSS classes (if unique)
- Each action includes an assertion to verify the element is visible
- Comments are added to describe each action
- Input values are combined into single fill() commands

### React-Specific Tips
- For React applications, ensure components have proper `data-testid` attributes for reliable selection
- The recorder works well with React's synthetic events
- For React Router applications, the recorder will capture navigation events
- React component state changes are detected through their DOM effects
- React forms and controlled inputs are properly recorded

### Working with AI Tools
- Share recorded tests with AI tools to get suggestions for improvements
- Ask AI to analyze test coverage and suggest additional scenarios
- Use AI to help refactor complex tests into more maintainable ones
- Let AI generate documentation for your test suite based on recorded tests

### CI/CD Integration
- Add recorded tests to your CI/CD pipeline for automated regression testing
- Use the `--headless` flag for CI environments
- Generate and save test artifacts (screenshots, videos) on failure
- Integrate with test reporting tools for better visibility

## 📄 License

MIT

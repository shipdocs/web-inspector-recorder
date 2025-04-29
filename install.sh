#!/bin/bash

# Web Inspector Recorder Installation Script
# This script installs the Web Inspector Recorder in your project

# Print colorful status messages
print_status() {
    echo -e "\033[1;34m[INFO]\033[0m $1"
}

print_success() {
    echo -e "\033[1;32m[SUCCESS]\033[0m $1"
}

print_error() {
    echo -e "\033[1;31m[ERROR]\033[0m $1"
}

print_warning() {
    echo -e "\033[1;33m[WARNING]\033[0m $1"
}

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install Node.js and npm first."
    exit 1
fi

print_status "Installing Web Inspector Recorder..."

# Create tests directory if it doesn't exist
if [ ! -d "tests" ]; then
    print_status "Creating tests directory..."
    mkdir -p tests
fi

# Install dependencies
print_status "Installing required dependencies..."
npm install playwright @playwright/test commander --save-dev

# Install Playwright browsers
print_status "Installing Playwright browsers..."
npx playwright install

# Create playwright.config.js if it doesn't exist
if [ ! -f "playwright.config.js" ]; then
    print_status "Creating playwright.config.js..."
    cat > playwright.config.js << 'EOL'
// @ts-check

/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  testDir: './tests',
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
    navigationTimeout: 60000, // 1 minute for navigation
    baseURL: process.env.BASE_URL || 'http://localhost:3000', // Default for React apps
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
EOL
fi

# Create recorder.js script
print_status "Creating recorder.js script..."
cat > tests/recorder.js << 'EOL'
#!/usr/bin/env node

const { program } = require('commander');
const playwright = require('playwright');

async function main() {
  program
    .version('0.1.0')
    .description('Web Inspector & Recorder Tool')
    .argument('<url>', 'URL of the website to inspect')
    .option('-o, --output <file>', 'Output file for the generated test script', 'tests/recorded-test.spec.js')
    .action(async (url, options) => {
      console.log(`Inspecting URL: ${url}`);
      console.log(`Test script will be saved to: ${options.output}`);

      const recordedActions = [];
      let lastInputValue = '';
      let lastInputId = '';

      const browser = await playwright.chromium.launch({
        headless: false,
        args: ['--disable-web-security'],
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      });
      
      const context = await browser.newContext();
      const page = await context.newPage();

      recordedActions.push({
        type: 'navigation',
        url: url
      });

      await page.exposeFunction('recordAction', (action) => {
        if (action.type === 'input') {
          // Only record input when value changes significantly or different field
          if (action.id !== lastInputId || 
              (action.value.length - lastInputValue.length > 2) || 
              action.value.includes('@') || 
              action.value.includes('.')) {
            console.log('[Action Recorded]:', action);
            recordedActions.push(action);
            lastInputValue = action.value;
            lastInputId = action.id;
          }
        } else {
          console.log('[Action Recorded]:', action);
          recordedActions.push(action);
        }
      });

      await page.addInitScript(() => {
        window.addEventListener('click', (event) => {
          const element = event.target;
          
          // Get best selector for element
          function getBestSelector(el) {
            if (el.id) return `#${el.id}`;
            if (el.getAttribute('role')) return `[role="${el.getAttribute('role')}"]`;
            if (el.getAttribute('aria-label')) return `[aria-label="${el.getAttribute('aria-label')}"]`;
            
            // For buttons/links with text
            if ((el.tagName === 'BUTTON' || el.tagName === 'A') && el.textContent.trim()) {
              return `${el.tagName.toLowerCase()}:has-text("${el.textContent.trim()}")`;
            }
            
            // For inputs with placeholder
            if (el.tagName === 'INPUT' && el.getAttribute('placeholder')) {
              return `input[placeholder="${el.getAttribute('placeholder')}"]`;
            }
            
            // Fallback to class if unique enough
            if (el.className && !el.className.includes(' ')) {
              return `.${el.className}`;
            }
            
            // Last resort: tag name + text content if short enough
            const text = el.textContent.trim();
            if (text && text.length < 50) {
              return `${el.tagName.toLowerCase()}:has-text("${text}")`;
            }
            
            return el.tagName.toLowerCase();
          }

          window.recordAction({
            type: 'click',
            tagName: element.tagName,
            textContent: element.textContent.trim().substring(0, 50), // Limit text content length
            id: element.id,
            className: element.className,
            selector: getBestSelector(element),
            role: element.getAttribute('role'),
            ariaLabel: element.getAttribute('aria-label')
          });
        }, true);

        window.addEventListener('input', (event) => {
          const element = event.target;
          window.recordAction({
            type: 'input',
            tagName: element.tagName,
            value: element.value,
            id: element.id,
            className: element.className,
            selector: element.id ? 
              `#${element.id}` : 
              element.getAttribute('placeholder') ?
                `input[placeholder="${element.getAttribute('placeholder')}"]` :
                element.className ?
                  `.${element.className.split(' ')[0]}` :
                  element.tagName.toLowerCase(),
            placeholder: element.getAttribute('placeholder')
          });
        }, true);
      });

      await page.route('**', async route => {
        try {
          const request = route.request();
          const response = await route.fetch();

          recordedActions.push({
            type: 'request',
            url: request.url(),
            method: request.method(),
            status: response.status(),
          });

          console.log(`\nRequest URL: ${request.url()}`);
          console.log(`  Method: ${request.method()}`);
          console.log(`  Response Status: ${response.status()}`);

          route.continue();
        } catch (error) {
          console.error('[page.route Error]:', error);
          route.continue();
        }
      });

      console.log('Press Ctrl+C to exit and generate test script.');

      console.log(`Navigating to URL: ${url}`);
      try {
        await page.goto(url, { timeout: 60000 });
        console.log('page.goto() call completed.');
      } catch (error) {
        console.error('Error during page.goto():', error);
      }

      process.on('SIGINT', async () => {
        console.log('\n[SIGINT Handler] SIGINT signal received!');
        console.log('\n[SIGINT Handler] Recording stopped. Generating test script...\n');
        const testScript = generateTestScript(recordedActions);
        console.log('[SIGINT Handler] Test script generated. Saving to file...');
        
        const fs = require('fs');
        const path = require('path');
        
        // Ensure directory exists
        const dir = path.dirname(options.output);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        // Write test script to file
        fs.writeFileSync(options.output, testScript);
        console.log(`[SIGINT Handler] Test script saved to: ${options.output}`);
        
        await browser.close();
        console.log('[SIGINT Handler] Browser closed.');
        process.exit(0);
      });

      await new Promise(() => {});
    });

  program.parse(process.argv);
}

function generateTestScript(recordedActions) {
  let testScript = `
const { test, expect } = require('@playwright/test');

test('Generated Test Script', async ({ page }) => {`;

  let lastUrl = '';
  let lastSelector = '';
  
  for (const action of recordedActions) {
    if (action.type === 'navigation') {
      testScript += `
  // Navigate to ${action.url}
  await page.goto('${action.url}');
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveURL('${action.url}');`;
      lastUrl = action.url;
    } else if (action.type === 'click') {
      const selector = action.selector;
      if (selector && selector !== lastSelector) {
        testScript += `
  // Click ${action.textContent ? `"${action.textContent}"` : action.tagName}
  await expect(page.locator('${selector}')).toBeVisible();
  await page.click('${selector}');
  await page.waitForLoadState('networkidle');`;
        lastSelector = selector;
      }
    } else if (action.type === 'input') {
      if (action.selector !== lastSelector) {
        testScript += `
  // Fill ${action.placeholder ? `"${action.placeholder}"` : action.selector} input
  await expect(page.locator('${action.selector}')).toBeVisible();
  await page.fill('${action.selector}', '${action.value}');`;
        lastSelector = action.selector;
      } else {
        // Update the last fill command with new value
        testScript = testScript.replace(
          new RegExp(`await page\\.fill\\('${action.selector}', '[^']*'\\);$`),
          `await page.fill('${action.selector}', '${action.value}');`
        );
      }
    }
  }

  testScript += `
});`;
  return testScript;
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
EOL

# Make recorder.js executable
chmod +x tests/recorder.js

# Update package.json with new scripts
print_status "Updating package.json with recorder scripts..."

# Check if package.json exists
if [ -f "package.json" ]; then
    # Check if jq is installed
    if command -v jq &> /dev/null; then
        # Use jq to update package.json
        jq '.scripts += {"record": "node tests/recorder.js", "test:record": "node tests/recorder.js"}' package.json > package.json.tmp
        mv package.json.tmp package.json
    else
        print_warning "jq is not installed. Please manually add the following scripts to your package.json:"
        echo '"record": "node tests/recorder.js"'
        echo '"test:record": "node tests/recorder.js"'
    fi
else
    print_warning "package.json not found. Please create one with the following scripts:"
    echo '"record": "node tests/recorder.js"'
    echo '"test:record": "node tests/recorder.js"'
fi

print_success "Web Inspector Recorder installed successfully!"
print_status "You can now record tests with: npm run record <url>"
print_status "Generated tests will be saved to: tests/recorded-test.spec.js"
print_status "Run tests with: npx playwright test tests/recorded-test.spec.js"

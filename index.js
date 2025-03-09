#!/usr/bin/env node

const { program } = require('commander');
const playwright = require('playwright');

async function main() {
  program
    .version('0.1.0')
    .description('Standalone Web Inspector & Recorder Tool')
    .argument('<url>', 'URL of the website to inspect')
    .action(async (url) => {
      console.log(`Inspecting URL: ${url}`);

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

      console.log('Press Ctrl+C to exit.');

      console.log(`Navigating to URL: ${url}`);
      try {
        await page.goto(url, { timeout: 360000 });
        console.log('page.goto() call completed.');
      } catch (error) {
        console.error('Error during page.goto():', error);
      }

      process.on('SIGINT', async () => {
        console.log('\n[SIGINT Handler] SIGINT signal received!');
        console.log('\n[SIGINT Handler] Recording stopped. Generating test script...\n');
        const testScript = generateTestScript(recordedActions);
        console.log('[SIGINT Handler] Test script generated:\n', testScript);
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
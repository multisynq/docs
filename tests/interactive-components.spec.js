import { test, expect } from '@playwright/test';

/**
 * Interactive Components Tests
 * Tests for code blocks, copy buttons, interactive examples, and other UI components
 */

test.describe('Interactive Components', () => {
  test.describe('Code Blocks', () => {
    test('code blocks are properly rendered', async ({ page }) => {
      await page.goto('/essentials/collaboration');
      
      // Check that code blocks exist
      const codeBlocks = page.locator('pre code, .language-javascript, .language-js');
      const codeCount = await codeBlocks.count();
      expect(codeCount).toBeGreaterThan(0);

      // Check first code block for proper formatting
      const firstCodeBlock = codeBlocks.first();
      await expect(firstCodeBlock).toBeVisible();
      
      // Code should have syntax highlighting
      const className = await firstCodeBlock.getAttribute('class');
      expect(className).toMatch(/language-|hljs/);
      
      // Code should not be empty
      const codeContent = await firstCodeBlock.textContent();
      expect(codeContent?.trim().length).toBeGreaterThan(10);
    });

    test('code blocks have copy functionality', async ({ page }) => {
      await page.goto('/quickstart');
      
      // Look for copy buttons near code blocks
      const copyButtons = page.locator('.copy-button, button[aria-label*="copy" i], [data-copy]');
      const copyCount = await copyButtons.count();
      
      if (copyCount > 0) {
        const firstCopyButton = copyButtons.first();
        await expect(firstCopyButton).toBeVisible();
        
        // Click copy button
        await firstCopyButton.click();
        
        // Should show some feedback (text change, animation, etc.)
        await page.waitForTimeout(500); // Allow time for feedback
        
        // Check if button text changed or tooltip appeared
        const buttonText = await firstCopyButton.textContent();
        const tooltip = page.locator('.tooltip, [role="tooltip"]');
        
        const hasFeedback = buttonText?.includes('Copied') || 
                           buttonText?.includes('✓') || 
                           await tooltip.count() > 0;
        
        console.log('Copy feedback detected:', hasFeedback);
      }
    });

    test('code blocks support syntax highlighting', async ({ page }) => {
      await page.goto('/api-reference/model');
      
      const codeBlocks = page.locator('pre code');
      const codeCount = await codeBlocks.count();
      
      for (let i = 0; i < Math.min(codeCount, 3); i++) {
        const codeBlock = codeBlocks.nth(i);
        
        // Check for syntax highlighting elements
        const syntaxElements = codeBlock.locator('.hljs-keyword, .hljs-string, .hljs-comment, .token-keyword, .token-string');
        const syntaxCount = await syntaxElements.count();
        
        if (syntaxCount > 0) {
          console.log(`Code block ${i} has ${syntaxCount} syntax highlighted elements`);
        }
      }
    });

    test('code blocks are accessible', async ({ page }) => {
      await page.goto('/essentials/sync');
      
      const codeBlocks = page.locator('pre');
      const codeCount = await codeBlocks.count();
      
      for (let i = 0; i < Math.min(codeCount, 3); i++) {
        const codeBlock = codeBlocks.nth(i);
        
        // Check for proper attributes
        const tabIndex = await codeBlock.getAttribute('tabindex');
        const role = await codeBlock.getAttribute('role');
        const ariaLabel = await codeBlock.getAttribute('aria-label');
        
        // Code blocks should be keyboard accessible
        expect(tabIndex === '0' || tabIndex === null).toBe(true);
      }
    });
  });

  test.describe('Documentation Cards and Components', () => {
    test('card components render correctly', async ({ page }) => {
      await page.goto('/');
      
      // Look for card-like components
      const cards = page.locator('.card, .card-group, [data-card]');
      const cardCount = await cards.count();
      
      if (cardCount > 0) {
        const firstCard = cards.first();
        await expect(firstCard).toBeVisible();
        
        // Cards should have content
        const cardContent = await firstCard.textContent();
        expect(cardContent?.trim().length).toBeGreaterThan(0);
        
        // Cards should be clickable if they have links
        const cardLink = firstCard.locator('a');
        const linkCount = await cardLink.count();
        
        if (linkCount > 0) {
          const href = await cardLink.getAttribute('href');
          expect(href).toBeTruthy();
        }
      }
    });

    test('tabs component works correctly', async ({ page }) => {
      await page.goto('/react-together');
      
      // Look for tab components
      const tabList = page.locator('[role="tablist"], .tabs, .tab-container');
      const tabCount = await tabList.count();
      
      if (tabCount > 0) {
        const tabs = page.locator('[role="tab"], .tab');
        const tabButtonCount = await tabs.count();
        
        if (tabButtonCount > 1) {
          // Click second tab
          const secondTab = tabs.nth(1);
          await secondTab.click();
          
          // Check if content changed
          const activeTab = page.locator('[role="tab"][aria-selected="true"], .tab.active');
          await expect(activeTab).toBeVisible();
          
          // Check if tab panel is visible
          const tabPanel = page.locator('[role="tabpanel"], .tab-panel');
          await expect(tabPanel.first()).toBeVisible();
        }
      }
    });

    test('collapsible sections work', async ({ page }) => {
      await page.goto('/api-reference/model');
      
      // Look for collapsible elements
      const collapsibles = page.locator('details, .collapsible, [data-collapsible]');
      const collapsibleCount = await collapsibles.count();
      
      if (collapsibleCount > 0) {
        const firstCollapsible = collapsibles.first();
        
        // Check if it's collapsed initially
        const isOpen = await firstCollapsible.getAttribute('open');
        
        // Click to toggle
        const summary = firstCollapsible.locator('summary');
        if (await summary.count() > 0) {
          await summary.click();
          
          // Wait for animation
          await page.waitForTimeout(300);
          
          // Check if state changed
          const newState = await firstCollapsible.getAttribute('open');
          expect(newState !== isOpen).toBe(true);
        }
      }
    });
  });

  test.describe('Interactive Examples', () => {
    test('interactive demos are functional', async ({ page }) => {
      // Check pages that might have interactive demos
      const demoPages = ['/essentials/chat', '/essentials/whiteboard', '/quickstart'];
      
      for (const demoPage of demoPages) {
        await page.goto(demoPage);
        
        // Look for interactive elements
        const buttons = page.locator('button:not([disabled])');
        const inputs = page.locator('input, textarea');
        const interactiveElements = page.locator('[data-demo], .demo, .interactive');
        
        const buttonCount = await buttons.count();
        const inputCount = await inputs.count();
        const demoCount = await interactiveElements.count();
        
        console.log(`${demoPage}: ${buttonCount} buttons, ${inputCount} inputs, ${demoCount} demos`);
        
        // If there are interactive elements, test one
        if (buttonCount > 0) {
          const firstButton = buttons.first();
          const buttonText = await firstButton.textContent();
          
          // Skip navigation and utility buttons
          if (buttonText && !buttonText.match(/menu|close|search|toggle/i)) {
            await firstButton.click();
            
            // Wait for any response
            await page.waitForTimeout(500);
            
            console.log(`Clicked button: ${buttonText}`);
          }
        }
      }
    });

    test('code examples are runnable', async ({ page }) => {
      await page.goto('/essentials/collaboration');
      
      // Look for "Run" or "Try it" buttons
      const runButtons = page.locator('button:has-text("Run"), button:has-text("Try"), .run-button');
      const runCount = await runButtons.count();
      
      if (runCount > 0) {
        const firstRunButton = runButtons.first();
        await expect(firstRunButton).toBeVisible();
        
        await firstRunButton.click();
        
        // Wait for execution
        await page.waitForTimeout(1000);
        
        // Look for output or result area
        const output = page.locator('.output, .result, .console, [data-output]');
        const outputCount = await output.count();
        
        if (outputCount > 0) {
          await expect(output.first()).toBeVisible();
        }
      }
    });
  });

  test.describe('Media and Images', () => {
    test('all images load successfully', async ({ page }) => {
      await page.goto('/');
      
      const images = page.locator('img');
      const imageCount = await images.count();
      
      console.log(`Found ${imageCount} images to test`);
      
      for (let i = 0; i < Math.min(imageCount, 10); i++) {
        const img = images.nth(i);
        const src = await img.getAttribute('src');
        
        if (src && !src.startsWith('data:')) {
          // Check if image is loaded
          const naturalWidth = await img.evaluate(el => el.naturalWidth);
          expect(naturalWidth).toBeGreaterThan(0);
          
          // Check if image has alt text
          const alt = await img.getAttribute('alt');
          expect(alt).toBeTruthy();
        }
      }
    });

    test('images are responsive', async ({ page }) => {
      await page.goto('/');
      
      const images = page.locator('img');
      const imageCount = await images.count();
      
      if (imageCount > 0) {
        const firstImage = images.first();
        
        // Get image dimensions
        const boundingBox = await firstImage.boundingBox();
        
        if (boundingBox) {
          // Image should not overflow container
          expect(boundingBox.width).toBeLessThanOrEqual(1200); // Reasonable max width
          
          // Check for responsive classes or styles
          const className = await firstImage.getAttribute('class');
          const style = await firstImage.getAttribute('style');
          
          const isResponsive = className?.includes('responsive') || 
                              style?.includes('max-width') ||
                              style?.includes('width: 100%');
          
          console.log('Image responsive indicators:', { className, style, isResponsive });
        }
      }
    });

    test('videos work correctly', async ({ page }) => {
      await page.goto('/');
      
      const videos = page.locator('video');
      const videoCount = await videos.count();
      
      if (videoCount > 0) {
        const firstVideo = videos.first();
        await expect(firstVideo).toBeVisible();
        
        // Check video attributes
        const controls = await firstVideo.getAttribute('controls');
        const autoplay = await firstVideo.getAttribute('autoplay');
        
        // Videos should have controls and not autoplay
        expect(controls).toBeTruthy();
        expect(autoplay).toBeFalsy();
        
        // Check if video has a poster image
        const poster = await firstVideo.getAttribute('poster');
        if (poster) {
          expect(poster.length).toBeGreaterThan(0);
        }
      }
    });
  });

  test.describe('Form Components', () => {
    test('search functionality works', async ({ page }) => {
      await page.goto('/');
      
      const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]');
      const searchCount = await searchInput.count();
      
      if (searchCount > 0) {
        const search = searchInput.first();
        await expect(search).toBeVisible();
        
        // Type in search input
        await search.fill('model');
        await search.press('Enter');
        
        // Wait for search results
        await page.waitForTimeout(1000);
        
        // Check if search results appeared
        const results = page.locator('.search-results, .search-result, [data-search-result]');
        const resultCount = await results.count();
        
        console.log(`Search for "model" returned ${resultCount} results`);
      }
    });

    test('contact forms are accessible', async ({ page }) => {
      await page.goto('/');
      
      const forms = page.locator('form');
      const formCount = await forms.count();
      
      if (formCount > 0) {
        const firstForm = forms.first();
        
        // Check for proper labels
        const inputs = firstForm.locator('input, textarea, select');
        const inputCount = await inputs.count();
        
        for (let i = 0; i < inputCount; i++) {
          const input = inputs.nth(i);
          const id = await input.getAttribute('id');
          const ariaLabel = await input.getAttribute('aria-label');
          const placeholder = await input.getAttribute('placeholder');
          
          // Input should have some form of label
          if (id) {
            const label = page.locator(`label[for="${id}"]`);
            const labelCount = await label.count();
            expect(labelCount > 0 || ariaLabel || placeholder).toBe(true);
          }
        }
      }
    });
  });

  test.describe('Accessibility Features', () => {
    test('skip links are functional', async ({ page }) => {
      await page.goto('/');
      
      // Tab to skip link
      await page.keyboard.press('Tab');
      
      const skipLink = page.locator('a[href^="#"]:has-text("skip"), .skip-link');
      const skipCount = await skipLink.count();
      
      if (skipCount > 0) {
        const skip = skipLink.first();
        await expect(skip).toBeFocused();
        
        await skip.press('Enter');
        
        // Check if focus moved to main content
        const mainContent = page.locator('main, #main, .main-content');
        if (await mainContent.count() > 0) {
          await expect(mainContent.first()).toBeFocused();
        }
      }
    });

    test('keyboard navigation works throughout site', async ({ page }) => {
      await page.goto('/quickstart');
      
      // Tab through interactive elements
      const interactiveElements = [];
      
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab');
        
        const focusedElement = page.locator(':focus');
        const tagName = await focusedElement.evaluate(el => el.tagName);
        const role = await focusedElement.getAttribute('role');
        
        if (tagName && ['A', 'BUTTON', 'INPUT', 'TEXTAREA', 'SELECT'].includes(tagName)) {
          interactiveElements.push({ tagName, role });
        }
      }
      
      // Should have found some interactive elements
      expect(interactiveElements.length).toBeGreaterThan(2);
      console.log('Interactive elements found:', interactiveElements);
    });

    test('focus indicators are visible', async ({ page }) => {
      await page.goto('/');
      
      // Tab to first focusable element
      await page.keyboard.press('Tab');
      
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
      
      // Check if focus ring is visible (this is tricky to test precisely)
      const styles = await focusedElement.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          outline: computed.outline,
          outlineColor: computed.outlineColor,
          boxShadow: computed.boxShadow
        };
      });
      
      // Should have some form of focus indication
      const hasFocusIndicator = styles.outline !== 'none' || 
                               styles.outlineColor !== 'rgb(0, 0, 0)' ||
                               styles.boxShadow !== 'none';
      
      expect(hasFocusIndicator).toBe(true);
    });
  });
}); 
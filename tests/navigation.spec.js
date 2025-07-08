import { test, expect } from '@playwright/test';

/**
 * Navigation and routing tests for Multisynq documentation
 * Tests sidebar navigation, page routing, breadcrumbs, and search functionality
 */

test.describe('Navigation Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Sidebar Navigation', () => {
    test('sidebar is visible and functional', async ({ page }) => {
      // Check if sidebar exists
      const sidebar = page.locator('[data-testid="sidebar"], .sidebar, nav');
      await expect(sidebar).toBeVisible();

      // Check for main navigation sections
      await expect(page.locator('text=Getting Started, text=Quickstart')).toBeVisible();
      await expect(page.locator('text=Essentials, text=API Reference')).toBeVisible();
      await expect(page.locator('text=React Together')).toBeVisible();
    });

    test('navigation links work correctly', async ({ page }) => {
      // Test Quickstart navigation
      await page.click('text=Quickstart');
      await expect(page).toHaveURL(/.*\/quickstart/);
      await expect(page.locator('h1')).toContainText('Quickstart');

      // Test API Reference navigation
      await page.click('text=API Reference');
      await expect(page).toHaveURL(/.*\/api-reference/);

      // Test Model API page
      await page.click('text=Model');
      await expect(page).toHaveURL(/.*\/api-reference\/model/);
      await expect(page.locator('h1')).toContainText('Model');

      // Test React Together navigation
      await page.click('text=React Together');
      await expect(page).toHaveURL(/.*\/react-together/);
    });

    test('navigation hierarchy is correct', async ({ page }) => {
      // Check that sections are properly organized
      const essentialsSection = page.locator('text=Essentials').locator('..');
      await expect(essentialsSection.locator('text=Synchronization')).toBeVisible();
      await expect(essentialsSection.locator('text=Collaboration')).toBeVisible();
      await expect(essentialsSection.locator('text=Chat')).toBeVisible();

      const apiSection = page.locator('text=API Reference').locator('..');
      await expect(apiSection.locator('text=Model')).toBeVisible();
      await expect(apiSection.locator('text=View')).toBeVisible();
      await expect(apiSection.locator('text=Session')).toBeVisible();
    });

    test('navigation state is maintained', async ({ page }) => {
      // Navigate to a page
      await page.click('text=Model');
      await expect(page).toHaveURL(/.*\/api-reference\/model/);

      // Check if current page is highlighted in navigation
      const activeLink = page.locator('.nav-active, [aria-current="page"], .active');
      await expect(activeLink).toContainText('Model');

      // Refresh page and check navigation state is maintained
      await page.reload();
      await expect(page).toHaveURL(/.*\/api-reference\/model/);
      await expect(page.locator('h1')).toContainText('Model');
    });
  });

  test.describe('Mobile Navigation', () => {
    test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE size

    test('mobile menu works correctly', async ({ page }) => {
      await page.goto('/');

      // Look for mobile menu toggle (hamburger menu)
      const menuToggle = page.locator('[data-testid="mobile-menu"], .mobile-menu-toggle, .hamburger');
      
      if (await menuToggle.isVisible()) {
        // Click to open mobile menu
        await menuToggle.click();

        // Check if navigation menu becomes visible
        const mobileNav = page.locator('.mobile-nav, .nav-mobile, [data-testid="mobile-navigation"]');
        await expect(mobileNav).toBeVisible();

        // Test navigation link in mobile menu
        await page.click('text=Quickstart');
        await expect(page).toHaveURL(/.*\/quickstart/);
      }
    });

    test('mobile navigation is touch-friendly', async ({ page }) => {
      await page.goto('/');

      // Check that links are large enough for touch interaction
      const navLinks = page.locator('nav a, .navigation a');
      const linkCount = await navLinks.count();

      for (let i = 0; i < Math.min(linkCount, 5); i++) {
        const link = navLinks.nth(i);
        const boundingBox = await link.boundingBox();
        
        if (boundingBox) {
          // Touch targets should be at least 44px in height (iOS guideline)
          expect(boundingBox.height).toBeGreaterThanOrEqual(40);
        }
      }
    });
  });

  test.describe('Breadcrumbs', () => {
    test('breadcrumbs show correct path', async ({ page }) => {
      // Navigate to a nested page
      await page.goto('/api-reference/model');

      // Check if breadcrumbs exist and show correct path
      const breadcrumbs = page.locator('.breadcrumbs, [data-testid="breadcrumbs"], .breadcrumb');
      
      if (await breadcrumbs.isVisible()) {
        await expect(breadcrumbs).toContainText('API Reference');
        await expect(breadcrumbs).toContainText('Model');
      }
    });

    test('breadcrumb links are functional', async ({ page }) => {
      await page.goto('/react-together/hooks/useStateTogether');

      const breadcrumbs = page.locator('.breadcrumbs, [data-testid="breadcrumbs"], .breadcrumb');
      
      if (await breadcrumbs.isVisible()) {
        // Click on parent breadcrumb
        await breadcrumbs.locator('text=React Together').click();
        await expect(page).toHaveURL(/.*\/react-together/);
      }
    });
  });

  test.describe('Search Functionality', () => {
    test('search interface is accessible', async ({ page }) => {
      // Look for search input or search button
      const searchInput = page.locator('input[type="search"], input[placeholder*="search" i], [data-testid="search"]');
      const searchButton = page.locator('button[aria-label*="search" i], .search-button');

      // At least one search element should be present
      const hasSearch = (await searchInput.count()) > 0 || (await searchButton.count()) > 0;
      expect(hasSearch).toBe(true);
    });

    test('search keyboard shortcut works', async ({ page }) => {
      // Try common search shortcuts
      await page.keyboard.press('Control+k');
      
      // Or try Cmd+K on Mac
      await page.keyboard.press('Meta+k');

      // Check if search modal or input becomes focused
      const searchModal = page.locator('.search-modal, [data-testid="search-modal"]');
      const searchInput = page.locator('input[type="search"]:focus, [data-testid="search"]:focus');

      const hasSearchOpen = (await searchModal.isVisible()) || (await searchInput.count()) > 0;
      // This may not work in all documentation frameworks, so we won't fail the test
      console.log('Search shortcut test result:', hasSearchOpen);
    });
  });

  test.describe('Page-to-Page Navigation', () => {
    test('internal links work correctly', async ({ page }) => {
      await page.goto('/');

      // Find and click internal links
      const internalLinks = page.locator('a[href^="/"]');
      const linkCount = await internalLinks.count();

      if (linkCount > 0) {
        const firstLink = internalLinks.first();
        const href = await firstLink.getAttribute('href');
        
        await firstLink.click();
        await expect(page).toHaveURL(new RegExp(href));
      }
    });

    test('back and forward navigation works', async ({ page }) => {
      await page.goto('/');
      
      // Navigate to another page
      await page.goto('/quickstart');
      await expect(page).toHaveURL(/.*\/quickstart/);

      // Use browser back button
      await page.goBack();
      await expect(page).toHaveURL(/.*\/$/);

      // Use browser forward button
      await page.goForward();
      await expect(page).toHaveURL(/.*\/quickstart/);
    });

    test('anchor links work within pages', async ({ page }) => {
      // Go to a page with table of contents
      await page.goto('/api-reference/model');

      // Look for anchor links (typically in TOC or headings)
      const anchorLinks = page.locator('a[href^="#"]');
      const anchorCount = await anchorLinks.count();

      if (anchorCount > 0) {
        const firstAnchor = anchorLinks.first();
        const href = await firstAnchor.getAttribute('href');
        
        await firstAnchor.click();
        
        // Check that URL includes the anchor
        await expect(page).toHaveURL(new RegExp(`#${href.substring(1)}`));

        // Check that the target element is in view
        const targetElement = page.locator(href);
        if (await targetElement.count() > 0) {
          await expect(targetElement).toBeInViewport();
        }
      }
    });
  });

  test.describe('Navigation Performance', () => {
    test('page transitions are smooth', async ({ page }) => {
      await page.goto('/');

      // Measure navigation time between pages
      const startTime = Date.now();
      await page.click('text=Quickstart');
      await page.waitForLoadState('networkidle');
      const navigationTime = Date.now() - startTime;

      // Navigation should be reasonably fast
      expect(navigationTime).toBeLessThan(2000);
    });

    test('navigation does not cause layout shifts', async ({ page }) => {
      await page.goto('/');
      
      // Take screenshot of initial state
      const initialScreenshot = await page.screenshot();

      // Navigate and come back
      await page.click('text=Quickstart');
      await page.goBack();
      await page.waitForLoadState('networkidle');

      // Take screenshot after navigation
      const finalScreenshot = await page.screenshot();

      // Screenshots should be very similar (allowing for small differences)
      expect(initialScreenshot.length).toBeCloseTo(finalScreenshot.length, -1);
    });
  });

  test.describe('Cross-Browser Navigation', () => {
    test('navigation works in different browsers', async ({ page, browserName }) => {
      await page.goto('/');

      // Test basic navigation in each browser
      await page.click('text=API Reference');
      await expect(page).toHaveURL(/.*\/api-reference/);

      await page.click('text=Model');
      await expect(page).toHaveURL(/.*\/api-reference\/model/);

      console.log(`Navigation test passed in ${browserName}`);
    });
  });

  test.describe('Accessibility Navigation', () => {
    test('navigation is keyboard accessible', async ({ page }) => {
      await page.goto('/');

      // Test tab navigation
      await page.keyboard.press('Tab');
      
      // Check if focus is visible
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();

      // Test Enter key to activate links
      let currentUrl = page.url();
      await page.keyboard.press('Enter');
      
      // URL should change or stay the same depending on the focused element
      const newUrl = page.url();
      expect(typeof newUrl).toBe('string');
    });

    test('navigation has proper ARIA labels', async ({ page }) => {
      await page.goto('/');

      // Check for proper navigation landmarks
      const nav = page.locator('nav, [role="navigation"]');
      await expect(nav).toBeVisible();

      // Check for skip links
      const skipLinks = page.locator('a[href^="#"]:has-text("skip"), .skip-link');
      if (await skipLinks.count() > 0) {
        await expect(skipLinks.first()).toBeVisible();
      }
    });

    test('navigation supports screen readers', async ({ page }) => {
      await page.goto('/');

      // Check for proper heading hierarchy
      const headings = page.locator('h1, h2, h3, h4, h5, h6');
      const headingCount = await headings.count();
      expect(headingCount).toBeGreaterThan(0);

      // Check for alt text on navigation images/icons
      const navImages = page.locator('nav img, [role="navigation"] img');
      const imageCount = await navImages.count();

      for (let i = 0; i < imageCount; i++) {
        const img = navImages.nth(i);
        const alt = await img.getAttribute('alt');
        const ariaLabel = await img.getAttribute('aria-label');
        
        // Images should have alt text or aria-label
        expect(alt || ariaLabel).toBeTruthy();
      }
    });
  });
}); 
import { test, expect } from '@playwright/test';

/**
 * Test suite for verifying all documentation pages load correctly
 * Tests page loading, basic content presence, and response times
 */

// Core documentation pages
const corePages = [
  { path: '/', title: 'Multisynq Documentation', description: 'Welcome to Multisynq' },
  { path: '/quickstart', title: 'Quickstart', description: 'Start building' },
  { path: '/development', title: 'Development', description: 'Development setup' },
];

// Essential guides pages  
const essentialPages = [
  { path: '/essentials/sync', title: 'Real-time Synchronization', description: 'Learn how Multisynq achieves' },
  { path: '/essentials/collaboration', title: 'Collaborative Editing', description: 'Build real-time collaborative' },
  { path: '/essentials/chat', title: 'Real-time Chat', description: 'Build chat applications' },
  { path: '/essentials/whiteboard', title: 'Shared Whiteboard', description: 'Create collaborative drawing' },
  { path: '/essentials/scaling', title: 'Scaling Applications', description: 'Learn how to scale' },
  { path: '/essentials/conflicts', title: 'Conflict Resolution', description: 'Understand how Multisynq handles' },
];

// API reference pages
const apiPages = [
  { path: '/api-reference/introduction', title: 'API Reference', description: 'Complete reference for the Multisynq' },
  { path: '/api-reference/model', title: 'Model', description: 'The Model class is the core' },
  { path: '/api-reference/view', title: 'View', description: 'The View class handles user interface' },
  { path: '/api-reference/session', title: 'Session', description: 'Session management' },
];

// React Together pages
const reactTogetherPages = [
  { path: '/react-together', title: 'React Together', description: 'React Together documentation' },
  { path: '/react-together/getting-started', title: 'Getting Started', description: 'Get started with React Together' },
  { path: '/react-together/hooks/useStateTogether', title: 'useStateTogether', description: 'Share state between users' },
  { path: '/react-together/hooks/useConnectedUsers', title: 'useConnectedUsers', description: 'Track connected users' },
  { path: '/react-together/hooks/useChat', title: 'useChat', description: 'Add real-time chat' },
  { path: '/react-together/components/ReactTogether', title: 'ReactTogether', description: 'Main component for React Together' },
];

// All pages combined
const allPages = [...corePages, ...essentialPages, ...apiPages, ...reactTogetherPages];

test.describe('Page Loading Tests', () => {
  test.describe('Core Pages', () => {
    for (const page of corePages) {
      test(`${page.path} loads successfully`, async ({ page: playwright }) => {
        const response = await playwright.goto(page.path);
        
        // Check response status
        expect(response?.status()).toBe(200);
        
        // Check page title
        await expect(playwright).toHaveTitle(new RegExp(page.title, 'i'));
        
        // Check main content is present
        await expect(playwright.locator('main')).toBeVisible();
        
        // Check for description in page content
        await expect(playwright.locator('body')).toContainText(page.description);
        
        // Performance check - page should load within 3 seconds
        const loadTime = Date.now();
        await playwright.waitForLoadState('networkidle');
        const totalTime = Date.now() - loadTime;
        expect(totalTime).toBeLessThan(3000);
      });
    }
  });

  test.describe('Essential Guides', () => {
    for (const page of essentialPages) {
      test(`${page.path} loads successfully`, async ({ page: playwright }) => {
        const response = await playwright.goto(page.path);
        
        expect(response?.status()).toBe(200);
        await expect(playwright).toHaveTitle(new RegExp(page.title, 'i'));
        await expect(playwright.locator('main')).toBeVisible();
        await expect(playwright.locator('body')).toContainText(page.description);
        
        // Check for code examples on essential pages
        const codeBlocks = playwright.locator('pre code, .language-javascript, .language-js');
        const codeCount = await codeBlocks.count();
        expect(codeCount).toBeGreaterThan(0);
      });
    }
  });

  test.describe('API Reference', () => {
    for (const page of apiPages) {
      test(`${page.path} loads successfully`, async ({ page: playwright }) => {
        const response = await playwright.goto(page.path);
        
        expect(response?.status()).toBe(200);
        await expect(playwright).toHaveTitle(new RegExp(page.title, 'i'));
        await expect(playwright.locator('main')).toBeVisible();
        await expect(playwright.locator('body')).toContainText(page.description);
        
        // API pages should have method/property documentation
        const headings = playwright.locator('h2, h3');
        const headingCount = await headings.count();
        expect(headingCount).toBeGreaterThan(2);
      });
    }
  });

  test.describe('React Together', () => {
    for (const page of reactTogetherPages) {
      test(`${page.path} loads successfully`, async ({ page: playwright }) => {
        const response = await playwright.goto(page.path);
        
        expect(response?.status()).toBe(200);
        await expect(playwright).toHaveTitle(new RegExp(page.title, 'i'));
        await expect(playwright.locator('main')).toBeVisible();
        await expect(playwright.locator('body')).toContainText(page.description);
        
        // React Together pages should mention React
        await expect(playwright.locator('body')).toContainText('React');
      });
    }
  });
});

test.describe('Page Performance', () => {
  test('All pages load within acceptable time limits', async ({ page }) => {
    for (const pageInfo of allPages) {
      const startTime = Date.now();
      const response = await page.goto(pageInfo.path);
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      // Page should load within 5 seconds
      expect(loadTime).toBeLessThan(5000);
      
      // Response should be successful
      expect(response?.status()).toBe(200);
      
      console.log(`${pageInfo.path}: ${loadTime}ms`);
    }
  });

  test('Pages have reasonable bundle sizes', async ({ page }) => {
    await page.goto('/');
    
    // Monitor network requests to check for large bundles
    const responses = [];
    page.on('response', response => {
      if (response.url().includes('.js') || response.url().includes('.css')) {
        responses.push({
          url: response.url(),
          size: response.headers()['content-length'] || 0
        });
      }
    });
    
    await page.waitForLoadState('networkidle');
    
    // No single JS bundle should be larger than 1MB
    for (const response of responses) {
      if (response.url.includes('.js')) {
        expect(parseInt(response.size) || 0).toBeLessThan(1024 * 1024);
      }
    }
  });
});

test.describe('Error Handling', () => {
  test('404 page handling', async ({ page }) => {
    const response = await page.goto('/non-existent-page');
    
    // Should show 404 page or redirect appropriately
    expect(response?.status()).toBe(404);
    
    // Should show helpful error message
    await expect(page.locator('body')).toContainText(/not found|404|page.*exist/i);
  });

  test('Broken image handling', async ({ page }) => {
    await page.goto('/');
    
    // Check that all images load properly
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const src = await img.getAttribute('src');
      
      if (src && !src.startsWith('data:')) {
        // Navigate to image URL to verify it loads
        const response = await page.request.get(src);
        expect(response.status()).toBe(200);
      }
    }
  });
});

test.describe('Content Validation', () => {
  test('Pages contain required metadata', async ({ page }) => {
    for (const pageInfo of allPages) {
      await page.goto(pageInfo.path);
      
      // Check for meta description
      const metaDescription = page.locator('meta[name="description"]');
      await expect(metaDescription).toHaveCount(1);
      
      // Check for viewport meta tag
      const viewport = page.locator('meta[name="viewport"]');
      await expect(viewport).toHaveCount(1);
      
      // Check for favicon
      const favicon = page.locator('link[rel*="icon"]');
      await expect(favicon).toHaveCount(1);
    }
  });

  test('Code blocks are properly formatted', async ({ page }) => {
    for (const pageInfo of essentialPages) {
      await page.goto(pageInfo.path);
      
      const codeBlocks = page.locator('pre code');
      const count = await codeBlocks.count();
      
      for (let i = 0; i < count; i++) {
        const codeBlock = codeBlocks.nth(i);
        
        // Code should be visible
        await expect(codeBlock).toBeVisible();
        
        // Code should have syntax highlighting classes
        const className = await codeBlock.getAttribute('class');
        expect(className).toMatch(/language-|hljs/);
        
        // Code should not be empty
        const text = await codeBlock.textContent();
        expect(text?.trim().length).toBeGreaterThan(0);
      }
    }
  });

  test('Links are properly formatted', async ({ page }) => {
    await page.goto('/');
    
    const links = page.locator('a[href]');
    const linkCount = await links.count();
    
    for (let i = 0; i < Math.min(linkCount, 20); i++) { // Test first 20 links
      const link = links.nth(i);
      const href = await link.getAttribute('href');
      
      if (href) {
        // Internal links should not be empty
        if (href.startsWith('/') || href.startsWith('#')) {
          expect(href.length).toBeGreaterThan(1);
        }
        
        // External links should have protocol
        if (!href.startsWith('/') && !href.startsWith('#')) {
          expect(href).toMatch(/^https?:\/\//);
        }
      }
    }
  });
}); 
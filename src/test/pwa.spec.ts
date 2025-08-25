import { test, expect } from '@playwright/test';

test.describe('PWA Functionality', () => {
  test('should have service worker registered', async ({ page }) => {
    await page.goto('/');
    
    // Check if service worker is registered
    const hasServiceWorker = await page.evaluate(() => {
      return 'serviceWorker' in navigator && navigator.serviceWorker.controller !== null;
    });
    
    expect(hasServiceWorker).toBeTruthy();
  });

  test('should have web app manifest', async ({ page }) => {
    await page.goto('/');
    
    // Check if manifest link exists
    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toBeVisible();
    
    // Check manifest href
    const manifestHref = await manifestLink.getAttribute('href');
    expect(manifestHref).toBe('/manifest.webmanifest');
  });

  test('should have proper meta tags for PWA', async ({ page }) => {
    await page.goto('/');
    
    // Check viewport meta tag
    const viewportMeta = page.locator('meta[name="viewport"]');
    await expect(viewportMeta).toBeVisible();
    
    // Check theme color meta tag
    const themeColorMeta = page.locator('meta[name="theme-color"]');
    await expect(themeColorMeta).toBeVisible();
  });
});

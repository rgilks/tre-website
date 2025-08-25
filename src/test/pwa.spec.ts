import { test, expect } from '@playwright/test'

test.describe('PWA Functionality', () => {
  test('should have service worker registered', async ({ page }) => {
    await page.goto('/')

    // Wait for PWA initialization and service worker registration
    await page.waitForTimeout(2000)

    // Check if service worker is registered with retry logic
    let hasServiceWorker = false
    for (let i = 0; i < 3; i++) {
      hasServiceWorker = await page.evaluate(() => {
        return (
          'serviceWorker' in navigator &&
          navigator.serviceWorker.controller !== null
        )
      })

      if (hasServiceWorker) break

      // Wait a bit more if not registered yet
      await page.waitForTimeout(1000)
    }

    expect(hasServiceWorker).toBeTruthy()
  })

  test('should have web app manifest', async ({ page }) => {
    await page.goto('/')

    // Check if manifest link exists (use first one to avoid duplicate issues)
    const manifestLinks = page.locator('link[rel="manifest"]')
    await expect(manifestLinks).toHaveCount(1)

    // Check manifest href
    const manifestHref = await manifestLinks.first().getAttribute('href')
    expect(manifestHref).toBe('/manifest.webmanifest')
  })

  test('should have proper meta tags for PWA', async ({ page }) => {
    await page.goto('/')

    // Check viewport meta tag exists (meta tags are not "visible" in DOM sense)
    const viewportMeta = page.locator('meta[name="viewport"]')
    await expect(viewportMeta).toHaveCount(1)

    // Check theme color meta tag exists
    const themeColorMeta = page.locator('meta[name="theme-color"]')
    await expect(themeColorMeta).toHaveCount(1)
  })
})

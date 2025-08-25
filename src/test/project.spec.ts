import { test, expect } from '@playwright/test'

test.describe('Project Page', () => {
  test('should load project details page', async ({ page }) => {
    // Navigate to a specific project (use a real project name that exists)
    await page.goto('/project/geno-1')

    // Check that the page loads
    await expect(page).toHaveTitle(/TRE Website/)

    // Check that project viewer is visible
    await expect(page.getByTestId('project-viewer')).toBeVisible()
  })

  test('should display project information', async ({ page }) => {
    await page.goto('/project/geno-1')

    // Check that project viewer is visible
    await expect(page.getByTestId('project-viewer')).toBeVisible()

    // Check that project iframe is present (this is what actually displays the project)
    await expect(page.locator('iframe')).toBeVisible()
  })

  test('should handle invalid project gracefully', async ({ page }) => {
    // Navigate to a non-existent project
    await page.goto('/project/non-existent-project')

    // Should still load the page (even if with error state)
    await expect(page).toHaveTitle(/TRE Website/)
  })
})

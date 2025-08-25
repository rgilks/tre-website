import { test, expect } from '@playwright/test';

test.describe('Project Page', () => {
  test('should load project details page', async ({ page }) => {
    // Navigate to a specific project (we'll use a mock project name)
    await page.goto('/project/test-project');
    
    // Check that the page loads
    await expect(page).toHaveTitle(/TRE Website/);
    
    // Check that project viewer is visible
    await expect(page.getByTestId('project-viewer')).toBeVisible();
  });

  test('should display project information', async ({ page }) => {
    await page.goto('/project/test-project');
    
    // Check that project header is visible
    await expect(page.getByTestId('project-card-header')).toBeVisible();
    
    // Check that project topics are visible
    await expect(page.getByTestId('project-card-topics')).toBeVisible();
    
    // Check that project footer is visible
    await expect(page.getByTestId('project-card-footer')).toBeVisible();
  });

  test('should handle invalid project gracefully', async ({ page }) => {
    // Navigate to a non-existent project
    await page.goto('/project/non-existent-project');
    
    // Should still load the page (even if with error state)
    await expect(page).toHaveTitle(/TRE Website/);
  });
});

import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/');
    
    // Check that the page loads
    await expect(page).toHaveTitle(/TRE Website/);
    
    // Check that main sections are visible
    await expect(page.getByTestId('hero-section')).toBeVisible();
    await expect(page.getByTestId('about-section')).toBeVisible();
    await expect(page.getByTestId('contact-section')).toBeVisible();
  });

  test('should display project grid', async ({ page }) => {
    await page.goto('/');
    
    // Check that project grid is visible
    await expect(page.getByTestId('project-grid')).toBeVisible();
    
    // Check that at least one project card is displayed
    const projectCards = page.getByTestId('project-card');
    await expect(projectCards.first()).toBeVisible();
  });

  test('should have clickable buttons in project cards', async ({ page }) => {
    await page.goto('/');
    
    // Check that project cards have clickable buttons
    const firstProjectCard = page.getByTestId('project-card').first();
    await expect(firstProjectCard).toBeVisible();
    
    // Check for GitHub button (should always be present)
    const githubButton = page.getByTestId('project-github').first();
    await expect(githubButton).toBeVisible();
    
    // Check that buttons are clickable
    await expect(githubButton).toHaveAttribute('href');
  });
});

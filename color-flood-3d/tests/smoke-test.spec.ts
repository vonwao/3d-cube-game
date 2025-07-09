import { test, expect } from '@playwright/test';

test.describe('Smoke Tests - Critical Functionality', () => {
  
  test('app should load without errors', async ({ page }) => {
    // Listen for console errors
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Navigate to the app
    await page.goto('/');
    
    // Wait for main container to be visible (either version)
    const mainContainer = page.locator('.color-competition-game, .color-competition-simple');
    await expect(mainContainer.first()).toBeVisible();
    
    // Check that no critical errors occurred
    const criticalErrors = errors.filter(error => 
      error.includes('Failed to') || 
      error.includes('Cannot') ||
      error.includes('Uncaught')
    );
    
    if (criticalErrors.length > 0) {
      console.log('Critical errors found:', criticalErrors);
      expect(criticalErrors.length).toBe(0);
    }
  });

  test('3D scene should render without WebGL errors', async ({ page }) => {
    await page.goto('/');
    
    // Wait for canvas to be present
    await expect(page.locator('.canvas-container canvas')).toBeVisible();
    
    // Check WebGL context is available
    const webGLSupported = await page.evaluate(() => {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
    });
    
    expect(webGLSupported).toBe(true);
  });

  test('essential UI components should be present', async ({ page }) => {
    await page.goto('/');
    
    // Critical UI elements that must be present (check both UI versions)
    const mainContainer = page.locator('.color-competition-game, .color-competition-simple');
    await expect(mainContainer.first()).toBeVisible();
    
    await expect(page.locator('.canvas-container')).toBeVisible();
    await expect(page.locator('.ui-overlay')).toBeVisible();
    await expect(page.locator('.top-bar')).toBeVisible();
    
    // Controls container exists in original UI, left-panel in simplified UI
    const controlsContainer = page.locator('.controls-container, .left-panel');
    await expect(controlsContainer.first()).toBeVisible();
  });

});
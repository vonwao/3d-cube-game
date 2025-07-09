import { test, expect } from '@playwright/test';

test.describe('Simplified UI - Smoke Tests', () => {
  
  test('simplified UI should load without errors', async ({ page }) => {
    // Listen for console errors
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Navigate to the app
    await page.goto('/');
    
    // Wait a bit for React to render
    await page.waitForTimeout(1000);
    
    // The app now defaults to the simplified UI, no need to click any button
    
    // Wait for main container to be visible
    await expect(page.locator('.color-competition-simple')).toBeVisible({ timeout: 15000 });
    
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

  test('simplified UI components should be present', async ({ page }) => {
    await page.goto('/');
    
    // Wait for initial load
    await page.waitForTimeout(1000);
    
    // The app now defaults to the simplified UI, no need to click any button
    
    // Critical UI elements for simplified version
    await expect(page.locator('.color-competition-simple')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.canvas-container')).toBeVisible();
    await expect(page.locator('.ui-overlay')).toBeVisible();
    await expect(page.locator('.top-bar')).toBeVisible();
    await expect(page.locator('.left-panel')).toBeVisible();
    await expect(page.locator('.right-panel')).toBeVisible();
    
    // Specific simplified UI components
    await expect(page.locator('.simple-preset-selector')).toBeVisible();
    await expect(page.locator('.simple-controls')).toBeVisible();
    await expect(page.locator('.preset-details-panel')).toBeVisible();
  });

  test('preset selection should work', async ({ page }) => {
    await page.goto('/');
    
    // Wait for initial load
    await page.waitForTimeout(1000);
    
    // The app now defaults to the simplified UI, no need to click any button
    
    // Wait for UI to be ready
    await expect(page.locator('.simple-preset-selector')).toBeVisible({ timeout: 10000 });
    
    // Click on a different preset
    const magnetVortexButton = page.locator('.preset-item:has-text("Magnetic Vortex")');
    await expect(magnetVortexButton).toBeVisible();
    await magnetVortexButton.click();
    
    // Check that the details panel updated
    await expect(page.locator('.preset-title:has-text("Magnetic Vortex")')).toBeVisible();
    await expect(page.locator('.preset-type:has-text("MAGNET")')).toBeVisible();
  });

  test('3D canvas should render', async ({ page }) => {
    await page.goto('/');
    
    // Wait for initial load
    await page.waitForTimeout(1000);
    
    // The app now defaults to the simplified UI, no need to click any button
    
    // Wait for canvas to be present
    await expect(page.locator('.canvas-container canvas')).toBeVisible({ timeout: 10000 });
    
    // Check WebGL context is available
    const webGLSupported = await page.evaluate(() => {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
    });
    
    expect(webGLSupported).toBe(true);
  });

});
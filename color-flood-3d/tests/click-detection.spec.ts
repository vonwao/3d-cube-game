import { test, expect } from '@playwright/test';

test.describe('3D Click Detection Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the test page
    await page.goto('/click-test');
    
    // Wait for the canvas to be ready
    await page.waitForSelector('canvas', { timeout: 5000 });
    
    // Wait a bit for Three.js to initialize
    await page.waitForTimeout(1000);
  });

  test('canvas should be visible and have correct dimensions', async ({ page }) => {
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(100);
    expect(box!.height).toBeGreaterThan(100);
    
    console.log('Canvas dimensions:', box);
  });

  test('clicking on cubes should register clicks', async ({ page }) => {
    // Get canvas element
    const canvas = page.locator('canvas');
    const canvasBox = await canvas.boundingBox();
    
    if (!canvasBox) {
      throw new Error('Canvas not found');
    }

    // Listen for console logs
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      consoleLogs.push(msg.text());
    });

    // Click in the center (should hit red cube)
    await page.mouse.click(
      canvasBox.x + canvasBox.width / 2,
      canvasBox.y + canvasBox.height / 2
    );
    
    // Wait for click to process
    await page.waitForTimeout(500);
    
    // Check if click was registered
    const lastClicked = await page.locator('#last-clicked').textContent();
    const totalClicks = await page.locator('#total-clicks').textContent();
    
    console.log('Last clicked:', lastClicked);
    console.log('Total clicks:', totalClicks);
    console.log('Console logs:', consoleLogs);
    
    // Verify click was registered
    expect(lastClicked).not.toBe('none');
    expect(parseInt(totalClicks || '0')).toBeGreaterThan(0);
  });

  test('clicking on different positions should hit different cubes', async ({ page }) => {
    const canvas = page.locator('canvas');
    const canvasBox = await canvas.boundingBox();
    
    if (!canvasBox) {
      throw new Error('Canvas not found');
    }

    const clicks = [];
    
    // Click left side (blue cube)
    await page.mouse.click(
      canvasBox.x + canvasBox.width * 0.2,
      canvasBox.y + canvasBox.height / 2
    );
    await page.waitForTimeout(300);
    clicks.push(await page.locator('#last-clicked').textContent());
    
    // Click center (red cube)  
    await page.mouse.click(
      canvasBox.x + canvasBox.width / 2,
      canvasBox.y + canvasBox.height / 2
    );
    await page.waitForTimeout(300);
    clicks.push(await page.locator('#last-clicked').textContent());
    
    // Click right side (green cube)
    await page.mouse.click(
      canvasBox.x + canvasBox.width * 0.8,
      canvasBox.y + canvasBox.height / 2
    );
    await page.waitForTimeout(300);
    clicks.push(await page.locator('#last-clicked').textContent());
    
    console.log('Clicks registered:', clicks);
    
    // Check we got different cubes
    const uniqueClicks = new Set(clicks);
    expect(uniqueClicks.size).toBeGreaterThan(1);
  });

  test('hover effects should work', async ({ page }) => {
    const canvas = page.locator('canvas');
    const canvasBox = await canvas.boundingBox();
    
    if (!canvasBox) {
      throw new Error('Canvas not found');
    }

    // Move mouse to center
    await page.mouse.move(
      canvasBox.x + canvasBox.width / 2,
      canvasBox.y + canvasBox.height / 2
    );
    
    // Check cursor changed
    const cursor = await page.evaluate(() => document.body.style.cursor);
    expect(cursor).toBe('pointer');
  });

  test('clicking outside cubes should miss', async ({ page }) => {
    const canvas = page.locator('canvas');
    const canvasBox = await canvas.boundingBox();
    
    if (!canvasBox) {
      throw new Error('Canvas not found');
    }

    let missDetected = false;
    page.on('console', msg => {
      if (msg.text().includes('Pointer missed all objects')) {
        missDetected = true;
      }
    });

    // Click in top corner (should miss)
    await page.mouse.click(
      canvasBox.x + 10,
      canvasBox.y + 10
    );
    
    await page.waitForTimeout(300);
    
    expect(missDetected).toBe(true);
  });

  test('raycaster should work with instanced mesh', async ({ page }) => {
    // Navigate to the actual game
    await page.goto('/');
    
    // Wait for the game to load
    await page.waitForSelector('.gameContainer canvas', { timeout: 5000 });
    await page.waitForTimeout(1000);
    
    // Get console logs
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      consoleLogs.push(msg.text());
    });
    
    // Try clicking on the game canvas
    const gameCanvas = page.locator('.gameContainer canvas');
    const box = await gameCanvas.boundingBox();
    
    if (box) {
      await page.mouse.click(
        box.x + box.width / 2,
        box.y + box.height / 2
      );
      
      await page.waitForTimeout(500);
      
      console.log('Game canvas click logs:', consoleLogs);
    }
  });
});
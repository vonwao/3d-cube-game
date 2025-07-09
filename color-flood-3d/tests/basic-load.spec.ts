import { test, expect } from '@playwright/test';

test('basic app load test', async ({ page }) => {
  // Navigate to the app
  await page.goto('/');
  
  // Take a screenshot for debugging
  await page.screenshot({ path: 'test-screenshot.png' });
  
  // Check if any game selector button is visible
  const gameButtons = page.locator('button');
  const count = await gameButtons.count();
  
  console.log(`Found ${count} buttons on the page`);
  
  // At least one button should be visible
  expect(count).toBeGreaterThan(0);
  
  // Look for any main container
  const containers = await page.evaluate(() => {
    const classNames = Array.from(document.querySelectorAll('div')).map(el => el.className);
    return classNames.filter(cn => cn.includes('competition') || cn.includes('flood'));
  });
  
  console.log('Found containers:', containers);
});
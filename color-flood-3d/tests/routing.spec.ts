import { test, expect } from '@playwright/test'

test.describe('Routing Tests', () => {
  test('should navigate to analysis page', async ({ page }) => {
    // Start at the home page
    await page.goto('/')
    
    // Should see the game interface
    await expect(page.locator('h1')).toContainText('Color Competition')
    
    // Click the CA Analysis link
    await page.click('a[href="/analysis"]')
    
    // Should navigate to analysis page
    await expect(page).toHaveURL('/analysis')
    
    // Should see the analysis page content
    await expect(page.locator('h1')).toContainText('Cellular Automata Analysis Lab')
  })
  
  test('should navigate back to game from analysis page', async ({ page }) => {
    // Start at the analysis page
    await page.goto('/analysis')
    
    // Should see the analysis page
    await expect(page.locator('h1')).toContainText('Cellular Automata Analysis Lab')
    
    // Click the back button
    await page.click('a[href="/"]')
    
    // Should navigate back to home
    await expect(page).toHaveURL('/')
    
    // Should see the game interface
    await expect(page.locator('h1')).toContainText('Color Competition')
  })
  
  test('analysis page should have all required components', async ({ page }) => {
    await page.goto('/analysis')
    
    // Check for main components
    await expect(page.locator('h1')).toContainText('Cellular Automata Analysis Lab')
    await expect(page.locator('h2')).toContainText('Simulation Configuration')
    await expect(page.locator('button')).toContainText('Start Analysis')
    
    // Check for configuration options
    await expect(page.locator('select')).toHaveCount(3) // Cube size, generations, runs per ruleset
    await expect(page.locator('input[type="checkbox"]')).toHaveCount(2) // Two checkboxes
  })
})
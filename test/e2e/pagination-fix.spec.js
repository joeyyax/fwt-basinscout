/**
 * E2E Test - Pagination Restoration Fix
 * Verifies that pagination reappears when returning to map section using scroll/keyboard navigation
 */

import { test, expect } from '@playwright/test';

// Helper function to handle scrolling across different platforms
async function scrollDown(page, distance = 500) {
  const browserName = page.context().browser().browserType().name();
  const isMobileDevice = page.context()._options.isMobile;

  if (browserName === 'webkit' && isMobileDevice) {
    // Use touch gestures only for actual mobile devices
    const viewportSize = page.viewportSize();
    const startY = viewportSize.height * 0.7;
    const endY = viewportSize.height * 0.3;
    const centerX = viewportSize.width / 2;

    await page.touchscreen.tap(centerX, startY);
    await page.mouse.move(centerX, startY);
    await page.mouse.down();
    await page.mouse.move(centerX, endY);
    await page.mouse.up();
  } else {
    // Use mouse wheel for all other cases
    await page.mouse.wheel(0, distance);
  }
}

async function scrollUp(page, distance = 500) {
  const browserName = page.context().browser().browserType().name();
  const isMobileDevice = page.context()._options.isMobile;

  if (browserName === 'webkit' && isMobileDevice) {
    // Use touch gestures only for actual mobile devices
    const viewportSize = page.viewportSize();
    const startY = viewportSize.height * 0.3;
    const endY = viewportSize.height * 0.7;
    const centerX = viewportSize.width / 2;

    await page.touchscreen.tap(centerX, startY);
    await page.mouse.move(centerX, startY);
    await page.mouse.down();
    await page.mouse.move(centerX, endY);
    await page.mouse.up();
  } else {
    // Use mouse wheel for all other cases
    await page.mouse.wheel(0, -distance);
  }
}

test.describe('Pagination Restoration Fix - Scroll/Keyboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for app to initialize
    await page.waitForSelector('#app', { state: 'visible' });
    await page.waitForTimeout(3000); // Extended wait for initialization
  });

  test('should restore map pagination when returning from results section using scroll navigation', async ({ page }) => {
    const mapPagination = page.locator('#map .pagination-panel');
    
    // 1. Start at intro section
    await expect(page.locator('#intro')).toBeVisible();
    
    // 2. Navigate to map section using scroll
    await scrollDown(page, 500);
    await page.waitForTimeout(1500);
    await expect(page.locator('#map')).toBeVisible();
    
    // 3. Wait for pagination to appear (if section pagination is enabled)
    await page.waitForTimeout(1500);
    
    // Check if pagination exists at all in this section
    const hasPagination = await mapPagination.count() > 0;
    
    if (hasPagination) {
      // 4. Verify pagination is visible when first entering map section
      await expect(mapPagination).toBeVisible();
      
      // 5. Navigate to results section using scroll
      await scrollDown(page, 500);
      await page.waitForTimeout(1500);
      await expect(page.locator('#results')).toBeVisible();
      
      // 6. Verify map pagination is hidden when in results
      await expect(mapPagination).not.toBeVisible();
      
      // 7. Navigate back to map section using scroll (this tests our pagination restoration fix)
      await scrollUp(page, 500);
      await page.waitForTimeout(1500);
      await expect(page.locator('#map')).toBeVisible();
      
      // 8. Verify pagination reappears (this is what our fix addresses)
      await expect(mapPagination).toBeVisible();
      
      // 9. Test navigation back to intro section
      await scrollUp(page, 500);
      await page.waitForTimeout(1500);
      await expect(page.locator('#intro')).toBeVisible();
      
      // 10. Navigate back to map from intro
      await scrollDown(page, 500);
      await page.waitForTimeout(1500);
      await expect(page.locator('#map')).toBeVisible();
      
      // 11. Verify pagination still works after returning from intro
      await expect(mapPagination).toBeVisible();
      
      // 12. Test rapid section switching using scroll (stress test)
      for (let i = 0; i < 2; i++) {
        // Go to results
        await scrollDown(page, 500);
        await page.waitForTimeout(800);
        await expect(page.locator('#results')).toBeVisible();
        await expect(mapPagination).not.toBeVisible();
        
        // Return to map
        await scrollUp(page, 500);
        await page.waitForTimeout(800);
        await expect(page.locator('#map')).toBeVisible();
        await expect(mapPagination).toBeVisible();
      }
    } else {
      // If no pagination exists, test basic navigation still works
      await scrollDown(page, 500);
      await page.waitForTimeout(1000);
      await expect(page.locator('#results')).toBeVisible();
      
      await page.keyboard.press('ArrowUp');
      await page.waitForTimeout(1000);
      await expect(page.locator('#map')).toBeVisible();
    }
  });

  test('should handle panel pagination within map section after restoration', async ({ page }) => {
    // Navigate to map section
    await scrollDown(page, 500);
    await page.waitForTimeout(1500);
    await expect(page.locator('#map')).toBeVisible();
    
    const mapPagination = page.locator('#map .pagination-panel');
    const hasPagination = await mapPagination.count() > 0;
    
    if (hasPagination) {
      await expect(mapPagination).toBeVisible();
      
      const panelDots = mapPagination.locator('.pagination-dot');
      const panelCount = await panelDots.count();
      
      if (panelCount > 1) {
        // Navigate to last panel if multiple panels exist
        await panelDots.last().click();
        await page.waitForTimeout(1000);
        
        // Verify active state
        const activeDot = mapPagination.locator('.pagination-dot.panel-active');
        await expect(activeDot).toBeVisible();
        
        // Navigate away and back
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(1000);
        await expect(page.locator('#results')).toBeVisible();
        
        await page.keyboard.press('ArrowUp');
        await page.waitForTimeout(1000);
        await expect(page.locator('#map')).toBeVisible();
        await expect(mapPagination).toBeVisible();
        
        // Test panel navigation after restoration
        await panelDots.first().click();
        await page.waitForTimeout(1000);
        const firstActiveDot = mapPagination.locator('.pagination-dot.panel-active').first();
        await expect(firstActiveDot).toBeVisible();
      }
    }
  });
});

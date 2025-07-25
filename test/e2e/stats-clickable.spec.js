/**
 * Test for verifying stats clickability after fixing section pointer-events
 */
import { test, expect } from '@playwright/test';

test.describe('Stats Clickability Fix', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    // Wait for the app to load
    await page.waitForSelector('.section');
    await page.waitForTimeout(1500); // Allow for app initialization
  });

  test('should allow stats to be clicked in intro section', async ({
    page,
  }) => {
    // 1. Verify we're on the intro section
    const introSection = page.locator('#intro');
    await expect(introSection).toBeVisible();

    // 2. Check that intro section has active class (allowing for other classes too)
    await expect(introSection).toHaveClass(/.*active.*/);

    // 3. Check that stats are present and clickable
    const stats = page.locator('.stat');
    const statCount = await stats.count();

    if (statCount > 0) {
      console.log(`Found ${statCount} stats to test`);

      // 4. Test first stat clickability
      const firstStat = stats.first();
      await expect(firstStat).toBeVisible();

      // 5. Verify the stat is an anchor tag with href
      const href = await firstStat.getAttribute('href');
      expect(href).toBeTruthy();
      expect(href).toContain('http');

      // 6. Check computed styles - pointer-events should not be 'none'
      const pointerEvents = await firstStat.evaluate(
        (el) => window.getComputedStyle(el).pointerEvents
      );
      expect(pointerEvents).not.toBe('none');

      // 7. Test actual click (trial click to test if element is clickable)
      await firstStat.click({ trial: true });
      console.log('✅ First stat is clickable');

      // 8. Test additional stats if they exist
      if (statCount > 1) {
        const secondStat = stats.nth(1);
        await expect(secondStat).toBeVisible();
        await secondStat.click({ trial: true });
        console.log('✅ Second stat is clickable');
      }

      if (statCount > 2) {
        const thirdStat = stats.nth(2);
        await expect(thirdStat).toBeVisible();
        await thirdStat.click({ trial: true });
        console.log('✅ Third stat is clickable');
      }
    } else {
      console.log('ℹ️ No stats found in intro section');
    }
  });
});

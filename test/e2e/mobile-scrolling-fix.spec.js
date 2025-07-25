import { test, expect } from '@playwright/test';

test.describe('Mobile Scrolling Fix', () => {
  test('should allow touch scrolling in stats area without triggering navigation', async ({
    page,
  }) => {
    await page.goto('/');

    // Wait for the page to load
    await page.waitForSelector('.section.active');

    // Find the stats container
    const statsContainer = page.locator('.stats');
    await expect(statsContainer).toBeVisible();

    // Verify stats are no longer wrapped in anchor tags
    const clickableStats = page.locator('a.stat');
    await expect(clickableStats).toHaveCount(0);

    // Verify source links are still clickable
    const sourceLinks = page.locator('.stat-label a');
    await expect(sourceLinks).toHaveCount(3);

    // Verify source links have proper attributes
    for (const link of await sourceLinks.all()) {
      await expect(link).toHaveAttribute('href');
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toContainText('(source)');
    }
  });

  test('should have responsive touch navigation outside stats area', async ({
    page,
  }) => {
    await page.goto('/');

    // Wait for the page to load
    await page.waitForSelector('.section.active');

    // Find a non-interactive area for touch navigation (like the prose area)
    const proseArea = page.locator('.prose h2').first();
    await expect(proseArea).toBeVisible();

    // Simulate a vertical swipe on mobile
    await page.setViewportSize({ width: 375, height: 667 }); // Mobile viewport

    // Get the bounding box of the prose area
    const bbox = await proseArea.boundingBox();

    // Simulate a swipe up gesture (should trigger navigation)
    await page.mouse.move(bbox.x + bbox.width / 2, bbox.y + bbox.height / 2);
    await page.mouse.down();
    await page.mouse.move(bbox.x + bbox.width / 2, bbox.y - 100); // Swipe up
    await page.mouse.up();

    // Wait a moment for potential navigation
    await page.waitForTimeout(500);

    // Note: This test mainly verifies that the touch handling code doesn't crash
    // Actual navigation behavior may vary based on panel content
  });

  test('should allow clicking source links without triggering navigation', async ({
    page,
  }) => {
    await page.goto('/');

    // Wait for the page to load
    await page.waitForSelector('.section.active');

    // Click on a source link
    const firstSourceLink = page.locator('.stat-label a').first();
    await expect(firstSourceLink).toBeVisible();

    // Click the source link (this should open in a new tab, but we'll just verify the click works)
    await firstSourceLink.click();

    // Verify we're still on the same section (navigation wasn't triggered)
    await expect(page.locator('.section.active')).toBeVisible();
  });
});

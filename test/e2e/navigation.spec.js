/**
 * E2E Tests - Navigation and Core Functionality
 * Tests user workflows and prevents regressions
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

test.describe('Navigation Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for app to initialize
    await page.waitForSelector('#app', { state: 'visible' });
    await page.waitForTimeout(2000); // Wait for initialization delay
  });

  test('should load the application correctly', async ({ page }) => {
    // Check that main elements are present
    await expect(page.locator('#app')).toBeVisible();
    await expect(
      page.locator('header img[alt="The Freshwater Trust"]')
    ).toBeVisible();
    await expect(page.locator('main')).toBeVisible();

    // Check that sections are present
    await expect(page.locator('#intro')).toBeVisible();
    await expect(page.locator('#map')).toBeVisible();
    await expect(page.locator('#results')).toBeVisible();
  });

  test('should navigate between sections using scroll', async ({ page }) => {
    // Start at intro section
    await expect(page.locator('#intro')).toBeVisible();

    // Scroll down to navigate forward
    await scrollDown(page, 500);
    await page.waitForTimeout(1000);

    // Should now be at map section
    await expect(page.locator('#map')).toBeVisible();

    // Scroll down again
    await scrollDown(page, 500);
    await page.waitForTimeout(1000);

    // Should now be at results section
    await expect(page.locator('#results')).toBeVisible();
  });

  test('should navigate using keyboard arrows', async ({ page }) => {
    // Start at intro
    await expect(page.locator('#intro')).toBeVisible();

    // Press arrow down
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(1000);

    // Should navigate to next section
    await expect(page.locator('#map')).toBeVisible();

    // Press arrow up
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(1000);

    // Should navigate back
    await expect(page.locator('#intro')).toBeVisible();
  });

  test('should navigate using section navigation dots', async ({ page }) => {
    // Wait for navigation dots to appear
    await page.waitForSelector('.pagination-section .pagination-dot');

    const navDots = page.locator('.pagination-section .pagination-dot');
    await expect(navDots).toHaveCount(3);

    // Click on the second navigation dot (map section)
    await navDots.nth(1).click();
    await page.waitForTimeout(1000);

    // Should be at map section
    await expect(page.locator('#map')).toBeVisible();

    // Click on third dot (results section)
    await navDots.nth(2).click();
    await page.waitForTimeout(1000);

    // Should be at results section
    await expect(page.locator('#results')).toBeVisible();
  });

  test('should navigate panels within map section', async ({ page }) => {
    // Navigate to map section first
    const navDots = page.locator('.pagination-section .pagination-dot');
    await navDots.nth(1).click();
    await page.waitForTimeout(1000);

    // Check that panel pagination appears
    await expect(page.locator('.pagination-panel')).toBeVisible();

    const panelDots = page.locator('.pagination-panel .pagination-dot');
    await expect(panelDots.first()).toBeVisible();

    // Navigate through panels using scroll
    await scrollDown(page, 300);
    await page.waitForTimeout(500);

    // Should show different panel content
    const panels = page.locator('#map .panel');
    await expect(panels.first()).toBeVisible();
  });
});

test.describe('Donut Chart Animations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#app', { state: 'visible' });
    await page.waitForTimeout(2000);
  });

  test('should display donut charts in intro section', async ({ page }) => {
    // Check that donut charts are present
    await expect(page.locator('.stat-donut-chart')).toHaveCount(2);

    // Check that circles have proper attributes
    const circles = page.locator('.stat-donut-chart .circle');
    await expect(circles.first()).toHaveAttribute('data-target-value', '51');
    await expect(circles.nth(1)).toHaveAttribute('data-target-value', '38');
  });

  test('should animate donut charts on page load', async ({ page }) => {
    // Wait for animations to complete
    await page.waitForTimeout(3000);

    // Check that circles have been animated (stroke-dasharray should not be 0,100)
    const circles = page.locator('.stat-donut-chart .circle');

    // First circle should be animated to its target value
    const firstCircle = circles.first();
    const strokeDashArray = await firstCircle.getAttribute('stroke-dasharray');
    expect(strokeDashArray).not.toBe('0, 100');
  });

  test('should display correct stat values', async ({ page }) => {
    const statValues = page.locator('.stat-value');

    // Wait for animations to complete
    await page.waitForTimeout(3000);

    // Check stat values
    await expect(statValues.nth(0)).toHaveText('>51%');
    await expect(statValues.nth(1)).toHaveText('#1');
    await expect(statValues.nth(2)).toHaveText('38%');
  });

  test('should reset and animate donut charts when returning to section', async ({
    page,
  }) => {
    // Navigate away from intro section
    await scrollDown(page, 500);
    await page.waitForTimeout(1000);

    // Navigate back to intro section
    await scrollUp(page, 500);
    await page.waitForTimeout(1000);

    // Donut charts should be reset and animate again
    await page.waitForTimeout(2000);

    const circles = page.locator('.stat-donut-chart .circle');
    const strokeDashArray = await circles
      .first()
      .getAttribute('stroke-dasharray');
    expect(strokeDashArray).not.toBe('0, 100');
  });
});

test.describe('Responsive Design', () => {
  test('should work on mobile devices', async ({ page, browserName }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Check that app is responsive
    await expect(page.locator('#app')).toBeVisible();
    await expect(
      page.locator('header img[alt="The Freshwater Trust"]')
    ).toBeVisible();

    // Only test touch on actual mobile browsers
    if (browserName === 'webkit' && page.context()._options.isMobile) {
      // Test touch navigation on actual mobile
      await page.touchscreen.tap(200, 400);
      await page.waitForTimeout(500);
    } else {
      // For desktop browsers in mobile viewport, test with click/scroll
      await scrollDown(page, 300);
      await page.waitForTimeout(500);
    }

    // Test that navigation dots are accessible in mobile view
    await expect(page.locator('.pagination-dot').first()).toBeVisible();
  });

  test('should maintain navigation functionality on tablet', async ({
    page,
  }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Test navigation
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(1000);

    await expect(page.locator('#map')).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  test('should have proper ARIA labels and roles', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Check main content has proper roles
    await expect(page.locator('main')).toHaveAttribute('role', 'main');
    await expect(page.locator('nav')).toHaveAttribute('role', 'navigation');

    // Check that headings are properly structured
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Tab through interactive elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Arrow keys should work for navigation
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(1000);

    await expect(page.locator('#map')).toBeVisible();
  });

  test('should have proper focus management', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Navigate to navigation dots
    const navDots = page.locator('.pagination-section .pagination-dot');
    await navDots.first().focus();

    // Should be focusable
    await expect(navDots.first()).toBeFocused();

    // Press Enter to activate
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);

    // Should maintain focus management
    await expect(page.locator('#intro')).toBeVisible();
  });
});

test.describe('Performance and Error Handling', () => {
  test('should handle rapid navigation gracefully', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Rapid scroll events
    for (let i = 0; i < 10; i++) {
      await scrollDown(page, 100);
      await page.waitForTimeout(50);
    }

    // Should not break or cause errors
    await expect(page.locator('#app')).toBeVisible();
  });

  test('should not have console errors', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForTimeout(3000);

    // Navigate through all sections
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(1000);
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(1000);

    // Should have no console errors
    expect(consoleErrors).toHaveLength(0);
  });

  test('should handle missing images gracefully', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Navigate to map section which has images
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(1000);

    // Even if some images fail to load, app should work
    await expect(page.locator('#map')).toBeVisible();
  });
});

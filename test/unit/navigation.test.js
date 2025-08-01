import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the AnimationController before importing anything else
vi.mock('../../src/scripts/animations.js', () => ({
  AnimationController: {
    animateToPanel: vi.fn().mockResolvedValue(),
  },
}));

// Import the modules after mocking
import { NavigationController } from '../../src/scripts/navigation.js';
import { appState } from '../../src/scripts/state.js';

describe('NavigationController', () => {
  beforeEach(() => {
    // Set up DOM structure
    document.body.innerHTML = `
      <div class="section" data-section="0">
        <div class="panel" data-panel="0"></div>
        <div class="panel" data-panel="1"></div>
        <div class="panel" data-panel="2"></div>
      </div>
      <div class="section" data-section="1">
        <div class="panel" data-panel="0"></div>
        <div class="panel" data-panel="1"></div>
      </div>
    `;

    // Initialize appState
    appState.initDOM();

    // Reset appState to known values
    appState.currentSection = 0;
    appState.currentPanel = 1; // Start at panel 1 so we can navigate forward
    appState.isAnimating = false;
    appState.lastNavigationTime = 0; // Allow navigation

    // Clear all mocks
    vi.clearAllMocks();
  });

  describe('canNavigate', () => {
    it('should allow navigation when not animating', () => {
      appState.isAnimating = false;
      appState.lastNavigationTime = 0;

      expect(appState.canNavigate()).toBe(true);
    });

    it('should prevent navigation when animating and within block time', () => {
      appState.isAnimating = true;
      appState.animationStartTime = Date.now(); // Set recent animation start

      expect(appState.canNavigate()).toBe(false);
    });
  });

  describe('navigate', () => {
    it('should navigate forward by one step', async () => {
      const { AnimationController } = await import('../../src/scripts/animations.js');

      appState.currentSection = 0;
      appState.currentPanel = 1;

      NavigationController.navigate(1);

      expect(AnimationController.animateToPanel).toHaveBeenCalledWith(0, 2, 1);
    });

    it('should navigate even when animating (navigate bypasses canNavigate check)', async () => {
      const { AnimationController } = await import('../../src/scripts/animations.js');

      appState.isAnimating = true; // navigate() bypasses this check
      appState.animationStartTime = Date.now();

      NavigationController.navigate(1);

      // navigate() does not check canNavigate, only throttledNavigate does
      expect(AnimationController.animateToPanel).toHaveBeenCalled();
    });
  });

  describe('throttledNavigate', () => {
    it('should call navigate when not throttled', () => {
      const navigateSpy = vi.spyOn(NavigationController, 'navigate');

      NavigationController.throttledNavigate(1);

      expect(navigateSpy).toHaveBeenCalledWith(1);
    });

    it('should not call navigate when throttled (animating)', () => {
      const navigateSpy = vi.spyOn(NavigationController, 'navigate');

      appState.isAnimating = true;
      appState.animationStartTime = Date.now();

      NavigationController.throttledNavigate(1);

      expect(navigateSpy).not.toHaveBeenCalled();
    });
  });

  describe('goToSection', () => {
    it('should navigate to specific section', async () => {
      const { AnimationController } = await import('../../src/scripts/animations.js');

      appState.currentSection = 0;

      NavigationController.goToSection(1);

      expect(AnimationController.animateToPanel).toHaveBeenCalledWith(1, 0, 1);
    });

    it('should not navigate to same section', async () => {
      const { AnimationController } = await import('../../src/scripts/animations.js');

      appState.currentSection = 0;

      NavigationController.goToSection(0);

      expect(AnimationController.animateToPanel).not.toHaveBeenCalled();
    });
  });
});

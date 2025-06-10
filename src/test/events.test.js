import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock GSAP Observer at the module level
vi.mock('gsap/Observer', () => ({
  Observer: {
    create: vi.fn(() => ({ kill: vi.fn() })),
  },
}));

// Mock NavigationController
vi.mock('../scripts/navigation.js', () => ({
  NavigationController: {
    navigate: vi.fn(),
    throttledNavigate: vi.fn(),
    goToSection: vi.fn(),
  },
}));

import { ScrollController } from '../scripts/events.js';
import { appState } from '../scripts/state.js';

describe('ScrollController', () => {
  beforeEach(() => {
    // Set up DOM with proper structure that appState expects
    document.body.innerHTML = `
      <div class="pagination-section">
        <div class="pagination-dot" data-type="section" data-section-index="0"></div>
        <div class="pagination-dot" data-type="section" data-section-index="1"></div>
        <div class="pagination-dot" data-type="section" data-section-index="2"></div>
      </div>
      <div class="section" data-section="0"></div>
      <div class="section" data-section="1"></div>
      <div class="section" data-section="2"></div>
    `;

    // Initialize appState with the DOM
    appState.initDOM();

    // Clear all mocks
    vi.clearAllMocks();
  });

  describe('init', () => {
    it('should initialize all event listeners', () => {
      const setupScrollObserverSpy = vi.spyOn(
        ScrollController,
        'setupScrollObserver'
      );
      const setupKeyboardNavigationSpy = vi.spyOn(
        ScrollController,
        'setupKeyboardNavigation'
      );
      const setupNavigationDotsSpy = vi.spyOn(
        ScrollController,
        'setupNavigationDots'
      );

      ScrollController.init();

      expect(setupScrollObserverSpy).toHaveBeenCalled();
      expect(setupKeyboardNavigationSpy).toHaveBeenCalled();
      expect(setupNavigationDotsSpy).toHaveBeenCalled();
    });
  });

  describe('setupScrollObserver', () => {
    it('should create GSAP Observer with correct configuration', async () => {
      const { Observer } = await import('gsap/Observer');

      ScrollController.setupScrollObserver();

      expect(Observer.create).toHaveBeenCalled();

      const config = Observer.create.mock.calls[0][0];
      expect(config).toHaveProperty('type');
      expect(config).toHaveProperty('onDown');
      expect(config).toHaveProperty('onUp');
    });

    it('should call NavigationController on wheel events', async () => {
      const { Observer } = await import('gsap/Observer');
      const { NavigationController } = await import('../scripts/navigation.js');

      ScrollController.setupScrollObserver();

      const config = Observer.create.mock.calls[0][0];

      // Test wheel down (forward navigation) - onDown should navigate backward (-1)
      if (config.onDown) {
        config.onDown();
        expect(NavigationController.throttledNavigate).toHaveBeenCalledWith(-1);
      }

      // Test wheel up (backward navigation) - onUp should navigate forward (1)
      if (config.onUp) {
        config.onUp();
        expect(NavigationController.throttledNavigate).toHaveBeenCalledWith(1);
      }
    });
  });

  describe('setupKeyboardNavigation', () => {
    it('should navigate on arrow key presses', async () => {
      const { NavigationController } = await import('../scripts/navigation.js');

      ScrollController.setupKeyboardNavigation();

      // Test arrow down - should call throttledNavigate, not navigate
      const downEvent = new window.KeyboardEvent('keydown', {
        key: 'ArrowDown',
      });
      document.dispatchEvent(downEvent);
      expect(NavigationController.throttledNavigate).toHaveBeenCalledWith(1);

      // Test arrow up - should call throttledNavigate, not navigate
      const upEvent = new window.KeyboardEvent('keydown', { key: 'ArrowUp' });
      document.dispatchEvent(upEvent);
      expect(NavigationController.throttledNavigate).toHaveBeenCalledWith(-1);
    });

    it('should not navigate on other key presses', async () => {
      const { NavigationController } = await import('../scripts/navigation.js');

      ScrollController.setupKeyboardNavigation();

      const event = new window.KeyboardEvent('keydown', { key: 'Space' });
      document.dispatchEvent(event);

      expect(NavigationController.throttledNavigate).not.toHaveBeenCalled();
    });
  });

  describe('setupNavigationDots', () => {
    it('should handle navigation dot clicks', async () => {
      const { NavigationController } = await import('../scripts/navigation.js');

      ScrollController.setupNavigationDots();

      const navDot = document.querySelector('[data-section-index="1"]');
      navDot.click();

      expect(NavigationController.goToSection).toHaveBeenCalledWith(1);
    });
  });

  describe('isInteractiveElement', () => {
    it('should identify interactive elements', () => {
      const button = document.createElement('button');
      const div = document.createElement('div');
      const input = document.createElement('input');
      const link = document.createElement('a');
      link.href = '#';

      expect(ScrollController.isInteractiveElement(button)).toBe(true);
      expect(ScrollController.isInteractiveElement(input)).toBe(true);
      expect(ScrollController.isInteractiveElement(link)).toBe(true);
      expect(ScrollController.isInteractiveElement(div)).toBe(false);
    });
  });
});

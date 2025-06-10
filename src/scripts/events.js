/**
 * ScrollController
 *
 * Handles scroll-based navigation events including:
 * - Mouse wheel scrolling for section/panel navigation
 * - Touch gestures for mobile navigation
 * - Keyboard arrow key navigation
 * - Navigation dot click handling
 *
 * Coordinates with NavigationController to provide smooth navigation experience
 */
import { Observer } from 'gsap/Observer';
import { CONFIG } from './constants.js';
import { appState } from './state.js';
import { NavigationController } from './navigation.js';

export class ScrollController {
  // Initialize all scroll and input event listeners
  static init() {
    this.setupScrollObserver();
    this.setupNavigationDots();
    this.setupKeyboardNavigation();
  }

  // Setup GSAP Observer for scroll/swipe detection
  static setupScrollObserver() {
    // Only wheel navigation - completely avoid pointer/touch to prevent interference
    Observer.create({
      target: window,
      type: 'wheel',
      wheelSpeed: CONFIG.OBSERVER.WHEEL_SPEED,
      onDown: () => NavigationController.throttledNavigate(-1), // Wheel up/backward = navigate backward
      onUp: () => NavigationController.throttledNavigate(1), // Wheel down/forward = navigate forward
      tolerance: CONFIG.OBSERVER.TOLERANCE,
      preventDefault: CONFIG.OBSERVER.PREVENT_DEFAULT_SCROLL,
    });

    // Simple touch navigation for mobile - very conservative
    let startY = 0;
    let isTouch = false;

    document.addEventListener(
      'touchstart',
      (e) => {
        // Only handle single finger touches on non-interactive elements
        if (e.touches.length === 1 && !this.isInteractiveElement(e.target)) {
          startY = e.touches[0].clientY;
          isTouch = true;
        }
      },
      { passive: true }
    );

    document.addEventListener(
      'touchend',
      (e) => {
        if (isTouch && e.changedTouches.length === 1) {
          const endY = e.changedTouches[0].clientY;
          const deltaY = startY - endY;

          // Require significant swipe distance
          if (Math.abs(deltaY) > 50) {
            if (deltaY > 0) {
              NavigationController.throttledNavigate(1); // Swipe up = next
            } else {
              NavigationController.throttledNavigate(-1); // Swipe down = prev
            }
          }
        }
        isTouch = false;
      },
      { passive: true }
    );
  }

  // Check if element is interactive and should not trigger navigation
  static isInteractiveElement(element) {
    const interactiveSelectors = [
      'a[href]',
      'button',
      'input',
      'textarea',
      'select',
      '.stat',
      '.pagination-dot',
    ];

    return interactiveSelectors.some((selector) => {
      return (
        element.matches &&
        (element.matches(selector) || element.closest(selector))
      );
    });
  }

  // Setup navigation dots click handlers
  static setupNavigationDots() {
    const navDots = appState.getNavDots();

    navDots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        NavigationController.goToSection(index);
      });
    });
  }

  // Setup keyboard navigation
  static setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          NavigationController.throttledNavigate(1);
          e.preventDefault();
          break;
        case 'ArrowUp':
        case 'ArrowLeft':
          NavigationController.throttledNavigate(-1);
          e.preventDefault();
          break;
      }
    });
  }
}

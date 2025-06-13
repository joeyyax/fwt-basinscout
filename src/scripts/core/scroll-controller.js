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
import { CONFIG } from '../constants.js';
import { appState } from '../state.js';
import { NavigationController } from '../navigation.js';

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

    // Improved touch navigation for mobile - more responsive and less intrusive
    let startY = 0;
    let startX = 0;
    let isTouch = false;
    let hasMoved = false;
    let touchElement = null;

    document.addEventListener(
      'touchstart',
      (e) => {
        // Only handle single finger touches on non-interactive elements
        if (e.touches.length === 1 && !this.isInteractiveElement(e.target)) {
          startY = e.touches[0].clientY;
          startX = e.touches[0].clientX;
          isTouch = true;
          hasMoved = false;
          touchElement = e.target;
        }
      },
      { passive: true } // Keep passive for better performance
    );

    document.addEventListener(
      'touchmove',
      (e) => {
        if (isTouch && e.touches.length === 1) {
          const currentY = e.touches[0].clientY;
          const currentX = e.touches[0].clientX;
          const deltaY = Math.abs(startY - currentY);
          const deltaX = Math.abs(startX - currentX);

          // Lower movement threshold for more responsive detection
          if (deltaY > 5 || deltaX > 5) {
            hasMoved = true;
          }
        }
      },
      { passive: true } // Keep passive to allow native scrolling
    );

    document.addEventListener(
      'touchend',
      (e) => {
        if (isTouch && e.changedTouches.length === 1 && hasMoved) {
          const endY = e.changedTouches[0].clientY;
          const endX = e.changedTouches[0].clientX;
          const deltaY = startY - endY;
          const deltaX = Math.abs(startX - endX);

          // More responsive thresholds for mobile
          const isGoodArea = this.isGoodNavigationArea(touchElement);
          const threshold = isGoodArea ? 25 : 35; // Lowered thresholds for better responsiveness
          const maxHorizontalMovement = 120; // More forgiving horizontal movement

          // More lenient gesture detection for better mobile UX
          if (
            Math.abs(deltaY) > threshold &&
            deltaX < maxHorizontalMovement &&
            Math.abs(deltaY) > deltaX * 1.2 // Reduced ratio requirement
          ) {
            if (deltaY > 0) {
              NavigationController.throttledNavigate(1); // Swipe up = next
            } else {
              NavigationController.throttledNavigate(-1); // Swipe down = prev
            }
          }
        }
        isTouch = false;
        hasMoved = false;
        touchElement = null;
      },
      { passive: true }
    );
  }

  // Check if element is interactive and should not trigger navigation
  static isInteractiveElement(element) {
    if (!element || !element.matches) return false;

    const interactiveSelectors = [
      'a[href]',
      'button',
      'input',
      'textarea',
      'select',
      '.pagination-dot',
      '.media-stats', // Media stats area
      '.media-stack', // Media area
    ];

    // Check if the element itself or any parent matches interactive selectors
    return interactiveSelectors.some((selector) => {
      return element.matches(selector) || element.closest(selector);
    });
  }

  // Check if the touch area is good for navigation (large prose areas)
  static isGoodNavigationArea(element) {
    if (!element || !element.matches) return true;

    const goodNavigationSelectors = [
      '.prose',
      '.content-wrapper',
      '.panel',
      '.container',
    ];

    // If touching a good navigation area, be more responsive
    return goodNavigationSelectors.some((selector) => {
      return element.matches(selector) || element.closest(selector);
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

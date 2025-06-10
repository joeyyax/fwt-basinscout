/**
 * Height Matcher Utility
 * Provides functionality to match element heights based on data attributes
 */

import { log, EVENTS } from './logger.js';

export class HeightMatcher {
  /**
   * Initialize height matching for all elements with data-match-height attribute
   */
  static init() {
    this.setupHeightMatching();
    this.setupResizeObserver();
  }

  /**
   * Set up height matching for elements with data-match-height attribute
   */
  static setupHeightMatching() {
    const elementsToMatch = document.querySelectorAll('[data-match-height]');

    elementsToMatch.forEach((element) => {
      const targetSelector = element.getAttribute('data-match-height');
      if (targetSelector) {
        this.matchElementHeight(element, targetSelector);
      }
    });
  }

  /**
   * Match an element's height to a target element
   * @param {HTMLElement} element - Element to resize
   * @param {string} targetSelector - CSS selector for target element
   */
  static matchElementHeight(element, targetSelector) {
    const targetElement = document.querySelector(targetSelector);

    if (!targetElement) {
      log.debug(EVENTS.LAYOUT, 'Height match target not found', {
        targetSelector,
        element: element.className,
      });
      return;
    }

    // Use ResizeObserver if available, otherwise fall back to manual checking
    if (typeof window !== 'undefined' && window.ResizeObserver) {
      this.observeElementHeight(element, targetElement);
    } else {
      this.setElementHeight(element, targetElement);
    }
  }

  /**
   * Set element height to match target element
   * @param {HTMLElement} element - Element to resize
   * @param {HTMLElement} targetElement - Target element to match
   */
  static setElementHeight(element, targetElement) {
    // Wait for next frame to ensure target element is rendered
    requestAnimationFrame(() => {
      const targetHeight = targetElement.offsetHeight;

      if (targetHeight > 0) {
        element.style.height = `${targetHeight}px`;

        log.info(EVENTS.LAYOUT, 'Element height matched', {
          element: element.className,
          target: targetElement.className,
          height: targetHeight,
        });
      } else {
        log.debug(EVENTS.LAYOUT, 'Target element has no height yet', {
          element: element.className,
          target: targetElement.className,
        });
      }
    });
  }

  /**
   * Use ResizeObserver to dynamically update height matching
   * @param {HTMLElement} element - Element to resize
   * @param {HTMLElement} targetElement - Target element to observe
   */
  static observeElementHeight(element, targetElement) {
    const updateHeight = () => {
      this.setElementHeight(element, targetElement);
    };

    // Initial height set
    updateHeight();

    // Create ResizeObserver to watch target element if available
    if (typeof window !== 'undefined' && window.ResizeObserver) {
      const resizeObserver = new window.ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.target === targetElement) {
            updateHeight();
          }
        }
      });

      // Start observing target element
      resizeObserver.observe(targetElement);

      // Store observer reference for cleanup if needed
      element._heightObserver = resizeObserver;
    }
  }

  /**
   * Set up ResizeObserver to handle window resize and dynamic content changes
   */
  static setupResizeObserver() {
    // Throttled resize handler for fallback
    let resizeTimeout;

    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.setupHeightMatching();
      }, 250);
    });
  }

  /**
   * Refresh height matching (useful after dynamic content changes)
   */
  static refresh() {
    this.setupHeightMatching();
  }

  /**
   * Clean up observers for a specific element
   * @param {HTMLElement} element - Element to clean up
   */
  static cleanup(element) {
    if (element._heightObserver) {
      element._heightObserver.disconnect();
      delete element._heightObserver;
    }
  }
}

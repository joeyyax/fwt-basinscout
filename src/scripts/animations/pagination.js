/**
 * Pagination Animation Controller
 * Handles stagger animations for pagination dots when they appear
 */

import { CONFIG } from '../constants.js';
import { gsap } from 'gsap';
import { log, EVENTS } from '../utils/logger.js';
import { ErrorHandler } from '../utils/error-handler.js';

export class PaginationAnimationController {
  /**
   * Animate pagination dots in with stagger effect
   * @param {HTMLElement} container - The pagination container
   * @param {number} delay - Optional delay before starting animation
   * @returns {gsap.Timeline} - Animation timeline
   */
  static animateDotsIn(container, delay = 0) {
    try {
      if (!container) return null;

      const dots = container.querySelectorAll('.pagination-dot');
      if (dots.length === 0) return null;

      const timeline = gsap.timeline({ delay });

      // Set initial state for dots
      gsap.set(dots, {
        opacity: 0,
        scale: 0.8,
        y: 10,
      });

      // Animate dots in with stagger
      timeline.to(dots, {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: CONFIG.ANIMATION.PAGINATION_DOT_ENTER_DURATION,
        ease: 'back.out(1.7)',
        stagger: CONFIG.ANIMATION.PAGINATION_DOT_STAGGER_DELAY,
      });

      log.debug(EVENTS.ANIMATION, 'Pagination dots animated in', {
        dotCount: dots.length,
        delay,
      });

      return timeline;
    } catch (error) {
      ErrorHandler.handleError(error, 'Failed to animate pagination dots in');
      return null;
    }
  }

  /**
   * Animate pagination dots out with quick stagger
   * @param {HTMLElement} container - The pagination container
   * @param {number} delay - Optional delay before starting animation
   * @returns {gsap.Timeline} - Animation timeline
   */
  static animateDotsOut(container, delay = 0) {
    try {
      if (!container) return null;

      const dots = container.querySelectorAll('.pagination-dot');
      if (dots.length === 0) return null;

      const timeline = gsap.timeline({ delay });

      // Animate dots out quickly
      timeline.to(dots, {
        opacity: 0,
        scale: 0.8,
        y: -5,
        duration: CONFIG.ANIMATION.PAGINATION_DOT_ENTER_DURATION * 0.6,
        ease: 'power2.in',
        stagger: CONFIG.ANIMATION.PAGINATION_DOT_STAGGER_DELAY * 0.5, // Faster exit stagger
      });

      log.debug(EVENTS.ANIMATION, 'Pagination dots animated out', {
        dotCount: dots.length,
        delay,
      });

      return timeline;
    } catch (error) {
      ErrorHandler.handleError(error, 'Failed to animate pagination dots out');
      return null;
    }
  }

  /**
   * Initialize pagination dots to hidden state for animation
   * @param {HTMLElement} container - The pagination container
   */
  static initializeDotsForAnimation(container) {
    try {
      if (!container) return;

      const dots = container.querySelectorAll('.pagination-dot');
      if (dots.length === 0) return;

      // Set initial hidden state
      gsap.set(dots, {
        opacity: 0,
        scale: 0.8,
        y: 10,
      });

      log.debug(EVENTS.ANIMATION, 'Pagination dots initialized for animation', {
        dotCount: dots.length,
      });
    } catch (error) {
      ErrorHandler.handleError(
        error,
        'Failed to initialize pagination dots for animation'
      );
    }
  }

  /**
   * Reset pagination dots to visible state (no animation)
   * @param {HTMLElement} container - The pagination container
   */
  static resetDotsToVisible(container) {
    try {
      if (!container) return;

      const dots = container.querySelectorAll('.pagination-dot');
      if (dots.length === 0) return;

      // Reset to visible state
      gsap.set(dots, {
        opacity: 1,
        scale: 1,
        y: 0,
      });

      log.debug(EVENTS.ANIMATION, 'Pagination dots reset to visible', {
        dotCount: dots.length,
      });
    } catch (error) {
      ErrorHandler.handleError(
        error,
        'Failed to reset pagination dots to visible'
      );
    }
  }

  /**
   * Animate pagination container becoming visible with dots stagger
   * @param {HTMLElement} container - The pagination container
   * @param {number} delay - Optional delay before starting animation
   * @returns {gsap.Timeline} - Animation timeline
   */
  static animateContainerIn(container, delay = 0) {
    try {
      if (!container) return null;

      const timeline = gsap.timeline({ delay });

      // First make container visible
      timeline.set(container, {
        display: 'flex',
        opacity: 1,
      });

      // Then animate dots in with stagger
      const dotsTimeline = this.animateDotsIn(container, 0);
      if (dotsTimeline) {
        timeline.add(dotsTimeline, 0);
      }

      log.debug(EVENTS.ANIMATION, 'Pagination container animated in', {
        hasContainer: !!container,
        delay,
      });

      return timeline;
    } catch (error) {
      ErrorHandler.handleError(
        error,
        'Failed to animate pagination container in'
      );
      return null;
    }
  }

  /**
   * Animate pagination container becoming hidden
   * @param {HTMLElement} container - The pagination container
   * @param {number} delay - Optional delay before starting animation
   * @returns {gsap.Timeline} - Animation timeline
   */
  static animateContainerOut(container, delay = 0) {
    try {
      if (!container) return null;

      const timeline = gsap.timeline({ delay });

      // Animate dots out first
      const dotsTimeline = this.animateDotsOut(container, 0);
      if (dotsTimeline) {
        timeline.add(dotsTimeline, 0);
      }

      // Then hide container
      timeline.set(
        container,
        {
          display: 'none',
          opacity: 0,
        },
        `+=${CONFIG.ANIMATION.PAGINATION_DOT_ENTER_DURATION * 0.6}`
      );

      log.debug(EVENTS.ANIMATION, 'Pagination container animated out', {
        hasContainer: !!container,
        delay,
      });

      return timeline;
    } catch (error) {
      ErrorHandler.handleError(
        error,
        'Failed to animate pagination container out'
      );
      return null;
    }
  }
}

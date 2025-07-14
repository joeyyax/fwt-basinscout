/**
 * Scroll Instruction Bubble
 * Creates an independent floating scroll instruction that appears at the bottom of the screen
 * Completely separate from panel animations for proper timing control
 */

import { CONFIG } from '../constants.js';
import { NavigationController } from '../navigation.js';
import { log, EVENTS } from './logger.js';

export class ScrollInstruction {
  static instructionElement = null;
  static showTimeout = null;
  static hideTimeout = null;
  static inactivityTimeout = null;
  static isVisible = false;
  static isPermanentlyDismissed = false;
  static lastActivityTime = 0;

  /**
   * Initialize the scroll instruction system
   */
  static initialize() {
    try {
      this.createInstruction();
      this.scheduleInitialDisplay();

      log.debug(EVENTS.UI, 'Scroll instruction initialized');
    } catch (error) {
      log.error(EVENTS.UI, 'Failed to initialize scroll instruction', {
        error,
      });
    }
  }

  /**
   * Create the scroll instruction element
   */
  static createInstruction() {
    // Remove existing instruction if it exists
    if (this.instructionElement) {
      this.instructionElement.remove();
    }

    // Create instruction container
    this.instructionElement = document.createElement('div');
    this.instructionElement.className = 'scroll-instruction';
    this.instructionElement.innerHTML = `
      <div class="scroll-instruction-content">
        <div class="scroll-instruction-arrow">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
          </svg>
        </div>
        <span class="scroll-instruction-text">Scroll to explore</span>
      </div>
    `;

    // Append to body
    document.body.appendChild(this.instructionElement);

    // Hide on mouse over and user interactions
    this.setupHideOnInteraction();

    log.debug(EVENTS.UI, 'Scroll instruction created');
  }

  /**
   * Schedule the initial display of the instruction
   */
  static scheduleInitialDisplay() {
    // Clear any existing timeouts
    this.clearTimeouts();

    // Show instruction after the configured delay
    this.showTimeout = setTimeout(() => {
      this.showInstruction();
    }, CONFIG.ANIMATION.SCROLL_INSTRUCTION_FIRST_PANEL_DELAY * 1000);

    log.debug(EVENTS.UI, 'Scroll instruction scheduled for display', {
      delay: CONFIG.ANIMATION.SCROLL_INSTRUCTION_FIRST_PANEL_DELAY,
    });
  }

  /**
   * Schedule the instruction to reappear after panel transition
   * This is called when a new panel becomes active to restart the inactivity timer
   */
  static scheduleInactivityDisplay() {
    // Don't schedule if permanently dismissed or inactivity timeout is disabled
    if (
      this.isPermanentlyDismissed ||
      CONFIG.ANIMATION.SCROLL_INSTRUCTION_INACTIVITY_TIMEOUT <= 0
    ) {
      return;
    }

    // Clear any existing inactivity timeout
    if (this.inactivityTimeout) {
      clearTimeout(this.inactivityTimeout);
      this.inactivityTimeout = null;
    }

    // Update last activity time
    this.lastActivityTime = Date.now();

    // Schedule reappearance after inactivity timeout
    this.inactivityTimeout = setTimeout(() => {
      // Only show if still inactive and not permanently dismissed
      if (!this.isPermanentlyDismissed && !this.isVisible) {
        this.showInstruction();
      }
    }, CONFIG.ANIMATION.SCROLL_INSTRUCTION_INACTIVITY_TIMEOUT * 1000);

    log.debug(EVENTS.UI, 'Scroll instruction inactivity timer started', {
      timeout: CONFIG.ANIMATION.SCROLL_INSTRUCTION_INACTIVITY_TIMEOUT,
    });
  }

  /**
   * Reset the inactivity timer when user interacts
   */
  static resetInactivityTimer() {
    this.lastActivityTime = Date.now();

    // Restart the inactivity timer if not permanently dismissed
    if (!this.isPermanentlyDismissed) {
      this.scheduleInactivityDisplay();
    }
  }

  /**
   * Show the scroll instruction with CSS transition
   */
  static showInstruction() {
    if (
      !this.instructionElement ||
      this.isVisible ||
      this.isPermanentlyDismissed
    )
      return;

    this.isVisible = true;
    this.instructionElement.classList.add('visible');

    this.scheduleAutoHide();
    log.debug(EVENTS.UI, 'Scroll instruction shown');
  }

  /**
   * Schedule auto-hide timeout if configured
   */
  static scheduleAutoHide() {
    if (CONFIG.ANIMATION.SCROLL_INSTRUCTION_AUTO_HIDE_TIMEOUT > 0) {
      this.hideTimeout = setTimeout(() => {
        this.hideInstruction();
      }, CONFIG.ANIMATION.SCROLL_INSTRUCTION_AUTO_HIDE_TIMEOUT * 1000);
    }
  }

  /**
   * Hide the scroll instruction with CSS transition
   */
  static hideInstruction() {
    if (!this.instructionElement || !this.isVisible) return;

    this.isVisible = false;
    this.instructionElement.classList.remove('visible');

    this.clearTimeouts();

    log.debug(EVENTS.UI, 'Scroll instruction hidden');
  }

  /**
   * Permanently dismiss the instruction (for general interactions)
   */
  static dismissInstruction() {
    if (!this.instructionElement) return;

    this.isPermanentlyDismissed = true;
    this.isVisible = false;
    this.instructionElement.classList.remove('visible');

    this.clearTimeouts();

    log.debug(EVENTS.UI, 'Scroll instruction permanently dismissed');
  }

  /**
   * Dismiss the instruction when panel changes occur
   * This provides a softer dismissal for panel changes vs user interactions
   * Also starts the inactivity timer for potential reappearance
   */
  static dismissOnPanelChange() {
    if (!this.instructionElement) return;

    // Hide if currently visible
    if (this.isVisible) {
      this.hideInstruction();
    }

    // Start inactivity timer for potential reappearance
    this.scheduleInactivityDisplay();

    log.debug(
      EVENTS.UI,
      'Scroll instruction dismissed due to panel change, inactivity timer started'
    );
  }

  /**
   * Set up event listeners to hide instruction on user interaction
   */
  static setupHideOnInteraction() {
    const hideOnInteraction = () => {
      this.hideInstruction();
      this.resetInactivityTimer(); // Restart inactivity timer after user interaction

      // Remove listeners after first interaction
      document.removeEventListener('wheel', hideOnInteraction);
      document.removeEventListener('touchstart', hideOnInteraction);
      document.removeEventListener('keydown', hideOnInteraction);
    };

    // Hide on scroll, touch, or keyboard interaction
    document.addEventListener('wheel', hideOnInteraction, { passive: true });
    document.addEventListener('touchstart', hideOnInteraction, {
      passive: true,
    });
    document.addEventListener('keydown', hideOnInteraction);

    // Make the instruction clickable - always navigate to next panel/section
    this.instructionElement.addEventListener('click', () => {
      log.debug(EVENTS.UI, 'Scroll instruction clicked - navigating forward');
      NavigationController.navigateForward();
      this.hideInstruction();
      this.resetInactivityTimer();
    });

    // Handle touch events on the instruction
    this.instructionElement.addEventListener(
      'touchstart',
      (e) => {
        e.preventDefault(); // Prevent scroll on touch
        log.debug(EVENTS.UI, 'Scroll instruction touched - navigating forward');
        NavigationController.navigateForward();
        this.hideInstruction();
        this.resetInactivityTimer();
      },
      { passive: false }
    );
  }

  /**
   * Clear all timeouts
   */
  static clearTimeouts() {
    if (this.showTimeout) {
      clearTimeout(this.showTimeout);
      this.showTimeout = null;
    }
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
    if (this.inactivityTimeout) {
      clearTimeout(this.inactivityTimeout);
      this.inactivityTimeout = null;
    }
  }

  /**
   * Cleanup the instruction system
   */
  static cleanup() {
    this.clearTimeouts();
    if (this.instructionElement) {
      this.instructionElement.remove();
      this.instructionElement = null;
    }
    this.isVisible = false;
    this.isPermanentlyDismissed = false;
    this.lastActivityTime = 0;

    log.debug(EVENTS.UI, 'Scroll instruction cleaned up');
  }
}

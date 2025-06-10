/**
 * Scroll Instructions Utility
 * Handles the injection of scroll instructions into the first panel
 */

import { log, EVENTS } from './logger.js';

export class ScrollInstructions {
  /**
   * Initialize scroll instructions by finding the first panel and injecting the template
   */
  static initialize() {
    try {
      // Find the first panel in the first section
      const firstPanel = this.getFirstPanel();
      if (!firstPanel) {
        log.warn(EVENTS.UI, 'No first panel found for scroll instructions');
        return;
      }

      // Inject scroll instructions into the first panel
      this.injectScrollInstructions(firstPanel);

      log.debug(EVENTS.UI, 'Scroll instructions initialized successfully');
    } catch (error) {
      log.error(EVENTS.UI, 'Failed to initialize scroll instructions', {
        error,
      });
    }
  }

  /**
   * Find the first panel in the application
   * @returns {HTMLElement|null} The first panel element
   */
  static getFirstPanel() {
    // Look for the first section
    const firstSection = document.querySelector('.section');
    if (!firstSection) return null;

    // Find the first panel within that section
    const firstPanel = firstSection.querySelector('.panel');
    return firstPanel;
  }

  /**
   * Inject scroll instructions from template into the specified panel
   * @param {HTMLElement} panel - The panel to inject scroll instructions into
   */
  static injectScrollInstructions(panel) {
    // Get the scroll instruction template
    const template = document.getElementById('scroll-instruction-template');
    if (!template) {
      log.warn(EVENTS.UI, 'Scroll instruction template not found');
      return;
    }

    // Clone the template content
    const scrollInstruction = template.content.cloneNode(true);

    // Find the prose container within the panel
    const proseContainer = panel.querySelector('.prose');
    if (!proseContainer) {
      log.warn(EVENTS.UI, 'No prose container found in first panel');
      return;
    }

    // Append the scroll instruction to the prose container
    // It will animate with the default prose animation
    proseContainer.appendChild(scrollInstruction);

    log.debug(EVENTS.UI, 'Scroll instructions injected into first panel');
  }
}

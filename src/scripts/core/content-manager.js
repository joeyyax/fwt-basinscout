/**
 * Content Manager
 * Handles content initialization, data attributes, and wrapper management
 */

import { CONFIG } from '../constants.js';
import { appState } from '../state.js';
import { log, EVENTS } from '../utils/logger.js';

export class ContentManager {
  // Dynamically add data-section and data-panel attributes
  static addDataAttributes() {
    const sections = appState.getSections();
    const navDots = appState.getNavDots();

    // Add data-section to sections and validate nav dots
    sections.forEach((section, sectionIndex) => {
      section.setAttribute('data-section', sectionIndex);

      // Add data-panel to panels within each section
      const panels = section.querySelectorAll('.panel');
      panels.forEach((panel, panelIndex) => {
        panel.setAttribute('data-panel', panelIndex);
      });
    });

    // Add data-section to navigation dots
    navDots.forEach((dot, index) => {
      dot.setAttribute('data-section', index);
    });

    // Log structure for debugging - structure logging will be handled separately
    if (CONFIG.DEBUG_MODE) {
      log.debug(EVENTS.APP, 'Data attributes added', {
        sections: sections.length,
        navDots: navDots.length,
      });
    }
  }

  // Initialize content wrappers to prevent FOUC
  static initializeContentWrappers() {
    const contentWrappers = document.querySelectorAll('.content-wrapper');
    contentWrappers.forEach((wrapper) => {
      wrapper.classList.add('initialized');
    });
  }
}

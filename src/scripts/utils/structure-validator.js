/**
 * Structure Validator
 * CMS integration validation, debugging, and structure analysis
 */

import { CONFIG } from '../constants.js';
import { appState } from '../state.js';
import { log, EVENTS } from './logger.js';

export class StructureValidator {
  // Validate structure after pagination is initialized
  static validateAfterPaginationInit() {
    if (CONFIG.DEBUG_MODE) {
      // Refresh nav dots after pagination is created
      appState.refreshNavDots();
      this.validateStructure();
    }
  }

  // Log the detected structure for debugging
  static logStructure() {
    log.debug(EVENTS.APP, 'Structure analysis', {
      totalSections: appState.getTotalSections(),
    });

    const sections = appState.getSections();
    sections.forEach((section, index) => {
      const panels = section.querySelectorAll('.panel');
      const title =
        section.querySelector('.title-wrapper h1')?.textContent || 'Untitled';
      const background = section.dataset.background || 'No background';
      const titleAnimation = section.dataset.titleAnimation || 'fade-up';

      log.debug(EVENTS.APP, `Section ${index} analysis`, {
        title,
        panelCount: panels.length,
        background,
        titleAnimation,
      });
    });

    log.info(EVENTS.APP, 'Architecture confirmed', {
      structure: {
        backgroundContainer: 'Outside app, always visible',
        header: 'Site header (hidden during delay)',
        navigation: 'Section navigation (hidden during delay)',
        main: 'Main content (hidden during delay)',
      },
    });
  }

  // Validate structure for CMS integration
  static validateStructure() {
    const sections = appState.getSections();
    const navDots = appState.getNavDots();
    const issues = [];

    // Check if pagination is disabled globally
    const sectionsContainer = document.getElementById('sections-container');
    const usePagination =
      sectionsContainer?.getAttribute('data-use-pagination') !== 'false';

    // Only check section count vs nav dots if pagination is enabled
    if (usePagination && sections.length !== navDots.length) {
      issues.push(
        `⚠️  Section count (${sections.length}) doesn't match navigation dots (${navDots.length})`
      );
    } else if (!usePagination) {
      log.debug(
        EVENTS.APP,
        'Pagination disabled - skipping navigation dots validation'
      );
    }

    // Check each section
    sections.forEach((section, index) => {
      const title = section.querySelector('.title-wrapper h1');
      const panels = section.querySelectorAll('.panel');
      const background = section.dataset.background;

      if (!title) {
        issues.push(`⚠️  Section ${index}: Missing title element`);
      }
      if (panels.length === 0) {
        issues.push(`⚠️  Section ${index}: No panels found`);
      }
      if (!background) {
        issues.push(`⚠️  Section ${index}: Missing data-background attribute`);
      }

      // Check panels
      panels.forEach((panel, panelIndex) => {
        const prose = panel.querySelector('.prose');
        if (!prose) {
          issues.push(
            `⚠️  Section ${index}, Panel ${panelIndex}: Missing .prose container`
          );
        }
      });
    });

    if (issues.length > 0) {
      log.error(EVENTS.APP, 'Structure validation failed', { issues });
    } else {
      log.info(EVENTS.APP, 'Structure validation passed - no issues found');
    }

    return issues.length === 0;
  }

  // Get validation issues for CMS debugging
  static getValidationIssues() {
    const sections = appState.getSections();
    const navDots = appState.getNavDots();
    const issues = [];

    // Check section count vs nav dots
    if (sections.length !== navDots.length) {
      issues.push(
        `Section count (${sections.length}) doesn't match navigation dots (${navDots.length})`
      );
    }

    // Check each section for missing elements
    sections.forEach((section, index) => {
      const title = section.querySelector('.title-wrapper h1');
      const panels = section.querySelectorAll('.panel');
      const background = section.dataset.background;

      if (!title) issues.push(`Section ${index}: Missing title`);
      if (panels.length === 0) issues.push(`Section ${index}: No panels`);
      if (!background) issues.push(`Section ${index}: Missing background`);
    });

    log.info(EVENTS.DEBUG, 'Validation issues analysis', {
      count: issues.length,
      issues,
    });
    return issues;
  }
}

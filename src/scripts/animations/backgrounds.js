/**
 * Background Controller
 * Handles background image transitions and animations
 * Manages background stacking and section-based visibility
 */

import { gsap } from 'gsap';
import { CONFIG } from '../constants.js';
import { appState } from '../state.js';
import { log, EVENTS } from '../utils/logger.js';

export class BackgroundController {
  // Store background mapping for quick lookups
  static backgroundMap = new Map();
  static currentBackgroundIndex = {};

  /**
   * Initialize background system
   */
  static initializeBackgrounds() {
    const sections = appState.getSections();

    sections.forEach((section, sectionIndex) => {
      this.initializeBackgroundsForSection(section, sectionIndex);
    });

    log.debug(EVENTS.MEDIA, 'Background system initialized', {
      sectionCount: sections.length,
    });
  }

  /**
   * Initialize backgrounds for a specific section
   * @param {HTMLElement} section - Section element
   * @param {number} sectionIndex - Section index
   */
  static initializeBackgroundsForSection(section, sectionIndex) {
    const panels = section.querySelectorAll('.panel[data-bg]');
    const backgrounds = [];

    // Collect background data from panels
    panels.forEach((panel, panelIndex) => {
      const bgPath = panel.dataset.bg;
      if (bgPath) {
        backgrounds.push({
          path: bgPath,
          panelIndex,
          panel,
        });
      }
    });

    if (backgrounds.length === 0) return;

    // Store mapping for section
    this.backgroundMap.set(sectionIndex, {
      backgrounds,
      currentBackgroundIndex: -1,
    });

    this.currentBackgroundIndex[sectionIndex] = -1;

    log.debug(EVENTS.MEDIA, 'Section backgrounds initialized', {
      sectionIndex,
      backgroundCount: backgrounds.length,
    });
  }

  /**
   * Create a background element
   * @param {string} backgroundPath - Path to background image
   * @param {number} backgroundIndex - Index for stacking order
   * @param {number} totalBackgrounds - Total number of backgrounds
   * @returns {HTMLElement} Background element
   */
  static createBackgroundElement(
    backgroundPath,
    backgroundIndex,
    totalBackgrounds
  ) {
    const container = document.createElement('div');
    container.className = 'background-item';
    container.dataset.backgroundIndex = backgroundIndex;

    // Set z-index for proper stacking (first item = lowest z-index)
    const zIndex = backgroundIndex + 1;

    const img = document.createElement('img');
    img.src = backgroundPath;
    img.alt = 'Background image';
    img.loading = 'lazy';

    container.appendChild(img);

    // Set initial GSAP properties
    gsap.set(container, {
      opacity: 0,
      scale: 1.05,
      zIndex,
    });

    return container;
  }

  /**
   * Show background at specific index with stacking effect
   * @param {number} sectionIndex - Section index
   * @param {number} backgroundIndex - Background index to show
   * @returns {gsap.Timeline} Animation timeline
   */
  static showBackgroundAtIndex(sectionIndex, backgroundIndex) {
    const backgroundData = this.backgroundMap.get(sectionIndex);
    if (!backgroundData || !backgroundData.backgrounds[backgroundIndex]) return;

    const timeline = gsap.timeline();

    // Find background container for this section
    const sections = appState.getSections();
    const section = sections[sectionIndex];
    if (!section) return;

    const backgroundContainer = section.querySelector('.background-container');
    if (!backgroundContainer) return;

    const backgroundItems =
      backgroundContainer.querySelectorAll('.background-item');

    // Show all backgrounds up to and including target index (stacking effect)
    backgroundItems.forEach((item, index) => {
      if (index <= backgroundIndex) {
        const newZIndex = index + 1;
        gsap.set(item, { zIndex: newZIndex });

        if (index < backgroundIndex) {
          // Items below target stay visible
          gsap.set(item, { opacity: 1, scale: 1 });
        } else if (index === backgroundIndex) {
          // Target item gets entrance animation
          timeline.fromTo(
            item,
            {
              opacity: 0,
              scale: 1.05,
            },
            {
              opacity: 1,
              scale: 1,
              duration: CONFIG.ANIMATION.CONTENT_ENTER_DURATION * 0.8,
              ease: 'power2.out',
            },
            0
          );
        }
      } else {
        // Hide items above target index
        timeline.to(
          item,
          {
            opacity: 0,
            scale: 1.2,
            duration: CONFIG.ANIMATION.CONTENT_EXIT_DURATION * 0.6,
            ease: 'power2.in',
          },
          0
        );
      }
    });

    // Update current background index
    backgroundData.currentBackgroundIndex = backgroundIndex;
    this.currentBackgroundIndex[sectionIndex] = backgroundIndex;

    log.debug(EVENTS.MEDIA, 'Background transition completed', {
      sectionIndex,
      backgroundIndex,
      backgroundPath: backgroundData.backgrounds[backgroundIndex].path,
    });

    return timeline;
  }

  /**
   * Update background based on current panel
   * @param {number} sectionIndex - Section index
   * @param {number} panelIndex - Panel index
   */
  static updateBackgroundForPanel(sectionIndex, panelIndex) {
    const backgroundData = this.backgroundMap.get(sectionIndex);
    if (!backgroundData) return;

    // Find background for current panel
    const background = backgroundData.backgrounds.find(
      (bg) => bg.panelIndex === panelIndex
    );

    if (background) {
      const backgroundIndex = backgroundData.backgrounds.indexOf(background);
      if (backgroundIndex !== backgroundData.currentBackgroundIndex) {
        this.showBackgroundAtIndex(sectionIndex, backgroundIndex);
      }
    }
  }

  /**
   * Get background path for specific panel
   * @param {number} sectionIndex - Section index
   * @param {number} panelIndex - Panel index
   * @returns {string|null} Background path or null
   */
  static getBackgroundForPanel(sectionIndex, panelIndex) {
    const sections = appState.getSections();
    const section = sections[sectionIndex];
    if (!section) return null;

    const panel = section.querySelectorAll('.panel')[panelIndex];
    return panel ? panel.dataset.bg : null;
  }

  /**
   * Show backgrounds for a specific section
   * @param {number} sectionIndex - Section index
   */
  static showBackgroundsForSection(sectionIndex) {
    const sections = appState.getSections();
    const section = sections[sectionIndex];
    if (!section) return;

    const backgroundContainer = section.querySelector('.background-container');
    if (backgroundContainer) {
      gsap.to(backgroundContainer, {
        opacity: 1,
        visibility: 'visible',
        duration: 0.3,
        ease: 'power2.out',
      });
    }

    log.debug(EVENTS.MEDIA, 'Backgrounds shown for section', { sectionIndex });
  }

  /**
   * Hide backgrounds for a specific section
   * @param {number} sectionIndex - Section index
   */
  static hideBackgroundsForSection(sectionIndex) {
    const sections = appState.getSections();
    const section = sections[sectionIndex];
    if (!section) return;

    const backgroundContainer = section.querySelector('.background-container');
    if (backgroundContainer) {
      gsap.to(backgroundContainer, {
        opacity: 0,
        visibility: 'hidden',
        duration: 0.3,
        ease: 'power2.in',
      });
    }

    log.debug(EVENTS.MEDIA, 'Backgrounds hidden for section', { sectionIndex });
  }

  /**
   * Update background visibility when sections change
   * @param {number} newSectionIndex - New section index
   * @param {number} oldSectionIndex - Old section index
   */
  static updateBackgroundVisibility(newSectionIndex, oldSectionIndex) {
    // Hide backgrounds from old section
    if (oldSectionIndex !== undefined && oldSectionIndex !== newSectionIndex) {
      this.hideBackgroundsForSection(oldSectionIndex);
    }

    // Show backgrounds for new section
    this.showBackgroundsForSection(newSectionIndex);

    log.debug(EVENTS.MEDIA, 'Background visibility updated', {
      newSectionIndex,
      oldSectionIndex,
    });
  }

  /**
   * Get current background index for a section
   * @param {number} sectionIndex - Section index
   * @returns {number} Current background index
   */
  static getCurrentBackgroundIndex(sectionIndex) {
    return this.currentBackgroundIndex[sectionIndex] || -1;
  }

  /**
   * Reset backgrounds for a section
   * @param {number} sectionIndex - Section index
   */
  static resetBackgroundsForSection(sectionIndex) {
    const backgroundData = this.backgroundMap.get(sectionIndex);
    if (backgroundData) {
      backgroundData.currentBackgroundIndex = -1;
      this.currentBackgroundIndex[sectionIndex] = -1;
    }

    log.debug(EVENTS.MEDIA, 'Backgrounds reset for section', { sectionIndex });
  }
}

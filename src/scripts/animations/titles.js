/**
 * Title Animation Controller
 * Handles title animations with configurable effects (fade-up, slide-right)
 */

import { gsap } from 'gsap';
import { CONFIG } from '../constants.js';
import { appState } from '../state.js';
import { log, EVENTS } from '../utils/logger.js';

export class TitleAnimationController {
  // Initialize all titles for first load
  static initializeTitles() {
    const sections = appState.getSections();

    sections.forEach((section, _sectionIndex) => {
      // Set initial title state (hidden for animation)
      const titleElement = section.querySelector('.title-wrapper h1');
      if (titleElement) {
        // Store original section title in data attribute for fallback behavior
        const originalTitle = titleElement.textContent.trim();
        if (originalTitle && !section.dataset.originalTitle) {
          section.dataset.originalTitle = originalTitle;
        }

        gsap.set(titleElement, { opacity: 0, y: 30, x: 0 }); // Reset position for both animation types

        // Remove any existing borders to prevent duplicates
        this.removeTitleBorder(titleElement);

        // Update border visibility based on title content
        this.updateBorderVisibility(titleElement);
      }
    });

    // Ensure all border visibility is correct after initialization
    this.updateAllBorderVisibility();
  }

  // Create animated border element for slide-right titles
  static createTitleBorder(titleElement) {
    const titleWrapper = titleElement.closest('.title-wrapper');
    if (!titleWrapper) return;

    // Check if border already exists to prevent duplicates
    if (titleWrapper.querySelector('.title-border')) {
      return;
    }

    // Create border element with Tailwind classes - positioned outside h1
    const borderElement = document.createElement('div');
    borderElement.className =
      'title-border absolute bottom-0 left-0 h-1 bg-white w-full';
    borderElement.style.cssText = `
      opacity: 0;
      will-change: transform, opacity;
      z-index: 1;
    `;

    // Set initial transform using GSAP to match animation values
    gsap.set(borderElement, {
      xPercent: CONFIG.ANIMATION.TITLE_BORDER_INITIAL_X_PERCENT,
      opacity: 0,
    });

    // Make title wrapper relatively positioned if not already
    const wrapperComputedStyle = window.getComputedStyle(titleWrapper);
    if (wrapperComputedStyle.position === 'static') {
      titleWrapper.style.position = 'relative';
    }

    // Append border to title wrapper (not inside h1)
    titleWrapper.appendChild(borderElement);

    // Update border visibility based on current title content
    this.updateBorderVisibility(titleElement);
  }

  // Remove title border element
  static removeTitleBorder(titleElement) {
    const titleWrapper = titleElement.closest('.title-wrapper');
    if (!titleWrapper) return;

    const existingBorder = titleWrapper.querySelector('.title-border');
    if (existingBorder) {
      existingBorder.remove();
    }
  }

  // Update border visibility based on title content
  static updateBorderVisibility(titleElement) {
    const titleWrapper = titleElement.closest('.title-wrapper');
    if (!titleWrapper) return;

    const existingBorder = titleWrapper.querySelector('.title-border');
    if (!existingBorder) return;

    const titleText = titleElement.textContent.trim();
    const isEmpty = titleText === '';

    if (isEmpty) {
      // Hide border when title is empty
      existingBorder.style.display = 'none';
      log.debug(EVENTS.TITLE, 'Title border hidden for empty title', {
        titleText,
      });
    } else {
      // Show border when title has content
      existingBorder.style.display = '';
      log.debug(EVENTS.TITLE, 'Title border shown for non-empty title', {
        titleText,
      });
    }
  }

  // Ensure border visibility is correct for all titles
  static updateAllBorderVisibility() {
    const sections = appState.getSections();
    sections.forEach((section) => {
      const titleElement = section.querySelector('.title-wrapper h1');
      if (titleElement) {
        this.updateBorderVisibility(titleElement);
      }
    });
  }

  // Get title animation type from section data attribute
  static getTitleAnimationType(sectionIndex) {
    const sections = appState.getSections();
    const section = sections[sectionIndex];
    return section ? section.dataset.titleAnimation : 'fade-up'; // Default to fade-up
  }

  // Animate title in based on animation type
  static animateTitleIn(sectionIndex, delay = 0) {
    const sections = appState.getSections();
    const section = sections[sectionIndex];
    if (!section) return;

    const titleElement = section.querySelector('.title-wrapper h1');
    if (!titleElement) return;

    const animationType = this.getTitleAnimationType(sectionIndex);

    if (animationType === 'slide-right') {
      // Create animated border element for slide-right animation
      this.createTitleBorder(titleElement);

      // Get the border element from the title wrapper
      const titleWrapper = titleElement.closest('.title-wrapper');
      const borderElement = titleWrapper?.querySelector('.title-border');

      // Create timeline for coordinated parallax animations
      const timeline = gsap.timeline();

      // Step 1: Animate in the border line first (faster parallax effect)
      if (borderElement) {
        timeline.fromTo(
          borderElement,
          {
            xPercent: CONFIG.ANIMATION.TITLE_BORDER_INITIAL_X_PERCENT,
            opacity: 0,
          },
          {
            xPercent: 0,
            opacity: 1,
            duration:
              CONFIG.ANIMATION.TITLE_ENTER_DURATION *
              CONFIG.ANIMATION.TITLE_BORDER_DURATION_MULTIPLIER,
            ease: 'power2.out',
            delay,
          }
        );
      }

      // Step 2: Animate in the title text (starts slightly after border begins)
      timeline.fromTo(
        titleElement,
        {
          opacity: 0,
          x: 100, // Start 100px to the right
          y: 0,
        },
        {
          opacity: 0.9,
          x: 0,
          y: 0,
          duration: CONFIG.ANIMATION.TITLE_ENTER_DURATION,
          ease: 'power2.out',
        },
        CONFIG.ANIMATION.TITLE_BORDER_TITLE_OVERLAP // Start before border finishes
      );

      return timeline;
    } else {
      // Default: fade-up animation (like content)
      return gsap.fromTo(
        titleElement,
        {
          opacity: 0,
          x: 0,
          y: 30, // Start 30px down
        },
        {
          opacity: 0.9,
          x: 0,
          y: 0,
          duration: CONFIG.ANIMATION.TITLE_ENTER_DURATION,
          ease: 'back.out(1.2)',
          delay,
        }
      );
    }
  }

  // Animate title out (always fade in place)
  static animateTitleOut(sectionIndex) {
    const sections = appState.getSections();
    const section = sections[sectionIndex];
    if (!section) return;

    const titleElement = section.querySelector('.title-wrapper h1');
    if (!titleElement) return;

    const titleWrapper = titleElement.closest('.title-wrapper');
    const borderElement = titleWrapper?.querySelector('.title-border');
    const animationType = this.getTitleAnimationType(sectionIndex);

    if (animationType === 'slide-right' && borderElement) {
      // Create timeline for coordinated fade out
      const timeline = gsap.timeline();

      // Fade out both border and title text together
      timeline.to(borderElement, {
        opacity: 0,
        xPercent: CONFIG.ANIMATION.TITLE_BORDER_EXIT_X_PERCENT,
        duration:
          CONFIG.ANIMATION.TITLE_EXIT_DURATION *
          CONFIG.ANIMATION.TITLE_BORDER_DURATION_MULTIPLIER,
        ease: 'power2.in',
      });

      // Fade out title text at the same time
      timeline.to(
        titleElement,
        {
          opacity: 0,
          duration: CONFIG.ANIMATION.TITLE_EXIT_DURATION,
          ease: 'power2.in',
        },
        0 // Start at the same time as border
      );

      return timeline;
    } else {
      // Default fade out
      return gsap.to(titleElement, {
        opacity: 0,
        duration: CONFIG.ANIMATION.TITLE_EXIT_DURATION,
        ease: 'power2.in',
      });
    }
  }

  // Animate initial title
  static animateInitialTitle() {
    // Animate the first section's title without additional delay (controlled by app.js)
    return this.animateTitleIn(0, 0);
  }

  // Show specific title (for direct navigation)
  static showTitle(sectionIndex) {
    const sections = appState.getSections();
    const section = sections[sectionIndex];

    if (section) {
      const titleElement = section.querySelector('.title-wrapper h1');
      if (titleElement) {
        const animationType = this.getTitleAnimationType(sectionIndex);

        // Set up border for slide-right animations
        if (animationType === 'slide-right') {
          this.createTitleBorder(titleElement);
          const titleWrapper = titleElement.closest('.title-wrapper');
          const borderElement = titleWrapper?.querySelector('.title-border');
          if (borderElement) {
            gsap.set(borderElement, { xPercent: 0, opacity: 1 });
          }
        }

        gsap.set(titleElement, { opacity: 0.9, x: 0, y: 0 });
      }
    }
  }

  // Hide specific title
  static hideTitle(sectionIndex) {
    const sections = appState.getSections();
    const section = sections[sectionIndex];

    if (section) {
      const titleElement = section.querySelector('.title-wrapper h1');
      if (titleElement) {
        const titleWrapper = titleElement.closest('.title-wrapper');
        const borderElement = titleWrapper?.querySelector('.title-border');

        // Hide border if it exists
        if (borderElement) {
          gsap.set(borderElement, {
            xPercent: CONFIG.ANIMATION.TITLE_BORDER_INITIAL_X_PERCENT,
            opacity: 0,
          });
        }

        gsap.set(titleElement, { opacity: 0, y: 30, x: 0 });
      }
    }
  }

  // Future: Dynamic title updates for interactive states
  static updateTitleForState(sectionIndex, newTitle, animationType = 'fade') {
    // Placeholder for dynamic title changes based on user interactions
    // Useful for your interactive map where titles might change based on selected fields/drains
    log.debug(EVENTS.TITLE, 'Title update placeholder', {
      sectionIndex,
      newTitle,
      animationType,
    });
  }

  // Future: Title overlays for stats and information panels
  static animateTitleOverlay(sectionIndex, overlayData) {
    // Placeholder for title overlays that appear over your complex map visuals
    log.debug(EVENTS.TITLE, 'Title overlay placeholder', {
      sectionIndex,
      overlayData,
    });
  }

  // ===== PANEL-DRIVEN TITLE SYSTEM =====

  /**
   * Get the title that should be displayed for a specific panel
   * @param {number} sectionIndex - Index of the section
   * @param {number} panelIndex - Index of the panel
   * @returns {string|null} The title text or null if no title found
   */
  static getTitleForPanel(sectionIndex, panelIndex) {
    const sections = appState.getSections();
    const section = sections[sectionIndex];
    if (!section) return null;

    const panels = section.querySelectorAll('.panel');
    const targetPanel = panels[panelIndex];

    // Check if the current panel has a data-title
    if (targetPanel && targetPanel.dataset.title) {
      return targetPanel.dataset.title;
    }

    // If current panel doesn't have a title, search backward through previous panels
    // to find the most recent panel title
    for (let i = panelIndex - 1; i >= 0; i--) {
      const previousPanel = panels[i];
      if (previousPanel && previousPanel.dataset.title) {
        log.debug(EVENTS.TITLE, 'Found title from previous panel', {
          sectionIndex,
          currentPanelIndex: panelIndex,
          foundAtPanelIndex: i,
          title: previousPanel.dataset.title,
        });
        return previousPanel.dataset.title;
      }
    }

    // If no panel titles found, fall back to section's original title
    return this.getBaseTitleForSection(sectionIndex);
  }

  /**
   * Check if any panel in the current section has data-title attributes
   * @param {number} sectionIndex - Index of the section
   * @returns {boolean} True if section has panels with dynamic titles
   */
  static sectionHasDynamicTitles(sectionIndex) {
    const sections = appState.getSections();
    const section = sections[sectionIndex];
    if (!section) return false;

    const panels = section.querySelectorAll('.panel[data-title]');
    return panels.length > 0;
  }

  /**
   * Get the base title for a section (from first panel or section itself)
   * @param {number} sectionIndex - Index of the section
   * @returns {string|null} The base title text
   */
  static getBaseTitleForSection(sectionIndex) {
    const sections = appState.getSections();
    const section = sections[sectionIndex];
    if (!section) return null;

    // First try to get the original section title stored during initialization
    if (section.dataset.originalTitle) {
      return section.dataset.originalTitle;
    }

    // Fallback: get current title element content
    const titleElement = section.querySelector('.title-wrapper h1');
    return titleElement ? titleElement.textContent.trim() : null;
  }

  /**
   * Update title for a specific panel with fade transition
   * @param {number} sectionIndex - Index of the section
   * @param {number} panelIndex - Index of the panel
   * @param {number} delay - Delay before starting title animation
   * @returns {gsap.Timeline} Timeline for the title update animation
   */
  static updateTitleForPanel(sectionIndex, panelIndex, delay = 0) {
    const newTitle = this.getTitleForPanel(sectionIndex, panelIndex);
    if (!newTitle) return null;

    const sections = appState.getSections();
    const section = sections[sectionIndex];
    const titleElement = section?.querySelector('.title-wrapper h1');

    if (!titleElement) return null;

    // Check if title actually needs to change
    const currentTitle = titleElement.textContent.trim();
    if (currentTitle === newTitle) {
      // Title is already correct, no animation needed
      return null;
    }

    log.debug(EVENTS.TITLE, 'Updating panel title', {
      sectionIndex,
      panelIndex,
      from: currentTitle,
      to: newTitle,
    });

    const timeline = gsap.timeline();

    // Step 1: Animate out current title
    const fadeOutTimeline = this.animateTitleOut(sectionIndex);
    if (fadeOutTimeline) {
      timeline.add(fadeOutTimeline, delay);
    }

    // Step 2: Change title text after fade out completes
    timeline.call(
      () => {
        titleElement.textContent = newTitle;
        // Update border visibility after title text changes
        this.updateBorderVisibility(titleElement);
      },
      null,
      `+=${CONFIG.ANIMATION.TITLE_EXIT_DURATION}`
    );

    // Step 3: Animate in new title (slightly before panel content)
    const panelContentDelay = CONFIG.ANIMATION.TITLE_PANEL_LEAD_TIME;
    const fadeInTimeline = this.animateTitleIn(sectionIndex, 0);
    if (fadeInTimeline) {
      timeline.add(fadeInTimeline, `+=${panelContentDelay}`);
    }

    return timeline;
  }

  /**
   * Initialize panel-driven title for the initial panel
   * @param {number} sectionIndex - Index of the section
   * @param {number} panelIndex - Index of the panel (usually 0)
   */
  static initializePanelTitle(sectionIndex = 0, panelIndex = 0) {
    const initialTitle = this.getTitleForPanel(sectionIndex, panelIndex);
    if (!initialTitle) return;

    const sections = appState.getSections();
    const section = sections[sectionIndex];
    const titleElement = section?.querySelector('.title-wrapper h1');

    if (titleElement) {
      // Set initial title text without animation
      titleElement.textContent = initialTitle;
      // Update border visibility for initial title
      this.updateBorderVisibility(titleElement);

      log.debug(EVENTS.TITLE, 'Initialized panel title', {
        sectionIndex,
        panelIndex,
        title: initialTitle,
      });
    }
  }

  /**
   * Check if a panel has its own title
   * @param {number} sectionIndex - Index of the section
   * @param {number} panelIndex - Index of the panel
   * @returns {boolean} True if panel has data-title attribute
   */
  static panelHasTitle(sectionIndex, panelIndex) {
    const sections = appState.getSections();
    const section = sections[sectionIndex];
    if (!section) return false;

    const panels = section.querySelectorAll('.panel');
    const panel = panels[panelIndex];

    return panel && panel.dataset.title && panel.dataset.title.trim() !== '';
  }
}

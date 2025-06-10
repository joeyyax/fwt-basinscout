/**
 * Accessibility utilities for screen reader support and keyboard navigation
 */

import { CONFIG } from './constants.js';

class AccessibilityController {
  // Create or get the screen reader announcement container
  static getAnnouncementContainer() {
    let container = document.getElementById('sr-announcements');

    if (!container) {
      container = document.createElement('div');
      container.id = 'sr-announcements';
      container.setAttribute('aria-live', 'polite');
      container.setAttribute('aria-atomic', 'true');
      container.className = 'sr-only';
      container.style.cssText = `
        position: absolute !important;
        width: 1px !important;
        height: 1px !important;
        padding: 0 !important;
        margin: -1px !important;
        overflow: hidden !important;
        clip: rect(0, 0, 0, 0) !important;
        white-space: nowrap !important;
        border: 0 !important;
      `;
      document.body.appendChild(container);
    }

    return container;
  }

  // Announce content changes to screen readers
  static announceNavigation(sectionIndex, panelIndex = null) {
    const container = this.getAnnouncementContainer();
    const sections = document.querySelectorAll('.section');
    const totalSections = sections.length;

    let message;
    if (panelIndex !== null) {
      const panels = sections[sectionIndex]?.querySelectorAll('.panel') || [];
      const totalPanels = panels.length;
      message = `Panel ${panelIndex + 1} of ${totalPanels}, Section ${sectionIndex + 1} of ${totalSections}`;
    } else {
      message = `Section ${sectionIndex + 1} of ${totalSections}`;
    }

    // Clear previous message and add new one
    container.textContent = '';
    setTimeout(() => {
      container.textContent = message;
    }, CONFIG.UI.ACCESSIBILITY_NAVIGATION_ANNOUNCE_DELAY_MS);
  }

  // Announce section title changes
  static announceSectionTitle(sectionIndex) {
    const container = this.getAnnouncementContainer();
    const sections = document.querySelectorAll('.section');
    const section = sections[sectionIndex];

    if (section) {
      const title = section.querySelector('h1, h2, h3')?.textContent || '';
      const message = title
        ? `Now viewing: ${title}`
        : `Section ${sectionIndex + 1}`;

      // Clear previous message and add new one
      container.textContent = '';
      setTimeout(() => {
        container.textContent = message;
      }, CONFIG.UI.ACCESSIBILITY_TITLE_ANNOUNCE_DELAY_MS); // Slightly delayed to allow for transition
    }
  }

  // Check if user prefers reduced motion
  static prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  // Check if user prefers high contrast
  static prefersHighContrast() {
    return window.matchMedia('(prefers-contrast: high)').matches;
  }

  // Add skip link for keyboard navigation
  static addSkipLink() {
    let skipLink = document.getElementById('skip-link');

    if (!skipLink) {
      skipLink = document.createElement('a');
      skipLink.id = 'skip-link';
      skipLink.href = '#sections-container';
      skipLink.textContent = 'Skip to main content';
      skipLink.className = 'sr-only-until-focus';
      skipLink.style.cssText = `
        position: absolute !important;
        top: -100px !important;
        left: 6px !important;
        width: auto !important;
        height: auto !important;
        padding: 8px 16px !important;
        margin: 0 !important;
        overflow: visible !important;
        clip: auto !important;
        white-space: nowrap !important;
        background: white !important;
        color: black !important;
        text-decoration: none !important;
        border: 2px solid black !important;
        border-radius: 4px !important;
        font-weight: bold !important;
        z-index: 9999 !important;
        transition: top 0.3s ease !important;
      `;

      // Show on focus
      skipLink.addEventListener('focus', () => {
        skipLink.style.top = '6px';
      });

      // Hide on blur
      skipLink.addEventListener('blur', () => {
        skipLink.style.top = '-100px';
      });

      document.body.insertBefore(skipLink, document.body.firstChild);
    }
  }

  // Initialize accessibility features
  static init() {
    this.addSkipLink();
    this.getAnnouncementContainer();

    // Add reduced motion class to body if user prefers it
    if (this.prefersReducedMotion()) {
      document.body.classList.add('prefers-reduced-motion');
    }

    // Add high contrast class to body if user prefers it
    if (this.prefersHighContrast()) {
      document.body.classList.add('prefers-high-contrast');
    }
  }
}

// Export the AccessibilityController class
export { AccessibilityController };

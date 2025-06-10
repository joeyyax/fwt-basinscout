// State management for the scrolling application
import { CONFIG } from './constants.js';

class AppState {
  constructor() {
    this.currentSection = 0;
    this.currentPanel = 0;
    this.isAnimating = false;
    this.lastNavigationTime = 0;

    // Cached DOM elements
    this.sections = null;
    this.navDots = null;
    this.backgroundContainer = null;
    this.paginationContainers = null;
  }

  // Initialize DOM element references and calculate dynamic values
  initDOM() {
    this.sections = document.querySelectorAll('.section');
    this.navDots = document.querySelectorAll(
      '.pagination-dot[data-type="section"]'
    ); // Updated to match pagination system
    this.backgroundContainer = document.getElementById('background-container');
    this.paginationContainers = document.querySelectorAll('.pagination');
  }

  // Refresh navigation dots after pagination is initialized
  refreshNavDots() {
    this.navDots = document.querySelectorAll(
      '.pagination-dot[data-type="section"]'
    );
  }

  // Dynamic getters for CMS-managed content
  getTotalSections() {
    return this.sections ? this.sections.length : 0;
  }

  getPanelsPerSection() {
    // Get panels from the first section to determine the standard count
    // Assumes all sections have the same number of panels
    if (this.sections && this.sections.length > 0) {
      const firstSection = this.sections[0];
      const panels = firstSection.querySelectorAll('.panel');
      return panels.length;
    }
    return 0;
  }

  // Get panels for a specific section (in case sections have different panel counts)
  getPanelsInSection(sectionIndex) {
    if (this.sections && this.sections[sectionIndex]) {
      const section = this.sections[sectionIndex];
      const panels = section.querySelectorAll('.panel');
      return panels.length;
    }
    return 0;
  }

  // Getters for current state
  getCurrentSection() {
    return this.currentSection;
  }

  getCurrentPanel() {
    return this.currentPanel;
  }

  isCurrentlyAnimating() {
    return this.isAnimating;
  }

  // State setters
  setCurrentSection(sectionIndex) {
    this.currentSection = sectionIndex;
  }

  setCurrentPanel(panelIndex) {
    this.currentPanel = panelIndex;
  }

  setAnimating(animating) {
    this.isAnimating = animating;
  }

  setLastNavigationTime(time) {
    this.lastNavigationTime = time;
  }

  // Navigation state checks
  canNavigateForward() {
    const currentSectionPanels = this.getPanelsInSection(this.currentSection);
    return (
      this.currentPanel < currentSectionPanels - 1 ||
      this.currentSection < this.getTotalSections() - 1
    );
  }

  canNavigateBackward() {
    return this.currentPanel > 0 || this.currentSection > 0;
  }

  // Check if navigation is allowed (considering cooldown)
  canNavigate() {
    const now = Date.now();
    return (
      !this.isAnimating &&
      now - this.lastNavigationTime >= CONFIG.NAVIGATION_COOLDOWN_MS
    );
  }

  // Get DOM elements
  getSections() {
    return this.sections;
  }

  getNavDots() {
    return this.navDots;
  }

  getBackgroundContainer() {
    return this.backgroundContainer;
  }

  getPaginationContainers() {
    return this.paginationContainers;
  }
}

// Export singleton instance
export const appState = new AppState();

// Make available globally for debugging
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  window.appState = appState;
}

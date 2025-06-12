// Main application entry point
import '../styles/style.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Observer } from 'gsap/Observer';

// Import application modules
import { CONFIG } from './constants.js';
import { appState } from './state.js';
import { AnimationController } from './animations.js';
import { PaginationController } from './pagination.js';
import { AccessibilityController } from './accessibility.js';
import { HeightMatcher } from './utils/height-matcher.js';
import { ScrollInstructions } from './utils/scroll-instructions.js';
import { ScrollController } from './events.js';
import { ErrorHandler } from './utils/error-handler.js';
import { log, EVENTS } from './utils/logger.js';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, Observer);

class AppInitializer {
  // Initialize the entire application
  static init() {
    // Initialize accessibility features first
    AccessibilityController.init();

    // Initialize state and DOM references
    appState.initDOM();

    // Add data attributes dynamically for debugging and CMS convenience
    this.addDataAttributes();

    // Always initialize background system immediately for showcase
    this.initializeBackgroundSystem();

    // Handle optional app initialization delay
    if (CONFIG.APP_INITIALIZATION_DELAY_MS > 0) {
      // Hide main content initially for the showcase
      this.hideAppContent();

      // Set up panel structure without animations to prevent FOUC
      AnimationController.setupPanelStructureOnly();

      // Wait for the configured delay before showing content AND starting animations
      setTimeout(() => {
        this.showAppContent();
        // Start animations AFTER the delay and content is shown
        this.startApplicationAnimations();
      }, CONFIG.APP_INITIALIZATION_DELAY_MS);
    } else {
      // No delay - start animations immediately
      this.startApplicationAnimations();
    }
  }

  // Initialize just the background system for immediate animation
  static initializeBackgroundSystem() {
    // Initialize background system and let each layer animate when its image loads
    // This allows background animations to showcase during app initialization delay
    AnimationController.sections.initializeBackgroundSystem();
  }

  // Hide the main content (keep header and nav visible during background showcase)
  static hideAppContent() {
    // Hide just the main content, leaving header and navigation visible
    const mainElement = document.querySelector('main');
    if (mainElement) {
      mainElement.style.opacity = '0';
      mainElement.style.visibility = 'hidden';
    }
  }

  // Show the main content with animation
  static showAppContent() {
    // Show main content with smooth animation
    const mainElement = document.querySelector('main');
    if (mainElement) {
      mainElement.style.visibility = 'visible';
      // Use GSAP for smooth fade-in
      gsap.to(mainElement, {
        opacity: 1,
        duration: CONFIG.ANIMATION.APP_CONTENT_FADE_IN_DURATION,
        ease: 'power2.out',
      });
    }
  }

  // Start all application animations (extracted from init for delay handling)
  static startApplicationAnimations() {
    // Initialize panels after a small delay for smoother startup
    setTimeout(() => {
      // Initialize all panel animations (but skip background system - already initialized)
      AnimationController.initializePanelsOnly();

      // Initialize scroll instructions after panels are set up
      ScrollInstructions.initialize();

      // Now that pagination is initialized, validate the structure
      this.validateAfterPaginationInit();

      // Initialize content wrappers (make them visible)
      this.initializeContentWrappers();

      // Initialize height matching after layout is established
      HeightMatcher.init();

      // Update initial navigation state
      PaginationController.updatePagination();

      // Ensure navigation is ready (not stuck in animating state)
      appState.setAnimating(false);

      // Animate in the initial title first
      setTimeout(() => {
        AnimationController.animateInitialTitle();
      }, CONFIG.INITIAL_TITLE_ANIMATION_DELAY_MS);

      // Animate in the initial content after the title
      setTimeout(() => {
        AnimationController.animateInitialPanel();
      }, CONFIG.INITIAL_CONTENT_ANIMATION_DELAY_MS);
    }, CONFIG.PANEL_INITIALIZATION_DELAY_MS);
  }

  // Initialize content wrappers to prevent FOUC
  static initializeContentWrappers() {
    const contentWrappers = document.querySelectorAll('.content-wrapper');
    contentWrappers.forEach((wrapper) => {
      wrapper.classList.add('initialized');
    });
  }

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

    // Log structure for debugging
    if (CONFIG.DEBUG_MODE) {
      this.logStructure();
      // Skip validation here - will be done after pagination is initialized
    }
  }

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
}

// Initialize the application
function init() {
  // Initialize error handling first
  ErrorHandler.init();

  // Initialize app state and UI
  AppInitializer.init();

  // Setup scroll and input event listeners
  ScrollController.init();
}

// Start the application when DOM is ready
init();

// Make validation available globally for CMS debugging
if (typeof window !== 'undefined') {
  window.CMS_DEBUG = {
    validateStructure: () => AppInitializer.validateStructure(),
    logStructure: () => AppInitializer.logStructure(),
    addDataAttributes: () => AppInitializer.addDataAttributes(),
    getValidationIssues: () => {
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
    },
  };
}

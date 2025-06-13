/**
 * Application Initializer
 * Core application setup and lifecycle management
 */

import { CONFIG } from '../constants.js';
import { appState } from '../state.js';
import {
  AnimationController,
  SectionAnimationController,
} from '../animations.js';
import { PaginationController } from '../pagination.js';
import { AccessibilityController } from '../accessibility.js';
import { HeightMatcher } from '../utils/height-matcher.js';
import { ScrollInstruction } from '../utils/scroll-instruction.js';
import { ContentManager } from './content-manager.js';
import { ContentOverflowDetector } from '../utils/content-overflow-detector.js';
import { gsap } from 'gsap';

export class AppInitializer {
  // Initialize the entire application
  static init() {
    // Initialize accessibility features first
    AccessibilityController.init();

    // Initialize state and DOM references
    appState.initDOM();

    // Add data attributes dynamically for debugging and CMS convenience
    ContentManager.addDataAttributes();

    // Log structure for debugging
    if (CONFIG.DEBUG_MODE) {
      // Import and call StructureValidator dynamically to avoid circular dependencies
      import('../utils/structure-validator.js').then(
        ({ StructureValidator }) => {
          StructureValidator.logStructure();
        }
      );
    }

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
    SectionAnimationController.initializeBackgroundSystem();
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

      // Check for content overflow and split panels if necessary
      // Do this after panels are initialized but before animations start
      ContentOverflowDetector.initializeWithProperTiming();

      // Initialize pagination AFTER potential panel splitting
      PaginationController.initializePagination();

      // Initialize scroll hint bubble after panels are set up
      ScrollInstruction.initialize();

      // Now that pagination is initialized, validate the structure
      // Import and call StructureValidator dynamically to avoid circular dependencies
      import('../utils/structure-validator.js').then(
        ({ StructureValidator }) => {
          StructureValidator.validateAfterPaginationInit();
        }
      );

      // Initialize content wrappers (make them visible)
      ContentManager.initializeContentWrappers();

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
}

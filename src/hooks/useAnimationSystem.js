/**
 * Animation System Integration Hooks
 *
 * Replaces timeout-based coordination with proper Preact lifecycle management.
 * Eliminates all hacky timeouts while preserving GSAP animation functionality.
 */

import { useState, useEffect, useLayoutEffect, useRef } from 'preact/hooks';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Observer } from 'gsap/Observer';

// Import animation system modules
import { ScrollController } from '../scripts/core/scroll-controller.js';
import { ErrorHandler } from '../scripts/utils/error-handler.js';
import { ContentManager } from '../scripts/core/content-manager.js';
import { OrientationOverlay } from '../scripts/utils/orientation-overlay.js';
import { SectionAnimationController } from '../scripts/animations/sections.js';
import { appState } from '../scripts/state.js';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, Observer);

/**
 * Hook to detect when DOM content is ready for animations
 * Replaces timeout-based DOM readiness checks
 */
export function useContentReady(dependencies = [], source = null, data = null) {
  const [isReady, setIsReady] = useState(false);
  const checkAttempts = useRef(0);
  const maxAttempts = 50; // Max attempts to prevent infinite loops

  useLayoutEffect(() => {
    const checkReadiness = () => {
      checkAttempts.current++;

      // Required DOM elements that animations depend on
      const requiredElements = [
        '.section',
        '.panel',
        '#background-container',
        '.pagination',
      ];

      const elementsExist = requiredElements.every((selector) => {
        const elements = document.querySelectorAll(selector);
        return elements.length > 0;
      });

      // Check if app state can initialize DOM references
      const canInitState = document.querySelectorAll('.section').length > 0;

      // For GraphQL mode, also check if sections have background data attributes
      let backgroundDataReady = true;
      if (source === 'graphql' && data) {
        const sections = document.querySelectorAll('.section');
        backgroundDataReady = Array.from(sections).some((section) =>
          section.hasAttribute('data-background')
        );
      }

      if (elementsExist && canInitState && backgroundDataReady) {
        setIsReady(true);
        return true;
      } else if (checkAttempts.current >= maxAttempts) {
        console.warn(
          'Content readiness check exceeded max attempts, proceeding anyway'
        );
        setIsReady(true);
        return true;
      }

      return false;
    };

    // Reset attempts counter when dependencies change
    checkAttempts.current = 0;

    // Check immediately
    if (!checkReadiness()) {
      // If not ready, use requestAnimationFrame for next check (better than timeout)
      const checkAgain = () => {
        if (!checkReadiness()) {
          requestAnimationFrame(checkAgain);
        }
      };
      requestAnimationFrame(checkAgain);
    }
  }, dependencies);

  return isReady;
}

/**
 * Hook to manage background system lifecycle reactively
 * Replaces the hacky 100ms timeout in App.jsx
 */
export function useBackgroundSystem(data, source) {
  const [backgroundReady, setBackgroundReady] = useState(false);
  const initializedRef = useRef(false);

  useLayoutEffect(() => {
    // Only reinitialize backgrounds when GraphQL data comes in AND we already had a working system
    // This replaces the hacky 100ms timeout that was in App.jsx
    if (source === 'graphql' && data && !initializedRef.current) {
      // Use requestAnimationFrame to ensure DOM has been updated with new data attributes
      const reinitializeBackgrounds = () => {
        const backgroundContainer = document.getElementById(
          'background-container'
        );
        const sectionsWithBackground = document.querySelectorAll(
          '.section[data-background]'
        );

        if (backgroundContainer && sectionsWithBackground.length > 0) {
          try {
            SectionAnimationController.initializeBackgroundSystem();
            setBackgroundReady(true);
            initializedRef.current = true;
          } catch (error) {
            console.error('Failed to reinitialize background system:', error);
            setBackgroundReady(false);
          }
        }
      };

      // Use requestAnimationFrame instead of setTimeout - more performant
      requestAnimationFrame(reinitializeBackgrounds);
    } else {
      // For static content or initial load, let the main animation system handle backgrounds
      setBackgroundReady(true);
    }
  }, [data, source]);

  // Reset when source changes
  useEffect(() => {
    if (source === 'graphql') {
      initializedRef.current = false;
      setBackgroundReady(false);
    }
  }, [source]);

  return backgroundReady;
}

/**
 * Enhanced Animation System Manager
 * Replaces AppInitializer with proper lifecycle management
 */
class AnimationSystemManager {
  static isInitialized = false;
  static initPromise = null;

  static async initialize(options = {}) {
    if (this.isInitialized && !options.force) {
      return Promise.resolve();
    }

    if (this.initPromise && !options.force) {
      return this.initPromise;
    }

    this.initPromise = this._performInitialization(options);
    return this.initPromise;
  }

  static async _performInitialization(options = {}) {
    try {
      // Import CONFIG to respect app initialization timing
      const { CONFIG } = await import('../scripts/constants.js');

      // Initialize error handling first
      ErrorHandler.init();

      // Only hide content if elements exist to prevent GSAP warnings
      const proseElements = document.querySelectorAll('.prose > *');
      const titleElements = document.querySelectorAll('.title-wrapper h1');

      if (proseElements.length > 0 || titleElements.length > 0) {
        gsap.set('.prose > *, .title-wrapper h1', {
          opacity: 0,
        });
      }

      // Remove loading class
      gsap.set(document.body, { clearProps: 'all' });
      document.body.classList.remove('gsap-loading');

      // Initialize app state and UI
      appState.initDOM();

      // Add data attributes dynamically
      ContentManager.addDataAttributes();

      // Initialize accessibility features
      const { AccessibilityController } = await import(
        '../scripts/accessibility.js'
      );
      AccessibilityController.init();

      // Initialize background system immediately for showcase (this should always happen first)
      if (!options.skipBackgrounds) {
        SectionAnimationController.initializeBackgroundSystem();
      }

      // Handle optional app initialization delay (legitimate visual timing for showcase)
      if (CONFIG.APP_INITIALIZATION_DELAY_MS > 0) {
        console.log(
          `Applying ${CONFIG.APP_INITIALIZATION_DELAY_MS}ms app initialization delay for showcase`
        );

        // Hide main content initially for the showcase
        this._hideAppContent();

        // Set up panel structure without animations to prevent FOUC
        const { AnimationController } = await import(
          '../scripts/animations.js'
        );
        AnimationController.setupPanelStructureOnly();

        // Wait for the configured delay before showing content AND starting animations
        await new Promise((resolve) => {
          setTimeout(async () => {
            try {
              console.log(
                'App initialization delay complete, showing content and starting animations'
              );

              this._showAppContent(CONFIG);
              // Start animations AFTER the delay and content is shown
              await this._startApplicationAnimations();

              // Setup scroll and input event listeners
              ScrollController.init();

              // Initialize orientation overlay
              OrientationOverlay.init();

              this.isInitialized = true;
              console.log('Animation system initialized successfully');
              resolve();
            } catch (error) {
              console.error('Animation system initialization failed:', error);
              resolve(); // Don't throw in setTimeout callback
            }
          }, CONFIG.APP_INITIALIZATION_DELAY_MS);
        });
      } else {
        console.log(
          'No app initialization delay, starting animations immediately'
        );

        // No delay - start animations immediately
        await this._startApplicationAnimations();

        // Setup scroll and input event listeners
        ScrollController.init();

        // Initialize orientation overlay
        OrientationOverlay.init();

        this.isInitialized = true;
        console.log('Animation system initialized successfully');
      }
    } catch (error) {
      console.error('Animation system initialization failed:', error);
      throw error;
    }
  }

  // Hide the main content (keep header and nav visible during background showcase)
  static _hideAppContent() {
    const mainElement = document.querySelector('main');
    if (mainElement) {
      mainElement.style.opacity = '0';
      mainElement.style.visibility = 'hidden';
    }
  }

  // Show the main content with animation
  static _showAppContent(CONFIG) {
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

  static async _startApplicationAnimations() {
    // Import animation controller dynamically
    const { AnimationController } = await import('../scripts/animations.js');
    const { PaginationController } = await import('../scripts/pagination.js');
    const { HeightMatcher } = await import(
      '../scripts/utils/height-matcher.js'
    );
    const { ScrollInstruction } = await import(
      '../scripts/utils/scroll-instruction.js'
    );
    const { ContentOverflowDetector } = await import(
      '../scripts/utils/content-overflow-detector.js'
    );

    try {
      // Set up panel structure without animations to prevent FOUC
      AnimationController.setupPanelStructureOnly();

      // Initialize all panel animations (skip background - already done)
      AnimationController.initializePanelsOnly();

      // Check for content overflow and split panels if necessary
      ContentOverflowDetector.initializeWithProperTiming();

      // Initialize pagination AFTER potential panel splitting
      PaginationController.initializePagination();

      // Initialize scroll hint bubble after panels are set up
      ScrollInstruction.initialize();

      // Initialize content wrappers (make them visible)
      ContentManager.initializeContentWrappers();

      // Initialize height matching after layout is established
      HeightMatcher.init();

      // Update initial navigation state
      PaginationController.updatePagination();

      // Ensure navigation is ready (not stuck in animating state)
      appState.setAnimating(false);

      // Animate in the initial title and content without delays
      await this._animateInitialContent(AnimationController);
    } catch (error) {
      console.error('Failed to start application animations:', error);
      throw error;
    }
  }

  static async _animateInitialContent(AnimationController) {
    // Create a timeline for coordinated initial animations
    const timeline = gsap.timeline();

    // Animate in the initial title first
    timeline.add(() => {
      AnimationController.animateInitialTitle();
    });

    // Animate in the initial content after a small delay
    timeline.add(() => {
      AnimationController.animateInitialPanel();
    }, '+=0.2'); // Small delay for sequencing, not a hacky timeout

    return timeline;
  }

  static async reinitialize(reason = 'content-change', options = {}) {
    console.log(`Reinitializing animation system: ${reason}`);

    try {
      // Clean up existing state
      if (this.isInitialized) {
        this.cleanup();
      }

      // Force reinitialization
      return await this.initialize({ force: true, ...options });
    } catch (error) {
      console.error('Animation system reinitialization failed:', error);
      throw error;
    }
  }

  static cleanup() {
    try {
      // Kill all GSAP animations
      gsap.killTweensOf('*');

      // Clear ScrollTrigger instances
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());

      // Reset state
      this.isInitialized = false;
      this.initPromise = null;

      console.log('Animation system cleaned up');
    } catch (error) {
      console.error('Animation system cleanup failed:', error);
    }
  }

  static isReady() {
    return this.isInitialized;
  }
}

/**
 * Master animation system hook
 * Coordinates entire animation lifecycle without timeouts
 */
export function useAnimationSystem(data, source) {
  const [systemReady, setSystemReady] = useState(false);
  const [error, setError] = useState(null);
  const contentReady = useContentReady([data, source], source, data);
  const initRef = useRef(false);

  // Initialize system when content is ready
  useLayoutEffect(() => {
    if (contentReady && !initRef.current) {
      initRef.current = true;

      AnimationSystemManager.initialize({
        data,
        source,
        // Don't skip backgrounds - let the main system handle them
        // App.jsx will reinitialize them for GraphQL separately
      })
        .then(() => {
          setSystemReady(true);
          setError(null);
        })
        .catch((err) => {
          console.error('Animation system initialization failed:', err);
          setError(err);
          setSystemReady(false);
        });
    }
  }, [contentReady, data, source]);

  // Handle content source changes (e.g., GraphQL -> static or vice versa)
  useEffect(() => {
    if (systemReady && initRef.current) {
      // Reset for reinitialization when source changes significantly
      if (source === 'graphql') {
        initRef.current = false;
        setSystemReady(false);
      }
    }
  }, [source, systemReady]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      AnimationSystemManager.cleanup();
    };
  }, []);

  return {
    ready: systemReady,
    error,
    contentReady,
  };
}

/**
 * Hook for managing GSAP-related styles and setup
 * Handles the immediate style changes that prevent FOUC
 * Only runs after DOM elements exist
 */
export function useGSAPSetup() {
  useLayoutEffect(() => {
    // Only set styles for elements that actually exist
    const proseElements = document.querySelectorAll('.prose > *');
    const titleElements = document.querySelectorAll('.title-wrapper h1');

    if (proseElements.length > 0 || titleElements.length > 0) {
      gsap.set('.prose > *, .title-wrapper h1', {
        opacity: 0,
      });
    }

    // Remove loading class once GSAP is ready
    gsap.set(document.body, { clearProps: 'all' });
    document.body.classList.remove('gsap-loading');
  }, []);
}

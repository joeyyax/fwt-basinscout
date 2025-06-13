/**
 * Application Configuration Constants
 *
 * Centralized configuration for all timing, animation durations, and behavioral settings.
 * This file consolidates hardcoded values from across the application for easy maintenance
 * and customization. Changes here affect all animations and behaviors globally.
 *
 * Time Units:
 * - GSAP animations: seconds (e.g., 0.5, 1.2, 2.0)
 * - setTimeout/setInterval: milliseconds (e.g., 500, 800, 1200)
 * - All values clearly marked with unit suffix where ambiguous
 */

export const CONFIG = {
  // ===== DEVELOPMENT & DEBUGGING =====

  /** Enable debug logging and development features (disable in production) */
  DEBUG_MODE: true, // Boolean flag for console.log statements and development helpers

  // ===== CORE APPLICATION TIMING =====

  /** Minimum time between user navigation attempts (prevents rapid clicking spam) - in milliseconds */
  NAVIGATION_COOLDOWN_MS: 200, // Reduced for better mobile responsiveness

  /** Delay before panel initialization begins (allows DOM to fully settle) - in milliseconds */
  PANEL_INITIALIZATION_DELAY_MS: 500, // Ensures DOM elements are ready for GSAP queries

  /** Delay before initial title animation starts on page load - in milliseconds */
  INITIAL_TITLE_ANIMATION_DELAY_MS: 200, // Small delay to let page render before animating

  /** Delay before initial content animation starts on page load - in milliseconds */
  INITIAL_CONTENT_ANIMATION_DELAY_MS: 200, // Longer delay for content after titles start

  /** Delay before background overlay appears on initial load (0 = immediate) - in milliseconds */
  INITIAL_BACKGROUND_OVERLAY_DELAY_MS: 0, // Controls when dark overlay fades in over background

  /** Optional delay before showing main app content and starting animations (0 = disabled) - in milliseconds */
  APP_INITIALIZATION_DELAY_MS: 2000, // Global app delay for preloading/splash screens

  // ===== ANIMATION DURATIONS & TIMING =====

  ANIMATION: {
    // ----- Section Transitions -----

    /** Duration for section opacity fade in/out transitions - in seconds */
    SECTION_FADE_DURATION: 0.3, // Quick fade between sections for responsiveness

    /** Duration for content elements animating out during section transitions - in seconds */
    CONTENT_EXIT_DURATION: 0.4, // Content exits slightly slower than section fade

    /** Duration for content elements animating in during section transitions - in seconds */
    CONTENT_ENTER_DURATION: 0.6, // Content enters slower for smooth reveal effect

    /** Base stagger delay between sequential content elements - in seconds */
    CONTENT_STAGGER_DELAY: 0.1, // Creates cascade effect for multiple elements

    /** Duration for background image transitions between sections - in seconds */
    BACKGROUND_TRANSITION_DURATION: 1.5, // Longer duration for dramatic background changes

    // ----- Title Animations -----

    /** Duration for title elements animating in (fade-up, slide-in, etc.) - in seconds */
    TITLE_ENTER_DURATION: 0.8, // Moderate speed for impactful title reveals

    /** Duration for title elements animating out (fade, slide-out, etc.) - in seconds */
    TITLE_EXIT_DURATION: 0.4, // Faster exit to make way for new content

    /** Base delay between multiple title elements in a sequence - in seconds */
    TITLE_SEQUENCE_DELAY: 0.1, // Small delay for hierarchical title reveals (h1, h2, etc.)

    /** Time for title to lead panel content during panel-driven title changes - in seconds */
    TITLE_PANEL_LEAD_TIME: 0.15, // Title animates in slightly before panel content

    // ----- Background Animations -----

    /** Duration for background layer opacity changes (fade in/out) - in seconds */
    BACKGROUND_OPACITY_DURATION: 1.0, // Quick opacity changes for immediate visual feedback

    /** Duration for background transform animations (scale, rotation) - in seconds */
    BACKGROUND_TRANSFORM_DURATION: 2.0, // Longer transforms for dramatic visual effects

    /** How much background transforms overlap with opacity animations (negative = start earlier) - in seconds */
    BACKGROUND_TRANSFORM_OVERLAP: 0.1, // Slight overlap prevents jarring transitions

    /** Duration for global background overlay fade in/out - in seconds */
    BACKGROUND_OVERLAY_FADE_DURATION: 0.5, // Dark overlay that appears over background images

    // ----- App Initialization -----

    /** Duration for main app content fade-in after initialization delay - in seconds */
    APP_CONTENT_FADE_IN_DURATION: 0.5, // Smooth reveal of main content after app delay

    // ----- Statistics & Data Visualizations -----

    /** Duration for donut chart progress animations (0 to target percentage) - in seconds */
    STATS_DONUT_CHART_DURATION: 1.2, // Satisfying duration for circular progress animations

    /** Duration for panel donut chart animations - alias for consistency */
    DONUT_ANIMATION_DURATION: 1.2, // Matches STATS_DONUT_CHART_DURATION for consistent timing

    /** Duration for numeric value counting animations (0 to target number) - in seconds */
    STATS_NUMBER_COUNT_DURATION: 1.2, // Matches donut charts for consistent timing

    /** Stagger delay between multiple statistics in the same container - in seconds */
    STATS_ELEMENT_STAGGER_DELAY: 0.2, // Creates wave effect across multiple stats

    /** Stagger delay between donut charts animating in the same container - in seconds */
    DONUT_STAGGER_DELAY: 0.2, // Creates wave effect across multiple donut charts

    /** Easing function for donut chart animations */
    DONUT_EASE: 'power0.inOut', // Linear easing for constant speed donut filling (power0 = linear)

    // ----- Media Item Animations -----

    /** Stagger delay between media markers when animating in/out - in seconds */
    MEDIA_MARKER_STAGGER_DELAY: 0.08, // Creates sequential marker appearance effect

    /** Stagger delay between media stats when animating in/out - in seconds */
    MEDIA_STATS_STAGGER_DELAY: 0.12, // Slightly slower than markers for layered effect

    /** Duration multiplier for media marker animations relative to content - ratio */
    MEDIA_MARKER_DURATION_MULTIPLIER: 0.6, // 60% of content duration for snappy marker animations

    /** Duration multiplier for media stats animations relative to content - ratio */
    MEDIA_STATS_DURATION_MULTIPLIER: 0.5, // 50% of content duration for quick stats transitions

    // ----- Panel Content Animations -----

    /** Stagger delay between child elements within a panel during enter animations - in seconds */
    PANEL_CHILD_ELEMENT_STAGGER: 0.1, // Creates cascade effect for lists, text blocks, etc.

    /** Additional delay offset for child elements after their parent starts animating - in seconds */
    PANEL_CHILD_ANIMATION_OFFSET: 0.2, // Ensures parent animates first, then children follow

    // ----- Panel Exit Animations (optimized for speed) -----

    /** Fast stagger delay for main elements exiting during transitions - in seconds */
    PANEL_EXIT_ELEMENT_STAGGER: 0.05, // Rapid exit for quick transitions

    /** Even faster stagger delay for child elements exiting during transitions - in seconds */
    PANEL_CHILD_EXIT_STAGGER: 0.03, // Very fast child exits to clear content quickly

    // ----- Border Animations (Panels & Titles) -----

    /** Duration for panel border slide-up animation (leading content) - in seconds */
    PANEL_BORDER_ENTER_DURATION: 0.25, // Fixed duration that finishes before content starts

    /** Delay for content to wait after panel border finishes - in seconds */
    PANEL_BORDER_CONTENT_DELAY: 0.25, // Content waits for border to complete

    /** Y-axis exit movement for panel borders (upward slide) - percentage */
    PANEL_BORDER_EXIT_Y_PERCENT: -20, // Slides up slightly while fading out

    /** Exit duration multiplier for panel borders relative to content exit - ratio */
    PANEL_BORDER_EXIT_DURATION_MULTIPLIER: 0.8, // 80% of content exit duration

    /** Initial X-axis position for title borders (off-screen right) - percentage */
    TITLE_BORDER_INITIAL_X_PERCENT: 150, // Starts 150% off-screen to the right

    /** Exit X-axis position for title borders (off-screen left) - percentage */
    TITLE_BORDER_EXIT_X_PERCENT: -50, // Exits 50% off-screen to the left

    /** Title border animation duration multiplier relative to title duration - ratio */
    TITLE_BORDER_DURATION_MULTIPLIER: 0.6, // 60% of title animation duration (faster)

    /** Title border start delay relative to title animation - seconds */
    TITLE_BORDER_TITLE_OVERLAP: 0.1, // Title starts 0.1s after border finishes (border comes first)

    /** Initial panel content delay after border leads in - seconds */
    INITIAL_PANEL_CONTENT_DELAY: 0.3, // Initial content waits for border to establish space

    // ----- Pagination Animations -----

    /** Duration for pagination dots stagger entrance animation - in seconds */
    PAGINATION_DOT_ENTER_DURATION: 0.4, // Individual dot animation duration

    /** Stagger delay between pagination dots when they appear - in seconds */
    PAGINATION_DOT_STAGGER_DELAY: 0.08, // Creates wave effect across dots
  },

  // ===== USER INTERFACE INTERACTIONS =====

  UI: {
    /** Duration of visual feedback for pagination dot clicks - in milliseconds */
    PAGINATION_CLICK_FEEDBACK_DURATION_MS: 150, // Brief visual response for user click feedback

    /** Delay before screen reader announcements for navigation changes - in milliseconds */
    ACCESSIBILITY_NAVIGATION_ANNOUNCE_DELAY_MS: 100, // Small delay to let content settle before announcing

    /** Delay before screen reader announcements for title changes during transitions - in milliseconds */
    ACCESSIBILITY_TITLE_ANNOUNCE_DELAY_MS: 300, // Longer delay for title announcements after content changes
  },

  // ===== GSAP OBSERVER (SCROLL/WHEEL NAVIGATION) =====

  OBSERVER: {
    /** Wheel/scroll sensitivity multiplier */
    WHEEL_SPEED: -1, // Controls scroll sensitivity

    /** Tolerance threshold for detecting scroll direction changes (prevents jitter) */
    TOLERANCE: 30, // Minimum scroll delta required to trigger navigation

    /** Whether to prevent default scroll behavior */
    PREVENT_DEFAULT_SCROLL: true, // Prevents default scroll to enable custom navigation
  },
};

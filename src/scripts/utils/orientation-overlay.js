/**
 * Viewport Overlay System
 * Shows prompts for mobile orientation and browser height issues
 */

import { CONFIG } from '../constants.js';

export class OrientationOverlay {
  static orientationOverlay = null;
  static heightOverlay = null;
  static isShowingOrientation = false;
  static isShowingHeight = false;

  // Initialize viewport detection
  static init() {
    console.log('ViewportOverlay: Initializing...');
    this.createOrientationOverlay();
    this.createHeightOverlay();

    // Wait for layout to be complete before initial check
    // This prevents false positives from inaccurate window.innerHeight
    this.waitForStableLayout(() => {
      this.checkViewport();
    });

    // Listen for orientation changes
    window.addEventListener('orientationchange', () => {
      console.log('ViewportOverlay: orientationchange event fired');
      setTimeout(() => {
        this.checkViewport();
      }, 100);
    });

    // Listen for resize events
    window.addEventListener('resize', () => {
      console.log('ViewportOverlay: resize event fired');
      this.checkViewport();
    });

    console.log('ViewportOverlay: Initialization complete');
  }

  // Wait for layout to stabilize before checking viewport
  static waitForStableLayout(callback) {
    let lastHeight = 0;
    let stableCount = 0;
    const requiredStableChecks =
      CONFIG.VIEWPORT_OVERLAY.REQUIRED_STABLE_MEASUREMENTS;

    const checkStability = () => {
      const currentHeight = Math.max(
        window.innerHeight,
        document.documentElement.clientHeight
      );

      if (currentHeight === lastHeight && currentHeight > 0) {
        stableCount++;
        if (stableCount >= requiredStableChecks) {
          console.log(
            'ViewportOverlay: Layout stable, height =',
            currentHeight
          );
          callback();
          return;
        }
      } else {
        stableCount = 0;
        lastHeight = currentHeight;
      }

      // Check again in a short interval, max 10 attempts
      if (stableCount < requiredStableChecks) {
        setTimeout(
          checkStability,
          CONFIG.VIEWPORT_OVERLAY.LAYOUT_STABILITY_CHECK_INTERVAL
        );
      }
    };

    // Start checking after initial delay
    setTimeout(
      checkStability,
      CONFIG.VIEWPORT_OVERLAY.LAYOUT_STABILITY_INITIAL_DELAY
    );
  }

  // Check if device is mobile and in landscape mode
  static shouldShowOrientationOverlay() {
    // Check if device has touch capability (mobile indicator)
    const hasTouchScreen =
      'ontouchstart' in window || window.navigator.maxTouchPoints > 0;

    // Check screen dimensions for mobile size
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Mobile device detection - either small screen OR touch device
    const isMobileDevice =
      hasTouchScreen &&
      Math.min(screenWidth, screenHeight) <=
        CONFIG.VIEWPORT_OVERLAY.MOBILE_SCREEN_THRESHOLD;

    // Landscape detection - viewport width is greater than height
    const isLandscape = viewportWidth > viewportHeight;

    // Additional check for screen orientation API if available
    const screenOrientation = window.screen?.orientation?.type || '';
    const isLandscapeByAPI = screenOrientation.includes('landscape');

    // Final decision - show if mobile device AND in landscape
    const shouldShow = isMobileDevice && (isLandscape || isLandscapeByAPI);

    return shouldShow;
  }

  // Check if browser window is too short
  static shouldShowHeightOverlay() {
    const viewportHeight = window.innerHeight;
    const documentHeight = document.documentElement.clientHeight;
    const bodyHeight = document.body.clientHeight;
    const baseMinHeight = CONFIG.VIEWPORT_OVERLAY.MIN_HEIGHT_THRESHOLD;

    // Use the most reliable height measurement
    // documentElement.clientHeight is usually most accurate for actual viewport
    const reliableHeight = documentHeight || viewportHeight;

    // Don't show on mobile devices (they handle height differently)
    const hasTouchScreen =
      'ontouchstart' in window || window.navigator.maxTouchPoints > 0;
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    const isMobileDevice =
      hasTouchScreen &&
      Math.min(screenWidth, screenHeight) <=
        CONFIG.VIEWPORT_OVERLAY.MOBILE_SCREEN_THRESHOLD;

    // Calculate the effective minimum height with appropriate buffer
    // Mobile devices get a larger buffer for dynamic UI elements (address bars, nav bars)
    // Desktop devices get a smaller buffer for browser chrome (bookmarks bar, etc.)
    const uiBuffer = isMobileDevice
      ? CONFIG.VIEWPORT_OVERLAY.MOBILE_UI_BUFFER
      : CONFIG.VIEWPORT_OVERLAY.DESKTOP_UI_BUFFER;

    const effectiveMinHeight = baseMinHeight + uiBuffer;

    // Show if not mobile and viewport is too short (accounting for UI buffer)
    const shouldShow = !isMobileDevice && reliableHeight < effectiveMinHeight;

    // Debug logging to help identify false positives
    if (shouldShow) {
      console.log('HeightOverlay Debug:', {
        viewportHeight,
        documentHeight,
        bodyHeight,
        reliableHeight,
        baseMinHeight,
        uiBuffer,
        effectiveMinHeight,
        isMobileDevice,
        hasTouchScreen,
        screenDimensions: `${screenWidth}x${screenHeight}`,
        userAgent: window.navigator.userAgent.substring(0, 100),
      });
    }

    return shouldShow;
  }

  // Check both orientation and height and show appropriate overlay
  static checkViewport() {
    const shouldShowOrientation = this.shouldShowOrientationOverlay();
    const shouldShowHeight = this.shouldShowHeightOverlay();

    // Update orientation overlay
    const phoneIcon = this.orientationOverlay?.querySelector('.phone-icon');
    if (phoneIcon) {
      if (shouldShowOrientation) {
        phoneIcon.classList.remove('correct-orientation');
        phoneIcon.classList.add('wrong-orientation');
      } else {
        phoneIcon.classList.remove('wrong-orientation');
        phoneIcon.classList.add('correct-orientation');
      }
    }

    // Orientation overlay takes priority over height overlay
    if (shouldShowOrientation) {
      this.showOrientationOverlay();
      this.hideHeightOverlay();
    } else if (shouldShowHeight) {
      this.hideOrientationOverlay();
      this.showHeightOverlay();
    } else {
      this.hideOrientationOverlay();
      this.hideHeightOverlay();
    }
  }

  // Create the orientation overlay element
  static createOrientationOverlay() {
    if (this.orientationOverlay) return;

    this.orientationOverlay = document.createElement('div');
    this.orientationOverlay.id = 'orientation-overlay';
    this.orientationOverlay.className = 'viewport-overlay';
    this.orientationOverlay.innerHTML = `
      <div class="overlay-content">
        <div class="phone-icon">
          <svg width="40" height="60" viewBox="0 0 40 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="6" y="4" width="28" height="52" rx="4" stroke="white" stroke-width="2" fill="none"/>
            <rect x="10" y="8" width="20" height="36" rx="1" fill="white" opacity="0.3"/>
            <circle cx="20" cy="50" r="3" fill="white"/>
          </svg>
        </div>
        <h2>Please Rotate Your Device</h2>
        <p>This website is designed for vertical viewing. Please rotate your device.</p>
      </div>
    `;

    document.body.appendChild(this.orientationOverlay);
  }

  // Create the height overlay element
  static createHeightOverlay() {
    if (this.heightOverlay) return;

    this.heightOverlay = document.createElement('div');
    this.heightOverlay.id = 'height-overlay';
    this.heightOverlay.className = 'viewport-overlay';
    this.heightOverlay.innerHTML = `
      <div class="overlay-content">
        <div class="browser-icon">
          <svg width="60" height="50" viewBox="0 0 60 50" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Browser window frame - will animate height -->
            <rect x="4" y="6" width="52" rx="4" stroke="white" stroke-width="2" fill="none" class="browser-window">
              <animate attributeName="height" values="28;38;28" dur="3s" repeatCount="indefinite"/>
            </rect>
            <!-- Browser content area - will animate height -->
            <rect x="8" y="12" width="44" rx="1" fill="white" opacity="0.3" class="browser-content">
              <animate attributeName="height" values="16;26;16" dur="3s" repeatCount="indefinite"/>
            </rect>
            <!-- Browser buttons - stay fixed size and position -->
            <circle cx="12" cy="10" r="1.5" fill="white"/>
            <circle cx="16" cy="10" r="1.5" fill="white"/>
            <circle cx="20" cy="10" r="1.5" fill="white"/>
          </svg>
        </div>
        <h2>Please Make Your Window Taller</h2>
        <p>This website needs more vertical space to display properly. Please resize your browser window.</p>
      </div>
    `;

    document.body.appendChild(this.heightOverlay);
  }

  // Show the orientation overlay
  static showOrientationOverlay() {
    if (this.isShowingOrientation || !this.orientationOverlay) return;

    console.log('ViewportOverlay: Showing orientation overlay');
    this.isShowingOrientation = true;
    this.orientationOverlay.style.display = 'flex';

    // Add to body class for any additional styling needs
    document.body.classList.add('viewport-prompt-active');

    // Prevent all interaction with the site
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
  }

  // Hide the orientation overlay
  static hideOrientationOverlay() {
    if (!this.isShowingOrientation || !this.orientationOverlay) return;

    console.log('ViewportOverlay: Hiding orientation overlay');
    this.isShowingOrientation = false;
    this.orientationOverlay.style.display = 'none';

    // Only restore normal interaction if no overlay is showing
    if (!this.isShowingHeight) {
      document.body.classList.remove('viewport-prompt-active');
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    }
  }

  // Show the height overlay
  static showHeightOverlay() {
    if (this.isShowingHeight || !this.heightOverlay) return;

    console.log('ViewportOverlay: Showing height overlay');
    this.isShowingHeight = true;
    this.heightOverlay.style.display = 'flex';

    // Add to body class for any additional styling needs
    document.body.classList.add('viewport-prompt-active');

    // Prevent all interaction with the site
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
  }

  // Hide the height overlay
  static hideHeightOverlay() {
    if (!this.isShowingHeight || !this.heightOverlay) return;

    console.log('ViewportOverlay: Hiding height overlay');
    this.isShowingHeight = false;
    this.heightOverlay.style.display = 'none';

    // Only restore normal interaction if no overlay is showing
    if (!this.isShowingOrientation) {
      document.body.classList.remove('viewport-prompt-active');
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    }
  }
}

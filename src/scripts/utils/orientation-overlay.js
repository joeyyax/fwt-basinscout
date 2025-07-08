/**
 * Viewport Overlay System
 * Shows prompts for mobile orientation and screen height based on config toggles
 * Control via CONFIG.VIEWPORT_OVERLAY.ENABLE_ORIENTATION_CHECK and ENABLE_HEIGHT_CHECK
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

    // Check if any overlays are enabled
    if (
      !CONFIG.VIEWPORT_OVERLAY.ENABLE_ORIENTATION_CHECK &&
      !CONFIG.VIEWPORT_OVERLAY.ENABLE_HEIGHT_CHECK
    ) {
      console.log(
        'ViewportOverlay: Both orientation and height checks disabled, skipping initialization'
      );
      return;
    }

    // Create overlays based on enabled features
    if (CONFIG.VIEWPORT_OVERLAY.ENABLE_ORIENTATION_CHECK) {
      this.createOrientationOverlay();
    }
    if (CONFIG.VIEWPORT_OVERLAY.ENABLE_HEIGHT_CHECK) {
      this.createHeightOverlay();
    }

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
    // Check if orientation overlay is enabled in config
    if (!CONFIG.VIEWPORT_OVERLAY.ENABLE_ORIENTATION_CHECK) {
      return false;
    }

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
    // Check if height overlay is enabled in config
    if (!CONFIG.VIEWPORT_OVERLAY.ENABLE_HEIGHT_CHECK) {
      return false;
    }

    const viewportHeight = Math.max(
      window.innerHeight,
      document.documentElement.clientHeight
    );

    // Detect mobile device to apply appropriate UI buffer
    const hasTouchScreen =
      'ontouchstart' in window || window.navigator.maxTouchPoints > 0;
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    const isMobileDevice =
      hasTouchScreen &&
      Math.min(screenWidth, screenHeight) <=
        CONFIG.VIEWPORT_OVERLAY.MOBILE_SCREEN_THRESHOLD;

    const uiBuffer = isMobileDevice
      ? CONFIG.VIEWPORT_OVERLAY.MOBILE_UI_BUFFER
      : CONFIG.VIEWPORT_OVERLAY.DESKTOP_UI_BUFFER;

    const effectiveMinHeight =
      CONFIG.VIEWPORT_OVERLAY.MIN_HEIGHT_THRESHOLD + uiBuffer;

    return viewportHeight < effectiveMinHeight;
  }

  // Check orientation and height, show appropriate overlays based on config
  static checkViewport() {
    const shouldShowOrientation = this.shouldShowOrientationOverlay();
    const shouldShowHeight = this.shouldShowHeightOverlay();

    // Update orientation overlay if enabled
    if (CONFIG.VIEWPORT_OVERLAY.ENABLE_ORIENTATION_CHECK) {
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

      // Show/hide orientation overlay
      if (shouldShowOrientation) {
        this.showOrientationOverlay();
      } else {
        this.hideOrientationOverlay();
      }
    }

    // Handle height overlay if enabled
    if (CONFIG.VIEWPORT_OVERLAY.ENABLE_HEIGHT_CHECK) {
      if (shouldShowHeight) {
        this.showHeightOverlay();
      } else {
        this.hideHeightOverlay();
      }
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
        <div class="expand-icon">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="8" y="15" width="24" height="10" rx="2" stroke="white" stroke-width="2" fill="none"/>
            <path d="M15 9 L20 4 L25 9" stroke="white" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M15 31 L20 36 L25 31" stroke="white" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            <line x1="20" y1="4" x2="20" y2="15" stroke="white" stroke-width="2" stroke-linecap="round"/>
            <line x1="20" y1="25" x2="20" y2="36" stroke="white" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <h2>Please Make Your Window Taller</h2>
        <p>This website needs more vertical space to display properly. Please expand your browser window or use a device with a taller screen.</p>
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

    // Only restore normal interaction if height overlay is also hidden
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

    // Only restore normal interaction if orientation overlay is also hidden
    if (!this.isShowingOrientation) {
      document.body.classList.remove('viewport-prompt-active');
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    }
  }
}

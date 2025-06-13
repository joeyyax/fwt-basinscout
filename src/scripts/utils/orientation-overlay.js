/**
 * Orientation Overlay
 * Shows a prompt for mobile users to rotate to portrait mode
 */

export class OrientationOverlay {
  static overlay = null;
  static isShowing = false;

  // Initialize orientation detection
  static init() {
    console.log('OrientationOverlay: Initializing...');
    this.createOverlay();
    this.checkOrientation();

    // Listen for orientation changes
    window.addEventListener('orientationchange', () => {
      console.log('OrientationOverlay: orientationchange event fired');
      // Small delay to ensure orientation change is complete
      setTimeout(() => {
        this.checkOrientation();
      }, 100);
    });

    // Also listen for resize events as backup
    window.addEventListener('resize', () => {
      console.log('OrientationOverlay: resize event fired');
      this.checkOrientation();
    });

    console.log('OrientationOverlay: Initialization complete');
  }

  // Check if device is mobile and in landscape mode
  static shouldShowOverlay() {
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
      hasTouchScreen && Math.min(screenWidth, screenHeight) <= 768;

    // Landscape detection - viewport width is greater than height
    const isLandscape = viewportWidth > viewportHeight;

    // Additional check for screen orientation API if available
    const screenOrientation = window.screen?.orientation?.type || '';
    const isLandscapeByAPI = screenOrientation.includes('landscape');

    // Final decision - show if mobile device AND in landscape
    const shouldShow = isMobileDevice && (isLandscape || isLandscapeByAPI);

    // Log debugging info
    console.log('OrientationOverlay Debug:', {
      hasTouchScreen,
      screenWidth,
      screenHeight,
      viewportWidth,
      viewportHeight,
      isMobileDevice,
      isLandscape,
      isLandscapeByAPI,
      screenOrientation,
      shouldShow,
    });

    return shouldShow;
  }

  // Check orientation and show/hide overlay accordingly
  static checkOrientation() {
    const shouldShow = this.shouldShowOverlay();
    const phoneIcon = this.overlay?.querySelector('.phone-icon');

    if (phoneIcon) {
      // Update phone icon color based on orientation
      if (shouldShow) {
        // Wrong orientation (landscape) - show red
        phoneIcon.classList.remove('correct-orientation');
        phoneIcon.classList.add('wrong-orientation');
      } else {
        // Correct orientation (portrait) - show green
        phoneIcon.classList.remove('wrong-orientation');
        phoneIcon.classList.add('correct-orientation');
      }
    }

    if (shouldShow) {
      this.showOverlay();
    } else {
      this.hideOverlay();
    }
  }

  // Create the overlay element
  static createOverlay() {
    if (this.overlay) return;

    this.overlay = document.createElement('div');
    this.overlay.id = 'orientation-overlay';
    this.overlay.className = 'orientation-overlay';
    this.overlay.innerHTML = `
      <div class="orientation-content">
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

    // Add to body
    document.body.appendChild(this.overlay);
  }

  // Show the overlay
  static showOverlay() {
    if (this.isShowing || !this.overlay) return;

    console.log('OrientationOverlay: Showing overlay');
    this.isShowing = true;
    this.overlay.style.display = 'flex';

    // Add to body class for any additional styling needs
    document.body.classList.add('orientation-prompt-active');

    // Prevent all interaction with the site
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
  }

  // Hide the overlay
  static hideOverlay() {
    if (!this.isShowing || !this.overlay) return;

    console.log('OrientationOverlay: Hiding overlay');
    this.isShowing = false;
    this.overlay.style.display = 'none';

    // Remove body class
    document.body.classList.remove('orientation-prompt-active');

    // Restore normal interaction
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
    document.body.style.height = '';
  }
}

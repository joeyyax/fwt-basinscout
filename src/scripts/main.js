// Main application entry point
import '../styles/style.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Observer } from 'gsap/Observer';

// Import application modules
import { AppInitializer } from './core/app-initializer.js';
import { ScrollController } from './core/scroll-controller.js';
import { ErrorHandler } from './utils/error-handler.js';
import { StructureValidator } from './utils/structure-validator.js';
import { ContentManager } from './core/content-manager.js';
import { OrientationOverlay } from './utils/orientation-overlay.js';
import { CONFIG } from './constants.js';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, Observer);

// Immediately hide content with GSAP to prevent FOUC
gsap.set('.prose > *, .title-wrapper h1', {
  opacity: 0,
});

// Remove loading class once GSAP is ready
gsap.set(document.body, { clearProps: 'all' });
document.body.classList.remove('gsap-loading');

// Initialize the application
function init() {
  // Initialize error handling first
  ErrorHandler.init();

  // Initialize app state and UI
  AppInitializer.init();

  // Setup scroll and input event listeners
  ScrollController.init();

  // Initialize orientation overlay for mobile after everything else is loaded
  // This ensures accurate window.innerHeight measurements
  setTimeout(() => {
    OrientationOverlay.init();
  }, CONFIG.VIEWPORT_OVERLAY_INITIALIZATION_DELAY_MS);
}

// Start the application when DOM is ready
init();

// Make validation available globally for CMS debugging
if (typeof window !== 'undefined') {
  window.CMS_DEBUG = {
    validateStructure: () => StructureValidator.validateStructure(),
    logStructure: () => StructureValidator.logStructure(),
    addDataAttributes: () => ContentManager.addDataAttributes(),
    getValidationIssues: () => StructureValidator.getValidationIssues(),
  };
}

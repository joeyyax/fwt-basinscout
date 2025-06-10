// Main application entry point
import '../styles/style.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Observer } from 'gsap/Observer';

// Import application modules
import { AppInitializer } from './app.js';
import { ScrollController } from './events.js';
import { ErrorHandler } from './utils/error-handler.js';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, Observer);

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

/**
 * Error Handler
 * Simple, centralized error detection and handling system
 * Integrates with existing logger and event systems
 */

import { log, EVENTS } from './logger.js';

export class ErrorHandler {
  static isInitialized = false;
  static errorCount = 0;
  static errorThreshold = 10; // Max errors before taking action

  /**
   * Initialize global error handling
   */
  static init() {
    if (this.isInitialized) return;

    // Handle uncaught JavaScript errors
    window.addEventListener('error', (event) => {
      this.handleError(event.error || new Error(event.message), {
        type: 'uncaught',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(event.reason, {
        type: 'unhandled-promise',
        promise: true,
      });
    });

    // Handle GSAP/animation errors specifically
    this.setupGSAPErrorHandling();

    this.isInitialized = true;
    log.info(EVENTS.APP, 'Error handler initialized');
  }

  /**
   * Handle errors consistently
   * @param {Error|string} error - Error object or message
   * @param {Object} context - Additional context about the error
   */
  static handleError(error, context = {}) {
    this.errorCount++;

    const errorInfo = {
      message: error?.message || error || 'Unknown error',
      stack: error?.stack,
      timestamp: Date.now(),
      context,
      count: this.errorCount,
    };

    // Log to our event system
    log.error(EVENTS.ERROR, 'Application error detected', errorInfo);

    // In development, also log to console for debugging
    if (this.isDevelopment()) {
      console.error('🚨 Error Handler:', errorInfo);
    }

    // Take action if too many errors
    if (this.errorCount >= this.errorThreshold) {
      this.handleCriticalError(errorInfo);
    }

    return errorInfo;
  }

  /**
   * Wrap functions to catch and handle errors automatically
   * @param {Function} fn - Function to wrap
   * @param {string} context - Context description
   * @returns {Function} Wrapped function
   */
  static wrap(fn, context = 'unknown') {
    return (...args) => {
      try {
        const result = fn.apply(this, args);

        // Handle async functions
        if (result && typeof result.catch === 'function') {
          return result.catch((error) => {
            this.handleError(error, { context, async: true });
            throw error; // Re-throw to maintain promise behavior
          });
        }

        return result;
      } catch (error) {
        this.handleError(error, { context });
        throw error; // Re-throw to maintain normal error flow
      }
    };
  }

  /**
   * Setup GSAP-specific error handling
   */
  static setupGSAPErrorHandling() {
    // Wrap common GSAP methods to catch animation errors
    if (typeof window !== 'undefined' && window.gsap) {
      const originalGsapTo = window.gsap.to;
      window.gsap.to = this.wrap(originalGsapTo, 'gsap.to');

      const originalGsapSet = window.gsap.set;
      window.gsap.set = this.wrap(originalGsapSet, 'gsap.set');
    }
  }

  /**
   * Handle critical errors (too many errors)
   */
  static handleCriticalError(errorInfo) {
    log.error(EVENTS.APP, 'Critical error threshold reached', {
      errorCount: this.errorCount,
      threshold: this.errorThreshold,
      lastError: errorInfo,
    });

    // In development, show a console warning
    if (this.isDevelopment()) {
      console.warn(`🔥 Critical: ${this.errorCount} errors detected`);
    }

    // Could add recovery actions here, like:
    // - Disable problematic features
    // - Reload the page
    // - Show user notification
  }

  /**
   * Manually report an error
   * @param {Error|string} error - Error to report
   * @param {Object} context - Additional context
   */
  static report(error, context = {}) {
    return this.handleError(error, { ...context, manual: true });
  }

  /**
   * Get error statistics
   */
  static getStats() {
    return {
      errorCount: this.errorCount,
      threshold: this.errorThreshold,
      isInitialized: this.isInitialized,
    };
  }

  /**
   * Reset error count (useful for testing)
   */
  static reset() {
    this.errorCount = 0;
  }

  /**
   * Check if running in development
   */
  static isDevelopment() {
    return (
      typeof window !== 'undefined' && window.location.hostname === 'localhost'
    );
  }
}

// Auto-initialize in browser environments
if (typeof window !== 'undefined') {
  // Initialize after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ErrorHandler.init());
  } else {
    ErrorHandler.init();
  }
}

// Export for manual use
export default ErrorHandler;

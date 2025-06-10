/**
 * Application Event System
 *
 * A centralized event system for logging, debugging, and monitoring
 * application behavior. Replaces console statements with a more
 * structured approach that can be configured for different environments.
 */

// Event types for categorization
export const EVENT_TYPES = {
  // Animation events
  ANIMATION_START: 'animation:start',
  ANIMATION_COMPLETE: 'animation:complete',
  ANIMATION_UPDATE: 'animation:update',
  ANIMATION_ERROR: 'animation:error',

  // Background system events
  BACKGROUND_LOAD: 'background:load',
  BACKGROUND_ERROR: 'background:error',
  BACKGROUND_TRANSFORM: 'background:transform',

  // Navigation events
  NAVIGATION_CHANGE: 'navigation:change',
  NAVIGATION_ERROR: 'navigation:error',

  // Panel events
  PANEL_TRANSITION: 'panel:transition',
  PANEL_SETUP: 'panel:setup',

  // Section events
  SECTION_ENTER: 'section:enter',
  SECTION_EXIT: 'section:exit',
  SECTION_PARSE: 'section:parse',

  // Media events
  MEDIA_LOAD: 'media:load',
  MEDIA_ERROR: 'media:error',
  MEDIA_TRANSITION: 'media:transition',

  // App lifecycle events
  APP_INIT: 'app:init',
  APP_READY: 'app:ready',
  APP_ERROR: 'app:error',

  // Stats/markers events
  STATS_ANIMATE: 'stats:animate',
  MARKER_ANIMATE: 'marker:animate',

  // Performance events
  PERFORMANCE_TIMING: 'performance:timing',

  // Debug events
  DEBUG_INFO: 'debug:info',
  DEBUG_WARN: 'debug:warn',
  DEBUG_ERROR: 'debug:error',
};

// Event severity levels
export const EVENT_LEVELS = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
};

class EventLogger {
  constructor() {
    this.listeners = new Map();
    this.config = {
      enabled: true,
      level: EVENT_LEVELS.DEBUG,
      console: true, // Whether to also log to console
      store: false, // Whether to store events in memory
      maxEvents: 1000, // Max events to store
    };
    this.events = [];
  }

  /**
   * Configure the event logger
   * @param {Object} options - Configuration options
   */
  configure(options = {}) {
    this.config = { ...this.config, ...options };
  }

  /**
   * Emit an event
   * @param {string} type - Event type from EVENT_TYPES
   * @param {Object} data - Event data
   * @param {string} level - Event level from EVENT_LEVELS
   * @param {string} source - Source component/module
   */
  emit(type, data = {}, level = EVENT_LEVELS.INFO, source = 'unknown') {
    if (!this.config.enabled) return;

    const event = {
      type,
      data,
      level,
      source,
      timestamp: Date.now(),
      id: this.generateId(),
    };

    // Store event if configured
    if (this.config.store) {
      this.events.push(event);
      if (this.events.length > this.config.maxEvents) {
        this.events.shift();
      }
    }

    // Log to console if configured
    if (this.config.console) {
      this.logToConsole(event);
    }

    // Notify listeners
    const typeListeners = this.listeners.get(type) || [];
    const allListeners = this.listeners.get('*') || [];

    [...typeListeners, ...allListeners].forEach((callback) => {
      try {
        callback(event);
      } catch (error) {
        // Only show errors in development
        if (
          typeof window !== 'undefined' &&
          window.location.hostname === 'localhost'
        ) {
          console.error('Event listener error:', error);
        }
      }
    });
  }

  /**
   * Listen for events
   * @param {string} type - Event type or '*' for all events
   * @param {Function} callback - Callback function
   */
  on(type, callback) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type).push(callback);
  }

  /**
   * Remove event listener
   * @param {string} type - Event type
   * @param {Function} callback - Callback function to remove
   */
  off(type, callback) {
    const listeners = this.listeners.get(type);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Get stored events
   * @param {string} type - Optional type filter
   * @param {string} level - Optional level filter
   * @returns {Array} Filtered events
   */
  getEvents(type = null, level = null) {
    let filtered = [...this.events];

    if (type) {
      filtered = filtered.filter((event) => event.type === type);
    }

    if (level) {
      filtered = filtered.filter((event) => event.level === level);
    }

    return filtered;
  }

  /**
   * Clear stored events
   */
  clearEvents() {
    this.events = [];
  }

  /**
   * Log event to console with appropriate styling
   * @param {Object} event - Event object
   */
  logToConsole(event) {
    const prefix = `[${event.source}] ${event.type}`;
    const data = Object.keys(event.data).length > 0 ? event.data : '';

    switch (event.level) {
      case EVENT_LEVELS.ERROR:
        console.error(prefix, data);
        break;
      case EVENT_LEVELS.WARN:
        console.warn(prefix, data);
        break;
      case EVENT_LEVELS.DEBUG:
        console.debug(prefix, data);
        break;
      default:
        console.log(prefix, data);
    }
  }

  /**
   * Generate unique event ID
   * @returns {string} Unique ID
   */
  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get event statistics
   * @returns {Object} Statistics object
   */
  getStats() {
    const stats = {
      total: this.events.length,
      byType: {},
      byLevel: {},
      bySource: {},
    };

    this.events.forEach((event) => {
      // Count by type
      stats.byType[event.type] = (stats.byType[event.type] || 0) + 1;

      // Count by level
      stats.byLevel[event.level] = (stats.byLevel[event.level] || 0) + 1;

      // Count by source
      stats.bySource[event.source] = (stats.bySource[event.source] || 0) + 1;
    });

    return stats;
  }
}

// Create global instance
export const eventLogger = new EventLogger();

// Convenience functions for common use cases
export const logAnimation = (type, data, source) => {
  eventLogger.emit(type, data, EVENT_LEVELS.DEBUG, source);
};

export const logBackground = (type, data, source) => {
  eventLogger.emit(type, data, EVENT_LEVELS.INFO, source);
};

export const logNavigation = (type, data, source) => {
  eventLogger.emit(type, data, EVENT_LEVELS.INFO, source);
};

export const logError = (type, data, source) => {
  eventLogger.emit(type, data, EVENT_LEVELS.ERROR, source);
};

export const logDebug = (type, data, source) => {
  eventLogger.emit(type, data, EVENT_LEVELS.DEBUG, source);
};

export const logInfo = (type, data, source) => {
  eventLogger.emit(type, data, EVENT_LEVELS.INFO, source);
};

export const logWarn = (type, data, source) => {
  eventLogger.emit(type, data, EVENT_LEVELS.WARN, source);
};

// Development helper - set up console commands for debugging
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  window.eventLogger = eventLogger;
  window.EVENT_TYPES = EVENT_TYPES;
  window.EVENT_LEVELS = EVENT_LEVELS;
}

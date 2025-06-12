/**
 * Simple Logger System
 * Clean, intuitive API for logging application events
 */

// Simple event categories
export const EVENTS = {
  // Animation events
  ANIMATION: 'animation',
  BACKGROUND: 'background',
  PANEL: 'panel',
  SECTION: 'section',
  TITLE: 'title',
  MEDIA: 'media',
  STATS: 'stats',

  // System events
  APP: 'app',
  NAVIGATION: 'navigation',
  LAYOUT: 'layout',
  ERROR: 'error',
  DEBUG: 'debug',
};

class SimpleLogger {
  constructor() {
    this.enabled = true;
    this.showInConsole =
      typeof window !== 'undefined' && window.location.hostname === 'localhost';
    this.events = [];
    this.maxEvents = 500;
  }

  // Store event
  _store(category, message, data = null, level = 'info') {
    if (!this.enabled) return;

    const event = {
      category,
      message,
      data,
      level,
      timestamp: Date.now(),
      time: new Date().toLocaleTimeString(),
    };

    this.events.push(event);
    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }

    if (this.showInConsole) {
      this._logToConsole(event);
    }
  }

  _logToConsole(event) {
    const prefix = `[${event.category}]`;
    const message = event.data ? `${event.message}:` : event.message;

    // For better debugging, stringify arrays and show key info for objects
    let logData = event.data;
    if (event.data) {
      if (Array.isArray(event.data)) {
        // For arrays, show length and first few items
        if (event.data.length > 0 && typeof event.data[0] === 'string') {
          logData = `[${event.data.length} items: ${event.data.slice(0, 3).join(', ')}${event.data.length > 3 ? '...' : ''}]`;
        } else {
          logData = `[${event.data.length} items]`;
        }
      } else if (typeof event.data === 'object' && event.data !== null) {
        // For objects, show key info inline
        if (event.data.issues) {
          // Special handling for validation issues
          logData = `Issues found: ${event.data.issues.join(' | ')}`;
        } else if (event.data.structure) {
          // Special handling for architecture info
          logData = 'Architecture details (expand to see full structure)';
        } else {
          // For other objects, show key count or stringify small objects (safely)
          const keys = Object.keys(event.data);
          if (keys.length <= 3) {
            try {
              logData = JSON.stringify(event.data, null, 2);
            } catch {
              // Handle circular references and DOM elements
              logData = `{${keys.length} properties: ${keys.join(', ')}} [Contains circular refs or DOM elements]`;
            }
          } else {
            logData = `{${keys.length} properties: ${keys.slice(0, 3).join(', ')}${keys.length > 3 ? '...' : ''}}`;
          }
        }
      }
    }

    switch (event.level) {
      case 'error':
        console.error(prefix, message, logData || '');
        if (event.data && typeof event.data === 'object') {
          console.error('Full data:', event.data);
        }
        break;
      case 'warn':
        console.warn(prefix, message, logData || '');
        if (event.data && typeof event.data === 'object') {
          console.warn('Full data:', event.data);
        }
        break;
      case 'debug':
        console.debug(prefix, message, logData || '');
        break;
      default:
        console.log(prefix, message, logData || '');
    }
  }

  // Simple logging methods
  info(category, message, data) {
    this._store(category, message, data, 'info');
  }

  debug(category, message, data) {
    this._store(category, message, data, 'debug');
  }

  warn(category, message, data) {
    this._store(category, message, data, 'warn');
  }

  error(category, message, data) {
    this._store(category, message, data, 'error');
  }

  // Get events
  getEvents(category = null) {
    if (category) {
      return this.events.filter((e) => e.category === category);
    }
    return [...this.events];
  }

  // Clear events
  clear() {
    this.events = [];
  }

  // Toggle logging
  toggle(enabled = !this.enabled) {
    this.enabled = enabled;
  }
}

// Create global instance
export const log = new SimpleLogger();

// Make available in dev tools
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  window.log = log;
  window.EVENTS = EVENTS; // Add a quick debug helper
  window.debugStructure = () => {
    console.log('=== STRUCTURE DEBUG ===');
    const sections = document.querySelectorAll('.section');
    const navDots = document.querySelectorAll(
      '.pagination-dot[data-type="section"]'
    );
    const panelDots = document.querySelectorAll(
      '.pagination-dot[data-type="panel"]'
    );
    console.log(`Sections found: ${sections.length}`);
    console.log(`Navigation dots found: ${navDots.length}`);
    console.log(`Panel dots found: ${panelDots.length}`);

    // Check if pagination is disabled globally
    const sectionsContainer = document.getElementById('sections-container');
    const usePagination =
      sectionsContainer?.getAttribute('data-use-pagination') !== 'false';

    if (!usePagination) {
      console.log('ℹ️  Section navigation disabled - skipping nav dots check');
    } else if (sections.length !== navDots.length) {
      console.warn('❌ Mismatch between sections and nav dots!');
    } else {
      console.log('✅ Section and nav dot counts match');
    }

    return {
      sections: sections.length,
      navDots: navDots.length,
      panelDots: panelDots.length,
    };
  };

  // Add navigation debug helper
  window.debugNavigation = () => {
    console.log('=== NAVIGATION DEBUG ===');
    const state = window.appState || {};
    console.log(
      `Current section: ${state.currentSection !== undefined ? state.currentSection : 'unknown'}`
    );
    console.log(
      `Current panel: ${state.currentPanel !== undefined ? state.currentPanel : 'unknown'}`
    );
    console.log(
      `Is animating: ${state.isAnimating !== undefined ? state.isAnimating : 'unknown'}`
    );
    console.log(
      `Can navigate: ${state.canNavigate ? state.canNavigate() : 'unknown'}`
    );
    console.log(
      `Last navigation time: ${state.lastNavigationTime !== undefined ? state.lastNavigationTime : 'unknown'}`
    );

    // Test navigation manually
    console.log('Testing navigation...');
    if (window.NavigationController) {
      console.log('NavigationController available');
    } else {
      console.warn('❌ NavigationController not available');
    }

    return state;
  };

  // Auto-run debug on localhost after page load
  setTimeout(() => {
    console.log('🚀 AUTO-DEBUG: Running structure and navigation debug...');
    window.debugStructure();
    window.debugNavigation();

    // Check map section specifically
    const mapSection = document.getElementById('map');
    if (mapSection) {
      const paginationContainer = mapSection.querySelector('.pagination-panel');
      const panels = mapSection.querySelectorAll('.panel');
      const containerSnippet = paginationContainer?.outerHTML
        ? `${paginationContainer.outerHTML.substring(0, 200)}...`
        : 'null';
      console.log('📍 MAP SECTION ANALYSIS:', {
        sectionFound: !!mapSection,
        usePagination: mapSection.dataset.usePagination,
        paginationContainer: !!paginationContainer,
        panelCount: panels.length,
        containerHTML: containerSnippet,
        panelDotsFound: document.querySelectorAll(
          '.pagination-dot[data-type="panel"][data-section-index="2"]'
        ).length,
      });
    }
  }, 2000); // Wait 2 seconds for initialization

  // Add manual donut animation trigger for testing
  window.testDonutAnimations = () => {
    console.log('🧪 Testing donut animations...');
    const statsContainers = document.querySelectorAll(
      '[data-stagger-children="true"]'
    );
    console.log(
      `Found ${statsContainers.length} containers with stagger-children`
    );

    import('../animations/panel-stats.js').then(
      ({ InlineStatsAnimationController }) => {
        statsContainers.forEach((container, index) => {
          console.log(`Testing container ${index}:`, container.className);
          InlineStatsAnimationController.animateDonutCharts(container);
        });
      }
    );
  };

  // Add donut reset function for testing
  window.resetDonuts = () => {
    console.log('🔄 Resetting donut charts...');
    import('../animations/panel-stats.js').then(
      ({ InlineStatsAnimationController }) => {
        InlineStatsAnimationController.initializeDonutCharts();
      }
    );
  };

  // Add 9th panel debug function for testing
  window.debug9thPanel = () => {
    console.log('🔍 DEBUG: Inspecting 9th panel stats...');

    // Check panel 9 HTML attributes
    const panels = document.querySelectorAll('.panel');
    const panel9 = Array.from(panels).find(
      (p) => p.dataset.stats && p.dataset.stats.includes('9a_Stats')
    );
    if (panel9) {
      console.log('✅ Panel 9 found:', {
        hasDataStats: !!panel9.dataset.stats,
        statsLength: panel9.dataset.stats?.length,
        statsPreview: `${panel9.dataset.stats?.substring(0, 100)}...`,
        mediaPath: panel9.dataset.media,
      });
    } else {
      console.log('❌ Panel 9 with 9a_Stats not found');
    }

    // Check for panels sharing the same media path
    const sharedMediaPath = '/img/8_Stage Maps/TFT-Map_8_3_1-with-Fields.png';
    const panelsWithSharedMedia = Array.from(panels).filter(
      (p) => p.dataset.media === sharedMediaPath
    );
    console.log(
      `🔍 Panels sharing media path ${sharedMediaPath}:`,
      panelsWithSharedMedia.length
    );
    panelsWithSharedMedia.forEach((panel, index) => {
      console.log(`  Panel ${index + 1}:`, {
        hasStats: !!panel.dataset.stats,
        statsPreview: panel.dataset.stats
          ? `${panel.dataset.stats.substring(0, 50)}...`
          : 'none',
        hasMarkers: !!panel.dataset.marker,
      });
    });

    // Check media stacks for 9th panel stats
    const mediaStacks = document.querySelectorAll('.media-stack');
    let found9thPanelStats = false;

    mediaStacks.forEach((stack, stackIndex) => {
      const mediaItems = stack.querySelectorAll('.media-item');
      mediaItems.forEach((item, itemIndex) => {
        const statsContainer = item.querySelector('.media-stats');
        if (statsContainer) {
          const statItems = statsContainer.querySelectorAll('.stat-item');
          const statsCount = statItems.length;
          const has9thPanelStats = Array.from(statItems).some((statItem) => {
            const img = statItem.querySelector('img');
            return img && img.src.includes('9a_Stats');
          });

          if (has9thPanelStats) {
            found9thPanelStats = true;
            console.log('✅ Found 9th panel stats in DOM:', {
              stackIndex,
              itemIndex,
              totalStatsCount: statsCount,
              statsContainerVisible: statsContainer.style.opacity !== '0',
              statsContainerOpacity:
                window.getComputedStyle(statsContainer).opacity,
            });

            // List all stat images for this media item
            statItems.forEach((statItem, statIndex) => {
              const img = statItem.querySelector('img');
              if (img) {
                console.log(`  Stat ${statIndex + 1}:`, {
                  src: img.src.split('/').pop(),
                  visible: statItem.style.opacity !== '0',
                  opacity: window.getComputedStyle(statItem).opacity,
                });
              }
            });
          } else if (statsCount > 0) {
            console.log(
              `📊 Media item ${itemIndex} has ${statsCount} stats (not 9th panel)`
            );
          }
        }
      });
    });

    if (!found9thPanelStats) {
      console.log('❌ No 9th panel stats found in media stacks');
    }
  };

  // Add donut inspection function
  window.inspectDonuts = () => {
    console.log('🔍 DONUT INSPECTION:');
    const donutCircles = document.querySelectorAll('.stat-donut-chart .circle');
    const statValues = document.querySelectorAll('.stat-value');

    console.log(`Found ${donutCircles.length} donut circles`);
    console.log(`Found ${statValues.length} stat values`);

    donutCircles.forEach((circle, index) => {
      const currentDashArray = circle.getAttribute('stroke-dasharray');
      const targetDashArray = circle.getAttribute('data-target-dasharray');
      const dataTargetValue = circle.getAttribute('data-target-value');
      const statValue = circle
        .closest('.stat')
        ?.querySelector('.stat-value')?.textContent;

      console.log(`Donut ${index}:`, {
        statValue,
        dataTargetValue,
        currentDashArray,
        targetDashArray,
        isInitialized: !!targetDashArray,
      });
    });

    statValues.forEach((value, index) => {
      const originalText = value.getAttribute('data-original-text');
      const currentText = value.textContent;

      console.log(`Stat value ${index}:`, {
        currentText,
        originalText,
        isInitialized: !!originalText,
      });
    });
  };
}

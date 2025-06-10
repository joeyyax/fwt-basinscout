/**
 * Media Stats Controller
 * Handles statistics display and animations on media items
 * Supports vertical stacking with accessibility features
 */

import { gsap } from 'gsap';
import { CONFIG } from '../constants.js';
import { log, EVENTS } from '../utils/logger.js';

export class MediaStatsController {
  /**
   * Parse stats data from panel data-stats attribute
   * Format: "image1.png,Alt text 1;image2.png,Alt text 2"
   * Alt text is optional: "image1.png;image2.png,Alt text 2"
   * @param {string} statsData - Comma/semicolon separated stats data
   * @returns {Array} Array of stat objects with path, alt, title properties
   */
  static parseStatsData(statsData) {
    if (!statsData) return [];

    try {
      // Split multiple stats by semicolon
      const statStrings = statsData.split(';');
      const stats = [];

      statStrings.forEach((statString) => {
        const parts = statString.trim().split(',');
        if (parts.length >= 1 && parts[0].trim()) {
          const imagePath = parts[0].trim();
          const altText =
            parts.length > 1 ? parts.slice(1).join(',').trim() : '';

          stats.push({
            path: imagePath,
            alt: altText || `Statistic image`, // Default alt text if none provided
            title: altText || '', // Use alt text as title for hover tooltip
          });
        }
      });

      return stats;
    } catch (error) {
      log.warn(EVENTS.MEDIA, 'Failed to parse stats data', {
        statsData,
        error,
      });
      return [];
    }
  }

  /**
   * Create an individual stat item element
   * @param {Object} stat - Stat object with path, alt, title properties
   * @param {number} statIndex - Index for data attributes
   * @returns {HTMLElement} Stat item element with image and accessibility attributes
   */
  static createStatItem(stat, statIndex) {
    const statItem = document.createElement('div');
    statItem.className = 'stat-item';
    statItem.dataset.statIndex = statIndex;

    const img = document.createElement('img');
    img.src = stat.path;
    img.alt = stat.alt; // Use provided alt text
    img.loading = 'lazy'; // Lazy load stats for performance

    // Add title attribute for hover tooltip if provided
    if (stat.title) {
      img.title = stat.title;
    }

    statItem.appendChild(img);

    // Set initial GSAP properties (hidden and positioned for entrance animation)
    gsap.set(statItem, {
      opacity: 0,
      x: 20, // Start slightly to the right
      scale: 0.9, // Start slightly smaller
    });

    return statItem;
  }

  /**
   * Create a stats container with vertically stacked stat items
   * @param {Array} stats - Array of stat objects
   * @returns {HTMLElement} Stats container element with all stat items
   */
  static createStatsContainer(stats) {
    const statsContainer = document.createElement('div');
    statsContainer.className = 'media-stats';

    // Create individual stat items
    stats.forEach((stat, statIndex) => {
      const statItem = this.createStatItem(stat, statIndex);
      statsContainer.appendChild(statItem);
    });

    // Set initial GSAP properties (hidden initially)
    gsap.set(statsContainer, {
      opacity: 0,
    });

    return statsContainer;
  }

  /**
   * Animate stats in for a media item
   * @param {HTMLElement} mediaItem - The media container element
   * @param {gsap.Timeline} timeline - GSAP timeline to add animations to
   * @param {number} delay - Delay before starting stats animations
   */
  static animateStatsIn(mediaItem, timeline, delay = 0) {
    const statsContainer = mediaItem.querySelector('.media-stats');
    if (!statsContainer) return;

    // Debug logging for 9th panel investigation
    const has9thPanelStats = Array.from(
      statsContainer.querySelectorAll('.stat-item img')
    ).some((img) => img.src.includes('9a_Stats'));
    if (has9thPanelStats) {
      log.debug(EVENTS.MEDIA, '🔍 DEBUG: Panel 9 stats animating IN', {
        mediaIndex: mediaItem.dataset.mediaIndex,
        delay,
        statsContainerOpacity: window.getComputedStyle(statsContainer).opacity,
      });
    }

    // Show stats container
    timeline.to(
      statsContainer,
      {
        opacity: 1,
        duration:
          CONFIG.ANIMATION.CONTENT_ENTER_DURATION *
          CONFIG.ANIMATION.MEDIA_STATS_DURATION_MULTIPLIER,
        ease: 'power2.out',
      },
      `+=${delay}`
    );

    // Animate individual stat items with stagger
    const statItems = statsContainer.querySelectorAll('.stat-item');
    if (statItems.length > 0) {
      timeline.fromTo(
        statItems,
        {
          opacity: 0,
          x: 20,
          scale: 0.9,
        },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration:
            CONFIG.ANIMATION.CONTENT_ENTER_DURATION *
            CONFIG.ANIMATION.MEDIA_STATS_DURATION_MULTIPLIER,
          ease: 'back.out(1.7)',
          stagger: CONFIG.ANIMATION.MEDIA_STATS_STAGGER_DELAY, // Use constant for consistent timing
        },
        `+=${CONFIG.ANIMATION.CONTENT_ENTER_DURATION * 0.1}` // Additional delay for stats
      );
    }

    log.debug(EVENTS.MEDIA, 'Stats animated in', {
      statCount: statItems.length,
      delay,
    });
  }

  /**
   * Animate stats out for a media item
   * @param {HTMLElement} mediaItem - The media container element
   * @param {gsap.Timeline} timeline - GSAP timeline to add animations to
   * @param {number} delay - Delay before starting stats animations
   */
  static animateStatsOut(mediaItem, timeline, delay = 0) {
    const statsContainer = mediaItem.querySelector('.media-stats');
    if (!statsContainer) return;

    // Debug logging for 9th panel investigation
    const has9thPanelStats = Array.from(
      statsContainer.querySelectorAll('.stat-item img')
    ).some((img) => img.src.includes('9a_Stats'));
    if (has9thPanelStats) {
      log.debug(EVENTS.MEDIA, '🔍 DEBUG: Panel 9 stats animating OUT', {
        mediaIndex: mediaItem.dataset.mediaIndex,
        delay,
        statsContainerOpacity: window.getComputedStyle(statsContainer).opacity,
      });
    }

    // Hide individual stat items first with stagger
    const statItems = statsContainer.querySelectorAll('.stat-item');
    if (statItems.length > 0) {
      timeline.to(
        statItems,
        {
          opacity: 0,
          x: 20,
          scale: 0.9,
          duration:
            CONFIG.ANIMATION.CONTENT_EXIT_DURATION *
            CONFIG.ANIMATION.MEDIA_STATS_DURATION_MULTIPLIER,
          ease: 'power2.in',
          stagger: CONFIG.ANIMATION.MEDIA_STATS_STAGGER_DELAY * 0.4, // Faster stagger for exit
        },
        delay
      );
    }

    // Hide stats container
    timeline.to(
      statsContainer,
      {
        opacity: 0,
        duration:
          CONFIG.ANIMATION.CONTENT_EXIT_DURATION *
          CONFIG.ANIMATION.MEDIA_STATS_DURATION_MULTIPLIER,
        ease: 'power2.in',
      },
      `+=${CONFIG.ANIMATION.CONTENT_EXIT_DURATION * 0.2}` // Hide container after items
    );

    log.debug(EVENTS.MEDIA, 'Stats animated out', {
      statCount: statItems.length,
      delay,
    });
  }

  /**
   * Add stats to a media container element
   * @param {HTMLElement} container - Media container to add stats to
   * @param {Array} stats - Array of stat objects
   */
  static addStatsToContainer(container, stats) {
    if (!stats || stats.length === 0) return;

    // Debug logging for 9th panel investigation
    if (stats.some((s) => s.path.includes('9a_Stats'))) {
      log.debug(
        EVENTS.MEDIA,
        '🔍 DEBUG: Panel 9 stats being added to container',
        {
          containerClassName: container.className,
          containerDataIndex: container.dataset.mediaIndex,
          statCount: stats.length,
          statPaths: stats.map((s) => s.path),
        }
      );
    }

    const statsContainer = this.createStatsContainer(stats);
    container.appendChild(statsContainer);

    // Debug logging for 9th panel investigation
    if (stats.some((s) => s.path.includes('9a_Stats'))) {
      log.debug(
        EVENTS.MEDIA,
        '🔍 DEBUG: Panel 9 stats container created and added',
        {
          statsContainerChildren: statsContainer.children.length,
          statsContainerHTML: `${statsContainer.outerHTML.substring(0, 200)}...`,
        }
      );
    }

    log.debug(EVENTS.MEDIA, 'Stats added to container', {
      statCount: stats.length,
    });
  }

  /**
   * Get stats container within a media item
   * @param {HTMLElement} mediaItem - Media container element
   * @returns {HTMLElement|null} Stats container element or null if not found
   */
  static getStatsContainer(mediaItem) {
    return mediaItem.querySelector('.media-stats');
  }

  /**
   * Remove stats from a media item
   * @param {HTMLElement} mediaItem - Media container element
   */
  static removeStatsFromContainer(mediaItem) {
    const statsContainer = this.getStatsContainer(mediaItem);
    if (statsContainer) {
      statsContainer.remove();
      log.debug(EVENTS.MEDIA, 'Stats removed from container');
    }
  }

  /**
   * Update stats visibility based on responsive breakpoints
   * @param {HTMLElement} mediaItem - Media container element
   * @param {boolean} isMobile - Whether the current viewport is mobile
   */
  static updateStatsVisibility(mediaItem, isMobile) {
    const statsContainer = this.getStatsContainer(mediaItem);
    if (!statsContainer) return;

    if (isMobile) {
      // Hide stats on mobile - they'll appear below media instead
      statsContainer.style.display = 'none';
    } else {
      // Show stats on tablet/desktop
      statsContainer.style.display = '';
    }

    log.debug(EVENTS.MEDIA, 'Stats visibility updated', { isMobile });
  }

  /**
   * Ensure stats are visible (for items that should remain visible)
   * @param {HTMLElement} mediaItem - Media container element
   */
  static ensureStatsVisible(mediaItem) {
    const statsContainer = this.getStatsContainer(mediaItem);
    if (!statsContainer) return;

    // Ensure stats container is visible
    gsap.set(statsContainer, { opacity: 1 });

    // Ensure all stat items are visible
    const statItems = statsContainer.querySelectorAll('.stat-item');
    if (statItems.length > 0) {
      gsap.set(statItems, { opacity: 1, x: 0, scale: 1 });
    }

    log.debug(EVENTS.MEDIA, 'Stats ensured visible', {
      statCount: statItems.length,
    });
  }
}

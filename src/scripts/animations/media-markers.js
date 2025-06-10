/**
 * Media Markers Controller
 * Handles marker positioning and animations on media items
 * Supports circle and square markers with coordinate positioning
 */

import { gsap } from 'gsap';
import { CONFIG } from '../constants.js';
import { log, EVENTS } from '../utils/logger.js';

export class MediaMarkersController {
  /**
   * Parse marker data from panel data-marker attribute
   * Format: "circle,21.5,38.5;square,44,67"
   * @param {string} markerData - Comma/semicolon separated marker data
   * @returns {Array} Array of marker objects with shape, x, y properties
   */
  static parseMarkerData(markerData) {
    if (!markerData) return [];

    // Split multiple markers by semicolon
    const markerStrings = markerData.split(';');
    const markers = [];

    markerStrings.forEach((markerString) => {
      const parts = markerString.trim().split(',');
      if (parts.length === 3) {
        const [shape, x, y] = parts;
        markers.push({
          shape: shape.trim(), // 'circle' or 'square'
          x: parseFloat(x.trim()), // x coordinate (percentage)
          y: parseFloat(y.trim()), // y coordinate (percentage)
        });
      }
    });

    return markers;
  }

  /**
   * Create a marker element positioned at specific coordinates
   * @param {Object} marker - Marker object with shape, x, y properties
   * @param {number} markerIndex - Index for data attributes
   * @returns {HTMLElement} Positioned marker element
   */
  static createMarkerElement(marker, markerIndex) {
    const markerElement = document.createElement('div');
    markerElement.className = `media-marker ${marker.shape}`;
    markerElement.dataset.markerIndex = markerIndex;

    // Position marker using percentage coordinates
    // CSS transform: translate(-50%, -50%) centers the marker on the coordinates
    markerElement.style.left = `${marker.x}%`;
    markerElement.style.top = `${marker.y}%`;

    // Set initial GSAP properties (hidden initially)
    gsap.set(markerElement, {
      opacity: 0,
      scale: 0.8, // Start slightly smaller for entrance animation
    });

    return markerElement;
  }

  /**
   * Animate markers in for a media item
   * @param {HTMLElement} mediaItem - The media container element
   * @param {gsap.Timeline} timeline - GSAP timeline to add animations to
   * @param {number} delay - Delay before starting marker animations
   */
  static animateMarkersIn(mediaItem, timeline, delay = 0) {
    const markers = mediaItem.querySelectorAll('.media-marker');
    if (markers.length === 0) return;

    timeline.fromTo(
      markers,
      {
        opacity: 0,
        scale: 0.8,
      },
      {
        opacity: 1,
        scale: 1,
        duration:
          CONFIG.ANIMATION.CONTENT_ENTER_DURATION *
          CONFIG.ANIMATION.MEDIA_MARKER_DURATION_MULTIPLIER,
        ease: 'back.out(1.7)',
        stagger: CONFIG.ANIMATION.MEDIA_MARKER_STAGGER_DELAY, // Use constant for consistent timing
      },
      `+=${delay}`
    );

    log.debug(EVENTS.MEDIA, 'Markers animated in', {
      markerCount: markers.length,
      delay,
    });
  }

  /**
   * Animate markers out for a media item
   * @param {HTMLElement} mediaItem - The media container element
   * @param {gsap.Timeline} timeline - GSAP timeline to add animations to
   * @param {number} delay - Delay before starting marker animations
   */
  static animateMarkersOut(mediaItem, timeline, delay = 0) {
    const markers = mediaItem.querySelectorAll('.media-marker');
    if (markers.length === 0) return;

    timeline.to(
      markers,
      {
        opacity: 0,
        scale: 0.8,
        duration:
          CONFIG.ANIMATION.CONTENT_EXIT_DURATION *
          CONFIG.ANIMATION.MEDIA_MARKER_DURATION_MULTIPLIER,
        ease: 'power2.in',
        stagger: CONFIG.ANIMATION.MEDIA_MARKER_STAGGER_DELAY * 0.5, // Faster stagger for exit
      },
      delay
    );

    log.debug(EVENTS.MEDIA, 'Markers animated out', {
      markerCount: markers.length,
      delay,
    });
  }

  /**
   * Add markers to a media container element
   * @param {HTMLElement} container - Media container to add markers to
   * @param {Array} markers - Array of marker objects
   */
  static addMarkersToContainer(container, markers) {
    if (!markers || markers.length === 0) return;

    markers.forEach((marker, markerIndex) => {
      const markerElement = this.createMarkerElement(marker, markerIndex);
      container.appendChild(markerElement);
    });

    log.debug(EVENTS.MEDIA, 'Markers added to container', {
      markerCount: markers.length,
    });
  }

  /**
   * Get all markers within a media item
   * @param {HTMLElement} mediaItem - Media container element
   * @returns {NodeList} All marker elements within the container
   */
  static getMarkersInContainer(mediaItem) {
    return mediaItem.querySelectorAll('.media-marker');
  }

  /**
   * Remove all markers from a media item
   * @param {HTMLElement} mediaItem - Media container element
   */
  static removeMarkersFromContainer(mediaItem) {
    const markers = this.getMarkersInContainer(mediaItem);
    markers.forEach((marker) => marker.remove());

    log.debug(EVENTS.MEDIA, 'Markers removed from container', {
      removedCount: markers.length,
    });
  }

  /**
   * Ensure markers are visible (for items that should remain visible)
   * @param {HTMLElement} mediaItem - Media container element
   */
  static ensureMarkersVisible(mediaItem) {
    const markers = this.getMarkersInContainer(mediaItem);
    if (markers.length === 0) return;

    gsap.set(markers, { opacity: 1, scale: 1 });

    log.debug(EVENTS.MEDIA, 'Markers ensured visible', {
      markerCount: markers.length,
    });
  }
}

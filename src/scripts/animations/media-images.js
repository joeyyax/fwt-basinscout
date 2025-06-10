/**
 * Media Images Controller
 * Handles media image creation, loading, and animations
 * Focuses on the core image display functionality within media stacks
 */

import { gsap } from 'gsap';
import { CONFIG } from '../constants.js';
import { log, EVENTS } from '../utils/logger.js';
import { HeightMatcher } from '../utils/height-matcher.js';
import { MediaMarkersController } from './media-markers.js';
import { MediaStatsController } from './media-stats.js';

export class MediaImagesController {
  /**
   * Create a media element (image with markers and stats)
   * @param {string} mediaPath - Path to the media file
   * @param {number} mediaIndex - Index of the media item in the stack
   * @param {number} totalMedia - Total number of media items
   * @param {Array} markers - Array of marker objects
   * @param {Array} stats - Array of stat objects
   * @returns {HTMLElement} Complete media container element
   */
  static createMediaElement(
    mediaPath,
    mediaIndex,
    totalMedia,
    markers = [],
    stats = []
  ) {
    const container = document.createElement('div');
    container.className = 'media-item';
    container.dataset.mediaIndex = mediaIndex;

    // Set z-index so later items (higher mediaIndex) stack on top
    // First item (index 0) should be at bottom with z-index 1
    // This creates the proper stacking order for the stack illusion
    const zIndex = mediaIndex + 1;

    // Create and configure the image element
    const img = this.createImageElement(mediaPath);
    container.appendChild(img);

    // Add markers using controller
    MediaMarkersController.addMarkersToContainer(container, markers);

    // Add stats using controller
    MediaStatsController.addStatsToContainer(container, stats);

    // Debug logging for stats creation
    if (
      stats &&
      stats.length > 0 &&
      stats.some((s) => s.path.includes('9a_Stats'))
    ) {
      log.debug(
        EVENTS.MEDIA,
        '🔍 DEBUG: Panel 9 media element created with stats',
        {
          mediaIndex,
          statsCount: stats.length,
          hasStatsContainer: !!container.querySelector('.media-stats'),
        }
      );
    }

    // Set initial GSAP properties with proper stacking z-index
    gsap.set(container, {
      opacity: 0,
      zIndex,
    });

    return container;
  }

  /**
   * Create an image element with proper configuration
   * @param {string} mediaPath - Path to the media file
   * @returns {HTMLElement} Configured image element
   */
  static createImageElement(mediaPath) {
    const isGif = mediaPath.match(/\.gif$/i);

    const img = document.createElement('img');
    img.src = mediaPath;
    img.alt = 'Panel media content';
    img.loading = 'lazy'; // Lazy load non-visible media

    // Auto-play GIFs when visible
    if (isGif) {
      img.dataset.autoplay = 'true';
      // Add specific class for animated content optimization
      img.classList.add('animated-content');
    }

    // Add responsive classes
    img.className = 'media-image';

    // Ensure image is always at full opacity - container handles visibility
    gsap.set(img, { opacity: 1 });

    return img;
  }

  /**
   * Animate a media image entrance
   * @param {HTMLElement} mediaItem - The media container element
   * @param {gsap.Timeline} timeline - GSAP timeline to add animations to
   * @param {number} delay - Delay before starting animation
   */
  static animateImageIn(mediaItem, timeline, delay = 0) {
    timeline.fromTo(
      mediaItem,
      {
        opacity: 0,
      },
      {
        opacity: 1,
        duration: CONFIG.ANIMATION.CONTENT_ENTER_DURATION * 0.8,
        ease: 'power2.out',
        onStart: () => {
          console.log('🎬 Media fade animation started:', {
            element: mediaItem,
            mediaIndex: mediaItem.dataset.mediaIndex,
          });
        },
        onComplete: () => {
          console.log(
            '✅ Media fade animation completed:',
            mediaItem.dataset.mediaIndex
          );
        },
      },
      delay
    );

    log.debug(EVENTS.MEDIA, 'Image animated in', {
      mediaIndex: mediaItem.dataset.mediaIndex,
      delay,
    });
  }

  /**
   * Animate a media image exit
   * @param {HTMLElement} mediaItem - The media container element
   * @param {gsap.Timeline} timeline - GSAP timeline to add animations to
   * @param {number} delay - Delay before starting animation
   */
  static animateImageOut(mediaItem, timeline, delay = 0) {
    timeline.to(
      mediaItem,
      {
        opacity: 0,
        duration: CONFIG.ANIMATION.CONTENT_EXIT_DURATION * 0.6,
        ease: 'power2.in',
      },
      delay
    );

    log.debug(EVENTS.MEDIA, 'Image animated out', {
      mediaIndex: mediaItem.dataset.mediaIndex,
      delay,
    });
  }

  /**
   * Preload media images for performance
   * @param {Array} mediaPaths - Array of media paths to preload
   */
  static preloadImages(mediaPaths) {
    mediaPaths.forEach((path) => {
      const img = new Image();
      img.src = path;
    });

    log.debug(EVENTS.MEDIA, 'Images preloaded', {
      count: mediaPaths.length,
    });
  }

  /**
   * Get the image element within a media item
   * @param {HTMLElement} mediaItem - Media container element
   * @returns {HTMLElement|null} Image element or null if not found
   */
  static getImageElement(mediaItem) {
    return mediaItem.querySelector('.media-image');
  }

  /**
   * Update image source for dynamic content
   * @param {HTMLElement} mediaItem - Media container element
   * @param {string} newPath - New image path
   */
  static updateImageSource(mediaItem, newPath) {
    const img = this.getImageElement(mediaItem);
    if (img) {
      img.src = newPath;
      log.debug(EVENTS.MEDIA, 'Image source updated', { newPath });
    }
  }

  /**
   * Handle image loading states and errors
   * @param {HTMLElement} mediaItem - Media container element
   */
  static setupImageLoadHandlers(mediaItem) {
    const img = this.getImageElement(mediaItem);
    if (!img) return;

    img.addEventListener('load', () => {
      mediaItem.classList.add('loaded');
      log.debug(EVENTS.MEDIA, 'Image loaded successfully', {
        src: img.src,
      });

      // Refresh height matching when media images load
      HeightMatcher.refresh();
    });

    img.addEventListener('error', () => {
      mediaItem.classList.add('error');
      log.warn(EVENTS.MEDIA, 'Image failed to load', {
        src: img.src,
      });
    });
  }
}

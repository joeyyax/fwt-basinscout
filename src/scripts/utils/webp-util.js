/**
 * WebP Image Utility
 * Handles WebP image loading with fallback to original format
 * Provides automatic format selection based on browser support
 */

import { log, EVENTS } from './logger.js';

export class WebPImageUtil {
  // Check if browser supports WebP
  static supportsWebP = null;

  // Initialize WebP support detection
  static async initializeWebPSupport() {
    if (this.supportsWebP !== null) return this.supportsWebP;

    return new Promise((resolve) => {
      const webp = new Image();
      webp.onload = webp.onerror = () => {
        this.supportsWebP = webp.height === 2;
        log.debug(EVENTS.MEDIA, 'WebP support detected', {
          supported: this.supportsWebP,
        });
        resolve(this.supportsWebP);
      };
      webp.src =
        'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });
  }

  /**
   * Get optimized image source with WebP fallback
   * @param {string} originalPath - Original image path
   * @returns {Promise<string>} Optimized image path
   */
  static async getOptimizedImageSrc(originalPath) {
    // Initialize WebP support if not already done
    await this.initializeWebPSupport();

    // Skip GIFs and other non-convertible formats
    if (this.isAnimatedFormat(originalPath)) {
      return originalPath;
    }

    // Try WebP version if supported
    if (this.supportsWebP) {
      const webpPath = this.getWebPPath(originalPath);
      const webpExists = await this.imageExists(webpPath);

      if (webpExists) {
        log.debug(EVENTS.MEDIA, 'Using WebP version', {
          original: originalPath,
          webp: webpPath,
        });
        return webpPath;
      }
    }

    // Fallback to original
    log.debug(EVENTS.MEDIA, 'Using original image format', {
      path: originalPath,
      reason: this.supportsWebP ? 'WebP not available' : 'WebP not supported',
    });
    return originalPath;
  }

  /**
   * Check if format should not be converted (GIF, SVG, etc.)
   * @param {string} path - Image path
   * @returns {boolean} True if format should be preserved
   */
  static isAnimatedFormat(path) {
    return /\.(gif|svg)$/i.test(path);
  }

  /**
   * Convert image path to WebP version
   * @param {string} originalPath - Original image path
   * @returns {string} WebP path
   */
  static getWebPPath(originalPath) {
    // Handle the .png.webp format you have
    return `${originalPath}.webp`;
  }

  /**
   * Check if image exists at given path
   * @param {string} imagePath - Path to check
   * @returns {Promise<boolean>} True if image exists
   */
  static async imageExists(imagePath) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = imagePath;
    });
  }

  /**
   * Preload optimized images for better performance
   * @param {Array<string>} imagePaths - Array of image paths to preload
   * @returns {Promise<Array<string>>} Array of optimized paths
   */
  static async preloadOptimizedImages(imagePaths) {
    const optimizedPaths = await Promise.all(
      imagePaths.map((path) => this.getOptimizedImageSrc(path))
    );

    // Preload the optimized images
    optimizedPaths.forEach((path) => {
      const img = new Image();
      img.src = path;
    });

    log.debug(EVENTS.MEDIA, 'Optimized images preloaded', {
      count: optimizedPaths.length,
    });

    return optimizedPaths;
  }

  /**
   * Create image element with optimized source
   * @param {string} originalPath - Original image path
   * @param {Object} options - Image element options
   * @returns {Promise<HTMLImageElement>} Image element with optimized source
   */
  static async createOptimizedImage(originalPath, options = {}) {
    const optimizedSrc = await this.getOptimizedImageSrc(originalPath);

    const img = document.createElement('img');
    img.src = optimizedSrc;
    img.alt = options.alt || 'Image';
    img.loading = options.loading || 'lazy';

    // Apply any additional options
    Object.entries(options).forEach(([key, value]) => {
      if (key !== 'alt' && key !== 'loading') {
        img[key] = value;
      }
    });

    return img;
  }
}

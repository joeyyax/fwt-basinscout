/**
 * Media Stack Controller
 * Main orchestrator for the media stack system
 * Coordinates media images, markers, stats, and backgrounds
 */

import { gsap } from 'gsap';
import { CONFIG } from '../constants.js';
import { appState } from '../state.js';
import { log, EVENTS } from '../utils/logger.js';
import { MediaImagesController } from './media-images.js';
import { MediaMarkersController } from './media-markers.js';
import { MediaStatsController } from './media-stats.js';
import { BackgroundController } from './backgrounds.js';

export class MediaStackController {
  // Store media mapping for quick lookups
  static mediaStackMap = new Map();

  // Initialize all media systems
  static initializeMedia() {
    // Initialize individual media systems
    this.initializeMediaStacks();
    BackgroundController.initializeBackgrounds();
  }

  // Initialize media stack components with panel-driven content
  static initializeMediaStacks() {
    const mediaStacks = document.querySelectorAll('.media-stack');

    mediaStacks.forEach((stack, stackIndex) => {
      // Clear any existing content
      stack.innerHTML = '';

      // Find all panels with data-media attributes in the same section
      const section = stack.closest('.section');
      if (!section) return;

      const panels = section.querySelectorAll('.panel[data-media]');
      const mediaItems = [];

      // Collect media items from all panels (no deduplication)
      panels.forEach((panel, panelIndex) => {
        const mediaPath = panel.dataset.media;
        if (mediaPath) {
          const statsData = panel.dataset.stats;
          const parsedStats = MediaStatsController.parseStatsData(statsData);
          const parsedMarkers = MediaMarkersController.parseMarkerData(
            panel.dataset.marker
          );

          // Debug logging for Panel 9 investigation
          if (statsData && statsData.includes('9a_Stats')) {
            log.debug(
              EVENTS.MEDIA,
              '🔍 DEBUG: Panel 9 found in media stack initialization',
              {
                panelIndex,
                mediaPath,
                statsData: statsData
                  ? `${statsData.substring(0, 100)}...`
                  : 'none',
                parsedStatsCount: parsedStats.length,
              }
            );
          }

          mediaItems.push({
            path: mediaPath,
            panelIndex,
            panel,
            markers: parsedMarkers,
            stats: parsedStats,
          });
        }
      });

      if (mediaItems.length === 0) {
        // Hide empty media stacks
        stack.style.display = 'none';
        log.debug(EVENTS.MEDIA, 'Empty media stack hidden', { stackIndex });
        return;
      }

      // Create stacked media elements using MediaImagesController
      mediaItems.forEach((mediaItem, mediaIndex) => {
        const mediaElement = MediaImagesController.createMediaElement(
          mediaItem.path,
          mediaIndex,
          mediaItems.length,
          mediaItem.markers,
          mediaItem.stats
        );
        stack.appendChild(mediaElement);
      });

      // Store mapping for panel-to-media lookups
      this.mediaStackMap.set(stackIndex, {
        mediaItems,
        currentMediaIndex: -1, // Start with -1 so first call to show index 0 will work
      });

      // Set up first media item but keep it hidden initially
      if (mediaItems.length > 0) {
        const firstItem = stack.querySelector(
          '.media-item[data-media-index="0"]'
        );
        if (firstItem) {
          // Prepare first item but keep it hidden
          gsap.set(firstItem, { opacity: 0 });
        }
      }

      // Only mark stack as initialized, but keep it hidden until section is active
      stack.classList.add('initialized');

      // Check if this section is currently active
      const sections = Array.from(document.querySelectorAll('.section'));
      const sectionIndex = sections.indexOf(section);
      const currentSectionIndex = appState.getCurrentSection();

      // Only prepare media stack for current section (don't show yet)
      if (sectionIndex === currentSectionIndex) {
        // Don't show immediately - will be shown when initial panel animates
        this.hideMediaStackForSection(sectionIndex);
      } else {
        this.hideMediaStackForSection(sectionIndex);
      }

      log.debug(
        EVENTS.MEDIA,
        'Media stack initialized with panel-driven content',
        {
          stackIndex,
          sectionIndex,
          currentSectionIndex,
          isVisible: sectionIndex === currentSectionIndex,
          mediaCount: mediaItems.length,
          mediaItems: mediaItems.map((item) => ({
            path: item.path,
            panelIndex: item.panelIndex,
          })),
        }
      );
    });
  }

  // Show media at specific index with true stacking animation
  static showMediaAtIndex(stackIndex, mediaIndex) {
    const stackData = this.mediaStackMap.get(stackIndex);
    if (!stackData || !stackData.mediaItems[mediaIndex]) return;

    const mediaStacks = document.querySelectorAll('.media-stack');
    const stack = mediaStacks[stackIndex];
    if (!stack) return;

    const mediaItems = stack.querySelectorAll('.media-item');
    const targetItem = mediaItems[mediaIndex];
    if (!targetItem) return;

    // Create timeline for smooth transition
    const timeline = gsap.timeline();

    // Update z-index for all items to create proper stacking order
    // Items at or below the target index should be visible (stacked)
    // Items above the target index should be hidden
    mediaItems.forEach((item, index) => {
      const shouldBeVisible = index <= mediaIndex;
      const newZIndex = index + 1; // First item (index 0) = z-index 1, second item = z-index 2, etc.

      // Update z-index immediately for proper stacking
      gsap.set(item, { zIndex: newZIndex });

      if (shouldBeVisible) {
        // Keep all items at or below target index visible with full opacity
        if (index < mediaIndex) {
          // Items below target stay visible but don't animate
          gsap.set(item, { opacity: 1 });

          // Hide markers and stats for items below target - only the active item should show them
          MediaMarkersController.animateMarkersOut(item, timeline, 0);
          MediaStatsController.animateStatsOut(item, timeline, 0);
        } else if (index === mediaIndex) {
          // Target item gets entrance animation using MediaImagesController
          MediaImagesController.animateImageIn(item, timeline);

          // Animate markers for the target item using controller
          MediaMarkersController.animateMarkersIn(
            item,
            timeline,
            CONFIG.ANIMATION.CONTENT_ENTER_DURATION * 0.3
          );

          // Animate stats for the target item using controller
          MediaStatsController.animateStatsIn(
            item,
            timeline,
            CONFIG.ANIMATION.CONTENT_ENTER_DURATION * 0.4
          );
        }
      } else {
        // Items above target index should be hidden using MediaImagesController
        MediaImagesController.animateImageOut(item, timeline);

        // Hide markers using controller
        MediaMarkersController.animateMarkersOut(item, timeline, 0);

        // Hide stats using controller
        MediaStatsController.animateStatsOut(item, timeline, 0);
      }
    });

    // Update current media index
    stackData.currentMediaIndex = mediaIndex;

    log.debug(EVENTS.MEDIA, 'Media transition completed', {
      stackIndex,
      mediaIndex,
      mediaPath: stackData.mediaItems[mediaIndex].path,
    });

    return timeline;
  }

  // Update media based on current panel (called during panel transitions)
  static updateMediaForPanel(sectionIndex, panelIndex) {
    const sections = appState.getSections();
    const section = sections[sectionIndex];
    if (!section) return;

    const mediaStacks = section.querySelectorAll('.media-stack');

    mediaStacks.forEach((stack, _stackIndex) => {
      const globalStackIndex = Array.from(
        document.querySelectorAll('.media-stack')
      ).indexOf(stack);
      const stackData = this.mediaStackMap.get(globalStackIndex);

      if (!stackData) return;

      // Find media item for current panel
      const mediaItem = stackData.mediaItems.find(
        (item) => item.panelIndex === panelIndex
      );
      if (mediaItem) {
        const mediaIndex = stackData.mediaItems.indexOf(mediaItem);
        if (mediaIndex !== stackData.currentMediaIndex) {
          this.showMediaAtIndex(globalStackIndex, mediaIndex);
        }
      }
    });
  }

  // Get media path for specific panel
  static getMediaForPanel(sectionIndex, panelIndex) {
    const sections = appState.getSections();
    const section = sections[sectionIndex];
    if (!section) return null;

    const panel = section.querySelectorAll('.panel')[panelIndex];
    return panel ? panel.dataset.media : null;
  }

  // Basic media stack transition (legacy compatibility)
  static animateMediaTransition(
    stackIndex,
    fromIndex,
    toIndex,
    _direction = 1
  ) {
    return this.showMediaAtIndex(stackIndex, toIndex);
  }

  // Show media stacks for a specific section
  static showMediaStackForSection(sectionIndex) {
    const sections = appState.getSections();
    const section = sections[sectionIndex];
    if (!section) return;

    const mediaStacks = section.querySelectorAll('.media-stack.initialized');
    mediaStacks.forEach((stack) => {
      // Use GSAP to smoothly show the media stack
      gsap.to(stack, {
        opacity: 1,
        visibility: 'visible',
        duration: 0.3,
        ease: 'power2.out',
      });
    });

    log.debug(EVENTS.MEDIA, 'Media stacks shown for section', {
      sectionIndex,
      stackCount: mediaStacks.length,
    });
  }

  // Hide media stacks for a specific section
  static hideMediaStackForSection(sectionIndex) {
    const sections = appState.getSections();
    const section = sections[sectionIndex];
    if (!section) return;

    const mediaStacks = section.querySelectorAll('.media-stack.initialized');
    mediaStacks.forEach((stack) => {
      // Use GSAP to smoothly hide the media stack
      gsap.to(stack, {
        opacity: 0,
        visibility: 'hidden',
        duration: 0.3,
        ease: 'power2.in',
      });
    });

    log.debug(EVENTS.MEDIA, 'Media stacks hidden for section', {
      sectionIndex,
      stackCount: mediaStacks.length,
    });
  }

  // Update media stack visibility when sections change
  static updateMediaStackVisibility(newSectionIndex, oldSectionIndex) {
    // Hide media stacks from old section
    if (oldSectionIndex !== undefined && oldSectionIndex !== newSectionIndex) {
      this.hideMediaStackForSection(oldSectionIndex);
    }

    // Show media stacks for new section
    this.showMediaStackForSection(newSectionIndex);

    log.debug(EVENTS.MEDIA, 'Media stack visibility updated', {
      newSectionIndex,
      oldSectionIndex,
    });
  }
}

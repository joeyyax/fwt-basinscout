/**
 * Animation Controller - Main Coordination Layer
 * Coordinates all animation components and maintains backward compatibility
 */

import { gsap } from 'gsap';
import { SectionAnimationController } from './sections.js';
import { PanelAnimationController } from './panels.js';
import { TitleAnimationController } from './titles.js';
import { MediaStackController } from './media-stack.js';
import { MediaImagesController as _MediaImagesController } from './media-images.js';
import { MediaMarkersController as _MediaMarkersController } from './media-markers.js';
import { MediaStatsController as _MediaStatsController } from './media-stats.js';
import { BackgroundController as _BackgroundController } from './backgrounds.js';
import { PaginationAnimationController } from './pagination.js';
import { ScrollInstruction } from '../utils/scroll-instruction.js';
// PanelStatsAnimationController imported but not used yet - keeping for future features
// eslint-disable-next-line no-unused-vars
import { PanelStatsAnimationController } from './panel-stats.js';
import { CONFIG } from '../constants.js';
import { appState } from '../state.js';
import { PaginationController } from '../pagination.js';
import { AccessibilityController } from '../accessibility.js';

// Re-export all animation controllers for granular access
export { SectionAnimationController } from './sections.js';
export { PanelAnimationController } from './panels.js';
export { TitleAnimationController } from './titles.js';
export { MediaStackController } from './media-stack.js';
export { MediaImagesController } from './media-images.js';
export { MediaMarkersController } from './media-markers.js';
export { MediaStatsController } from './media-stats.js';
export { BackgroundController } from './backgrounds.js';
export { PanelStatsAnimationController } from './panel-stats.js';
export { PaginationAnimationController } from './pagination.js';

/**
 * Main AnimationController - Coordinates all animation types
 * Maintains backward compatibility with existing code
 */
export class AnimationController {
  // Initialize all panels and sections for first load
  static initializePanels() {
    // Initialize pagination using the dedicated controller
    PaginationController.initializePagination();

    // Initialize all animation components
    SectionAnimationController.initializeSections();
    PanelAnimationController.initializePanels();
    TitleAnimationController.initializeTitles();
    MediaStackController.initializeMedia();
  }

  // Initialize panels only (without background system - for delayed content)
  static initializePanelsOnly() {
    // Initialize pagination using the dedicated controller
    PaginationController.initializePagination();

    // Initialize section classes (but skip background system which is handled separately)
    SectionAnimationController.initializeSectionClasses();

    // Initialize panels, titles, and media
    PanelAnimationController.initializePanels();
    TitleAnimationController.initializeTitles();
    MediaStackController.initializeMedia();
  }

  // Set up panel structure without triggering animations (for app initialization delay)
  static setupPanelStructureOnly() {
    // Initialize pagination using the dedicated controller
    PaginationController.initializePagination();

    // Set up panel structure without animations
    PanelAnimationController.setupPanelStructure();
    TitleAnimationController.initializeTitles();
    MediaStackController.initializeMedia();
  }

  // Animate in the initial panel content
  static animateInitialPanel() {
    return PanelAnimationController.animateInitialPanel();
  }

  // Get title animation type from section data attribute
  static getTitleAnimationType(sectionIndex) {
    return TitleAnimationController.getTitleAnimationType(sectionIndex);
  }

  // Animate title in based on animation type
  static animateTitleIn(sectionIndex, delay = 0) {
    return TitleAnimationController.animateTitleIn(sectionIndex, delay);
  }

  // Animate title out (always fade in place)
  static animateTitleOut(sectionIndex) {
    return TitleAnimationController.animateTitleOut(sectionIndex);
  }

  // Animate initial title
  static animateInitialTitle() {
    return TitleAnimationController.animateInitialTitle();
  }

  // Animate transition between panels/sections (MAIN COORDINATION METHOD)
  static animateToPanel(targetSectionIndex, targetPanelIndex, direction = 1) {
    if (!appState.canNavigate()) return;

    // Dismiss scroll instruction if visible when panel changes
    ScrollInstruction.dismissOnPanelChange();

    appState.setAnimating(true);

    // Store current state before updating for section transition logic
    const currentSectionIndex = appState.getCurrentSection();
    const currentPanelIndex = appState.getCurrentPanel();

    const sections = appState.getSections();
    const currentSectionEl = sections[currentSectionIndex];
    const targetSectionEl = sections[targetSectionIndex];
    const currentPanelElement =
      currentSectionEl.querySelectorAll('.panel')[currentPanelIndex];
    const targetPanelElement =
      targetSectionEl.querySelectorAll('.panel')[targetPanelIndex];

    // Get prose elements for current and target panels
    const currentProse = currentPanelElement.querySelector('.prose');
    const targetProse = targetPanelElement.querySelector('.prose');
    const currentProseElements = currentProse
      ? Array.from(currentProse.children)
      : [];
    const targetProseElements = targetProse
      ? Array.from(targetProse.children)
      : [];

    // Update state immediately for responsive feedback, but don't update pagination yet
    appState.setCurrentSection(targetSectionIndex);
    appState.setCurrentPanel(targetPanelIndex);

    // Update media stack visibility when sections change
    if (targetSectionIndex !== currentSectionIndex) {
      MediaStackController.updateMediaStackVisibility(
        targetSectionIndex,
        currentSectionIndex
      );
    }

    // Announce navigation change for screen readers
    AccessibilityController.announceNavigation(
      targetSectionIndex,
      targetPanelIndex
    );

    // Announce section title if section changed
    if (targetSectionIndex !== currentSectionIndex) {
      AccessibilityController.announceSectionTitle(targetSectionIndex);
    }

    // Create timeline for the transition
    const tl = gsap.timeline({
      onComplete: () => {
        // Clear any loading states and update pagination when animation completes
        PaginationController.clearLoadingStates();
        PaginationController.updatePagination();
        appState.setAnimating(false);
      },
    });

    // Handle section transitions (use stored current section, not updated state)
    if (targetSectionIndex !== currentSectionIndex) {
      const sectionTransitionData =
        SectionAnimationController.animateSectionTransition(
          tl,
          currentSectionEl,
          targetSectionEl
        );

      // Handle pagination for section transitions
      const containerId = `section-${targetSectionIndex}`;
      const paginationContainer =
        targetSectionEl.querySelector('.pagination-panel');

      if (paginationContainer) {
        if (!PaginationController.animatedContainers.has(containerId)) {
          // First time - initialize dots and animate in
          PaginationAnimationController.initializeDotsForAnimation(
            paginationContainer
          );
          PaginationAnimationController.animateContainerIn(
            paginationContainer,
            0.1
          );
          PaginationController.animatedContainers.add(containerId);
        } else {
          // Returning to previously visited section - restore visibility
          if (paginationContainer.style.display === 'none') {
            paginationContainer.style.display = 'flex';
            PaginationAnimationController.resetDotsToVisible(
              paginationContainer
            );
          }
        }
      }

      // Add title animations to the timeline
      tl.add(() => {
        TitleAnimationController.animateTitleOut(
          sectionTransitionData.currentSectionIndex
        );
      }, '<');

      tl.add(() => {
        TitleAnimationController.animateTitleIn(
          sectionTransitionData.targetSectionIndex,
          CONFIG.ANIMATION.TITLE_SEQUENCE_DELAY
        );
      }, '<+0.1');
    }

    // Animate content transition
    PanelAnimationController.animateContentTransition(
      tl,
      currentProseElements,
      targetProseElements,
      direction
    );

    return tl;
  }

  // Handle section fade transition with title animations (BACKWARD COMPATIBILITY)
  static animateSectionTransition(timeline, currentSection, targetSection) {
    return SectionAnimationController.animateSectionTransition(
      timeline,
      currentSection,
      targetSection
    );
  }

  // Handle content fade and slide transition (BACKWARD COMPATIBILITY)
  static animateContentTransition(
    timeline,
    currentElements,
    targetElements,
    direction
  ) {
    return PanelAnimationController.animateContentTransition(
      timeline,
      currentElements,
      targetElements,
      direction
    );
  }

  // Get background from section data attribute (BACKWARD COMPATIBILITY)
  static getSectionBackground(sectionIndex) {
    return SectionAnimationController.getSectionBackground(sectionIndex);
  }

  // Update background gradient (BACKWARD COMPATIBILITY)
  static updateBackground() {
    return SectionAnimationController.updateBackground();
  }

  // Basic media stack transition (if media stacks exist)
  static animateMediaTransition(stackIndex, fromIndex, toIndex, direction = 1) {
    return MediaStackController.animateMediaTransition(
      stackIndex,
      fromIndex,
      toIndex,
      direction
    );
  }

  // ===== UTILITY METHODS =====

  // Direct component access for advanced usage
  static get sections() {
    return SectionAnimationController;
  }

  static get panels() {
    return PanelAnimationController;
  }

  static get titles() {
    return TitleAnimationController;
  }

  static get media() {
    return MediaStackController;
  }

  static get pagination() {
    return PaginationAnimationController;
  }
}

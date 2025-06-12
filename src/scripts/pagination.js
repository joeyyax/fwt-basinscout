/**
 * Pagination component logic
 * Handles both section-level and panel-level pagination with CSS class-based state management
 */

import { CONFIG } from './constants.js';
import { appState } from './state.js';
import { PaginationAnimationController } from './animations/pagination.js';
import { log, EVENTS } from './utils/logger.js';
// AccessibilityController imported but not used yet - keeping for future features
// eslint-disable-next-line no-unused-vars
import { AccessibilityController } from './accessibility.js';

export class PaginationController {
  // Track which pagination containers have been animated to prevent re-animation
  static animatedContainers = new Set();

  // Initialize both section and panel pagination
  static initializePagination() {
    this.initializeSectionPagination();

    const sections = appState.getSections();
    sections.forEach((section, sectionIndex) => {
      const panels = section.querySelectorAll('.panel');
      this.initializePanelPagination(section, sectionIndex, panels.length);
    });
  }

  // Initialize section-level pagination
  static initializeSectionPagination() {
    const sectionsContainer = document.getElementById('sections-container');
    const useSectionPagination =
      sectionsContainer?.dataset.usePagination === 'true';
    if (!useSectionPagination) return;

    const sectionPaginationContainer = document.querySelector(
      '.pagination-section'
    );
    if (!sectionPaginationContainer) return;

    const sections = appState.getSections();
    const sectionCount = sections.length;

    // Clear any existing pagination
    sectionPaginationContainer.innerHTML = '';

    // Create section pagination indicators
    for (let i = 0; i < sectionCount; i++) {
      const indicator = document.createElement('div');
      indicator.className =
        'pagination-dot section-inactive hover-active click-feedback';
      indicator.dataset.sectionIndex = i;
      indicator.dataset.type = 'section';

      // Accessibility attributes
      indicator.setAttribute('role', 'button');
      indicator.setAttribute('aria-label', `Navigate to section ${i + 1}`);
      indicator.setAttribute('tabindex', '0');
      indicator.setAttribute('aria-pressed', 'false');

      // Add click handler for section navigation
      indicator.addEventListener('click', () => {
        // Prevent double clicks during animations
        if (appState.isCurrentlyAnimating()) return;

        // Show loading state immediately
        this.showLoadingState(i, 0, 'section');
        this.navigateToSectionDirect(i);
      });

      // Add keyboard support
      indicator.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          // Prevent double clicks during animations
          if (appState.isCurrentlyAnimating()) return;

          // Show loading state immediately
          this.showLoadingState(i, 0, 'section');
          this.navigateToSectionDirect(i);
        }
      });

      sectionPaginationContainer.appendChild(indicator);
    }
  }

  // Initialize panel-level pagination for a specific section
  static initializePanelPagination(section, sectionIndex, panelCount) {
    const usePagination = section.dataset.usePagination === 'true';
    if (!usePagination) return;

    const paginationContainer = section.querySelector('.pagination-panel');
    if (!paginationContainer) {
      // Debug missing pagination container in development
      if (
        typeof window !== 'undefined' &&
        window.location.hostname === 'localhost'
      ) {
        log.warn(
          EVENTS.DEBUG,
          `Section ${sectionIndex}: No .pagination-panel container found, but data-use-pagination="true"`
        );
      }
      return;
    }

    // Enhanced debug for map section
    if (
      typeof window !== 'undefined' &&
      window.location.hostname === 'localhost'
    ) {
      const sectionId = section.id || `section-${sectionIndex}`;
      log.debug(
        EVENTS.DEBUG,
        `Initializing panel pagination for ${sectionId} (index: ${sectionIndex}) with ${panelCount} panels`
      );

      if (sectionId === 'map') {
        const mapDebugData = {
          sectionIndex,
          panelCount,
          usePagination,
          paginationContainer: !!paginationContainer,
          containerHTML: `${paginationContainer.outerHTML.substring(0, 200)}...`,
        };
        log.debug(EVENTS.DEBUG, 'MAP SECTION DEBUG', mapDebugData);
      }
    }

    // Clear any existing pagination
    paginationContainer.innerHTML = '';

    // Create pagination indicators
    for (let i = 0; i < panelCount; i++) {
      const indicator = document.createElement('div');
      indicator.className = 'pagination-dot panel-inactive hover-active';
      indicator.dataset.sectionIndex = sectionIndex;
      indicator.dataset.panelIndex = i;
      indicator.dataset.type = 'panel';

      // Accessibility attributes
      indicator.setAttribute('role', 'button');
      indicator.setAttribute(
        'aria-label',
        `Navigate to panel ${i + 1} of section ${sectionIndex + 1}`
      );
      indicator.setAttribute('tabindex', '0');
      indicator.setAttribute('aria-pressed', 'false');

      // Add click handler
      indicator.addEventListener('click', () => {
        // Prevent double clicks during animations
        if (appState.isCurrentlyAnimating()) return;

        // Navigate directly without loading state for panels
        this.navigateToPanelDirect(sectionIndex, i);
      });

      // Add keyboard support
      indicator.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          // Prevent double clicks during animations
          if (appState.isCurrentlyAnimating()) return;

          // Navigate directly without loading state for panels
          this.navigateToPanelDirect(sectionIndex, i);
        }
      });

      paginationContainer.appendChild(indicator);
    }

    // Initialize dots for animation after creation
    PaginationAnimationController.initializeDotsForAnimation(
      paginationContainer
    );
  }

  // Update all pagination indicators
  static updatePagination() {
    const navDots = appState.getNavDots();

    // Update legacy nav dots for backward compatibility
    if (navDots && navDots.length > 0) {
      navDots.forEach((dot, index) => {
        if (index === appState.getCurrentSection()) {
          dot.classList.add('active');
          dot.classList.remove('inactive');
        } else {
          dot.classList.add('inactive');
          dot.classList.remove('active');
        }
      });
    }

    // Update both section and panel pagination indicators
    this.updateSectionPagination();
    this.updatePanelPagination();
  }

  // Update section pagination indicators
  static updateSectionPagination() {
    const currentSection = appState.getCurrentSection();

    // Update section pagination dots
    document
      .querySelectorAll('.pagination-dot[data-type="section"]')
      .forEach((dot) => {
        const dotSection = parseInt(dot.dataset.sectionIndex);

        if (dotSection === currentSection) {
          dot.classList.remove('section-inactive');
          dot.classList.add('section-active');
          dot.setAttribute('aria-pressed', 'true');
        } else {
          dot.classList.remove('section-active');
          dot.classList.add('section-inactive');
          dot.setAttribute('aria-pressed', 'false');
        }
      });
  }

  // Update panel pagination indicators
  static updatePanelPagination() {
    const currentSection = appState.getCurrentSection();
    const currentPanel = appState.getCurrentPanel();

    // Enhanced debug pagination update in development
    if (
      typeof window !== 'undefined' &&
      window.location.hostname === 'localhost'
    ) {
      const panelContainers = document.querySelectorAll('.pagination-panel');
      const panelDots = document.querySelectorAll(
        '.pagination-dot[data-type="panel"]'
      );
      const sections = appState.getSections();
      const currentSectionEl = sections[currentSection];
      const currentSectionId =
        currentSectionEl?.id || `section-${currentSection}`;

      const updateData = {
        currentSection,
        currentPanel,
        currentSectionId,
        panelContainers: panelContainers.length,
        panelDots: panelDots.length,
      };
      log.debug(EVENTS.DEBUG, 'Updating panel pagination', updateData);
    }

    // Update panel pagination dots
    document
      .querySelectorAll('.pagination-dot[data-type="panel"]')
      .forEach((dot) => {
        const dotSection = parseInt(dot.dataset.sectionIndex);
        const dotPanel = parseInt(dot.dataset.panelIndex);

        if (dotSection === currentSection && dotPanel === currentPanel) {
          dot.classList.remove('panel-inactive');
          dot.classList.add('panel-active');
          dot.setAttribute('aria-pressed', 'true');
          dot.style.display = ''; // Reset display to default

          // Show the pagination container for current section (animation handled at section level)
          const container = dot.closest('.pagination-panel');
          if (container && container.style.display === 'none') {
            container.style.display = 'flex';
            PaginationAnimationController.resetDotsToVisible(container);
          }
        } else if (dotSection === currentSection) {
          // Show inactive dots for current section only
          dot.classList.remove('panel-active');
          dot.classList.add('panel-inactive');
          dot.setAttribute('aria-pressed', 'false');
          dot.style.display = ''; // Reset display to default

          // Show the pagination container for current section (animation handled at section level)
          const container = dot.closest('.pagination-panel');
          if (container && container.style.display === 'none') {
            container.style.display = 'flex';
            PaginationAnimationController.resetDotsToVisible(container);
          }
        } else {
          // Hide entire containers for non-current sections, except if they've been visited before
          const container = dot.closest('.pagination-panel');
          if (container && container.style.display !== 'none') {
            const containerSectionIndex = parseInt(dot.dataset.sectionIndex);
            const containerId = `section-${containerSectionIndex}`;

            // Only hide if this section hasn't been visited before
            if (!this.animatedContainers.has(containerId)) {
              PaginationAnimationController.animateContainerOut(container, 0);
            }
          }
        }
      });
  }

  // Navigate directly to a specific section (for section pagination clicks)
  static navigateToSectionDirect(targetSectionIndex) {
    if (appState.isCurrentlyAnimating()) return;

    const currentSection = appState.getCurrentSection();

    // Don't animate if we're already on this section
    if (targetSectionIndex === currentSection) {
      // Clear loading state if we're already here
      this.clearLoadingStates();
      return;
    }

    // Import AnimationController dynamically to avoid circular dependencies
    import('./animations.js').then(({ AnimationController }) => {
      // Determine direction for animation
      const direction = targetSectionIndex > currentSection ? 1 : -1;

      // Navigate to the first panel of the target section
      AnimationController.animateToPanel(targetSectionIndex, 0, direction);
    });
  }

  // Navigate directly to a specific panel (for panel pagination clicks)
  static navigateToPanelDirect(targetSectionIndex, targetPanelIndex) {
    if (appState.isCurrentlyAnimating()) return;

    const currentSection = appState.getCurrentSection();
    const currentPanel = appState.getCurrentPanel();

    // Don't animate if we're already on this panel
    if (
      targetSectionIndex === currentSection &&
      targetPanelIndex === currentPanel
    ) {
      // Clear loading state if we're already here
      this.clearLoadingStates();
      return;
    }

    // Import AnimationController dynamically to avoid circular dependencies
    import('./animations.js').then(({ AnimationController }) => {
      // Determine direction for animation
      let direction = 1;
      if (targetSectionIndex === currentSection) {
        // Same section, compare panels
        direction = targetPanelIndex > currentPanel ? 1 : -1;
      } else {
        // Different section, compare sections
        direction = targetSectionIndex > currentSection ? 1 : -1;
      }

      // Perform the animation
      AnimationController.animateToPanel(
        targetSectionIndex,
        targetPanelIndex,
        direction
      );
    });
  }

  // Add immediate visual feedback for responsive pagination
  static addImmediateFeedback(element) {
    element.classList.add('immediate-feedback');

    // Remove feedback class after animation
    setTimeout(() => {
      element.classList.remove('immediate-feedback');
    }, CONFIG.UI.PAGINATION_CLICK_FEEDBACK_DURATION_MS);
  }

  // Show loading state for a pagination dot
  static showLoadingState(sectionIndex, panelIndex, type = 'panel') {
    const selector =
      type === 'section'
        ? `.pagination-dot[data-type="section"][data-section-index="${sectionIndex}"]`
        : `.pagination-dot[data-type="panel"][data-section-index="${sectionIndex}"][data-panel-index="${panelIndex}"]`;

    const dot = document.querySelector(selector);
    if (dot) {
      // Remove any active states
      dot.classList.remove(
        'panel-active',
        'section-active',
        'panel-inactive',
        'section-inactive'
      );
      // Add loading state
      dot.classList.add('loading');
      dot.setAttribute('aria-pressed', 'true');
      dot.setAttribute('aria-live', 'polite');
      dot.setAttribute('aria-label', `Loading ${type} ${panelIndex + 1}...`);
    }
  }

  // Clear loading state from all pagination dots
  static clearLoadingStates() {
    document.querySelectorAll('.pagination-dot.loading').forEach((dot) => {
      dot.classList.remove('loading');
      dot.removeAttribute('aria-live');
      // Restore original aria-label
      const type = dot.dataset.type;
      const sectionIndex = parseInt(dot.dataset.sectionIndex);
      const panelIndex = parseInt(dot.dataset.panelIndex);

      if (type === 'section') {
        dot.setAttribute(
          'aria-label',
          `Navigate to section ${sectionIndex + 1}`
        );
      } else {
        dot.setAttribute(
          'aria-label',
          `Navigate to panel ${panelIndex + 1} of section ${sectionIndex + 1}`
        );
      }
    });
  }

  // Get pagination container for a specific section
  static getPaginationContainer(sectionIndex, type = 'panel') {
    const sections = appState.getSections();
    const section = sections[sectionIndex];

    if (!section) return null;

    if (type === 'section') {
      return document.querySelector('.pagination-section');
    } else {
      return section.querySelector('.pagination-panel');
    }
  }

  // Check if pagination is enabled for a section
  static isPaginationEnabled(sectionIndex, type = 'panel') {
    if (type === 'section') {
      const sectionsContainer = document.getElementById('sections-container');
      return sectionsContainer?.dataset.usePagination === 'true';
    } else {
      const sections = appState.getSections();
      const section = sections[sectionIndex];
      return section?.dataset.usePagination === 'true';
    }
  }

  // Get total pagination dots for a section
  static getPaginationCount(sectionIndex, type = 'panel') {
    if (type === 'section') {
      return appState.getTotalSections();
    } else {
      return appState.getPanelsInSection(sectionIndex);
    }
  }

  // Reset all pagination to initial state
  static resetPagination() {
    // Clear any loading states first
    this.clearLoadingStates();

    // Reset animation tracking
    this.animatedContainers.clear();

    // Reset section pagination
    document
      .querySelectorAll('.pagination-dot[data-type="section"]')
      .forEach((dot, index) => {
        if (index === 0) {
          dot.classList.remove('section-inactive');
          dot.classList.add('section-active');
        } else {
          dot.classList.remove('section-active');
          dot.classList.add('section-inactive');
        }
      });

    // Reset panel pagination
    document
      .querySelectorAll('.pagination-dot[data-type="panel"]')
      .forEach((dot) => {
        const dotSection = parseInt(dot.dataset.sectionIndex);
        const dotPanel = parseInt(dot.dataset.panelIndex);

        if (dotSection === 0 && dotPanel === 0) {
          dot.classList.remove('panel-inactive');
          dot.classList.add('panel-active');
        } else {
          dot.classList.remove('panel-active');
          dot.classList.add('panel-inactive');
        }
      });

    // Reset legacy nav dots
    const navDots = appState.getNavDots();
    if (navDots && navDots.length > 0) {
      navDots.forEach((dot, index) => {
        if (index === 0) {
          dot.classList.add('active');
          dot.classList.remove('inactive');
        } else {
          dot.classList.add('inactive');
          dot.classList.remove('active');
        }
      });
    }
  }
}

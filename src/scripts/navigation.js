// Navigation logic and control
import { appState } from './state.js';
import { AnimationController } from './animations.js';
import { CONFIG } from './constants.js';
import { ErrorHandler } from './utils/error-handler.js';
import { log, EVENTS } from './utils/logger.js';

export class NavigationController {
  // Check if device is mobile/touch enabled
  static isMobileDevice() {
    if (typeof window === 'undefined') return false;

    return (
      'ontouchstart' in window ||
      (typeof window.navigator !== 'undefined' &&
        window.navigator.maxTouchPoints > 0) ||
      window.innerWidth <= 1024
    );
  }

  // Get appropriate navigation cooldown for device type
  static getNavigationCooldown() {
    // Significantly reduce cooldown for mobile devices for better responsiveness
    return this.isMobileDevice()
      ? CONFIG.NAVIGATION_COOLDOWN_MS * 0.5 // 100ms for mobile (50% of 200ms)
      : CONFIG.NAVIGATION_COOLDOWN_MS; // 200ms for desktop
  }

  // Navigate in a specific direction (wrapped for error handling)
  static navigate(direction) {
    return ErrorHandler.wrap(() => {
      // Use mobile-responsive cooldown
      const now = Date.now();
      const requiredCooldown = this.getNavigationCooldown();

      if (
        appState.isAnimating ||
        now - appState.lastNavigationTime < requiredCooldown
      ) {
        // Debug navigation blocks in development only
        if (
          typeof window !== 'undefined' &&
          window.location.hostname === 'localhost'
        ) {
          const blockData = {
            isAnimating: appState.isAnimating,
            timeSinceLastNav: now - appState.lastNavigationTime,
            cooldownRequired: requiredCooldown,
            isMobile: this.isMobileDevice(),
          };
          log.debug(EVENTS.NAVIGATION, 'Navigation blocked', blockData);
        }
        return;
      }

      appState.setLastNavigationTime(now);

      if (direction > 0) {
        this.navigateForward();
      } else {
        this.navigateBackward();
      }
    }, 'NavigationController.navigate')();
  }

  // Navigate forward (down/right)
  static navigateForward() {
    const currentSection = appState.getCurrentSection();
    const currentPanel = appState.getCurrentPanel();
    const currentSectionPanels = appState.getPanelsInSection(currentSection);

    // Debug navigation in development
    if (
      typeof window !== 'undefined' &&
      window.location.hostname === 'localhost'
    ) {
      const forwardData = {
        currentSection,
        currentPanel,
        currentSectionPanels,
        totalSections: appState.getTotalSections(),
      };
      log.debug(EVENTS.NAVIGATION, 'Navigate Forward', forwardData);
    }

    if (currentPanel < currentSectionPanels - 1) {
      // Move to next panel in current section
      this.goToPanel(currentSection, currentPanel + 1, 1);
    } else if (currentSection < appState.getTotalSections() - 1) {
      // Move to first panel of next section
      this.goToPanel(currentSection + 1, 0, 1);
    }
  }

  // Navigate backward (up/left)
  static navigateBackward() {
    const currentSection = appState.getCurrentSection();
    const currentPanel = appState.getCurrentPanel();

    // Debug navigation in development
    if (
      typeof window !== 'undefined' &&
      window.location.hostname === 'localhost'
    ) {
      const backwardData = {
        currentSection,
        currentPanel,
        totalSections: appState.getTotalSections(),
      };
      log.debug(EVENTS.NAVIGATION, 'Navigate Backward', backwardData);
    }

    if (currentPanel > 0) {
      // Move to previous panel in current section
      this.goToPanel(currentSection, currentPanel - 1, -1);
    } else if (currentSection > 0) {
      // Move to last panel of previous section
      const previousSection = currentSection - 1;
      const previousSectionPanels =
        appState.getPanelsInSection(previousSection);
      this.goToPanel(previousSection, previousSectionPanels - 1, -1);
    }
  }

  // Navigate to a specific panel
  static goToPanel(sectionIndex, panelIndex, direction = 1) {
    AnimationController.animateToPanel(sectionIndex, panelIndex, direction);
  }

  // Navigate to a specific section (used by nav dots)
  static goToSection(sectionIndex) {
    if (
      !appState.canNavigate() ||
      sectionIndex === appState.getCurrentSection()
    ) {
      return;
    }

    const now = Date.now();
    appState.setLastNavigationTime(now);
    this.goToPanel(sectionIndex, 0, 1);
  }

  // Throttled navigation wrapper
  static throttledNavigate(direction) {
    if (appState.canNavigate()) {
      this.navigate(direction);
    }
  }
}

// Make available globally for debugging
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  window.NavigationController = NavigationController;
}

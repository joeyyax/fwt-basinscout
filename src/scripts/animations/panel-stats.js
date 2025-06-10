/**
 * Panel Stats Animation Controller
 * Handles donut chart animations and panel-specific statistical effects
 * Renamed from inline-stats for better semantic clarity
 */

import { gsap } from 'gsap';
import { CONFIG } from '../constants.js';
import { log, EVENTS } from '../utils/logger.js';
import { ErrorHandler } from '../utils/error-handler.js';

export class PanelStatsAnimationController {
  // Initialize all donut charts to 0 progress
  static initializeDonutCharts() {
    try {
      const donutCircles = document.querySelectorAll(
        '.stat-donut-chart .circle'
      );
      donutCircles.forEach((circle) => {
        // Read target value from data attribute instead of stroke-dasharray
        const targetValue = circle.getAttribute('data-target-value');
        const existingTarget = circle.getAttribute('data-target-dasharray');

        if (targetValue && !existingTarget) {
          // Store the data-driven target value
          const targetDashArray = `${targetValue}, 100`;
          circle.setAttribute('data-target-dasharray', targetDashArray);

          // Debug in development
          if (
            typeof window !== 'undefined' &&
            window.location.hostname === 'localhost'
          ) {
            // eslint-disable-next-line no-console
            console.debug(
              `🎯 Panel donut chart initialized from data-target-value:`,
              {
                targetValue,
                targetDashArray,
                circleElement:
                  circle.parentElement.parentElement
                    .closest('.stat')
                    ?.querySelector('.stat-value')?.textContent || 'unknown',
              }
            );
          }
        }

        // Always set to 0 progress for animation starting point
        circle.setAttribute('stroke-dasharray', '0, 100');
      });

      log.debug(EVENTS.ANIMATION, 'Panel donut charts initialized', {
        count: donutCircles.length,
      });
    } catch (error) {
      ErrorHandler.handleError(
        error,
        'Failed to initialize panel donut charts'
      );
    }
  }

  // Get the target value for a donut chart
  static getDonutChartTarget(circle) {
    try {
      const targetDashArray = circle.getAttribute('data-target-dasharray');
      if (!targetDashArray) return null;

      const [targetValue] = targetDashArray.split(',').map((v) => v.trim());
      return parseFloat(targetValue);
    } catch (error) {
      ErrorHandler.handleError(error, 'Failed to get donut chart target value');
      return null;
    }
  }

  // Animate donut charts to their target values
  static animateDonutCharts(container = document) {
    try {
      const donutCircles = container.querySelectorAll(
        '.stat-donut-chart .circle'
      );

      donutCircles.forEach((circle, index) => {
        const targetValue = this.getDonutChartTarget(circle);
        if (targetValue === null) return;

        // Create a timeline for each donut chart
        const timeline = gsap.timeline({
          delay: index * CONFIG.ANIMATION.DONUT_STAGGER_DELAY,
        });

        // Animate the donut chart progress
        timeline.to(circle, {
          duration: CONFIG.ANIMATION.DONUT_ANIMATION_DURATION,
          ease: CONFIG.ANIMATION.DONUT_EASE,
          attr: {
            'stroke-dasharray': `${targetValue}, 100`,
          },
          onUpdate() {
            // Optional: Add visual feedback during animation
            const currentProgress = gsap.getProperty(this.targets()[0], 'attr');
            log.debug(EVENTS.ANIMATION, 'Donut chart progress', {
              index,
              progress: currentProgress,
            });
          },
        });

        log.debug(EVENTS.ANIMATION, 'Panel donut chart animated', {
          index,
          targetValue,
        });
      });
    } catch (error) {
      ErrorHandler.handleError(error, 'Failed to animate panel donut charts');
    }
  }

  // Reset donut charts to 0 progress
  static resetDonutCharts(container = document) {
    try {
      const donutCircles = container.querySelectorAll(
        '.stat-donut-chart .circle'
      );

      donutCircles.forEach((circle) => {
        gsap.set(circle, {
          attr: {
            'stroke-dasharray': '0, 100',
          },
        });
      });

      log.debug(EVENTS.ANIMATION, 'Panel donut charts reset', {
        count: donutCircles.length,
      });
    } catch (error) {
      ErrorHandler.handleError(error, 'Failed to reset panel donut charts');
    }
  }

  // Animate panel stats entrance
  static animateStatsEnter(statsContainer, delay = 0) {
    try {
      if (!statsContainer) return;

      const statItems = statsContainer.querySelectorAll('.stat');

      const timeline = gsap.timeline({ delay });

      // Animate container
      timeline.fromTo(
        statsContainer,
        {
          opacity: 0,
          y: 20,
        },
        {
          opacity: 1,
          y: 0,
          duration: CONFIG.ANIMATION.CONTENT_ENTER_DURATION,
          ease: 'power2.out',
        }
      );

      // Animate individual stat items
      if (statItems.length > 0) {
        timeline.fromTo(
          statItems,
          {
            opacity: 0,
            scale: 0.9,
          },
          {
            opacity: 1,
            scale: 1,
            duration: CONFIG.ANIMATION.CONTENT_ENTER_DURATION * 0.8,
            ease: 'back.out(1.7)',
            stagger: 0.1,
          },
          '-=0.3'
        );
      }

      // Animate donut charts after stats appear
      timeline.call(() => {
        this.animateDonutCharts(statsContainer);
      });

      return timeline;
    } catch (error) {
      ErrorHandler.handleError(error, 'Failed to animate panel stats entrance');
      return null;
    }
  }

  // Animate panel stats exit
  static animateStatsExit(statsContainer, delay = 0) {
    try {
      if (!statsContainer) return;

      const statItems = statsContainer.querySelectorAll('.stat');

      const timeline = gsap.timeline({ delay });

      // Reset donut charts first
      this.resetDonutCharts(statsContainer);

      // Animate individual stat items out
      if (statItems.length > 0) {
        timeline.to(statItems, {
          opacity: 0,
          scale: 0.9,
          duration: CONFIG.ANIMATION.CONTENT_EXIT_DURATION * 0.6,
          ease: 'power2.in',
          stagger: 0.05,
        });
      }

      // Animate container out
      timeline.to(
        statsContainer,
        {
          opacity: 0,
          y: -10,
          duration: CONFIG.ANIMATION.CONTENT_EXIT_DURATION,
          ease: 'power2.in',
        },
        '-=0.2'
      );

      return timeline;
    } catch (error) {
      ErrorHandler.handleError(error, 'Failed to animate panel stats exit');
      return null;
    }
  }

  // Get all panel stats containers in a section
  static getPanelStatsContainers(section) {
    try {
      return section.querySelectorAll('.stats-container, .panel-stats');
    } catch (error) {
      ErrorHandler.handleError(error, 'Failed to get panel stats containers');
      return [];
    }
  }

  // Update panel stats visibility based on current panel
  static updateStatsVisibility(sectionIndex, panelIndex) {
    try {
      const sections = document.querySelectorAll('.section');
      const section = sections[sectionIndex];
      if (!section) return;

      const statsContainers = this.getPanelStatsContainers(section);

      statsContainers.forEach((container, index) => {
        if (index === panelIndex) {
          // Show stats for current panel
          this.animateStatsEnter(container);
        } else {
          // Hide stats for other panels
          this.animateStatsExit(container);
        }
      });

      log.debug(EVENTS.ANIMATION, 'Panel stats visibility updated', {
        sectionIndex,
        panelIndex,
        containerCount: statsContainers.length,
      });
    } catch (error) {
      ErrorHandler.handleError(
        error,
        'Failed to update panel stats visibility'
      );
    }
  }
}

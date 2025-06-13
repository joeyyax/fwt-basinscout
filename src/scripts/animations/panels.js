/**
 * Panel Animation Controller
 * Handles panel content transitions, prose animations, media stack integration, and panel borders
 */

import { gsap } from 'gsap';
import { CONFIG } from '../constants.js';
import { appState } from '../state.js';
import { TitleAnimationController } from './titles.js';
import { PanelStatsAnimationController } from './panel-stats.js';
import { MediaStackController } from './media-stack.js';
import { log, EVENTS } from '../utils/logger.js';

export class PanelAnimationController {
  // Create panel border for containers with data-panel-border="true"
  static createPanelBorder(panelsContainer) {
    // Check if border is enabled
    if (panelsContainer.dataset.panelBorder !== 'true') {
      return null;
    }

    // Check if border already exists
    let borderElement = panelsContainer.querySelector('.panel-border');
    if (!borderElement) {
      borderElement = document.createElement('div');
      borderElement.className =
        'panel-border absolute left-0 top-0 w-1 bg-white h-full opacity-0 drop-shadow-sm';
      gsap.set(borderElement, { yPercent: 100, opacity: 0 });
      panelsContainer.appendChild(borderElement);
    }

    return borderElement;
  }

  // Animate panel border in with parallax effect - leads content
  static animatePanelBorderIn(
    panelsContainer,
    _duration = CONFIG.ANIMATION.CONTENT_ENTER_DURATION
  ) {
    const borderElement = this.createPanelBorder(panelsContainer);
    if (!borderElement) return null;

    const timeline = gsap.timeline();

    // Border animates up from bottom, finishing before content starts
    timeline.fromTo(
      borderElement,
      { yPercent: 100, opacity: 0 },
      {
        yPercent: 0,
        opacity: 1,
        duration: CONFIG.ANIMATION.PANEL_BORDER_ENTER_DURATION,
        ease: 'power2.out',
      }
    );

    return timeline;
  }

  // Animate panel border out
  static animatePanelBorderOut(
    panelsContainer,
    duration = CONFIG.ANIMATION.CONTENT_EXIT_DURATION
  ) {
    const borderElement = panelsContainer.querySelector('.panel-border');
    if (!borderElement) return null;

    const timeline = gsap.timeline();

    // Border slides up slightly while fading out
    timeline.to(borderElement, {
      yPercent: CONFIG.ANIMATION.PANEL_BORDER_EXIT_Y_PERCENT,
      opacity: 0,
      duration:
        duration * CONFIG.ANIMATION.PANEL_BORDER_EXIT_DURATION_MULTIPLIER,
      ease: 'power2.in',
    });

    return timeline;
  }

  // Set up panel structure without animations (for delayed initialization)
  static setupPanelStructure() {
    const sections = appState.getSections();

    sections.forEach((section, _sectionIndex) => {
      const panels = section.querySelectorAll('.panel');

      panels.forEach((panel, panelIndex) => {
        // Only show the first panel initially, hide others with GSAP (no animations)
        if (panelIndex === 0) {
          gsap.set(panel, { opacity: 1, visibility: 'visible', zIndex: 10 });
        } else {
          gsap.set(panel, { opacity: 0, visibility: 'hidden', zIndex: 1 });
        }

        const prose = panel.querySelector('.prose');
        if (prose) {
          // Get all direct children of prose container
          const proseElements = Array.from(prose.children);
          if (proseElements.length > 0) {
            // Hide content with GSAP instead of CSS for better animation compatibility
            gsap.set(proseElements, { opacity: 0, y: 50 });
          }
        }
      });
    });

    // Initialize donut charts to 0 progress
    PanelStatsAnimationController.initializeDonutCharts();
  }

  // Initialize all panels for first load
  static initializePanels() {
    const sections = appState.getSections();

    sections.forEach((section, _sectionIndex) => {
      const panels = section.querySelectorAll('.panel');

      panels.forEach((panel, panelIndex) => {
        // Only show the first panel initially, hide others completely
        if (panelIndex === 0) {
          gsap.set(panel, { opacity: 1, visibility: 'visible', zIndex: 10 });
        } else {
          gsap.set(panel, { opacity: 0, visibility: 'hidden', zIndex: 1 });
        }

        const prose = panel.querySelector('.prose');
        if (prose) {
          // Get all direct children of prose container
          const proseElements = Array.from(prose.children);
          if (proseElements.length > 0) {
            // Hide ALL content initially (including first panel for animation)
            gsap.set(proseElements, { opacity: 0, y: 50 });
          }
        }
      });
    });

    // Initialize donut charts to 0 progress
    PanelStatsAnimationController.initializeDonutCharts();
  }

  // Animate in the initial panel content
  static animateInitialPanel() {
    const sections = appState.getSections();
    if (sections && sections.length > 0) {
      const firstSection = sections[0];
      const firstPanel = firstSection.querySelector('.panel');
      if (firstPanel) {
        const panelsContainer = firstPanel.closest('.panels-container');
        const prose = firstPanel.querySelector('.prose');

        if (prose) {
          // Get all direct children of prose container
          const proseElements = Array.from(prose.children);

          if (proseElements.length > 0) {
            // Initialize panel-driven title for the first panel (only for sections with dynamic titles)
            if (TitleAnimationController.sectionHasDynamicTitles(0)) {
              TitleAnimationController.initializePanelTitle(0, 0);
            }

            // Create timeline for coordinated initial animation
            const timeline = gsap.timeline();

            // Animate panel border if enabled
            if (
              panelsContainer &&
              panelsContainer.dataset.panelBorder === 'true'
            ) {
              const borderTimeline = this.animatePanelBorderIn(panelsContainer);
              if (borderTimeline) {
                timeline.add(borderTimeline, 0);
              }
            }

            // Animate in the main panel content - wait for border to finish leading in
            timeline.fromTo(
              proseElements,
              {
                opacity: 0,
                y: 50,
              },
              {
                opacity: (i, el) => (el.tagName === 'P' ? 0.9 : 1), // Paragraphs get 0.9, headings get 1
                y: 0,
                duration: CONFIG.ANIMATION.CONTENT_ENTER_DURATION,
                stagger: CONFIG.ANIMATION.CONTENT_STAGGER_DELAY,
                ease: 'back.out(1.2)',
              },
              CONFIG.ANIMATION.INITIAL_PANEL_CONTENT_DELAY // Start after border has had time to lead in
            );

            // Initialize media stack to sync with content animation - add slight delay
            timeline.call(
              () => {
                MediaStackController.updateMediaForPanel(0, 0);
                // Show media stack for initial section, synced with content
                MediaStackController.showMediaStackForSection(0);
              },
              null,
              CONFIG.ANIMATION.INITIAL_PANEL_CONTENT_DELAY + 0.1
            );

            // Animate staggered children
            proseElements.forEach((element, index) => {
              if (element.dataset.staggerChildren === 'true') {
                const children = Array.from(element.children);
                if (children.length > 0) {
                  const parentDelay =
                    index * CONFIG.ANIMATION.CONTENT_STAGGER_DELAY;

                  timeline.fromTo(
                    children,
                    {
                      opacity: 0,
                      y: 30,
                    },
                    {
                      opacity: 1,
                      y: 0,
                      duration: CONFIG.ANIMATION.CONTENT_ENTER_DURATION * 0.8,
                      stagger: CONFIG.ANIMATION.PANEL_CHILD_ELEMENT_STAGGER,
                      ease: 'back.out(1.4)',
                      delay:
                        parentDelay +
                        CONFIG.ANIMATION.PANEL_CHILD_ANIMATION_OFFSET,
                      onComplete: () => {
                        // Animate donut charts after stats have animated in
                        if (
                          typeof window !== 'undefined' &&
                          window.location.hostname === 'localhost'
                        ) {
                          log.debug(
                            EVENTS.ANIMATION,
                            'Initial panel - checking for donut containers',
                            { className: element.className }
                          );
                        }

                        // Check if this element itself has stagger children
                        if (element.dataset.staggerChildren === 'true') {
                          PanelStatsAnimationController.animateDonutCharts(
                            element
                          );
                        }

                        // Also check for nested stats containers
                        const nestedStatsContainers = element.querySelectorAll(
                          '[data-stagger-children="true"]'
                        );
                        nestedStatsContainers.forEach((container) => {
                          if (
                            typeof window !== 'undefined' &&
                            window.location.hostname === 'localhost'
                          ) {
                            log.debug(
                              EVENTS.ANIMATION,
                              'Found nested stats container',
                              { className: container.className }
                            );
                          }
                          PanelStatsAnimationController.animateDonutCharts(
                            container
                          );
                        });
                      },
                    },
                    '<'
                  );
                }
              }
            });

            // Animate scroll instructions after main content
            this.animateScrollInstructionsIn(firstPanel, timeline, 0.5);

            return timeline;
          }
        }
      }
    }
  }

  // Animate scroll instructions in using the utility
  static animateScrollInstructionsIn(panel, timeline, _delay = 0) {
    // Skip scroll instructions animation per user preference
    // ScrollInstructions only has initialize() method, no animateIn()
  }

  // Handle content fade and slide transition between panels
  static animateContentTransition(
    timeline,
    currentElements,
    targetElements,
    direction
  ) {
    const currentPanel =
      currentElements.length > 0 ? currentElements[0].closest('.panel') : null;
    const targetPanel =
      targetElements.length > 0 ? targetElements[0].closest('.panel') : null;
    const switchingPanels =
      currentPanel && targetPanel && currentPanel !== targetPanel;

    // Get panels containers for border animations
    const currentPanelsContainer = currentPanel
      ? currentPanel.closest('.panels-container')
      : null;
    const targetPanelsContainer = targetPanel
      ? targetPanel.closest('.panels-container')
      : null;

    // Step 1: Animate out current content and border
    this.animateElementsOut(timeline, currentElements, direction);

    // Animate out panel border if switching panels
    if (
      switchingPanels &&
      currentPanelsContainer &&
      currentPanelsContainer.dataset.panelBorder === 'true'
    ) {
      const borderOutTimeline = this.animatePanelBorderOut(
        currentPanelsContainer
      );
      if (borderOutTimeline) {
        timeline.add(borderOutTimeline, '<');
      }
    }

    // Update media stack with delay - sync with content animation
    if (switchingPanels && targetPanel) {
      const section = targetPanel.closest('.section');
      if (section) {
        const sections = appState.getSections();
        const sectionIndex = Array.from(sections).indexOf(section);
        const panels = section.querySelectorAll('.panel');
        const panelIndex = Array.from(panels).indexOf(targetPanel);

        // Update media stack to sync with content animation timing
        timeline.call(
          () => {
            MediaStackController.updateMediaForPanel(sectionIndex, panelIndex);
          },
          null,
          `+=${CONFIG.ANIMATION.CONTENT_EXIT_DURATION + CONFIG.ANIMATION.PANEL_BORDER_CONTENT_DELAY * 0.5}`
        ); // Start halfway through the border-to-content delay

        // Update title for panel-driven titles (only for sections with dynamic titles)
        if (TitleAnimationController.sectionHasDynamicTitles(sectionIndex)) {
          const titleUpdateTimeline =
            TitleAnimationController.updateTitleForPanel(
              sectionIndex,
              panelIndex,
              0 // No additional delay, starts immediately after content exit
            );
          if (titleUpdateTimeline) {
            // Start title animation slightly before content finishes exiting to ensure fade-out is visible
            timeline.add(
              titleUpdateTimeline,
              `+=${CONFIG.ANIMATION.CONTENT_EXIT_DURATION * 0.5}` // Start halfway through content exit
            );
          }
        }
      }
    }

    // Step 2: Only after content is fully out, handle panel switching
    if (switchingPanels) {
      // Reset stats before making target panel visible
      timeline.call(
        () => {
          PanelStatsAnimationController.resetDonutCharts(targetPanel);
        },
        null,
        `+=${CONFIG.ANIMATION.CONTENT_EXIT_DURATION}` // After exit animation completes
      );

      // Make target panel visible and bring to front - AFTER reset
      timeline.set(
        targetPanel,
        {
          opacity: 1,
          visibility: 'visible',
          zIndex: 10,
        },
        `+=0.01` // Small delay after reset to ensure it happens first
      );

      // Hide current panel
      timeline.set(
        currentPanel,
        {
          opacity: 0,
          visibility: 'hidden',
          zIndex: 1,
        },
        '<' // At the same time
      );

      // Hide other panels in the same section
      const section = targetPanel.closest('.section');
      if (section) {
        const allPanels = section.querySelectorAll('.panel');
        allPanels.forEach((panel) => {
          if (panel !== targetPanel && panel !== currentPanel) {
            timeline.set(
              panel,
              {
                opacity: 0,
                visibility: 'hidden',
                zIndex: 1,
              },
              '<'
            );
          }
        });
      }
    }

    // Step 3: Animate in new content and border
    // First animate in the border to lead the content
    if (
      targetPanelsContainer &&
      targetPanelsContainer.dataset.panelBorder === 'true'
    ) {
      const borderInTimeline = this.animatePanelBorderIn(targetPanelsContainer);
      if (borderInTimeline) {
        timeline.add(borderInTimeline); // Border starts immediately
      }
    }

    // Then animate in content after border finishes
    this.animateElementsIn(
      timeline,
      targetElements,
      direction,
      CONFIG.ANIMATION.PANEL_BORDER_CONTENT_DELAY
    );

    // Mobile Safari fallback - ensure text is visible after all animations
    if (typeof window !== 'undefined' && window.navigator) {
      const isIOSSafari =
        /iP(ad|od|hone)/.test(window.navigator.userAgent) &&
        /WebKit/.test(window.navigator.userAgent) &&
        !/CriOS|FxiOS|OPiOS|mercury/.test(window.navigator.userAgent);

      if (isIOSSafari) {
        timeline.call(
          () => {
            // Safety check after all animations should be complete
            setTimeout(() => {
              targetElements.forEach((el) => {
                if (window.getComputedStyle(el).opacity === '0') {
                  el.style.opacity = el.tagName === 'P' ? '0.9' : '1';
                  el.style.transform = 'translateY(0)';
                }
              });
            }, 100);
          },
          null,
          `+=${CONFIG.ANIMATION.CONTENT_ENTER_DURATION + CONFIG.ANIMATION.PANEL_BORDER_CONTENT_DELAY + 0.5}`
        );
      }
    }
  }

  // Prepare target panel for transition (make visible but behind current)
  static prepareTargetPanel(timeline, currentElements, targetElements) {
    if (currentElements.length > 0 && targetElements.length > 0) {
      const currentPanel = currentElements[0].closest('.panel');
      const targetPanel = targetElements[0].closest('.panel');

      if (currentPanel !== targetPanel) {
        // Make target panel visible but behind current panel
        timeline.set(
          targetPanel,
          {
            opacity: 1,
            visibility: 'visible',
            zIndex: 9, // Behind current panel
          },
          '<'
        );
      }
    }
  }

  // Switch panel visibility after content has animated out
  static switchPanelVisibility(timeline, currentElements, targetElements) {
    if (currentElements.length > 0 && targetElements.length > 0) {
      const currentPanel = currentElements[0].closest('.panel');
      const targetPanel = targetElements[0].closest('.panel');

      if (currentPanel !== targetPanel) {
        // Hide current panel and bring target panel to front
        // Use explicit timing to wait for content exit animation to complete
        timeline.set(
          currentPanel,
          {
            opacity: 0,
            visibility: 'hidden',
            zIndex: 1,
          },
          `+=${CONFIG.ANIMATION.CONTENT_EXIT_DURATION}` // Wait for exit animation duration
        );

        timeline.set(
          targetPanel,
          {
            zIndex: 10, // Bring to front
          },
          '<' // At the same time as hiding current panel
        );

        // Hide other panels in the same section
        const section = targetPanel.closest('.section');
        if (section) {
          const allPanels = section.querySelectorAll('.panel');
          allPanels.forEach((panel) => {
            if (panel !== targetPanel && panel !== currentPanel) {
              timeline.set(
                panel,
                {
                  opacity: 0,
                  visibility: 'hidden',
                  zIndex: 1,
                },
                '<'
              );
            }
          });
        }
      }
    }
  }

  // Helper method to animate elements out with optional child staggering
  static animateElementsOut(timeline, elements, direction) {
    // Animate out the main elements first with stagger
    timeline.to(elements, {
      opacity: 0,
      y: direction > 0 ? -50 : 50,
      duration: CONFIG.ANIMATION.CONTENT_EXIT_DURATION,
      stagger: CONFIG.ANIMATION.PANEL_EXIT_ELEMENT_STAGGER,
      ease: 'power2.in',
    });

    // Then animate out staggered children with proper timing based on parent position
    elements.forEach((element, index) => {
      // Check if this element should stagger its children
      if (element.dataset.staggerChildren === 'true') {
        const children = Array.from(element.children);
        if (children.length > 0) {
          // Calculate when this parent element starts animating out (based on stagger)
          const parentStartDelay =
            index * CONFIG.ANIMATION.PANEL_EXIT_ELEMENT_STAGGER; // Match the main stagger delay

          timeline.to(
            children,
            {
              opacity: 0,
              y: direction > 0 ? -30 : 30,
              duration: CONFIG.ANIMATION.CONTENT_EXIT_DURATION * 0.8,
              stagger: CONFIG.ANIMATION.PANEL_CHILD_EXIT_STAGGER,
              ease: 'power2.in',
            },
            `<+${parentStartDelay}` // Start when the parent element begins its exit
          );
        }
      }
    });
  }

  // Helper method to animate elements in with optional child staggering
  static animateElementsIn(timeline, elements, direction, delay = 0) {
    // Animate in the main elements first
    timeline.fromTo(
      elements,
      {
        opacity: 0,
        y: direction > 0 ? 50 : -50,
      },
      {
        opacity: (i, el) => (el.tagName === 'P' ? 0.9 : 1), // Paragraphs get 0.9, headings get 1
        y: 0,
        duration: CONFIG.ANIMATION.CONTENT_ENTER_DURATION,
        stagger: CONFIG.ANIMATION.CONTENT_STAGGER_DELAY,
        ease: 'back.out(1.2)',
        onComplete: () => {
          // Mobile Safari fallback - ensure text is visible after animation
          if (typeof window !== 'undefined' && window.navigator) {
            const isIOSSafari =
              /iP(ad|od|hone)/.test(window.navigator.userAgent) &&
              /WebKit/.test(window.navigator.userAgent) &&
              !/CriOS|FxiOS|OPiOS|mercury/.test(window.navigator.userAgent);

            if (isIOSSafari) {
              elements.forEach((el) => {
                if (window.getComputedStyle(el).opacity === '0') {
                  el.style.opacity = el.tagName === 'P' ? '0.9' : '1';
                  el.style.transform = 'translateY(0)';
                }
              });
            }
          }
        },
      },
      delay > 0 ? `+=${delay}` : '-=0.2' // Use custom delay or default overlap
    );

    // Then animate in staggered children
    elements.forEach((element, index) => {
      if (element.dataset.staggerChildren === 'true') {
        const children = Array.from(element.children);
        if (children.length > 0) {
          // Calculate delay based on parent element's position in stagger
          const parentDelay = index * CONFIG.ANIMATION.CONTENT_STAGGER_DELAY;

          timeline.fromTo(
            children,
            {
              opacity: 0,
              y: direction > 0 ? 30 : -30,
            },
            {
              opacity: 1,
              y: 0,
              duration: CONFIG.ANIMATION.CONTENT_ENTER_DURATION * 0.8,
              stagger: CONFIG.ANIMATION.PANEL_CHILD_ELEMENT_STAGGER, // Slightly longer stagger for visual appeal
              ease: 'back.out(1.4)',
              delay:
                parentDelay + CONFIG.ANIMATION.PANEL_CHILD_ANIMATION_OFFSET, // Start after parent begins animating
              onComplete: () => {
                // Mobile Safari fallback for child elements
                if (typeof window !== 'undefined' && window.navigator) {
                  const isIOSSafari =
                    /iP(ad|od|hone)/.test(window.navigator.userAgent) &&
                    /WebKit/.test(window.navigator.userAgent) &&
                    !/CriOS|FxiOS|OPiOS|mercury/.test(
                      window.navigator.userAgent
                    );

                  if (isIOSSafari) {
                    children.forEach((child) => {
                      if (window.getComputedStyle(child).opacity === '0') {
                        child.style.opacity = '1';
                        child.style.transform = 'translateY(0)';
                      }
                    });
                  }
                }

                // Animate donut charts after stats have animated in
                if (
                  typeof window !== 'undefined' &&
                  window.location.hostname === 'localhost'
                ) {
                  log.debug(
                    EVENTS.ANIMATION,
                    'Panel transition - checking for donut containers',
                    { className: element.className }
                  );
                }

                // Check if this element itself has stagger children
                if (element.dataset.staggerChildren === 'true') {
                  PanelStatsAnimationController.animateDonutCharts(element);
                }

                // Also check for nested stats containers
                const nestedStatsContainers = element.querySelectorAll(
                  '[data-stagger-children="true"]'
                );
                nestedStatsContainers.forEach((container) => {
                  if (
                    typeof window !== 'undefined' &&
                    window.location.hostname === 'localhost'
                  ) {
                    log.debug(
                      EVENTS.ANIMATION,
                      'Found nested stats container',
                      { className: container.className }
                    );
                  }
                  PanelStatsAnimationController.animateDonutCharts(container);
                });
              },
            },
            '<' // Start relative to the timeline position
          );
        }
      }
    });
  }

  // Show specific panel content (for direct navigation)
  static showPanel(sectionIndex, panelIndex) {
    const sections = appState.getSections();
    const section = sections[sectionIndex];

    if (section) {
      const panels = section.querySelectorAll('.panel');

      // Hide all panels first
      panels.forEach((panel, index) => {
        if (index === panelIndex) {
          gsap.set(panel, {
            opacity: 1,
            visibility: 'visible',
            zIndex: 10,
          });
        } else {
          gsap.set(panel, {
            opacity: 0,
            visibility: 'hidden',
            zIndex: 1,
          });
        }
      });

      const panel = panels[panelIndex];
      if (panel) {
        // Reset stats before showing panel
        PanelStatsAnimationController.resetDonutCharts(panel);

        // Update panel title for direct navigation (only for sections with dynamic titles)
        if (TitleAnimationController.sectionHasDynamicTitles(sectionIndex)) {
          TitleAnimationController.updateTitleForPanel(
            sectionIndex,
            panelIndex,
            0
          );
        }

        // Animate panel content
        this.animatePanelIn(panel);
      }
    }
  }

  // Animate panel content in (used for direct navigation)
  static animatePanelIn(panel) {
    const panelsContainer = panel.closest('.panels-container');
    const prose = panel.querySelector('.prose');

    if (prose) {
      const proseElements = Array.from(prose.children);
      const timeline = gsap.timeline();

      // Animate panel border first if enabled
      if (panelsContainer && panelsContainer.dataset.panelBorder === 'true') {
        const borderTimeline = this.animatePanelBorderIn(panelsContainer);
        if (borderTimeline) {
          timeline.add(borderTimeline, 0); // Border starts immediately
        }
      }

      // Animate in content after border finishes (0.25s delay)
      timeline.fromTo(
        proseElements,
        {
          opacity: 0,
          y: 50,
        },
        {
          opacity: (i, el) => (el.tagName === 'P' ? 0.9 : 1),
          y: 0,
          duration: CONFIG.ANIMATION.CONTENT_ENTER_DURATION,
          stagger: CONFIG.ANIMATION.CONTENT_STAGGER_DELAY,
          ease: 'back.out(1.2)',
        },
        `+=${CONFIG.ANIMATION.PANEL_BORDER_CONTENT_DELAY}` // Content starts after border finishes
      );

      // Handle staggered children
      proseElements.forEach((element, index) => {
        if (element.dataset.staggerChildren === 'true') {
          const children = Array.from(element.children);
          if (children.length > 0) {
            const parentDelay = index * CONFIG.ANIMATION.CONTENT_STAGGER_DELAY;

            timeline.fromTo(
              children,
              {
                opacity: 0,
                y: 30,
              },
              {
                opacity: 1,
                y: 0,
                duration: CONFIG.ANIMATION.CONTENT_ENTER_DURATION * 0.8,
                stagger: CONFIG.ANIMATION.PANEL_CHILD_ELEMENT_STAGGER,
                ease: 'back.out(1.4)',
                delay:
                  parentDelay + CONFIG.ANIMATION.PANEL_CHILD_ANIMATION_OFFSET,
                onComplete: () => {
                  if (element.dataset.staggerChildren === 'true') {
                    PanelStatsAnimationController.animateDonutCharts(element);
                  }
                },
              },
              '<'
            );
          }
        }
      });

      // Update media stack for this panel
      const section = panel.closest('.section');
      if (section) {
        const sections = appState.getSections();
        const sectionIndex = Array.from(sections).indexOf(section);
        const panels = section.querySelectorAll('.panel');
        const panelIndex = Array.from(panels).indexOf(panel);

        timeline.call(() => {
          MediaStackController.updateMediaForPanel(sectionIndex, panelIndex);
        });
      }
    }
  }
}

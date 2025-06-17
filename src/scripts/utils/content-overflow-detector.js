/**
 * Content Overflow Detector
 * Detects when panel content is too tall and splits it into multiple panels
 * while preserving semantic groupings and element relationships
 */

import { log, EVENTS } from './logger.js';

export class ContentOverflowDetector {
  /**
   * Initialize content overflow detection for all sections
   */
  static initializeOverflowDetection() {
    const sections = document.querySelectorAll(
      '.section[data-use-overflow-detector="true"]'
    );

    log.info(
      EVENTS.CONTENT,
      `Found ${sections.length} sections with overflow detection enabled`
    );

    sections.forEach((section, sectionIndex) => {
      const panels = section.querySelectorAll('.panel');

      log.debug(
        EVENTS.CONTENT,
        `Section ${sectionIndex} (${section.id || 'unnamed'}) has ${panels.length} panels for overflow detection`
      );

      panels.forEach((panel, panelIndex) => {
        this.checkAndSplitPanelContent(
          section,
          panel,
          sectionIndex,
          panelIndex
        );
      });
    });
  }

  /**
   * Check if panel content exceeds available height and split if necessary
   * @param {HTMLElement} section - The section containing the panel
   * @param {HTMLElement} panel - The panel to check
   * @param {number} sectionIndex - Section index for logging
   * @param {number} panelIndex - Panel index for logging
   */
  static checkAndSplitPanelContent(section, panel, sectionIndex, panelIndex) {
    const prose = panel.querySelector('.prose');
    if (!prose) return;

    // Get available height (panel height minus padding/margins)
    const panelHeight = this.getAvailablePanelHeight(panel);
    const contentHeight = this.getContentHeight(prose);

    log.debug(
      EVENTS.CONTENT,
      `Panel ${sectionIndex}-${panelIndex} height check`,
      {
        panelHeight,
        contentHeight,
        overflow: contentHeight > panelHeight,
      }
    );

    if (contentHeight > panelHeight) {
      this.splitPanelContent(
        section,
        panel,
        panelHeight,
        sectionIndex,
        panelIndex
      );
    }
  }

  /**
   * Get the available height for content within a panel
   * @param {HTMLElement} panel - The panel element
   * @returns {number} Available height in pixels
   */
  static getAvailablePanelHeight(panel) {
    const panelStyles = window.getComputedStyle(panel);
    const panelHeight = panel.offsetHeight;
    const paddingTop = parseFloat(panelStyles.paddingTop);
    const paddingBottom = parseFloat(panelStyles.paddingBottom);
    const marginTop = parseFloat(panelStyles.marginTop);
    const marginBottom = parseFloat(panelStyles.marginBottom);

    // Reserve space for panel gaps and potential borders
    const reservedSpace = 8; // 2rem gap as defined in panels.css

    return (
      panelHeight -
      paddingTop -
      paddingBottom -
      marginTop -
      marginBottom -
      reservedSpace
    );
  }

  /**
   * Get the actual content height of prose elements
   * @param {HTMLElement} prose - The prose container
   * @returns {number} Content height in pixels
   */
  static getContentHeight(prose) {
    // Create a temporary clone to measure content
    const clone = prose.cloneNode(true);
    clone.style.position = 'absolute';
    clone.style.visibility = 'hidden';
    clone.style.height = 'auto';
    clone.style.maxHeight = 'none';
    clone.style.width = `${prose.offsetWidth}px`;

    document.body.appendChild(clone);
    const height = clone.offsetHeight;
    document.body.removeChild(clone);

    return height;
  }

  /**
   * Split panel content into multiple panels when overflow is detected
   * @param {HTMLElement} section - The section containing the panel
   * @param {HTMLElement} originalPanel - The original panel with overflow
   * @param {number} maxHeight - Maximum height per panel
   * @param {number} sectionIndex - Section index for logging
   * @param {number} panelIndex - Panel index for logging
   */
  static splitPanelContent(
    section,
    originalPanel,
    maxHeight,
    sectionIndex,
    panelIndex
  ) {
    const prose = originalPanel.querySelector('.prose');
    const elements = Array.from(prose.children);

    if (elements.length === 0) return;

    // Group elements into semantic chunks
    const semanticGroups = this.createSemanticGroups(elements);

    // Distribute groups across panels
    const panelGroups = this.distributePanelsContent(
      semanticGroups,
      maxHeight,
      prose.offsetWidth
    );

    if (panelGroups.length <= 1) return; // No splitting needed

    log.info(
      EVENTS.CONTENT,
      `Splitting panel ${sectionIndex}-${panelIndex} into ${panelGroups.length} panels`
    );

    // Clear original panel content
    prose.innerHTML = '';

    // Add first group to original panel
    panelGroups[0].forEach((group) => {
      group.elements.forEach((element) => {
        prose.appendChild(element);
      });
    });

    // Create continuation panels
    for (let i = 1; i < panelGroups.length; i++) {
      this.createContinuationPanel(
        section,
        originalPanel,
        panelGroups[i],
        i,
        panelIndex
      );
    }
  }

  /**
   * Create semantic groups from prose elements
   * Groups related elements like pretitle + h3, or standalone elements
   * @param {Array<HTMLElement>} elements - Array of prose elements
   * @returns {Array<Object>} Array of semantic groups
   */
  static createSemanticGroups(elements) {
    const groups = [];
    let currentGroup = null;

    elements.forEach((element, elementIndex) => {
      const tagName = element.tagName.toLowerCase();
      const isPretitle = element.classList.contains('pretitle');
      const isHeading = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName);
      const nextElement = elements[elementIndex + 1];
      const nextIsHeading =
        nextElement &&
        ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(
          nextElement.tagName.toLowerCase()
        );

      // Start new group if:
      // 1. This is a pretitle
      // 2. This is a heading and previous group exists (but not if current group is expecting a heading)
      // 3. This is the first element
      if (
        isPretitle ||
        (isHeading && currentGroup && !currentGroup.expectsHeading) ||
        elementIndex === 0
      ) {
        if (currentGroup) {
          groups.push(currentGroup);
        }
        currentGroup = {
          type: isPretitle
            ? 'pretitle-group'
            : isHeading
              ? 'heading-group'
              : 'content-group',
          elements: [element],
          startsWith: tagName,
          endsAt: elementIndex,
        };
      } else {
        // Add to current group
        if (currentGroup) {
          currentGroup.elements.push(element);
          currentGroup.endsAt = elementIndex;

          // If this is a heading being added to a pretitle group, update the type
          if (isHeading && currentGroup.expectsHeading) {
            currentGroup.type = 'pretitle-heading-group';
            currentGroup.expectsHeading = false; // Mark as fulfilled
          }
        } else {
          // Shouldn't happen, but safety fallback
          currentGroup = {
            type: 'content-group',
            elements: [element],
            startsWith: tagName,
            endsAt: elementIndex,
          };
        }
      }

      // Special handling for pretitle + heading combinations
      if (isPretitle && nextIsHeading) {
        currentGroup.type = 'pretitle-heading-group';
        currentGroup.expectsHeading = true;
      }
    });

    // Add final group
    if (currentGroup) {
      groups.push(currentGroup);
    }

    log.debug(EVENTS.CONTENT, 'Created semantic groups', {
      totalElements: elements.length,
      groupCount: groups.length,
      groups: groups.map((g) => ({
        type: g.type,
        elementCount: g.elements.length,
        startsWith: g.startsWith,
        isPretitleHeadingGroup: g.type === 'pretitle-heading-group',
        elements: g.elements.map((el) => ({
          tag: el.tagName.toLowerCase(),
          isPretitle: el.classList.contains('pretitle'),
          text: `${el.textContent.substring(0, 50)}...`,
        })),
      })),
    });

    return groups;
  }

  /**
   * Distribute semantic groups across multiple panels based on height constraints
   * @param {Array<Object>} semanticGroups - Array of semantic groups
   * @param {number} maxHeight - Maximum height per panel
   * @param {number} contentWidth - Width for height calculations
   * @returns {Array<Array<Object>>} Array of panel groups
   */
  static distributePanelsContent(semanticGroups, maxHeight, contentWidth) {
    const panelGroups = [];
    let currentPanelGroups = [];
    let currentPanelHeight = 0;

    semanticGroups.forEach((group) => {
      const groupHeight = this.calculateGroupHeight(group, contentWidth);

      // Check if group fits in current panel
      if (currentPanelHeight + groupHeight <= maxHeight) {
        currentPanelGroups.push(group);
        currentPanelHeight += groupHeight;
      } else {
        // Start new panel
        if (currentPanelGroups.length > 0) {
          panelGroups.push([...currentPanelGroups]);
        }

        // Check if single group is too large for any panel
        if (groupHeight > maxHeight) {
          // Try to split large groups (like long lists)
          const splitGroups = this.splitLargeGroup(
            group,
            maxHeight,
            contentWidth
          );
          splitGroups.forEach((splitGroup, splitIndex) => {
            if (splitIndex === 0 && currentPanelGroups.length === 0) {
              currentPanelGroups = [splitGroup];
              currentPanelHeight = this.calculateGroupHeight(
                splitGroup,
                contentWidth
              );
            } else {
              if (currentPanelGroups.length > 0) {
                panelGroups.push([...currentPanelGroups]);
              }
              currentPanelGroups = [splitGroup];
              currentPanelHeight = this.calculateGroupHeight(
                splitGroup,
                contentWidth
              );
            }
          });
        } else {
          currentPanelGroups = [group];
          currentPanelHeight = groupHeight;
        }
      }
    });

    // Add final panel
    if (currentPanelGroups.length > 0) {
      panelGroups.push(currentPanelGroups);
    }

    log.debug(EVENTS.CONTENT, 'Distributed content across panels', {
      originalGroups: semanticGroups.length,
      resultingPanels: panelGroups.length,
      panelsBreakdown: panelGroups.map((panel, panelIndex) => ({
        panelIndex,
        groupCount: panel.length,
        estimatedHeight: panel.reduce(
          (sum, group) => sum + this.calculateGroupHeight(group, contentWidth),
          0
        ),
      })),
    });

    return panelGroups;
  }

  /**
   * Calculate the height of a semantic group
   * @param {Object} group - Semantic group object
   * @param {number} contentWidth - Width for calculations
   * @returns {number} Estimated height in pixels
   */
  static calculateGroupHeight(group, contentWidth) {
    // Create temporary container to measure height
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.visibility = 'hidden';
    tempContainer.style.width = `${contentWidth}px`;
    tempContainer.style.height = 'auto';
    tempContainer.className = 'prose'; // Apply prose styles

    // Clone elements to measure
    group.elements.forEach((element) => {
      const clone = element.cloneNode(true);
      tempContainer.appendChild(clone);
    });

    document.body.appendChild(tempContainer);
    const height = tempContainer.offsetHeight;
    document.body.removeChild(tempContainer);

    return height;
  }

  /**
   * Split a large group that doesn't fit in a single panel
   * @param {Object} group - The large semantic group
   * @param {number} maxHeight - Maximum height per panel
   * @param {number} contentWidth - Width for calculations
   * @returns {Array<Object>} Array of smaller groups
   */
  static splitLargeGroup(group, maxHeight, contentWidth) {
    const splitGroups = [];
    let currentGroup = {
      type: `${group.type}-split`,
      elements: [],
      startsWith: group.startsWith,
      split: true,
    };
    let currentHeight = 0;

    group.elements.forEach((element, elementIndex) => {
      const elementHeight = this.calculateElementHeight(element, contentWidth);
      const isPretitle = element.classList.contains('pretitle');
      const nextElement = group.elements[elementIndex + 1];
      const nextIsHeading =
        nextElement &&
        ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(
          nextElement.tagName.toLowerCase()
        );

      // If this is a pretitle with a following heading, we need to consider them together
      if (isPretitle && nextIsHeading) {
        const nextElementHeight = this.calculateElementHeight(
          nextElement,
          contentWidth
        );
        const combinedHeight = elementHeight + nextElementHeight;

        if (currentHeight + combinedHeight <= maxHeight) {
          // Both pretitle and heading fit in current group
          currentGroup.elements.push(element);
          currentHeight += elementHeight;
        } else {
          // Need to start new group with the pretitle + heading pair
          if (currentGroup.elements.length > 0) {
            splitGroups.push(currentGroup);
          }

          currentGroup = {
            type: `${group.type}-split`,
            elements: [element],
            startsWith: element.tagName.toLowerCase(),
            split: true,
            continuation: true,
          };
          currentHeight = elementHeight;
        }
      } else if (currentHeight + elementHeight <= maxHeight) {
        currentGroup.elements.push(element);
        currentHeight += elementHeight;
      } else {
        // Start new split group
        if (currentGroup.elements.length > 0) {
          splitGroups.push(currentGroup);
        }

        currentGroup = {
          type: `${group.type}-split`,
          elements: [element],
          startsWith: element.tagName.toLowerCase(),
          split: true,
          continuation: true,
        };
        currentHeight = elementHeight;
      }
    });

    // Add final split group
    if (currentGroup.elements.length > 0) {
      splitGroups.push(currentGroup);
    }

    log.debug(EVENTS.CONTENT, 'Split large group', {
      originalElements: group.elements.length,
      splitGroups: splitGroups.length,
    });

    return splitGroups;
  }

  /**
   * Calculate height of a single element
   * @param {HTMLElement} element - The element to measure
   * @param {number} contentWidth - Width for calculations
   * @returns {number} Element height in pixels
   */
  static calculateElementHeight(element, contentWidth) {
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.visibility = 'hidden';
    tempContainer.style.width = `${contentWidth}px`;
    tempContainer.className = 'prose';

    const clone = element.cloneNode(true);
    tempContainer.appendChild(clone);

    document.body.appendChild(tempContainer);
    const height = tempContainer.offsetHeight;
    document.body.removeChild(tempContainer);

    return height;
  }

  /**
   * Create a continuation panel with the specified content
   * @param {HTMLElement} section - The section to add the panel to
   * @param {HTMLElement} originalPanel - The original panel for reference
   * @param {Array<Object>} panelGroups - Groups to add to this panel
   * @param {number} continuationIndex - Index of the continuation (1, 2, 3...)
   * @param {number} originalPanelIndex - Index of the original panel
   */
  static createContinuationPanel(
    section,
    originalPanel,
    panelGroups,
    continuationIndex,
    originalPanelIndex
  ) {
    const panelsContainer = originalPanel.closest('.panels-container');
    if (!panelsContainer) return;

    // Create new panel element
    const newPanel = document.createElement('div');
    newPanel.className = 'panel panel-continuation';
    newPanel.setAttribute('data-continuation-panel', 'true');

    // Copy relevant data attributes from original panel (except data-title which would be confusing)
    const attributesToCopy = ['data-media', 'data-marker', 'data-stats'];
    attributesToCopy.forEach((attr) => {
      if (originalPanel.hasAttribute(attr)) {
        newPanel.setAttribute(attr, originalPanel.getAttribute(attr));
      }
    });

    // Create prose container
    const prose = document.createElement('div');
    prose.className = 'prose';

    // No continuation indicator needed - content should flow naturally

    // Add content groups to prose container
    panelGroups.forEach((group) => {
      group.elements.forEach((element) => {
        prose.appendChild(element);
      });
    });

    newPanel.appendChild(prose);

    // Insert panel immediately after the original panel in the correct sequence
    const existingPanels = panelsContainer.querySelectorAll('.panel');
    const sourceParentIndex = Array.from(existingPanels).indexOf(originalPanel);

    // Calculate where this continuation panel should be inserted
    // It should go after the original panel + any previous continuation panels
    const insertPosition = sourceParentIndex + continuationIndex;

    if (insertPosition < existingPanels.length) {
      // Insert before the panel at insertPosition
      panelsContainer.insertBefore(newPanel, existingPanels[insertPosition]);
    } else {
      // Insert at the end if we're beyond existing panels
      panelsContainer.appendChild(newPanel);
    }

    // Initialize panel for animations (hidden initially)
    if (typeof window !== 'undefined' && typeof window.gsap !== 'undefined') {
      window.gsap.set(newPanel, {
        opacity: 0,
        visibility: 'hidden',
        zIndex: 1,
      });

      // Hide prose elements for initial animation
      const newProseElements = Array.from(prose.children);
      window.gsap.set(newProseElements, { opacity: 0, y: 50 });
    } else {
      // Fallback: ensure panel is hidden without GSAP
      newPanel.style.opacity = '0';
      newPanel.style.visibility = 'hidden';
      newPanel.style.zIndex = '1';
    }

    log.info(
      EVENTS.CONTENT,
      `Created continuation panel ${originalPanelIndex + continuationIndex}`,
      {
        originalPanel: originalPanelIndex,
        continuationIndex,
        groupCount: panelGroups.length,
        elementCount: panelGroups.reduce(
          (sum, group) => sum + group.elements.length,
          0
        ),
      }
    );

    return newPanel;
  }

  /**
   * Re-initialize pagination after panels have been split
   * This should be called after all content overflow detection is complete
   */
  static updatePaginationAfterSplitting() {
    // Import pagination controller dynamically to avoid circular dependencies
    import('../pagination.js')
      .then(({ PaginationController }) => {
        // Re-initialize pagination to account for new panels
        PaginationController.initializePagination();

        log.debug(EVENTS.CONTENT, 'Pagination updated after content splitting');
      })
      .catch((error) => {
        log.error(
          EVENTS.CONTENT,
          'Failed to update pagination after splitting',
          error
        );
      });
  }

  /**
   * Get all panels in a section (including continuation panels)
   * @param {HTMLElement} section - The section element
   * @returns {Array<HTMLElement>} Array of panel elements
   */
  static getPanelsInSection(section) {
    return Array.from(section.querySelectorAll('.panel'));
  }

  /**
   * Check if content overflow detection should run
   * Only runs when viewport size is stable and content is loaded
   * @returns {boolean} Whether detection should run
   */
  static shouldRunDetection() {
    // Skip if we're in a test environment
    if (
      typeof window === 'undefined' ||
      window.location.href.includes('test')
    ) {
      return false;
    }

    // Enable on mobile - removed the viewport width restriction
    // The content should split on all devices when needed

    // Check if fonts and images are loaded
    if (document.readyState !== 'complete') {
      return false;
    }

    return true;
  }

  /**
   * Initialize overflow detection with proper timing
   */
  static initializeWithProperTiming() {
    if (!this.shouldRunDetection()) {
      log.debug(EVENTS.CONTENT, 'Skipping content overflow detection', {
        shouldRun: false,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        readyState: document.readyState,
      });
      return;
    }

    log.info(EVENTS.CONTENT, 'Starting content overflow detection', {
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      readyState: document.readyState,
    });

    // On mobile, wait longer for address bar to potentially hide and viewport to stabilize
    const isMobile = window.innerWidth < 768;
    const delay = isMobile ? 500 : 100;

    // Wait for fonts, layout, and mobile address bar to be stable
    setTimeout(() => {
      this.initializeOverflowDetection();
      this.updatePaginationAfterSplitting();
    }, delay);

    // On mobile, also listen for viewport changes (address bar show/hide)
    if (isMobile) {
      let resizeTimeout;
      const handleResize = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          log.debug(
            EVENTS.CONTENT,
            'Re-running overflow detection after viewport change',
            {
              viewport: `${window.innerWidth}x${window.innerHeight}`,
            }
          );
          this.initializeOverflowDetection();
          this.updatePaginationAfterSplitting();
        }, 250);
      };

      window.addEventListener('resize', handleResize);
      // Also listen for orientation changes
      window.addEventListener('orientationchange', () => {
        setTimeout(handleResize, 100);
      });
    }
  }
}

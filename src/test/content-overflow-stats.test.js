/**
 * Tests for Content Overflow Detector - Stats Splitting
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ContentOverflowDetector } from '../scripts/utils/content-overflow-detector.js';

// Mock the logger
vi.mock('../scripts/utils/logger.js', () => ({
  log: {
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
  EVENTS: {
    CONTENT: 'content',
  },
}));

// Mock the constants
vi.mock('../scripts/constants.js', () => ({
  CONFIG: {
    VIEWPORT_OVERLAY: {
      MOBILE_UI_BUFFER: 120,
      DESKTOP_UI_BUFFER: 80,
      MOBILE_SCREEN_THRESHOLD: 768,
    },
  },
}));

describe('ContentOverflowDetector - Stats Splitting', () => {
  let container;

  beforeEach(() => {
    // Create a mock DOM structure
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('should split stats container into individual stat groups', () => {
    // Create a stats container with multiple stats
    const statsContainer = document.createElement('div');
    statsContainer.className = 'stats';

    // Add three individual stats
    for (let i = 1; i <= 3; i++) {
      const stat = document.createElement('div');
      stat.className = 'stat';
      stat.innerHTML = `<div class="stat-content"><div class="stat-value">${i * 10}%</div></div>`;
      statsContainer.appendChild(stat);
    }

    const elements = [statsContainer];
    const groups = ContentOverflowDetector.createSemanticGroups(elements);

    // Should create 3 individual stat groups
    expect(groups).toHaveLength(3);

    // Each group should be an individual stat
    groups.forEach((group, index) => {
      expect(group.type).toBe('individual-stat');
      expect(group.statIndex).toBe(index);
      expect(group.totalStats).toBe(3);
      expect(group.isSplittable).toBe(true);
      expect(group.elements).toHaveLength(1);
      expect(group.elements[0].classList.contains('stats')).toBe(true);
      expect(group.elements[0].querySelectorAll('.stat')).toHaveLength(1);
    });
  });

  it('should combine individual stats back into stats container in distribution', () => {
    // Create individual stat groups (as if from createSemanticGroups)
    const originalStatsContainer = document.createElement('div');
    originalStatsContainer.className = 'stats';

    const statGroups = [];
    for (let i = 0; i < 2; i++) {
      const statsClone = originalStatsContainer.cloneNode(false);
      const stat = document.createElement('div');
      stat.className = 'stat';
      stat.innerHTML = `<div class="stat-content"><div class="stat-value">${(i + 1) * 20}%</div></div>`;
      statsClone.appendChild(stat);

      statGroups.push({
        type: 'individual-stat',
        elements: [statsClone],
        statIndex: i,
        totalStats: 3,
        originalStatsContainer,
        isSplittable: true,
      });
    }

    // Test the combination logic
    const combinedGroups =
      ContentOverflowDetector.combineIndividualStatsInPanel(statGroups, 0);

    expect(combinedGroups).toHaveLength(1);
    expect(combinedGroups[0].type).toBe('combined-stats');
    expect(combinedGroups[0].individualStats).toHaveLength(2);
    expect(
      combinedGroups[0].elements[0].querySelectorAll('.stat')
    ).toHaveLength(2);
  });

  it('should handle mixed content with individual stats', () => {
    // Create mixed content: heading + stats + paragraph
    const heading = document.createElement('h2');
    heading.textContent = 'Statistics';

    const statsContainer = document.createElement('div');
    statsContainer.className = 'stats';

    const stat1 = document.createElement('div');
    stat1.className = 'stat';
    stat1.innerHTML =
      '<div class="stat-content"><div class="stat-value">25%</div></div>';
    statsContainer.appendChild(stat1);

    const stat2 = document.createElement('div');
    stat2.className = 'stat';
    stat2.innerHTML =
      '<div class="stat-content"><div class="stat-value">50%</div></div>';
    statsContainer.appendChild(stat2);

    const paragraph = document.createElement('p');
    paragraph.textContent = 'This is a summary paragraph.';

    const elements = [heading, statsContainer, paragraph];
    const groups = ContentOverflowDetector.createSemanticGroups(elements);

    // Should have: 1 heading group + 2 individual stat groups + 1 content group
    expect(groups).toHaveLength(4);
    expect(groups[0].type).toBe('heading-group');
    expect(groups[1].type).toBe('individual-stat');
    expect(groups[2].type).toBe('individual-stat');
    expect(groups[3].type).toBe('content-group');
  });

  it('should handle empty stats container gracefully', () => {
    const statsContainer = document.createElement('div');
    statsContainer.className = 'stats';
    // No stats inside

    const elements = [statsContainer];
    const groups = ContentOverflowDetector.createSemanticGroups(elements);

    // Should create a single stats-container group as fallback
    expect(groups).toHaveLength(1);
    expect(groups[0].type).toBe('stats-container');
  });

  it('should maintain proper grid structure when combining stats', () => {
    // Create stats with grid classes
    const originalStatsContainer = document.createElement('div');
    originalStatsContainer.className =
      'stats grid grid-cols-1 md:grid-cols-11 gap-4 lg:gap-12';
    originalStatsContainer.setAttribute('data-stagger-children', 'true');

    const stat1 = document.createElement('div');
    stat1.className = 'stat stat-donut col-span-1 md:col-span-4';
    const stat2 = document.createElement('div');
    stat2.className = 'stat stat-standard col-span-1 md:col-span-3';

    originalStatsContainer.appendChild(stat1);
    originalStatsContainer.appendChild(stat2);

    const elements = [originalStatsContainer];
    const groups = ContentOverflowDetector.createSemanticGroups(elements);

    // Should create 2 individual stat groups
    expect(groups).toHaveLength(2);

    // When combined back, should preserve container attributes
    const combinedGroups =
      ContentOverflowDetector.combineIndividualStatsInPanel(groups, 0);
    expect(combinedGroups).toHaveLength(1);

    const combinedStatsContainer = combinedGroups[0].elements[0];
    expect(combinedStatsContainer.className).toContain('stats');
    expect(combinedStatsContainer.className).toContain('grid');
    expect(combinedStatsContainer.getAttribute('data-stagger-children')).toBe(
      'true'
    );
    expect(combinedStatsContainer.querySelectorAll('.stat')).toHaveLength(2);
  });
});

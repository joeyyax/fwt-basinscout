/**
 * Test for stats splitting functionality in ContentOverflowDetector
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ContentOverflowDetector } from '../../src/scripts/utils/content-overflow-detector.js';

// Mock the logger
vi.mock('../../src/scripts/utils/logger.js', () => ({
  log: {
    info: vi.fn(),
    debug: vi.fn(),
    error: vi.fn(),
  },
  EVENTS: {
    CONTENT: 'content',
  },
}));

describe('ContentOverflowDetector Stats Splitting', () => {
  let mockStatsContainer;
  let mockStat1;
  let mockStat2;
  let mockStat3;

  beforeEach(() => {
    // Create mock DOM elements
    mockStat1 = document.createElement('div');
    mockStat1.className = 'stat';
    mockStat1.textContent = 'Stat 1 Content';

    mockStat2 = document.createElement('div');
    mockStat2.className = 'stat';
    mockStat2.textContent = 'Stat 2 Content';

    mockStat3 = document.createElement('div');
    mockStat3.className = 'stat';
    mockStat3.textContent = 'Stat 3 Content';

    mockStatsContainer = document.createElement('div');
    mockStatsContainer.className = 'stats';
    mockStatsContainer.setAttribute('data-stats', 'true');
    mockStatsContainer.appendChild(mockStat1);
    mockStatsContainer.appendChild(mockStat2);
    mockStatsContainer.appendChild(mockStat3);
  });

  it('should split stats container into individual stat groups', () => {
    const elements = [mockStatsContainer];
    const groups = ContentOverflowDetector.createSemanticGroups(elements);

    expect(groups).toHaveLength(3); // Should create 3 individual stat groups

    // Check that each group is of type 'individual-stat'
    groups.forEach((group, index) => {
      expect(group.type).toBe('individual-stat');
      expect(group.elements).toHaveLength(1);
      expect(group.elements[0].className).toBe('stat');
      expect(group.needsStatsWrapper).toBe(true);
      expect(group.statIndex).toBe(index);
      expect(group.originalStatsContainer).toBe(mockStatsContainer);
    });
  });

  it('should preserve stats container attributes when creating individual groups', () => {
    const elements = [mockStatsContainer];
    const groups = ContentOverflowDetector.createSemanticGroups(elements);

    groups.forEach((group) => {
      expect(group.originalStatsContainer).toBe(mockStatsContainer);
      expect(group.originalStatsContainer.getAttribute('data-stats')).toBe(
        'true'
      );
    });
  });

  it('should handle mixed content with stats and other elements', () => {
    const heading = document.createElement('h3');
    heading.textContent = 'Test Heading';

    const paragraph = document.createElement('p');
    paragraph.textContent = 'Test paragraph';

    const elements = [heading, mockStatsContainer, paragraph];
    const groups = ContentOverflowDetector.createSemanticGroups(elements);

    expect(groups).toHaveLength(5); // 1 heading + 3 stats + 1 paragraph

    expect(groups[0].type).toBe('heading-group');
    expect(groups[0].elements[0]).toBe(heading);

    expect(groups[1].type).toBe('individual-stat');
    expect(groups[2].type).toBe('individual-stat');
    expect(groups[3].type).toBe('individual-stat');

    expect(groups[4].type).toBe('content-group');
    expect(groups[4].elements[0]).toBe(paragraph);
  });

  it('should reconstruct stats wrapper when adding groups to prose', () => {
    // Create a prose container
    const prose = document.createElement('div');
    prose.className = 'prose';

    // Create individual stat groups
    const statGroups = [
      {
        type: 'individual-stat',
        elements: [mockStat1],
        needsStatsWrapper: true,
        originalStatsContainer: mockStatsContainer,
        statIndex: 0,
      },
      {
        type: 'individual-stat',
        elements: [mockStat2],
        needsStatsWrapper: true,
        originalStatsContainer: mockStatsContainer,
        statIndex: 1,
      },
    ];

    ContentOverflowDetector.addGroupsToProse(prose, statGroups);

    // Should have created one stats wrapper
    const statsWrappers = prose.querySelectorAll('.stats');
    expect(statsWrappers).toHaveLength(1);

    // Stats wrapper should contain both stats
    const statsInWrapper = statsWrappers[0].querySelectorAll('.stat');
    expect(statsInWrapper).toHaveLength(2);
    expect(statsInWrapper[0]).toBe(mockStat1);
    expect(statsInWrapper[1]).toBe(mockStat2);

    // Stats wrapper should have copied attributes from original
    expect(statsWrappers[0].getAttribute('data-stats')).toBe('true');
  });

  it('should handle mixed content when adding groups to prose', () => {
    const prose = document.createElement('div');
    prose.className = 'prose';

    const heading = document.createElement('h3');
    heading.textContent = 'Test Heading';

    const groups = [
      {
        type: 'heading-group',
        elements: [heading],
      },
      {
        type: 'individual-stat',
        elements: [mockStat1],
        needsStatsWrapper: true,
        originalStatsContainer: mockStatsContainer,
      },
      {
        type: 'individual-stat',
        elements: [mockStat2],
        needsStatsWrapper: true,
        originalStatsContainer: mockStatsContainer,
      },
    ];

    ContentOverflowDetector.addGroupsToProse(prose, groups);

    // Should have heading, then stats wrapper
    expect(prose.children).toHaveLength(2);
    expect(prose.children[0]).toBe(heading);
    expect(prose.children[1].className).toBe('stats');

    // Stats wrapper should contain both stats
    const statsInWrapper = prose.children[1].querySelectorAll('.stat');
    expect(statsInWrapper).toHaveLength(2);
  });
});

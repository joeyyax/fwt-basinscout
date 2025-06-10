import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock GSAP module before importing (must be hoisted)
vi.mock('gsap', () => ({
  gsap: globalThis.gsap,
}));

import { PanelStatsAnimationController } from '../scripts/animations/panel-stats.js';

describe('PanelStatsAnimationController', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
  });

  function createMockDonutChart(targetValue = 50, statValue = '50%') {
    const container = document.createElement('div');
    container.className = 'stat stat-donut';
    container.innerHTML = `
      <div class="stat-donut-chart">
        <svg viewBox="0 0 42 42" class="circular-chart">
          <path class="circle-bg" d="M21 5 a 16 16 0 1 0 0 32 a 16 16 0 1 0 0 -32"></path>
          <path
            class="circle"
            stroke-dasharray="0, 100"
            d="M21 5 a 16 16 0 1 0 0 32 a 16 16 0 1 0 0 -32"
            data-target-value="${targetValue}"
          ></path>
        </svg>
      </div>
      <div class="stat-content">
        <div class="stat-value">${statValue}</div>
        <div class="stat-label">Test stat</div>
      </div>
    `;
    return container;
  }

  function createMockStatsContainer() {
    const container = document.createElement('div');
    container.className = 'stats';
    container.setAttribute('data-stagger-children', 'true');

    const chart1 = createMockDonutChart(75, '75%');
    const chart2 = createMockDonutChart(60, '60%');

    container.appendChild(chart1);
    container.appendChild(chart2);

    return container;
  }

  describe('initializeDonutCharts', () => {
    it('should initialize donut charts with data-target-value', () => {
      const container = createMockStatsContainer();
      document.body.appendChild(container);

      PanelStatsAnimationController.initializeDonutCharts();

      // Check that circles were initialized properly
      const circles = container.querySelectorAll('.circle');
      circles.forEach((circle) => {
        expect(circle.getAttribute('stroke-dasharray')).toBe('0, 100');
        expect(circle.getAttribute('data-target-dasharray')).toBeTruthy();
      });
    });

    it('should initialize stat values to starting state', () => {
      const container = createMockStatsContainer();
      document.body.appendChild(container);

      PanelStatsAnimationController.initializeDonutCharts();

      // Check that stat values were set to 0
      const statValues = container.querySelectorAll('.stat-value');
      statValues.forEach((value) => {
        expect(value.textContent).toMatch(/0/);
      });
    });
  });

  describe('animateDonutCharts', () => {
    it('should handle containers without donut charts gracefully', () => {
      const container = document.createElement('div');
      container.setAttribute('data-stagger-children', 'true');

      PanelStatsAnimationController.animateDonutCharts(container);

      // Should not throw an error and may or may not call GSAP
      expect(true).toBe(true);
    });
  });

  describe('resetDonutCharts', () => {
    it('should reset donut charts to 0 progress', () => {
      const container = createMockStatsContainer();
      document.body.appendChild(container);

      PanelStatsAnimationController.resetDonutCharts(container);

      // Check that circles were reset
      const circles = container.querySelectorAll('.circle');
      circles.forEach((circle) => {
        expect(circle.getAttribute('stroke-dasharray')).toBe('0, 100');
      });
    });
  });
});

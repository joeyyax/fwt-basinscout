/**
 * Test Utilities
 * Helper functions for creating test fixtures and assertions
 */

/**
 * Create a mock donut chart element with proper structure
 */
export function createMockDonutChart(targetValue = 50, statValue = '50%') {
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

/**
 * Create a mock stats container with stagger children
 */
export function createMockStatsContainer(donutCount = 2) {
  const container = document.createElement('div');
  container.className = 'stats';
  container.setAttribute('data-stagger-children', 'true');

  for (let i = 0; i < donutCount; i++) {
    const donut = createMockDonutChart(50 + i * 10, `${50 + i * 10}%`);
    container.appendChild(donut);
  }

  return container;
}

/**
 * Create a mock section with panels
 */
export function createMockSection(sectionId = 'test-section', panelCount = 2) {
  const section = document.createElement('section');
  section.id = sectionId;
  section.className = 'section';
  section.setAttribute('data-background', '/test-bg.jpg');

  const container = document.createElement('div');
  container.className = 'container';

  const titleWrapper = document.createElement('div');
  titleWrapper.className = 'title-wrapper';
  titleWrapper.innerHTML = '<h1>Test Section</h1>';

  const contentWrapper = document.createElement('div');
  contentWrapper.className = 'content-wrapper';

  const panelsContainer = document.createElement('div');
  panelsContainer.className = 'panels-container';

  for (let i = 0; i < panelCount; i++) {
    const panel = document.createElement('div');
    panel.className = 'panel';
    panel.innerHTML = `
      <div class="prose">
        <h2>Panel ${i + 1}</h2>
        <p>Test content for panel ${i + 1}</p>
      </div>
    `;
    panelsContainer.appendChild(panel);
  }

  contentWrapper.appendChild(panelsContainer);
  container.appendChild(titleWrapper);
  container.appendChild(contentWrapper);
  section.appendChild(container);

  return section;
}

/**
 * Create a mock app structure
 */
export function createMockApp() {
  const app = document.createElement('div');
  app.id = 'app';

  const main = document.createElement('main');
  main.id = 'sections-container';
  main.setAttribute('data-use-pagination', 'true');

  // Add intro section with stats
  const introSection = createMockSection('intro', 1);
  const statsContainer = createMockStatsContainer(2);
  const prose = introSection.querySelector('.prose');
  prose.appendChild(statsContainer);

  // Add map section
  const mapSection = createMockSection('map', 3);
  mapSection.setAttribute('data-use-pagination', 'true');

  main.appendChild(introSection);
  main.appendChild(mapSection);
  app.appendChild(main);

  // Add navigation container
  const nav = document.createElement('nav');
  nav.className = 'pagination pagination-section';
  app.appendChild(nav);

  return app;
}

/**
 * Wait for async operations to complete
 */
export function waitFor(condition, timeout = 1000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    function check() {
      if (condition()) {
        resolve();
      } else if (Date.now() - startTime >= timeout) {
        reject(new Error('Timeout waiting for condition'));
      } else {
        setTimeout(check, 10);
      }
    }

    check();
  });
}

/**
 * Simulate user interaction
 */
export function simulateEvent(element, eventType, options = {}) {
  const event = new Event(eventType, { bubbles: true, ...options });
  Object.assign(event, options);
  element.dispatchEvent(event);
  return event;
}

/**
 * Assert element visibility
 */
export function assertVisible(element) {
  const style = window.getComputedStyle(element);
  expect(style.display).not.toBe('none');
  expect(style.visibility).not.toBe('hidden');
  expect(parseFloat(style.opacity)).toBeGreaterThan(0);
}

/**
 * Assert element is hidden
 */
export function assertHidden(element) {
  const style = window.getComputedStyle(element);
  const isHidden =
    style.display === 'none' ||
    style.visibility === 'hidden' ||
    parseFloat(style.opacity) === 0;
  expect(isHidden).toBe(true);
}

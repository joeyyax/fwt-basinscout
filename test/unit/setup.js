/**
 * Test Setup File
 * Configures global test environment and mocks
 */
import { vi, afterEach } from 'vitest';

// Create shared mock instances
const mockObserverInstance = {
  kill: vi.fn(),
  enable: vi.fn(),
  disable: vi.fn(),
};

const mockGsapInstance = {
  kill: vi.fn(),
  play: vi.fn(),
  pause: vi.fn(),
  duration: vi.fn(() => 1),
  progress: vi.fn(() => 0),
};

// Mock GSAP for testing
globalThis.gsap = {
  set: vi.fn(() => mockGsapInstance),
  to: vi.fn(() => mockGsapInstance),
  fromTo: vi.fn(() => mockGsapInstance),
  timeline: vi.fn(() => ({
    to: vi.fn(),
    fromTo: vi.fn(),
    set: vi.fn(),
    play: vi.fn(),
    pause: vi.fn(),
    kill: vi.fn(),
    duration: vi.fn(() => 1),
    progress: vi.fn(() => 0),
  })),
  registerPlugin: vi.fn(),
  killTweensOf: vi.fn(),
  utils: {
    clamp: vi.fn((min, max, value) => Math.max(min, Math.min(max, value))),
  },
  core: {
    context: vi.fn(() => ({
      add: vi.fn(),
      kill: vi.fn(),
    })),
  },
};

// Mock GSAP plugins
globalThis.ScrollTrigger = {
  create: vi.fn(() => ({ kill: vi.fn() })),
  killAll: vi.fn(),
  refresh: vi.fn(),
};

globalThis.Observer = {
  create: vi.fn(() => mockObserverInstance),
};

// Mock window.location for localhost detection
Object.defineProperty(window, 'location', {
  value: {
    hostname: 'localhost',
    href: 'http://localhost:3000',
  },
  writable: true,
});

// Mock console methods to avoid noise in tests
globalThis.console = {
  ...console,
  debug: vi.fn(),
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

// Clean up after each test
afterEach(() => {
  // Reset all mocks
  vi.clearAllMocks();

  // Clean up DOM
  document.body.innerHTML = '';
  document.head.innerHTML = '';
});

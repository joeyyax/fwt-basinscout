/**
 * Logger System Tests
 * Tests for the simple logger API
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { log, EVENTS } from '../../src/scripts/utils/logger.js';

describe('Logger System', () => {
  beforeEach(() => {
    // Clear events before each test
    log.clear();
    vi.clearAllMocks();
  });

  describe('EVENTS constants', () => {
    it('should export event categories', () => {
      expect(EVENTS).toHaveProperty('ANIMATION');
      expect(EVENTS).toHaveProperty('BACKGROUND');
      expect(EVENTS).toHaveProperty('PANEL');
      expect(EVENTS).toHaveProperty('SECTION');
      expect(EVENTS).toHaveProperty('STATS');
      expect(EVENTS).toHaveProperty('APP');
      expect(EVENTS).toHaveProperty('NAVIGATION');
    });
  });

  describe('log.info', () => {
    it('should log info messages', () => {
      const testData = { test: 'data' };

      log.info(EVENTS.ANIMATION, 'Test message', testData);

      const events = log.getEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toMatchObject({
        category: EVENTS.ANIMATION,
        message: 'Test message',
        data: testData,
        level: 'info',
      });
    });

    it('should log without data', () => {
      log.info(EVENTS.APP, 'Simple message');

      const events = log.getEvents();
      expect(events[0].data).toBeNull();
    });
  });

  describe('log.debug', () => {
    it('should log debug messages', () => {
      log.debug(EVENTS.STATS, 'Debug message', { debug: true });

      const events = log.getEvents();
      expect(events[0].level).toBe('debug');
    });
  });

  describe('log.warn', () => {
    it('should log warning messages', () => {
      log.warn(EVENTS.NAVIGATION, 'Warning message');

      const events = log.getEvents();
      expect(events[0].level).toBe('warn');
    });
  });

  describe('log.error', () => {
    it('should log error messages', () => {
      log.error(EVENTS.ERROR, 'Error message', new Error('Test error'));

      const events = log.getEvents();
      expect(events[0].level).toBe('error');
    });
  });

  describe('getEvents', () => {
    it('should return all events when no category specified', () => {
      log.info(EVENTS.ANIMATION, 'Animation event');
      log.debug(EVENTS.STATS, 'Stats event');

      const events = log.getEvents();
      expect(events).toHaveLength(2);
    });

    it('should filter by category', () => {
      log.info(EVENTS.ANIMATION, 'Animation event');
      log.debug(EVENTS.STATS, 'Stats event');
      log.warn(EVENTS.ANIMATION, 'Another animation event');

      const animationEvents = log.getEvents(EVENTS.ANIMATION);
      expect(animationEvents).toHaveLength(2);
      expect(
        animationEvents.every((e) => e.category === EVENTS.ANIMATION)
      ).toBe(true);
    });
  });

  describe('clear', () => {
    it('should clear all events', () => {
      log.info(EVENTS.APP, 'Test');
      expect(log.getEvents()).toHaveLength(1);

      log.clear();
      expect(log.getEvents()).toHaveLength(0);
    });
  });

  describe('toggle', () => {
    it('should disable logging when toggled off', () => {
      log.toggle(false);
      log.info(EVENTS.APP, 'Should not be logged');

      expect(log.getEvents()).toHaveLength(0);
    });

    it('should enable logging when toggled on', () => {
      log.toggle(false);
      log.toggle(true);
      log.info(EVENTS.APP, 'Should be logged');

      expect(log.getEvents()).toHaveLength(1);
    });
  });

  describe('event storage limits', () => {
    it('should respect maxEvents limit', () => {
      // The logger is configured with maxEvents: 500
      // Let's test a smaller scenario
      const originalMaxEvents = log.maxEvents;
      log.maxEvents = 3;

      // Add 5 events
      for (let i = 0; i < 5; i++) {
        log.info(EVENTS.APP, `Event ${i}`);
      }

      const events = log.getEvents();
      expect(events).toHaveLength(3);

      // Should keep the most recent events
      expect(events[0].message).toBe('Event 2');
      expect(events[2].message).toBe('Event 4');

      // Restore original value
      log.maxEvents = originalMaxEvents;
    });
  });

  describe('complex data handling', () => {
    it('should handle circular references safely', () => {
      const obj = { name: 'test' };
      obj.self = obj; // Create circular reference

      expect(() => {
        log.info(EVENTS.DEBUG, 'Circular test', obj);
      }).not.toThrow();

      const events = log.getEvents();
      expect(events).toHaveLength(1);
    });

    it('should handle DOM elements', () => {
      const element = document.createElement('div');
      element.className = 'test-element';

      expect(() => {
        log.info(EVENTS.DEBUG, 'DOM test', { element });
      }).not.toThrow();
    });

    it('should handle arrays', () => {
      const testArray = ['item1', 'item2', 'item3'];

      log.info(EVENTS.DEBUG, 'Array test', testArray);

      const events = log.getEvents();
      expect(events[0].data).toEqual(testArray);
    });
  });
});

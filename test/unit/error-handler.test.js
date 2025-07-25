/**
 * Error Handler Tests
 * Tests for centralized error detection and handling
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ErrorHandler } from '../../src/scripts/utils/error-handler.js';
import { log, EVENTS } from '../../src/scripts/utils/logger.js';

// Mock the logger
vi.mock('../../src/scripts/utils/logger.js', () => ({
  log: {
    error: vi.fn(),
    info: vi.fn(),
  },
  EVENTS: {
    ERROR: 'error',
    APP: 'app',
  },
}));

describe('ErrorHandler', () => {
  beforeEach(() => {
    ErrorHandler.reset();
    vi.clearAllMocks();

    // Reset initialization state
    ErrorHandler.isInitialized = false;
  });

  describe('handleError', () => {
    it('should handle Error objects', () => {
      const error = new Error('Test error');
      const result = ErrorHandler.handleError(error);

      expect(result.message).toBe('Test error');
      expect(result.stack).toBe(error.stack);
      expect(log.error).toHaveBeenCalledWith(
        EVENTS.ERROR,
        'Application error detected',
        expect.objectContaining({
          message: 'Test error',
          count: 1,
        })
      );
    });

    it('should handle string errors', () => {
      const result = ErrorHandler.handleError('Simple error message');

      expect(result.message).toBe('Simple error message');
      expect(log.error).toHaveBeenCalled();
    });

    it('should include context information', () => {
      const context = { type: 'test', source: 'unit-test' };
      const result = ErrorHandler.handleError('Test error', context);

      expect(result.context).toEqual(context);
    });

    it('should increment error count', () => {
      ErrorHandler.handleError('Error 1');
      ErrorHandler.handleError('Error 2');

      const stats = ErrorHandler.getStats();
      expect(stats.errorCount).toBe(2);
    });
  });

  describe('wrap function', () => {
    it('should catch and handle synchronous errors', () => {
      const faultyFunction = () => {
        throw new Error('Wrapped error');
      };

      const wrapped = ErrorHandler.wrap(faultyFunction, 'test-context');

      expect(() => wrapped()).toThrow('Wrapped error');
      expect(log.error).toHaveBeenCalledWith(
        EVENTS.ERROR,
        'Application error detected',
        expect.objectContaining({
          message: 'Wrapped error',
          context: { context: 'test-context' },
        })
      );
    });

    it('should handle successful function calls', () => {
      const successFunction = (x, y) => x + y;
      const wrapped = ErrorHandler.wrap(successFunction, 'test-context');

      const result = wrapped(2, 3);
      expect(result).toBe(5);
      expect(log.error).not.toHaveBeenCalled();
    });

    it('should handle async function errors', async () => {
      const asyncFaultyFunction = async () => {
        throw new Error('Async error');
      };

      const wrapped = ErrorHandler.wrap(asyncFaultyFunction, 'async-context');

      await expect(wrapped()).rejects.toThrow('Async error');
      expect(log.error).toHaveBeenCalledWith(
        EVENTS.ERROR,
        'Application error detected',
        expect.objectContaining({
          message: 'Async error',
          context: { context: 'async-context', async: true },
        })
      );
    });
  });

  describe('report method', () => {
    it('should manually report errors', () => {
      const result = ErrorHandler.report('Manual error', { source: 'user' });

      expect(result.message).toBe('Manual error');
      expect(result.context.manual).toBe(true);
      expect(result.context.source).toBe('user');
    });
  });

  describe('critical error handling', () => {
    it('should detect when error threshold is reached', () => {
      // Set a low threshold for testing
      ErrorHandler.errorThreshold = 3;

      // Generate errors up to threshold
      ErrorHandler.handleError('Error 1');
      ErrorHandler.handleError('Error 2');
      ErrorHandler.handleError('Error 3'); // Should trigger critical

      // Should have logged the critical error
      expect(log.error).toHaveBeenCalledWith(
        EVENTS.APP,
        'Critical error threshold reached',
        expect.objectContaining({
          errorCount: 3,
          threshold: 3,
        })
      );
    });
  });

  describe('getStats', () => {
    it('should return error statistics', () => {
      ErrorHandler.handleError('Test error');
      const stats = ErrorHandler.getStats();

      expect(stats).toMatchObject({
        errorCount: 1,
        threshold: expect.any(Number),
        isInitialized: expect.any(Boolean),
      });
    });
  });

  describe('reset', () => {
    it('should reset error count', () => {
      ErrorHandler.handleError('Error 1');
      ErrorHandler.handleError('Error 2');

      expect(ErrorHandler.getStats().errorCount).toBe(2);

      ErrorHandler.reset();
      expect(ErrorHandler.getStats().errorCount).toBe(0);
    });
  });

  describe('isDevelopment', () => {
    it('should detect development environment', () => {
      // In test environment, this should return false since hostname is not localhost
      const isDev = ErrorHandler.isDevelopment();
      expect(typeof isDev).toBe('boolean');
    });
  });
});

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TitleAnimationController } from '../scripts/animations/titles.js';
import { CONFIG } from '../scripts/constants.js';

// Mock GSAP before importing
vi.mock('gsap', () => ({
  gsap: globalThis.gsap,
}));

describe('TitleAnimationController - Border Enhancement', () => {
  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  function createMockTitleElement() {
    const titleWrapper = document.createElement('div');
    titleWrapper.className = 'title-wrapper';

    const titleElement = document.createElement('h1');
    titleElement.textContent = 'Test Title';

    titleWrapper.appendChild(titleElement);
    document.body.appendChild(titleWrapper);

    return titleElement;
  }

  describe('Title Border Creation', () => {
    it('should create a border element with correct Tailwind classes', () => {
      const titleElement = createMockTitleElement();

      // Call the actual method from our controller
      TitleAnimationController.createTitleBorder(titleElement);

      const titleWrapper = titleElement.closest('.title-wrapper');
      const border = titleWrapper.querySelector('.title-border');
      expect(border).toBeTruthy();
      expect(border.className).toContain('title-border');
      expect(border.className).toContain('absolute');
      expect(border.className).toContain('bottom-0');
      expect(border.className).toContain('left-0');
      expect(border.className).toContain('h-1');
      expect(border.className).toContain('bg-white');
      expect(border.className).toContain('w-full');
    });

    it('should set correct CSS properties for animation', () => {
      const titleElement = createMockTitleElement();

      TitleAnimationController.createTitleBorder(titleElement);
      const titleWrapper = titleElement.closest('.title-wrapper');
      const borderElement = titleWrapper.querySelector('.title-border');

      // Verify that gsap.set was called with correct parameters for initial transform
      expect(globalThis.gsap.set).toHaveBeenCalledWith(borderElement, {
        xPercent: CONFIG.ANIMATION.TITLE_BORDER_INITIAL_X_PERCENT,
        opacity: 0,
      });

      // Check inline styles that are set directly (not via GSAP)
      expect(borderElement.style.opacity).toBe('0');
      expect(borderElement.style.willChange).toBe('transform, opacity');
      expect(borderElement.style.zIndex).toBe('1');
    });

    it('should prevent duplicate borders on the same element', () => {
      const titleElement = createMockTitleElement();
      const titleWrapper = titleElement.closest('.title-wrapper');

      // Create first border
      TitleAnimationController.createTitleBorder(titleElement);
      expect(titleWrapper.querySelectorAll('.title-border')).toHaveLength(1);

      // Attempt to create second border (should remove first)
      TitleAnimationController.createTitleBorder(titleElement);
      expect(titleWrapper.querySelectorAll('.title-border')).toHaveLength(1);
    });
  });

  describe('Title Border Removal', () => {
    it('should remove existing border elements', () => {
      const titleElement = createMockTitleElement();
      const titleWrapper = titleElement.closest('.title-wrapper');

      // Create border first
      TitleAnimationController.createTitleBorder(titleElement);
      expect(titleWrapper.querySelector('.title-border')).toBeTruthy();

      // Remove border
      TitleAnimationController.removeTitleBorder(titleElement);
      expect(titleWrapper.querySelector('.title-border')).toBeNull();
    });

    it('should handle removal when no border exists', () => {
      const titleElement = createMockTitleElement();

      // Should not throw error when no border exists
      expect(() => {
        TitleAnimationController.removeTitleBorder(titleElement);
      }).not.toThrow();
    });
  });

  describe('Integration Tests', () => {
    it('should handle slide-right animation data attribute', () => {
      const titleElement = createMockTitleElement();

      // Mock a section with slide-right animation
      const mockSection = document.createElement('section');
      mockSection.dataset.titleAnimation = 'slide-right';

      // Test that getTitleAnimationType method works correctly
      const sections = [mockSection];
      const sectionIndex = 0;
      const animationType =
        sections[sectionIndex]?.dataset.titleAnimation || 'fade-up';

      expect(animationType).toBe('slide-right');

      // Test that createTitleBorder works for slide-right
      if (animationType === 'slide-right') {
        TitleAnimationController.createTitleBorder(titleElement);
        const titleWrapper = titleElement.closest('.title-wrapper');
        expect(titleWrapper.querySelector('.title-border')).toBeTruthy();
      }
    });
  });
});

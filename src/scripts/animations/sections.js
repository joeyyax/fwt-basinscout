/**
 * Section Animation Controller
 * Handles section-level transitions, fades, and background changes
 */

import { gsap } from 'gsap';
import { CONFIG } from '../constants.js';
import { appState } from '../state.js';
import { log, EVENTS } from '../utils/logger.js';

export class SectionAnimationController {
  // Initialize all sections for first load
  static initializeSections() {
    const sections = appState.getSections();

    sections.forEach((section, sectionIndex) => {
      // Set initial section visibility
      if (sectionIndex === 0) {
        gsap.set(section, { zIndex: 10, opacity: 1 });
      } else {
        gsap.set(section, { zIndex: 1, opacity: 0 });
      }
    });

    // Initialize background image system
    this.initializeBackgroundSystem();
  }

  // Initialize background image system with stacked layers
  static initializeBackgroundSystem() {
    const backgroundContainer = appState.getBackgroundContainer();
    const sections = appState.getSections();

    // Clear any existing background
    backgroundContainer.style.background = '';
    backgroundContainer.innerHTML = '';

    // Create background layers for each unique image/blur combination
    const uniqueImages = new Set();
    const imageBlurMap = new Map();
    let firstSectionKey = null;

    sections.forEach((section, index) => {
      const background = section.dataset.background;
      const blur = section.dataset.backgroundBlur;
      const scale = section.dataset.backgroundScale;
      const rotate = section.dataset.backgroundRotate;
      const opacity = section.dataset.backgroundOpacity;

      if (background) {
        const key = `${background}${blur ? `_blur_${blur}` : ''}`;
        uniqueImages.add(key);

        // Store the first section's key for initial visibility
        if (index === 0) {
          firstSectionKey = key;
        }

        if (!imageBlurMap.has(key)) {
          imageBlurMap.set(key, {
            image: background,
            blur: blur || null,
            sections: [
              {
                index,
                scale: scale || null,
                rotate: rotate || null,
                opacity: opacity || null,
              },
            ],
          });
        } else {
          imageBlurMap.get(key).sections.push({
            index,
            scale: scale || null,
            rotate: rotate || null,
            opacity: opacity || null,
          });
        }
      }
    });

    // Create DOM elements for each unique background
    let layerIndex = 0;

    uniqueImages.forEach((key) => {
      const data = imageBlurMap.get(key);

      // Create layer container
      const layer = document.createElement('div');
      layer.classList.add('background-layer');
      layer.dataset.image = data.image;
      layer.dataset.blur = data.blur || 'none';
      layer.dataset.key = key; // Store key for easy lookup

      const isInitialLayer = key === firstSectionKey;

      // Get initial transform values from the first section that uses this layer
      let initialOpacity = 0; // Always start at 0 for smooth animation
      if (isInitialLayer && data.sections.length > 0) {
        const firstSection = data.sections.find((s) => s.index === 0);
        if (firstSection) {
          const _transforms = this.parseTransformValues(firstSection);
          // Store target opacity for animation, but start at 0
          initialOpacity = 0;
        }
      }

      // Set layer container styles with proper stacking order
      layer.style.cssText = `
        position: absolute;
        inset: 0;
        opacity: ${isInitialLayer ? initialOpacity : 0};
        z-index: ${layerIndex + 1}; /* Higher z-index for layers that come later in the sequence */
        will-change: opacity, transform${data.blur ? ', filter' : ''};
        transform: translateZ(0); /* Only use hardware acceleration, let GSAP handle transforms */
        ${data.blur ? `filter: blur(${data.blur});` : ''}
      `;

      // Create the actual image element
      const img = document.createElement('img');
      img.src = data.image;
      img.alt = `Background image for section`;
      img.loading = 'eager'; // Load immediately for smooth transitions
      img.style.cssText = `
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center;
        display: block;
        opacity: 1;
        z-index: 0;
      `;

      // Start layer animation immediately when image loads (no delay)
      img.addEventListener('load', () => {
        if (isInitialLayer) {
          // Start the background animation immediately once image is ready
          this.animateInitialBackgroundLayer(layer);
        }
      });

      // Handle loading errors gracefully
      img.addEventListener('error', () => {
        log.error(EVENTS.BACKGROUND, 'Failed to load background image', {
          image: data.image,
        });
        // Image should always be visible, even if broken
        if (isInitialLayer) {
          // Start the background animation even with broken image
          this.animateInitialBackgroundLayer(layer);
        }
      });

      // Assemble the layer (just the image, no individual overlay)
      layer.appendChild(img);
      backgroundContainer.appendChild(layer);

      // Set initial GSAP transform values for the first section's layer (FROM values, not TO values)
      if (isInitialLayer && data.sections.length > 0) {
        const firstSection = data.sections.find((s) => s.index === 0);
        if (firstSection) {
          const transforms = this.parseTransformValues(firstSection);
          // Set initial FROM values so animation can happen
          gsap.set(layer, {
            scale: transforms.from.scale,
            rotation: transforms.from.rotate,
            opacity: transforms.from.opacity,
          });
        }
      }

      layerIndex++;
    });

    // Create a single global overlay on top of all background images
    const globalOverlay = document.createElement('div');
    globalOverlay.classList.add('global-background-overlay');
    globalOverlay.style.cssText = `
      position: absolute;
      inset: 0;
      background: radial-gradient(
        circle at center,
        transparent 0%,
        rgba(0, 0, 0, 0.3) 40%,
        rgba(0, 0, 0, 1) 100%
      );
      pointer-events: none;
      z-index: 100;
      opacity: 0;
    `;
    backgroundContainer.appendChild(globalOverlay);

    // Animate the overlay in with a delay on initial load
    gsap.to(globalOverlay, {
      opacity: 1,
      duration: CONFIG.ANIMATION.BACKGROUND_OVERLAY_FADE_DURATION,
      delay: CONFIG.INITIAL_BACKGROUND_OVERLAY_DELAY / 1000, // Convert ms to seconds
      ease: 'power2.out',
    });

    // Store image mapping for quick lookups
    this.imageLayerMap = imageBlurMap;

    // Preload all background images for smooth transitions
    this.preloadBackgroundImages(uniqueImages);
  }

  // Parse transform values from section data attributes
  static parseTransformValues(sectionData) {
    log.debug(EVENTS.SECTION, 'Parsing section data', sectionData);

    const defaults = {
      scale: 1,
      rotate: 0,
      opacity: 0, // Default should be 0 to match "0 1" pattern from user specs
    };

    const from = { ...defaults };
    const to = { ...defaults };

    // For opacity, the default should be "0 1" (from 0 to 1)
    to.opacity = 1; // Set default "to" value to 1

    // Parse scale
    if (sectionData.scale) {
      const scaleValues = sectionData.scale
        .split(' ')
        .map((v) => parseFloat(v.trim()));
      if (scaleValues.length === 1) {
        from.scale = to.scale = scaleValues[0];
      } else if (scaleValues.length === 2) {
        from.scale = scaleValues[0];
        to.scale = scaleValues[1];
      }
      log.debug(EVENTS.SECTION, 'Scale values:', {
        input: sectionData.scale,
        from: from.scale,
        to: to.scale,
      });
    }

    // Parse rotate
    if (sectionData.rotate) {
      const rotateValues = sectionData.rotate.split(' ').map((v) => v.trim());
      if (rotateValues.length === 1) {
        from.rotate = to.rotate = parseFloat(rotateValues[0]);
      } else if (rotateValues.length === 2) {
        from.rotate = parseFloat(rotateValues[0]);
        to.rotate = parseFloat(rotateValues[1]);
      }
      log.debug(EVENTS.SECTION, 'Rotate values:', {
        input: sectionData.rotate,
        from: from.rotate,
        to: to.rotate,
      });
    }

    // Parse opacity
    if (sectionData.opacity) {
      const opacityValues = sectionData.opacity
        .split(' ')
        .map((v) => parseFloat(v.trim()));
      if (opacityValues.length === 1) {
        from.opacity = to.opacity = opacityValues[0];
      } else if (opacityValues.length === 2) {
        from.opacity = opacityValues[0];
        to.opacity = opacityValues[1];
      }
      log.debug(EVENTS.SECTION, 'Opacity values:', {
        input: sectionData.opacity,
        from: from.opacity,
        to: to.opacity,
      });
    }

    const result = { from, to };
    log.debug(EVENTS.SECTION, 'Final parsed values:', result);
    return result;
  }

  // Build CSS transform string from transform values
  static buildTransformString(transforms) {
    const parts = [];

    if (transforms.scale !== 1) {
      parts.push(`scale(${transforms.scale})`);
    }

    if (transforms.rotate !== 0) {
      parts.push(`rotate(${transforms.rotate}deg)`);
    }

    // Always include translateZ for hardware acceleration
    parts.push('translateZ(0)');

    return parts.join(' ');
  }

  // Animate initial background transforms (called after page load)
  static animateInitialBackground() {
    const sections = appState.getSections();
    const firstSection = sections[0];

    if (!firstSection) return;

    const backgroundContainer = appState.getBackgroundContainer();
    const background = firstSection.dataset.background;
    const blur = firstSection.dataset.backgroundBlur;

    if (!background) return;

    const key = `${background}${blur ? `_blur_${blur}` : ''}`;
    const targetLayer = backgroundContainer.querySelector(
      `.background-layer[data-key="${key}"]`
    );

    if (!targetLayer) return;

    // Find the section data for transform values
    const sectionData = this.imageLayerMap
      .get(key)
      ?.sections.find((s) => s.index === 0);

    if (sectionData) {
      const transforms = this.parseTransformValues(sectionData);

      // Debug logging
      log.debug(EVENTS.SECTION, 'Initial background animation:', {
        from: transforms.from,
        to: transforms.to,
        layer: targetLayer,
      });

      // Create timeline for staggered animations
      const timeline = gsap.timeline();

      // Step 1: Opacity animation
      timeline.to(targetLayer, {
        opacity: transforms.to.opacity,
        duration: CONFIG.ANIMATION.BACKGROUND_OPACITY_DURATION,
        ease: 'power2.out',
        delay: 0,
      });

      // Step 2: Always animate transforms (force animation even if they seem at defaults)
      log.debug(
        EVENTS.SECTION,
        'Forcing transform animation regardless of values',
        {
          scale: `${transforms.from.scale} → ${transforms.to.scale}`,
          rotation: `${transforms.from.rotate} → ${transforms.to.rotate}`,
        }
      );

      timeline.to(
        targetLayer,
        {
          scale: transforms.to.scale,
          rotation: transforms.to.rotate,
          duration: CONFIG.ANIMATION.BACKGROUND_TRANSFORM_DURATION,
          ease: 'power2.out',
          onStart: () =>
            log.debug(EVENTS.SECTION, 'Transform animation started'),
          onUpdate: () => log.debug(EVENTS.SECTION, 'Transform animating...'),
          onComplete: () =>
            log.debug(EVENTS.SECTION, 'Transform animation completed'),
        },
        `-=${CONFIG.ANIMATION.BACKGROUND_TRANSFORM_OVERLAP}`
      ); // Start almost immediately after opacity

      return timeline;
    }
  }

  // Animate a specific background layer immediately (called when image loads)
  static animateInitialBackgroundLayer(layer) {
    // Find the section data for transform values
    const key = layer.dataset.key;
    const sectionData = this.imageLayerMap
      .get(key)
      ?.sections.find((s) => s.index === 0);

    if (sectionData) {
      const transforms = this.parseTransformValues(sectionData);

      log.debug(
        EVENTS.SECTION,
        'Starting immediate background layer animation',
        {
          from: transforms.from,
          to: transforms.to,
          layer,
        }
      );

      // Layer should already be set to FROM values during initialization
      // Create timeline for staggered animations (no delay)
      const timeline = gsap.timeline();

      // Step 1: Opacity animation
      timeline.to(layer, {
        opacity: transforms.to.opacity,
        duration: CONFIG.ANIMATION.BACKGROUND_OPACITY_DURATION,
        ease: 'power2.out',
      });

      // Step 2: Transform animations
      timeline.to(
        layer,
        {
          scale: transforms.to.scale,
          rotation: transforms.to.rotate,
          duration: CONFIG.ANIMATION.BACKGROUND_TRANSFORM_DURATION,
          ease: 'power2.out',
        },
        `-=${CONFIG.ANIMATION.BACKGROUND_TRANSFORM_OVERLAP}`
      ); // Start almost immediately after opacity

      return timeline;
    }
  }

  // Preload background images to prevent loading delays during transitions
  static preloadBackgroundImages(uniqueImages) {
    const preloadedImages = new Set();

    uniqueImages.forEach((key) => {
      const data = this.imageLayerMap.get(key);
      if (data && data.image && !preloadedImages.has(data.image)) {
        const img = new Image();
        img.src = data.image;
        preloadedImages.add(data.image);
      }
    });
  }

  // Handle section fade transition with coordinated animations
  static animateSectionTransition(timeline, currentSection, targetSection) {
    // Get section indices for background and title coordination
    const sections = appState.getSections();
    const currentSectionIndex = Array.from(sections).indexOf(currentSection);
    const targetSectionIndex = Array.from(sections).indexOf(targetSection);

    // Determine if we're going forward or backward
    const goingForward = targetSectionIndex > currentSectionIndex;

    timeline
      .set(targetSection, { zIndex: 10 })
      // Fade out current section
      .to(currentSection, {
        opacity: 0,
        duration: CONFIG.ANIMATION.SECTION_FADE_DURATION,
      })
      // Background image transition happens AFTER section fade out is complete
      .add(() => {
        this.transitionBackgroundImage(
          timeline,
          targetSectionIndex,
          goingForward
        );
      })
      // Fade in target section
      .to(targetSection, {
        opacity: 1,
        duration: CONFIG.ANIMATION.SECTION_FADE_DURATION,
      })
      .set(currentSection, { zIndex: 1 });

    return {
      currentSectionIndex,
      targetSectionIndex,
    };
  }

  // Transition between background images with directional stacking
  static transitionBackgroundImage(
    timeline,
    targetSectionIndex,
    goingForward = true
  ) {
    const backgroundContainer = appState.getBackgroundContainer();
    const sections = appState.getSections();
    const targetSection = sections[targetSectionIndex];

    if (!targetSection) return;

    const targetBackground = targetSection.dataset.background;
    const targetBlur = targetSection.dataset.backgroundBlur;
    const _targetScale = targetSection.dataset.backgroundScale;
    const _targetRotate = targetSection.dataset.backgroundRotate;
    const _targetOpacity = targetSection.dataset.backgroundOpacity;

    if (!targetBackground) return;

    const targetKey = `${targetBackground}${targetBlur ? `_blur_${targetBlur}` : ''}`;
    const currentLayers =
      backgroundContainer.querySelectorAll('.background-layer');
    const targetLayer = Array.from(currentLayers).find(
      (layer) => layer.dataset.key === targetKey
    );

    if (!targetLayer) return;

    // Find the section data for transform values
    const targetSectionData = this.imageLayerMap
      .get(targetKey)
      ?.sections.find((s) => s.index === targetSectionIndex);

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    const transitionDuration = prefersReducedMotion
      ? 0.1
      : CONFIG.ANIMATION.BACKGROUND_TRANSITION_DURATION;

    // Create smooth transition timeline
    const backgroundTimeline = gsap.timeline();

    if (goingForward) {
      // Going forward: fade IN the target layer (stack on top)

      // Add transform animations if transforms are defined
      if (targetSectionData) {
        const transforms = this.parseTransformValues(targetSectionData);

        // Step 1: Consistent opacity animation
        backgroundTimeline.to(
          targetLayer,
          {
            opacity: transforms.to.opacity,
            duration: CONFIG.ANIMATION.BACKGROUND_OPACITY_DURATION,
            ease: 'power2.inOut',
          },
          '<'
        );

        // Step 2: Much longer transform animations for dramatic effect
        if (transforms.to.scale !== 1 || transforms.to.rotate !== 0) {
          backgroundTimeline.to(
            targetLayer,
            {
              scale: transforms.to.scale,
              rotation: transforms.to.rotate,
              duration: CONFIG.ANIMATION.BACKGROUND_TRANSFORM_DURATION * 1.25, // Slightly longer for transitions
              ease: 'power2.out',
            },
            `-=${CONFIG.ANIMATION.BACKGROUND_TRANSFORM_OVERLAP}`
          );
        }
      } else {
        // No transforms, just opacity
        backgroundTimeline.to(
          targetLayer,
          {
            opacity: 1,
            duration: transitionDuration,
            ease: 'power2.inOut',
          },
          '<'
        );
      }
    } else {
      // Going backward: fade OUT layers that come after the target
      const _currentSectionIndex = appState.getCurrentSection();

      // Find all layers that should be hidden (sections after the target)
      currentLayers.forEach((layer) => {
        const layerData = this.imageLayerMap.get(layer.dataset.key);
        if (layerData && layerData.sections) {
          // Check if this layer belongs to sections after the target
          const hasLaterSections = layerData.sections.some(
            (sectionObj) => sectionObj.index > targetSectionIndex
          );
          if (hasLaterSections && parseFloat(layer.style.opacity) > 0) {
            backgroundTimeline.to(
              layer,
              {
                opacity: 0,
                duration: transitionDuration,
                ease: 'power2.inOut',
              },
              '<'
            );
          }
        }
      });

      // Ensure target layer is visible with proper transforms
      if (parseFloat(targetLayer.style.opacity) < 1) {
        // Add transform animations if transforms are defined
        if (targetSectionData) {
          const transforms = this.parseTransformValues(targetSectionData);

          // Step 1: Consistent opacity animation
          backgroundTimeline.to(
            targetLayer,
            {
              opacity: transforms.to.opacity,
              duration: CONFIG.ANIMATION.BACKGROUND_OPACITY_DURATION,
              ease: 'power2.inOut',
            },
            '<'
          );

          // Step 2: Much longer transform animations for dramatic effect
          if (transforms.to.scale !== 1 || transforms.to.rotate !== 0) {
            backgroundTimeline.to(
              targetLayer,
              {
                scale: transforms.to.scale,
                rotation: transforms.to.rotate,
                duration: CONFIG.ANIMATION.BACKGROUND_TRANSFORM_DURATION * 1.25, // Slightly longer for transitions
                ease: 'power2.out',
              },
              `-=${CONFIG.ANIMATION.BACKGROUND_TRANSFORM_OVERLAP}`
            );
          }
        } else {
          // No transforms, just opacity
          backgroundTimeline.to(
            targetLayer,
            {
              opacity: 1,
              duration: transitionDuration,
              ease: 'power2.inOut',
            },
            '<'
          );
        }
      }
    }

    // Add background transition to main timeline
    timeline.add(backgroundTimeline, '<');
  }

  // Get background from section data attribute
  static getSectionBackground(sectionIndex) {
    const sections = appState.getSections();
    const section = sections[sectionIndex];
    return section ? section.dataset.background : null;
  }

  // Update background image (for direct background changes with directional stacking)
  static updateBackground() {
    const currentSectionIndex = appState.getCurrentSection();
    const sections = appState.getSections();
    const currentSection = sections[currentSectionIndex];

    if (!currentSection) return;

    const backgroundContainer = appState.getBackgroundContainer();
    const targetBackground = currentSection.dataset.background;
    const targetBlur = currentSection.dataset.backgroundBlur;

    if (!targetBackground) return;

    const targetKey = `${targetBackground}${targetBlur ? `_blur_${targetBlur}` : ''}`;
    const currentLayers =
      backgroundContainer.querySelectorAll('.background-layer');
    const targetLayer = Array.from(currentLayers).find(
      (layer) => layer.dataset.key === targetKey
    );

    if (!targetLayer) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    const transitionDuration = prefersReducedMotion
      ? 0.1
      : CONFIG.ANIMATION.BACKGROUND_TRANSITION_DURATION;

    // Show appropriate layers based on current section
    currentLayers.forEach((layer) => {
      const layerData = this.imageLayerMap.get(layer.dataset.key);
      if (layerData && layerData.sections) {
        // Check if this layer should be visible (belongs to current section or earlier)
        const shouldBeVisible = layerData.sections.some(
          (sectionObj) => sectionObj.index <= currentSectionIndex
        );
        const currentOpacity = parseFloat(layer.style.opacity);

        if (shouldBeVisible && currentOpacity < 1) {
          // Find the section data for current section
          const currentSectionData = layerData.sections.find(
            (sectionObj) => sectionObj.index === currentSectionIndex
          );

          // Add transform animations if transforms are defined for current section
          if (currentSectionData) {
            const transforms = this.parseTransformValues(currentSectionData);

            // Create timeline for staggered animations
            const layerTimeline = gsap.timeline();

            // Step 1: Consistent opacity animation
            layerTimeline.to(layer, {
              opacity: transforms.to.opacity,
              duration: CONFIG.ANIMATION.BACKGROUND_OPACITY_DURATION,
              ease: 'power2.inOut',
            });

            // Step 2: Longer transform animations for dramatic effect
            if (transforms.to.scale !== 1 || transforms.to.rotate !== 0) {
              layerTimeline.to(
                layer,
                {
                  scale: transforms.to.scale,
                  rotation: transforms.to.rotate,
                  duration:
                    CONFIG.ANIMATION.BACKGROUND_TRANSFORM_DURATION * 0.75, // Shorter for direct updates
                  ease: 'power2.out',
                },
                `-=${CONFIG.ANIMATION.BACKGROUND_TRANSFORM_OVERLAP * 2}`
              ); // Start before opacity finishes
            }
          } else {
            // No transforms, just opacity
            gsap.to(layer, {
              opacity: 1,
              duration: transitionDuration,
              ease: 'power2.inOut',
            });
          }
        } else if (!shouldBeVisible && currentOpacity > 0) {
          // Fade out layer
          gsap.to(layer, {
            opacity: 0,
            duration: transitionDuration,
            ease: 'power2.inOut',
          });
        }
      }
    });
  }

  // Show specific section (for direct navigation)
  static showSection(sectionIndex) {
    const sections = appState.getSections();
    const section = sections[sectionIndex];

    if (section) {
      gsap.set(section, { zIndex: 10, opacity: 1 });
      this.updateBackground();
    }
  }

  // Hide specific section
  static hideSection(sectionIndex) {
    const sections = appState.getSections();
    const section = sections[sectionIndex];

    if (section) {
      gsap.set(section, { zIndex: 1, opacity: 0 });
    }
  }

  // Future: Stats overlay animations for your complex map system
  static animateStatsOverlay(sectionIndex, statsData) {
    // Placeholder for stats animations
    // Will handle the stat overlays visible in your 4_Stats, 9a_Stats, 9b_Stats folders
    log.debug(
      EVENTS.SECTION,
      `Future: Animate stats overlay for section ${sectionIndex}`,
      statsData
    );
  }

  // Future: Interactive marker animations
  static animateMarkers(sectionIndex, markerType = 'drain-dots') {
    // Placeholder for marker animations
    // Will handle drain dots, supply canals, field selections
    log.debug(
      EVENTS.SECTION,
      `Future: Animate ${markerType} for section ${sectionIndex}`
    );
  }
}

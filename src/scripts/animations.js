// Animation utilities using GSAP - Refactored to component-based architecture
// This file now acts as a proxy to the new component-based animation system
// Maintains backward compatibility while providing access to the new modular structure

export {
  AnimationController,
  SectionAnimationController,
  PanelAnimationController,
  TitleAnimationController,
  MediaStackController,
  MediaImagesController,
  MediaMarkersController,
  MediaStatsController,
  BackgroundController,
  PanelStatsAnimationController,
  PaginationAnimationController,
} from './animations/index.js';

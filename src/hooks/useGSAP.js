import { useEffect, useRef } from 'preact/hooks';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Custom hook for GSAP animations
 * @param {Function} animationCallback - Function that sets up GSAP animations
 * @param {Array} deps - Dependencies array for useEffect
 */
export function useGSAP(animationCallback, deps = []) {
  const timelineRef = useRef(null);

  useEffect(() => {
    // Create a new timeline
    timelineRef.current = gsap.timeline();

    // Run the animation callback with the timeline
    const cleanup = animationCallback(timelineRef.current, gsap, ScrollTrigger);

    // Cleanup function
    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
      if (typeof cleanup === 'function') {
        cleanup();
      }
    };
  }, deps);

  return timelineRef.current;
}

/**
 * Hook for scroll-triggered animations
 */
export function useScrollTrigger(elementRef, animationConfig, deps = []) {
  useEffect(() => {
    if (!elementRef.current) return;

    const animation = gsap.to(elementRef.current, {
      scrollTrigger: {
        trigger: elementRef.current,
        ...animationConfig.trigger,
      },
      ...animationConfig.animation,
    });

    return () => {
      animation.kill();
    };
  }, deps);
}

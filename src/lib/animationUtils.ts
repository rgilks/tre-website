/**
 * Utility functions for animation configurations
 */

/**
 * Staggered animation delays for hero section elements
 */
export function getHeroAnimationDelays(): number[] {
  return [0, 0.2, 0.4]
}

/**
 * Creates animation configurations for hero section elements
 */
export function getHeroAnimations() {
  return getHeroAnimationDelays().map(delay => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay, ease: 'easeOut' as const },
  }))
}

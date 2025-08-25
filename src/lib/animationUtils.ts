/**
 * Utility functions for animation configurations
 */

/**
 * Staggered animation delays for hero section elements
 */
export function getHeroAnimationDelays(): number[] {
  return [0, 0.3, 0.6]
}

/**
 * Creates animation configurations for hero section elements
 */
export function getHeroAnimations() {
  return getHeroAnimationDelays().map(delay => ({
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 1, delay, ease: 'easeOut' as const },
  }))
}

/**
 * Utility functions for animation configurations
 */

export interface AnimationConfig {
  initial: { opacity: number; y: number }
  animate: { opacity: number; y: number }
  transition: { duration: number; delay?: number; ease: "easeOut" | "easeIn" | "easeInOut" }
}

/**
 * Standard fade-in-up animation configuration
 * @param delay - Delay before animation starts (in seconds)
 * @returns Animation configuration object
 */
export function getFadeInUpAnimation(delay: number = 0): AnimationConfig {
  return {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay, ease: 'easeOut' }
  }
}

/**
 * Quick fade-in animation for interactive elements
 * @returns Animation configuration object
 */
export function getQuickFadeInAnimation(): AnimationConfig {
  return {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: 'easeOut' },
  }
}

/**
 * Hover animation for interactive elements
 * @returns Hover animation configuration
 */
export function getHoverAnimation() {
  return {
    whileHover: { y: -5 },
  }
}

/**
 * Staggered animation delays for hero section elements
 * @returns Array of delay values for staggered animations
 */
export function getHeroAnimationDelays(): number[] {
  return [0, 0.2, 0.4]
}

/**
 * Creates animation configurations for hero section elements
 * @returns Array of animation configurations
 */
export function getHeroAnimations(): AnimationConfig[] {
  return getHeroAnimationDelays().map(delay => getFadeInUpAnimation(delay))
}

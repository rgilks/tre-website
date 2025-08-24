import { describe, it, expect } from 'vitest'
import { 
  getFadeInUpAnimation, 
  getQuickFadeInAnimation, 
  getHoverAnimation, 
  getHeroAnimationDelays, 
  getHeroAnimations 
} from './animationUtils'

describe('animationUtils', () => {
  describe('getFadeInUpAnimation', () => {
    it('should return default animation without delay', () => {
      const result = getFadeInUpAnimation()
      
      expect(result.initial).toEqual({ opacity: 0, y: 20 })
      expect(result.animate).toEqual({ opacity: 1, y: 0 })
      expect(result.transition).toEqual({ duration: 0.8, delay: 0, ease: 'easeOut' })
    })

    it('should return animation with custom delay', () => {
      const result = getFadeInUpAnimation(0.5)
      
      expect(result.transition.delay).toBe(0.5)
      expect(result.transition.duration).toBe(0.8)
      expect(result.transition.ease).toBe('easeOut')
    })

    it('should handle zero delay', () => {
      const result = getFadeInUpAnimation(0)
      
      expect(result.transition.delay).toBe(0)
    })
  })

  describe('getQuickFadeInAnimation', () => {
    it('should return quick animation configuration', () => {
      const result = getQuickFadeInAnimation()
      
      expect(result.initial).toEqual({ opacity: 0, y: 20 })
      expect(result.animate).toEqual({ opacity: 1, y: 0 })
      expect(result.transition).toEqual({ duration: 0.5, ease: 'easeOut' })
    })

    it('should have shorter duration than standard animation', () => {
      const quick = getQuickFadeInAnimation()
      const standard = getFadeInUpAnimation()
      
      expect(quick.transition.duration).toBeLessThan(standard.transition.duration)
    })
  })

  describe('getHoverAnimation', () => {
    it('should return hover animation configuration', () => {
      const result = getHoverAnimation()
      
      expect(result.whileHover).toEqual({ y: -5 })
    })
  })

  describe('getHeroAnimationDelays', () => {
    it('should return array of staggered delays', () => {
      const result = getHeroAnimationDelays()
      
      expect(result).toEqual([0, 0.2, 0.4])
      expect(result).toHaveLength(3)
    })

    it('should have increasing delay values', () => {
      const delays = getHeroAnimationDelays()
      
      for (let i = 1; i < delays.length; i++) {
        expect(delays[i]).toBeGreaterThan(delays[i - 1])
      }
    })
  })

  describe('getHeroAnimations', () => {
    it('should return array of animation configurations', () => {
      const result = getHeroAnimations()
      
      expect(result).toHaveLength(3)
      expect(Array.isArray(result)).toBe(true)
    })

    it('should have correct delays for each animation', () => {
      const animations = getHeroAnimations()
      const expectedDelays = [0, 0.2, 0.4]
      
      animations.forEach((animation, index) => {
        expect(animation.transition.delay).toBe(expectedDelays[index])
        expect(animation.transition.duration).toBe(0.8)
        expect(animation.transition.ease).toBe('easeOut')
      })
    })

    it('should use fadeInUp animation for all hero elements', () => {
      const animations = getHeroAnimations()
      
      animations.forEach(animation => {
        expect(animation.initial).toEqual({ opacity: 0, y: 20 })
        expect(animation.animate).toEqual({ opacity: 1, y: 0 })
      })
    })
  })
})

import { describe, it, expect } from 'vitest'
import { 
  getQuickFadeInAnimation, 
  getHoverAnimation, 
  getHeroAnimationDelays, 
  getHeroAnimations 
} from './animationUtils'

describe('animationUtils', () => {
  describe('getQuickFadeInAnimation', () => {
    it('should return correct fade-in animation configuration', () => {
      const result = getQuickFadeInAnimation()
      
      expect(result).toEqual({
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, ease: 'easeOut' }
      })
    })

    it('should return consistent configuration on multiple calls', () => {
      const first = getQuickFadeInAnimation()
      const second = getQuickFadeInAnimation()
      
      expect(first).toEqual(second)
    })
  })

  describe('getHoverAnimation', () => {
    it('should return correct hover animation configuration', () => {
      const result = getHoverAnimation()
      
      expect(result).toEqual({
        whileHover: { y: -5 }
      })
    })

    it('should return consistent configuration on multiple calls', () => {
      const first = getHoverAnimation()
      const second = getHoverAnimation()
      
      expect(first).toEqual(second)
    })
  })

  describe('getHeroAnimationDelays', () => {
    it('should return array of three delay values', () => {
      const result = getHeroAnimationDelays()
      
      expect(result).toHaveLength(3)
      expect(result).toEqual([0, 0.2, 0.4])
    })

    it('should return consistent delays on multiple calls', () => {
      const first = getHeroAnimationDelays()
      const second = getHeroAnimationDelays()
      
      expect(first).toEqual(second)
    })

    it('should have increasing delay values', () => {
      const delays = getHeroAnimationDelays()
      
      for (let i = 1; i < delays.length; i++) {
        expect(delays[i]).toBeGreaterThan(delays[i - 1])
      }
    })
  })

  describe('getHeroAnimations', () => {
    it('should return array of three animation configurations', () => {
      const result = getHeroAnimations()
      
      expect(result).toHaveLength(3)
    })

    it('should return consistent animations on multiple calls', () => {
      const first = getHeroAnimations()
      const second = getHeroAnimations()
      
      expect(first).toEqual(second)
    })

    it('should have correct structure for each animation', () => {
      const animations = getHeroAnimations()
      
      animations.forEach((animation, index) => {
        expect(animation).toHaveProperty('initial')
        expect(animation).toHaveProperty('animate')
        expect(animation).toHaveProperty('transition')
        
        expect(animation.initial).toEqual({ opacity: 0, y: 20 })
        expect(animation.animate).toEqual({ opacity: 1, y: 0 })
        expect(animation.transition).toEqual({ 
          duration: 0.8, 
          delay: index * 0.2, 
          ease: 'easeOut' 
        })
      })
    })

    it('should have increasing delays matching getHeroAnimationDelays', () => {
      const animations = getHeroAnimations()
      const delays = getHeroAnimationDelays()
      
      animations.forEach((animation, index) => {
        expect(animation.transition.delay).toBe(delays[index])
      })
    })
  })
})

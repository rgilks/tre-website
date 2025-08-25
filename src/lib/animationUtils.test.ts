import { describe, it, expect } from 'vitest'

import { getHeroAnimationDelays, getHeroAnimations } from './animationUtils'

describe('AnimationUtils', () => {
  describe('getHeroAnimationDelays', () => {
    it('should return array of delay values', () => {
      const delays = getHeroAnimationDelays()
      expect(delays).toEqual([0, 0.3, 0.6])
    })

    it('should return array with correct length', () => {
      const delays = getHeroAnimationDelays()
      expect(delays).toHaveLength(3)
    })

    it('should return array of numbers', () => {
      const delays = getHeroAnimationDelays()
      delays.forEach(delay => {
        expect(typeof delay).toBe('number')
      })
    })
  })

  describe('getHeroAnimations', () => {
    it('should return array of animation configurations', () => {
      const animations = getHeroAnimations()
      expect(animations).toHaveLength(3)
    })

    it('should have correct structure for each animation', () => {
      const animations = getHeroAnimations()
      animations.forEach(animation => {
        expect(animation).toHaveProperty('initial')
        expect(animation).toHaveProperty('animate')
        expect(animation).toHaveProperty('transition')
      })
    })

    it('should have correct initial values', () => {
      const animations = getHeroAnimations()
      animations.forEach(animation => {
        expect(animation.initial).toEqual({ opacity: 0, y: 30 })
      })
    })

    it('should have correct animate values', () => {
      const animations = getHeroAnimations()
      animations.forEach(animation => {
        expect(animation.animate).toEqual({ opacity: 1, y: 0 })
      })
    })

    it('should have correct transition properties', () => {
      const animations = getHeroAnimations()
      animations.forEach(animation => {
        expect(animation.transition).toHaveProperty('duration')
        expect(animation.transition).toHaveProperty('delay')
        expect(animation.transition).toHaveProperty('ease')
      })
    })

    it('should have correct duration', () => {
      const animations = getHeroAnimations()
      animations.forEach(animation => {
        expect(animation.transition.duration).toBe(1)
      })
    })

    it('should have correct ease value', () => {
      const animations = getHeroAnimations()
      animations.forEach(animation => {
        expect(animation.transition.ease).toBe('easeOut')
      })
    })

    it('should have correct delay values', () => {
      const animations = getHeroAnimations()
      const expectedDelays = [0, 0.3, 0.6]
      animations.forEach((animation, index) => {
        expect(animation.transition.delay).toBe(expectedDelays[index])
      })
    })
  })
})

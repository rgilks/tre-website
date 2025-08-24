import { describe, it, expect } from 'vitest'
import { 
  getVisibleTopics, 
  getProjectCardBorderClass, 
  getProjectButtonClass, 
  getProjectBackgroundStyle 
} from './projectUtils'

describe('projectUtils', () => {
  describe('getVisibleTopics', () => {
    it('should return all topics when under max limit', () => {
      const topics = ['react', 'typescript', 'nextjs']
      const result = getVisibleTopics(topics, 5)
      
      expect(result.visibleTopics).toEqual(['react', 'typescript', 'nextjs'])
      expect(result.overflowCount).toBe(0)
      expect(result.hasOverflow).toBe(false)
    })

    it('should limit topics to maxVisible', () => {
      const topics = ['react', 'typescript', 'nextjs', 'tailwind', 'framer-motion']
      const result = getVisibleTopics(topics, 3)
      
      expect(result.visibleTopics).toEqual(['react', 'typescript', 'nextjs'])
      expect(result.overflowCount).toBe(2)
      expect(result.hasOverflow).toBe(true)
    })

    it('should use default maxVisible of 3', () => {
      const topics = ['react', 'typescript', 'nextjs', 'tailwind']
      const result = getVisibleTopics(topics)
      
      expect(result.visibleTopics).toEqual(['react', 'typescript', 'nextjs'])
      expect(result.overflowCount).toBe(1)
      expect(result.hasOverflow).toBe(true)
    })

    it('should handle empty topics array', () => {
      const result = getVisibleTopics([], 5)
      
      expect(result.visibleTopics).toEqual([])
      expect(result.overflowCount).toBe(0)
      expect(result.hasOverflow).toBe(false)
    })

    it('should handle single topic', () => {
      const topics = ['react']
      const result = getVisibleTopics(topics, 3)
      
      expect(result.visibleTopics).toEqual(['react'])
      expect(result.overflowCount).toBe(0)
      expect(result.hasOverflow).toBe(false)
    })
  })

  describe('getProjectCardBorderClass', () => {
    it('should return highlighted border class when isHighlighted is true', () => {
      const result = getProjectCardBorderClass(true)
      expect(result).toBe('border-tre-green shadow-lg shadow-tre-green/25')
    })

    it('should return default border class when isHighlighted is false', () => {
      const result = getProjectCardBorderClass(false)
      expect(result).toBe('border-tre-green/20 hover:border-tre-green/40')
    })
  })

  describe('getProjectButtonClass', () => {
    it('should return flex-1 when project has homepage', () => {
      const result = getProjectButtonClass(true)
      expect(result).toBe('flex-1')
    })

    it('should return w-full when project has no homepage', () => {
      const result = getProjectButtonClass(false)
      expect(result).toBe('w-full')
    })
  })

  describe('getProjectBackgroundStyle', () => {
    it('should return background image style when screenshot URL is provided', () => {
      const screenshotUrl = 'https://example.com/screenshot.png'
      const result = getProjectBackgroundStyle(screenshotUrl)
      
      expect(result).toEqual({
        backgroundImage: `url(${screenshotUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'blur(20px) brightness(0.3)',
        transform: 'scale(1.1)'
      })
    })

    it('should return fallback style when screenshot URL is null', () => {
      const result = getProjectBackgroundStyle(null)
      
      expect(result).toEqual({
        backgroundImage: 'none',
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
      })
    })

    it('should return fallback style when screenshot URL is undefined', () => {
      const result = getProjectBackgroundStyle(undefined)
      
      expect(result).toEqual({
        backgroundImage: 'none',
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
      })
    })

    it('should return fallback style when screenshot URL is empty string', () => {
      const result = getProjectBackgroundStyle('')
      
      expect(result).toEqual({
        backgroundImage: 'none',
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
      })
    })

    it('should return fallback style when screenshot URL is whitespace only', () => {
      const result = getProjectBackgroundStyle('   ')
      
      expect(result).toEqual({
        backgroundImage: 'none',
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
      })
    })
  })
})

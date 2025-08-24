import { describe, it, expect } from 'vitest'
import { 
  shouldHighlightProject, 
  getVisibleTopics, 
  getProjectCardBorderClass, 
  getProjectButtonClass, 
  getProjectBackgroundStyle 
} from './projectUtils'

describe('projectUtils', () => {
  describe('shouldHighlightProject', () => {
    it('should highlight the first project (index 0)', () => {
      expect(shouldHighlightProject(0)).toBe(true)
    })

    it('should not highlight other projects', () => {
      expect(shouldHighlightProject(1)).toBe(false)
      expect(shouldHighlightProject(5)).toBe(false)
      expect(shouldHighlightProject(10)).toBe(false)
    })
  })

  describe('getVisibleTopics', () => {
    it('should return visible topics and overflow count', () => {
      const topics = ['React', 'TypeScript', 'Next.js', 'Tailwind', 'Framer Motion']
      const result = getVisibleTopics(topics, 3)
      
      expect(result.visibleTopics).toEqual(['React', 'TypeScript', 'Next.js'])
      expect(result.overflowCount).toBe(2)
      expect(result.hasOverflow).toBe(true)
    })

    it('should handle topics with no overflow', () => {
      const topics = ['React', 'TypeScript']
      const result = getVisibleTopics(topics, 3)
      
      expect(result.visibleTopics).toEqual(['React', 'TypeScript'])
      expect(result.overflowCount).toBe(0)
      expect(result.hasOverflow).toBe(false)
    })

    it('should handle empty topics array', () => {
      const result = getVisibleTopics([], 3)
      
      expect(result.visibleTopics).toEqual([])
      expect(result.overflowCount).toBe(0)
      expect(result.hasOverflow).toBe(false)
    })

    it('should use default maxVisible of 3', () => {
      const topics = ['React', 'TypeScript', 'Next.js', 'Tailwind']
      const result = getVisibleTopics(topics)
      
      expect(result.visibleTopics).toEqual(['React', 'TypeScript', 'Next.js'])
      expect(result.overflowCount).toBe(1)
      expect(result.hasOverflow).toBe(true)
    })
  })

  describe('getProjectCardBorderClass', () => {
    it('should return highlighted border class', () => {
      const result = getProjectCardBorderClass(true)
      expect(result).toBe('border-tre-green shadow-lg shadow-tre-green/25')
    })

    it('should return normal border class', () => {
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
    it('should return background style for screenshot', () => {
      const screenshotUrl = 'https://example.com/screenshot.png'
      const result = getProjectBackgroundStyle(screenshotUrl)
      
      expect(result.backgroundImage).toBe(`url(${screenshotUrl})`)
      expect(result.backgroundSize).toBe('cover')
      expect(result.backgroundPosition).toBe('center')
      expect(result.filter).toBe('blur(20px) brightness(0.3)')
      expect(result.transform).toBe('scale(1.1)')
    })

    it('should return fallback style when no screenshot', () => {
      const result = getProjectBackgroundStyle(null)
      
      expect(result.backgroundImage).toBe('none')
      expect(result.backgroundColor).toBe('rgba(0, 0, 0, 0.5)')
    })

    it('should handle empty string screenshot URL', () => {
      const result = getProjectBackgroundStyle('')
      
      expect(result.backgroundImage).toBe('none')
      expect(result.backgroundColor).toBe('rgba(0, 0, 0, 0.5)')
    })
  })
})

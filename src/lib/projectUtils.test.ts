import { describe, it, expect } from 'vitest'
import { getVisibleTopics } from './projectUtils'

describe('ProjectUtils', () => {
  describe('getVisibleTopics', () => {
    it('should return visible topics within limit', () => {
      const topics = ['react', 'typescript', 'nextjs', 'tailwind', 'framer-motion']
      const result = getVisibleTopics(topics, 3)

      expect(result.visibleTopics).toEqual(['react', 'typescript', 'nextjs'])
      expect(result.overflowCount).toBe(2)
      expect(result.hasOverflow).toBe(true)
    })

    it('should handle empty topics array', () => {
      const result = getVisibleTopics([], 3)

      expect(result.visibleTopics).toEqual([])
      expect(result.overflowCount).toBe(0)
      expect(result.hasOverflow).toBe(false)
    })

    it('should handle topics array smaller than limit', () => {
      const topics = ['react', 'typescript']
      const result = getVisibleTopics(topics, 5)

      expect(result.visibleTopics).toEqual(['react', 'typescript'])
      expect(result.overflowCount).toBe(0)
      expect(result.hasOverflow).toBe(false)
    })

    it('should use default maxVisible when not specified', () => {
      const topics = ['react', 'typescript', 'nextjs', 'tailwind']
      const result = getVisibleTopics(topics)

      expect(result.visibleTopics).toEqual(['react', 'typescript', 'nextjs'])
      expect(result.overflowCount).toBe(1)
      expect(result.hasOverflow).toBe(true)
    })

    it('should handle exact match with limit', () => {
      const topics = ['react', 'typescript', 'nextjs']
      const result = getVisibleTopics(topics, 3)

      expect(result.visibleTopics).toEqual(['react', 'typescript', 'nextjs'])
      expect(result.overflowCount).toBe(0)
      expect(result.hasOverflow).toBe(false)
    })

    it('should handle zero limit', () => {
      const topics = ['react', 'typescript', 'nextjs']
      const result = getVisibleTopics(topics, 0)

      expect(result.visibleTopics).toEqual([])
      expect(result.overflowCount).toBe(3)
      expect(result.hasOverflow).toBe(true)
    })

    it('should handle negative limit', () => {
      const topics = ['react', 'typescript', 'nextjs']
      const result = getVisibleTopics(topics, -1)

      expect(result.visibleTopics).toEqual([])
      expect(result.overflowCount).toBe(3)
      expect(result.hasOverflow).toBe(true)
    })

    it('should handle single topic', () => {
      const topics = ['react']
      const result = getVisibleTopics(topics, 3)

      expect(result.visibleTopics).toEqual(['react'])
      expect(result.overflowCount).toBe(0)
      expect(result.hasOverflow).toBe(false)
    })

    it('should handle large number of topics', () => {
      const topics = Array.from({ length: 100 }, (_, i) => `topic-${i}`)
      const result = getVisibleTopics(topics, 10)

      expect(result.visibleTopics).toHaveLength(10)
      expect(result.overflowCount).toBe(90)
      expect(result.hasOverflow).toBe(true)
    })

    it('should preserve topic order', () => {
      const topics = ['z', 'a', 'm', 'b']
      const result = getVisibleTopics(topics, 2)

      expect(result.visibleTopics).toEqual(['z', 'a'])
    })
  })
})

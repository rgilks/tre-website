import { describe, it, expect } from 'vitest'
import { formatDate, getRelativeTime } from './dateUtils'

describe('dateUtils', () => {
  describe('formatDate', () => {
    it('should format a date string correctly', () => {
      const result = formatDate('2024-01-15T10:30:00Z')
      expect(result).toBe('Jan 15, 2024')
    })

    it('should handle different months', () => {
      const result = formatDate('2024-12-25T00:00:00Z')
      expect(result).toBe('Dec 25, 2024')
    })

    it('should handle single digit days', () => {
      const result = formatDate('2024-03-05T00:00:00Z')
      expect(result).toBe('Mar 5, 2024')
    })

    it('should handle leap year dates', () => {
      const result = formatDate('2024-02-29T00:00:00Z')
      expect(result).toBe('Feb 29, 2024')
    })
  })

  describe('getRelativeTime', () => {
    it('should return "Today" for today', () => {
      const today = new Date().toISOString()
      const result = getRelativeTime(today)
      expect(result).toBe('Today')
    })

    it('should return "Yesterday" for yesterday', () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      const result = getRelativeTime(yesterday)
      expect(result).toBe('Yesterday')
    })

    it('should return days ago for recent dates', () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      const result = getRelativeTime(threeDaysAgo)
      expect(result).toBe('3 days ago')
    })

    it('should return weeks ago for dates within a month', () => {
      const twoWeeksAgo = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
      const result = getRelativeTime(twoWeeksAgo)
      expect(result).toBe('2 weeks ago')
    })

    it('should return months ago for dates within a year', () => {
      const threeMonthsAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
      const result = getRelativeTime(threeMonthsAgo)
      expect(result).toBe('3 months ago')
    })

    it('should return years ago for old dates', () => {
      const twoYearsAgo = new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000).toISOString()
      const result = getRelativeTime(twoYearsAgo)
      expect(result).toBe('2 years ago')
    })
  })
})

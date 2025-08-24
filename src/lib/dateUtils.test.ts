import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

import { formatDate, getRelativeTime } from './dateUtils'

describe('dateUtils', () => {
  let mockDate: Date

  beforeEach(() => {
    // Mock current date to 2024-01-15 for consistent testing
    mockDate = new Date('2024-01-15T12:00:00Z')
    vi.useFakeTimers()
    vi.setSystemTime(mockDate)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('formatDate', () => {
    it('should format date correctly', () => {
      expect(formatDate('2024-01-15T12:00:00Z')).toBe('Jan 15, 2024')
      expect(formatDate('2023-12-25T00:00:00Z')).toBe('Dec 25, 2023')
      expect(formatDate('2024-06-01T12:00:00Z')).toBe('Jun 1, 2024')
    })

    it('should handle different date formats', () => {
      expect(formatDate('2024-01-15')).toBe('Jan 15, 2024')
      expect(formatDate('2024/01/15')).toBe('Jan 15, 2024')
    })

    it('should handle edge cases', () => {
      expect(formatDate('2024-02-29T12:00:00Z')).toBe('Feb 29, 2024') // Leap year
      expect(formatDate('2024-01-01T00:00:00Z')).toBe('Jan 1, 2024')
    })
  })

  describe('getRelativeTime', () => {
    it('should return "Today" for same day', () => {
      expect(getRelativeTime('2024-01-15T12:00:00Z')).toBe('Today')
      expect(getRelativeTime('2024-01-15T00:00:00Z')).toBe('Today')
    })

    it('should return "Yesterday" for previous day', () => {
      expect(getRelativeTime('2024-01-14T12:00:00Z')).toBe('Yesterday')
    })

    it('should return days ago for recent dates', () => {
      expect(getRelativeTime('2024-01-13T12:00:00Z')).toBe('2 days ago')
      expect(getRelativeTime('2024-01-10T12:00:00Z')).toBe('5 days ago')
    })

    it('should return weeks ago for dates within a month', () => {
      expect(getRelativeTime('2024-01-08T12:00:00Z')).toBe('1 weeks ago')
      expect(getRelativeTime('2024-01-01T12:00:00Z')).toBe('2 weeks ago')
    })

    it('should return months ago for dates within a year', () => {
      expect(getRelativeTime('2023-12-15T12:00:00Z')).toBe('1 months ago')
      expect(getRelativeTime('2023-06-15T12:00:00Z')).toBe('7 months ago')
    })

    it('should return years ago for older dates', () => {
      expect(getRelativeTime('2023-01-15T12:00:00Z')).toBe('1 years ago')
      expect(getRelativeTime('2020-01-15T12:00:00Z')).toBe('4 years ago')
    })
  })
})

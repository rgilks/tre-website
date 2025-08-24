import { describe, it, expect } from 'vitest'
import {
  extractYouTubeVideoId,
  isValidYouTubeVideoId,
  generateYouTubeEmbedUrl,
  generateYouTubeThumbnailUrl,
} from './youtube'

describe('youtube', () => {
  describe('extractYouTubeVideoId', () => {
    it('should extract video ID from watch URL', () => {
      expect(
        extractYouTubeVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
      ).toBe('dQw4w9WgXcQ')
    })

    it('should extract video ID from youtu.be URL', () => {
      expect(extractYouTubeVideoId('https://youtu.be/dQw4w9WgXcQ')).toBe(
        'dQw4w9WgXcQ'
      )
    })

    it('should extract video ID from embed URL', () => {
      expect(
        extractYouTubeVideoId('https://www.youtube.com/embed/dQw4w9WgXcQ')
      ).toBe('dQw4w9WgXcQ')
    })

    it('should extract video ID from v URL', () => {
      expect(
        extractYouTubeVideoId('https://www.youtube.com/v/dQw4w9WgXcQ')
      ).toBe('dQw4w9WgXcQ')
    })

    it('should extract video ID from raw ID', () => {
      expect(extractYouTubeVideoId('dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
    })

    it('should handle URLs with additional parameters', () => {
      expect(
        extractYouTubeVideoId(
          'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=123s'
        )
      ).toBe('dQw4w9WgXcQ')
    })

    it('should return null for invalid URLs', () => {
      expect(extractYouTubeVideoId('https://example.com')).toBeNull()
      expect(extractYouTubeVideoId('not-a-url')).toBeNull()
      expect(extractYouTubeVideoId('')).toBeNull()
    })

    it('should return null for undefined input', () => {
      // Test with undefined input
      const result = extractYouTubeVideoId(undefined as unknown as string)
      expect(result).toBeNull()
    })
  })

  describe('isValidYouTubeVideoId', () => {
    it('should validate correct video IDs', () => {
      expect(isValidYouTubeVideoId('dQw4w9WgXcQ')).toBe(true)
      expect(isValidYouTubeVideoId('12345678901')).toBe(true)
      expect(isValidYouTubeVideoId('abc-def_ghi')).toBe(true)
    })

    it('should reject invalid video IDs', () => {
      expect(isValidYouTubeVideoId('short')).toBe(false)
      expect(isValidYouTubeVideoId('toolong123456789')).toBe(false)
      expect(isValidYouTubeVideoId('invalid@#$%')).toBe(false)
      expect(isValidYouTubeVideoId('')).toBe(false)
    })
  })

  describe('generateYouTubeEmbedUrl', () => {
    it('should generate correct embed URL', () => {
      expect(generateYouTubeEmbedUrl('dQw4w9WgXcQ')).toBe(
        'https://www.youtube.com/embed/dQw4w9WgXcQ'
      )
    })

    it('should handle different video ID formats', () => {
      expect(generateYouTubeEmbedUrl('12345678901')).toBe(
        'https://www.youtube.com/embed/12345678901'
      )
    })
  })

  describe('generateYouTubeThumbnailUrl', () => {
    it('should generate default quality thumbnail URL', () => {
      expect(generateYouTubeThumbnailUrl('dQw4w9WgXcQ')).toBe(
        'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg'
      )
    })

    it('should generate high quality thumbnail URL', () => {
      expect(generateYouTubeThumbnailUrl('dQw4w9WgXcQ', 'hq')).toBe(
        'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg'
      )
    })

    it('should generate medium quality thumbnail URL', () => {
      expect(generateYouTubeThumbnailUrl('dQw4w9WgXcQ', 'mq')).toBe(
        'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg'
      )
    })

    it('should generate standard quality thumbnail URL', () => {
      expect(generateYouTubeThumbnailUrl('dQw4w9WgXcQ', 'sd')).toBe(
        'https://img.youtube.com/vi/dQw4w9WgXcQ/sddefault.jpg'
      )
    })

    it('should generate maxres thumbnail URL', () => {
      expect(generateYouTubeThumbnailUrl('dQw4w9WgXcQ', 'maxres')).toBe(
        'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'
      )
    })

    it('should handle different video IDs', () => {
      expect(generateYouTubeThumbnailUrl('12345678901', 'hq')).toBe(
        'https://img.youtube.com/vi/12345678901/hqdefault.jpg'
      )
    })
  })
})

import { describe, it, expect } from 'vitest'
import { 
  extractYouTubeVideoId, 
  isValidYouTubeVideoId, 
  generateYouTubeEmbedUrl, 
  generateYouTubeThumbnailUrl 
} from './youtube'

describe('YouTube Utilities', () => {
  describe('extractYouTubeVideoId', () => {
    it('should extract video ID from watch URL', () => {
      const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      expect(extractYouTubeVideoId(url)).toBe('dQw4w9WgXcQ')
    })

    it('should extract video ID from short URL', () => {
      const url = 'https://youtu.be/dQw4w9WgXcQ'
      expect(extractYouTubeVideoId(url)).toBe('dQw4w9WgXcQ')
    })

    it('should extract video ID from embed URL', () => {
      const url = 'https://www.youtube.com/embed/dQw4w9WgXcQ'
      expect(extractYouTubeVideoId(url)).toBe('dQw4w9WgXcQ')
    })

    it('should extract video ID from v URL', () => {
      const url = 'https://www.youtube.com/v/dQw4w9WgXcQ'
      expect(extractYouTubeVideoId(url)).toBe('dQw4w9WgXcQ')
    })

    it('should return video ID if already extracted', () => {
      const videoId = 'dQw4w9WgXcQ'
      expect(extractYouTubeVideoId(videoId)).toBe(videoId)
    })

    it('should return null for invalid URLs', () => {
      expect(extractYouTubeVideoId('https://example.com')).toBeNull()
      expect(extractYouTubeVideoId('')).toBeNull()
      expect(extractYouTubeVideoId('not-a-url')).toBeNull()
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
      expect(isValidYouTubeVideoId('toolongvideoid123')).toBe(false)
      expect(isValidYouTubeVideoId('invalid@chars')).toBe(false)
      expect(isValidYouTubeVideoId('')).toBe(false)
    })
  })

  describe('generateYouTubeEmbedUrl', () => {
    it('should generate correct embed URL', () => {
      const videoId = 'dQw4w9WgXcQ'
      const expected = 'https://www.youtube.com/embed/dQw4w9WgXcQ'
      expect(generateYouTubeEmbedUrl(videoId)).toBe(expected)
    })
  })

  describe('generateYouTubeThumbnailUrl', () => {
    it('should generate default thumbnail URL', () => {
      const videoId = 'dQw4w9WgXcQ'
      const expected = 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg'
      expect(generateYouTubeThumbnailUrl(videoId)).toBe(expected)
    })

    it('should generate high quality thumbnail URL', () => {
      const videoId = 'dQw4w9WgXcQ'
      const expected = 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'
      expect(generateYouTubeThumbnailUrl(videoId, 'maxres')).toBe(expected)
    })

    it('should generate medium quality thumbnail URL', () => {
      const videoId = 'dQw4w9WgXcQ'
      const expected = 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg'
      expect(generateYouTubeThumbnailUrl(videoId, 'mq')).toBe(expected)
    })
  })
})

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import fs from 'fs/promises'
import path from 'path'
import { ImageCacheService, ScreenshotCache } from './imageCache'

// Mock fs module
vi.mock('fs/promises')

const mockFs = vi.mocked(fs)

describe('ImageCacheService', () => {
  let cacheService: ImageCacheService
  const testImageCacheDir = path.join(process.cwd(), '.cache/images')
  const testScreenshotCacheFile = path.join(
    testImageCacheDir,
    'screenshot-urls.json'
  )

  beforeEach(() => {
    vi.clearAllMocks()
    cacheService = new ImageCacheService()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getCachedScreenshots', () => {
    it('should return cached screenshots when cache is valid', async () => {
      const now = Math.floor(Date.now() / 1000)
      const mockCache: ScreenshotCache = {
        'test-project': {
          urls: ['https://example.com/screenshot1.png'],
          timestamp: now,
        },
      }

      // Mock directory access
      mockFs.access.mockResolvedValue(undefined)

      // Mock file read
      mockFs.readFile.mockResolvedValue(JSON.stringify(mockCache))

      const result = await cacheService.getCachedScreenshots('test-project')

      expect(result).toEqual(['https://example.com/screenshot1.png'])
      expect(mockFs.readFile).toHaveBeenCalledWith(
        testScreenshotCacheFile,
        'utf-8'
      )
    })

    it('should return null when cache is expired', async () => {
      const expiredTimestamp = Math.floor(Date.now() / 1000) - 25 * 60 * 60 // 25 hours ago
      const mockCache: ScreenshotCache = {
        'test-project': {
          urls: ['https://example.com/screenshot1.png'],
          timestamp: expiredTimestamp,
        },
      }

      mockFs.access.mockResolvedValue(undefined)
      mockFs.readFile.mockResolvedValue(JSON.stringify(mockCache))

      const result = await cacheService.getCachedScreenshots('test-project')

      expect(result).toBeNull()
    })

    it('should return null when project not in cache', async () => {
      const mockCache: ScreenshotCache = {
        'other-project': {
          urls: ['https://example.com/screenshot1.png'],
          timestamp: Math.floor(Date.now() / 1000),
        },
      }

      mockFs.access.mockResolvedValue(undefined)
      mockFs.readFile.mockResolvedValue(JSON.stringify(mockCache))

      const result = await cacheService.getCachedScreenshots('test-project')

      expect(result).toBeNull()
    })

    it('should return null when cache file does not exist', async () => {
      mockFs.access.mockRejectedValue(new Error('File not found'))

      const result = await cacheService.getCachedScreenshots('test-project')

      expect(result).toBeNull()
    })
  })

  describe('setCachedScreenshots', () => {
    it('should create new cache file when none exists', async () => {
      const urls = ['https://example.com/screenshot1.png']

      // Mock directory creation
      mockFs.access.mockRejectedValueOnce(new Error('Directory not found'))
      mockFs.mkdir.mockResolvedValue(undefined)

      // Mock file read to fail (no existing cache)
      mockFs.readFile.mockRejectedValueOnce(new Error('File not found'))

      // Mock file write
      mockFs.writeFile.mockResolvedValue(undefined)

      await cacheService.setCachedScreenshots('test-project', urls)

      expect(mockFs.mkdir).toHaveBeenCalledWith(testImageCacheDir, {
        recursive: true,
      })
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        testScreenshotCacheFile,
        expect.stringContaining('test-project')
      )
    })

    it('should update existing cache when file exists', async () => {
      const existingCache: ScreenshotCache = {
        'existing-project': {
          urls: ['https://example.com/existing.png'],
          timestamp: Math.floor(Date.now() / 1000),
        },
      }

      const newUrls = ['https://example.com/new.png']

      mockFs.access.mockResolvedValue(undefined)
      mockFs.readFile.mockResolvedValue(JSON.stringify(existingCache))
      mockFs.writeFile.mockResolvedValue(undefined)

      await cacheService.setCachedScreenshots('test-project', newUrls)

      expect(mockFs.writeFile).toHaveBeenCalledWith(
        testScreenshotCacheFile,
        expect.stringContaining('test-project')
      )
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        testScreenshotCacheFile,
        expect.stringContaining('existing-project')
      )
    })
  })

  describe('getAllCachedScreenshots', () => {
    it('should return all cached screenshots', async () => {
      const mockCache: ScreenshotCache = {
        project1: {
          urls: ['https://example.com/screenshot1.png'],
          timestamp: Math.floor(Date.now() / 1000),
        },
        project2: {
          urls: ['https://example.com/screenshot2.png'],
          timestamp: Math.floor(Date.now() / 1000),
        },
      }

      mockFs.access.mockResolvedValue(undefined)
      mockFs.readFile.mockResolvedValue(JSON.stringify(mockCache))

      const result = await cacheService.getAllCachedScreenshots()

      expect(result).toEqual(mockCache)
    })

    it('should return empty object when cache file does not exist', async () => {
      mockFs.access.mockRejectedValue(new Error('File not found'))

      const result = await cacheService.getAllCachedScreenshots()

      expect(result).toEqual({})
    })
  })

  describe('clearProjectScreenshots', () => {
    it('should remove specific project from cache', async () => {
      const existingCache: ScreenshotCache = {
        project1: {
          urls: ['https://example.com/screenshot1.png'],
          timestamp: Math.floor(Date.now() / 1000),
        },
        project2: {
          urls: ['https://example.com/screenshot2.png'],
          timestamp: Math.floor(Date.now() / 1000),
        },
      }

      mockFs.access.mockResolvedValue(undefined)
      mockFs.readFile.mockResolvedValue(JSON.stringify(existingCache))
      mockFs.writeFile.mockResolvedValue(undefined)

      await cacheService.clearProjectScreenshots('project1')

      expect(mockFs.writeFile).toHaveBeenCalledWith(
        testScreenshotCacheFile,
        expect.not.stringContaining('project1')
      )
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        testScreenshotCacheFile,
        expect.stringContaining('project2')
      )
    })
  })

  describe('clearAllScreenshots', () => {
    it('should delete screenshot cache file', async () => {
      mockFs.unlink.mockResolvedValue(undefined)

      await cacheService.clearAllScreenshots()

      expect(mockFs.unlink).toHaveBeenCalledWith(testScreenshotCacheFile)
    })
  })

  describe('isScreenshotCacheValid', () => {
    it('should return true when cache is valid', async () => {
      const now = Math.floor(Date.now() / 1000)
      const mockCache: ScreenshotCache = {
        'test-project': {
          urls: ['https://example.com/screenshot1.png'],
          timestamp: now,
        },
      }

      mockFs.access.mockResolvedValue(undefined)
      mockFs.readFile.mockResolvedValue(JSON.stringify(mockCache))

      const result = await cacheService.isScreenshotCacheValid('test-project')

      expect(result).toBe(true)
    })

    it('should return false when cache is invalid', async () => {
      const expiredTimestamp = Math.floor(Date.now() / 1000) - 25 * 60 * 60
      const mockCache: ScreenshotCache = {
        'test-project': {
          urls: ['https://example.com/screenshot1.png'],
          timestamp: expiredTimestamp,
        },
      }

      mockFs.access.mockResolvedValue(undefined)
      mockFs.readFile.mockResolvedValue(JSON.stringify(mockCache))

      const result = await cacheService.isScreenshotCacheValid('test-project')

      expect(result).toBe(false)
    })
  })

  describe('getCacheStats', () => {
    it('should return correct cache statistics', async () => {
      const mockCache: ScreenshotCache = {
        project1: {
          urls: [
            'https://example.com/screenshot1.png',
            'https://example.com/screenshot2.png',
          ],
          timestamp: Math.floor(Date.now() / 1000),
        },
        project2: {
          urls: ['https://example.com/screenshot3.png'],
          timestamp: Math.floor(Date.now() / 1000),
        },
      }

      mockFs.access.mockResolvedValue(undefined)
      mockFs.readFile.mockResolvedValue(JSON.stringify(mockCache))

      const stats = await cacheService.getCacheStats()

      expect(stats.projectCount).toBe(2)
      expect(stats.totalUrls).toBe(3)
    })

    it('should return zero stats when cache is empty', async () => {
      mockFs.access.mockRejectedValue(new Error('File not found'))

      const stats = await cacheService.getCacheStats()

      expect(stats.projectCount).toBe(0)
      expect(stats.totalUrls).toBe(0)
    })
  })
})

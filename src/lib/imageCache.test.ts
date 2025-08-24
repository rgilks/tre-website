import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import {
  createCloudflareImageCacheService,
  createFallbackImageCacheService,
  ScreenshotCache,
} from './imageCache'

// Mock KV namespace for testing
const mockGet = vi.fn()
const mockPut = vi.fn()
const mockDelete = vi.fn()

const mockKV = {
  get: mockGet,
  put: mockPut,
  delete: mockDelete,
} as unknown as KVNamespace

describe('CloudflareImageCacheService', () => {
  let cacheService: ReturnType<typeof createCloudflareImageCacheService>

  beforeEach(() => {
    vi.clearAllMocks()
    cacheService = createCloudflareImageCacheService(mockKV)
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
          cloudflareIds: ['cloudflare-id-1'],
          timestamp: now,
        },
      }

      mockGet.mockResolvedValue(JSON.stringify(mockCache))

      const result = await cacheService.getCachedScreenshots('test-project')

      expect(result).toEqual(['https://example.com/screenshot1.png'])
      expect(mockGet).toHaveBeenCalledWith('screenshot_cache')
    })

    it('should return null when cache is expired', async () => {
      const expiredTimestamp = Math.floor(Date.now() / 1000) - 25 * 60 * 60 // 25 hours ago
      const mockCache: ScreenshotCache = {
        'test-project': {
          urls: ['https://example.com/screenshot1.png'],
          cloudflareIds: ['cloudflare-id-1'],
          timestamp: expiredTimestamp,
        },
      }

      mockGet.mockResolvedValue(JSON.stringify(mockCache))

      const result = await cacheService.getCachedScreenshots('test-project')

      expect(result).toBeNull()
    })

    it('should return null when project not in cache', async () => {
      const mockCache: ScreenshotCache = {
        'other-project': {
          urls: ['https://example.com/screenshot1.png'],
          cloudflareIds: ['cloudflare-id-1'],
          timestamp: Math.floor(Date.now() / 1000),
        },
      }

      mockGet.mockResolvedValue(JSON.stringify(mockCache))

      const result = await cacheService.getCachedScreenshots('test-project')

      expect(result).toBeNull()
    })

    it('should return null when cache does not exist', async () => {
      mockGet.mockResolvedValue(null)

      const result = await cacheService.getCachedScreenshots('test-project')

      expect(result).toBeNull()
    })

    it('should handle JSON parsing errors gracefully', async () => {
      mockGet.mockResolvedValue('invalid-json')

      const result = await cacheService.getCachedScreenshots('test-project')

      expect(result).toBeNull()
    })
  })

  describe('setCachedScreenshots', () => {
    it('should cache screenshot URLs for a project', async () => {
      const urls = ['https://example.com/screenshot1.png']
      const existingCache: ScreenshotCache = {
        'other-project': {
          urls: ['https://example.com/other.png'],
          cloudflareIds: [],
          timestamp: Math.floor(Date.now() / 1000),
        },
      }

      mockGet.mockResolvedValue(JSON.stringify(existingCache))
      mockPut.mockResolvedValue(undefined)

      await cacheService.setCachedScreenshots('test-project', urls)

      expect(mockPut).toHaveBeenCalledWith(
        'screenshot_cache',
        expect.stringContaining('test-project')
      )
    })

    it('should create new cache when none exists', async () => {
      mockGet.mockResolvedValue(null)
      mockPut.mockResolvedValue(undefined)

      const urls = ['https://example.com/screenshot1.png']
      await cacheService.setCachedScreenshots('test-project', urls)

      expect(mockPut).toHaveBeenCalledWith(
        'screenshot_cache',
        expect.stringContaining('test-project')
      )
    })
  })

  describe('clearAllScreenshots', () => {
    it('should delete entire screenshot cache', async () => {
      mockDelete.mockResolvedValue(undefined)

      await cacheService.clearAllScreenshots()

      expect(mockDelete).toHaveBeenCalledWith('screenshot_cache')
    })
  })
})

describe('FallbackImageCacheService', () => {
  let cacheService: ReturnType<typeof createFallbackImageCacheService>

  beforeEach(() => {
    cacheService = createFallbackImageCacheService()
  })

  it('should always return null for getCachedScreenshots', async () => {
    const result = await cacheService.getCachedScreenshots()
    expect(result).toBeNull()
  })

  it('should do nothing for setCachedScreenshots', async () => {
    await expect(cacheService.setCachedScreenshots()).resolves.toBeUndefined()
  })

  it('should do nothing for clearAllScreenshots', async () => {
    await expect(cacheService.clearAllScreenshots()).resolves.toBeUndefined()
  })
})

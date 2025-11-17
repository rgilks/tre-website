import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import {
  createCloudflareImageCacheService,
  createFallbackImageCacheService,
  createImageCacheService,
  createKVImageCacheService,
  initializeImageCacheService,
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

// Mock console.warn to avoid noise in tests
const originalWarn = console.warn
beforeEach(() => {
  console.warn = vi.fn()
})

afterEach(() => {
  console.warn = originalWarn
})

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

    it('should handle KV get errors gracefully', async () => {
      mockGet.mockRejectedValue(new Error('KV error'))

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

    it('should preserve existing cloudflareIds when updating cache', async () => {
      const existingCache: ScreenshotCache = {
        'test-project': {
          urls: ['old-url'],
          cloudflareIds: ['existing-id'],
          timestamp: Math.floor(Date.now() / 1000),
        },
      }

      mockGet.mockResolvedValue(JSON.stringify(existingCache))
      mockPut.mockResolvedValue(undefined)

      const newUrls = ['https://example.com/new-screenshot.png']
      await cacheService.setCachedScreenshots('test-project', newUrls)

      const putCall = mockPut.mock.calls[0]
      const updatedCache = JSON.parse(putCall[1])
      expect(updatedCache['test-project'].cloudflareIds).toEqual([
        'existing-id',
      ])
    })

    it('should handle KV get errors during set operation', async () => {
      mockGet.mockRejectedValue(new Error('KV get error'))
      mockPut.mockResolvedValue(undefined)

      const urls = ['https://example.com/screenshot1.png']
      await cacheService.setCachedScreenshots('test-project', urls)

      // Should still attempt to put with empty cache
      expect(mockPut).toHaveBeenCalledWith(
        'screenshot_cache',
        expect.stringContaining('test-project')
      )
    })

    it('should handle KV put errors gracefully', async () => {
      mockGet.mockResolvedValue(null)
      mockPut.mockRejectedValue(new Error('KV put error'))

      const urls = ['https://example.com/screenshot1.png']
      await expect(
        cacheService.setCachedScreenshots('test-project', urls)
      ).resolves.toBeUndefined()

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

    it('should handle KV delete errors gracefully', async () => {
      mockDelete.mockRejectedValue(new Error('KV delete error'))

      await expect(cacheService.clearAllScreenshots()).resolves.toBeUndefined()

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

describe('createImageCacheService', () => {
  it('should create Cloudflare service when env has GITHUB_CACHE', () => {
    const mockEnv = { GITHUB_CACHE: mockKV }
    const service = createImageCacheService(mockEnv)

    expect(service).toBeDefined()
    expect(typeof service.getCachedScreenshots).toBe('function')
    expect(typeof service.setCachedScreenshots).toBe('function')
    expect(typeof service.clearAllScreenshots).toBe('function')
  })

  it('should create fallback service when env is undefined', () => {
    const service = createImageCacheService()

    expect(service).toBeDefined()
    expect(typeof service.getCachedScreenshots).toBe('function')
    expect(typeof service.setCachedScreenshots).toBe('function')
    expect(typeof service.clearAllScreenshots).toBe('function')
  })

  it('should create fallback service when env has no GITHUB_CACHE', () => {
    const mockEnv = {}
    const service = createImageCacheService(mockEnv)

    expect(service).toBeDefined()
    expect(typeof service.getCachedScreenshots).toBe('function')
    expect(typeof service.setCachedScreenshots).toBe('function')
    expect(typeof service.clearAllScreenshots).toBe('function')
  })
})

describe('createKVImageCacheService', () => {
  it('should create Cloudflare service with provided KV', () => {
    const service = createKVImageCacheService(mockKV)

    expect(service).toBeDefined()
    expect(typeof service.getCachedScreenshots).toBe('function')
    expect(typeof service.setCachedScreenshots).toBe('function')
    expect(typeof service.clearAllScreenshots).toBe('function')
  })
})

describe('initializeImageCacheService', () => {
  it('should create Cloudflare service when env has GITHUB_CACHE', () => {
    const mockEnv = { GITHUB_CACHE: mockKV }
    const service = initializeImageCacheService(mockEnv)

    expect(service).toBeDefined()
    expect(typeof service.getCachedScreenshots).toBe('function')
    expect(typeof service.setCachedScreenshots).toBe('function')
    expect(typeof service.clearAllScreenshots).toBe('function')
  })

  it('should create fallback service when env has no GITHUB_CACHE', () => {
    const mockEnv = {}
    const service = initializeImageCacheService(mockEnv)

    expect(service).toBeDefined()
    expect(typeof service.getCachedScreenshots).toBe('function')
    expect(typeof service.setCachedScreenshots).toBe('function')
    expect(typeof service.clearAllScreenshots).toBe('function')
  })
})

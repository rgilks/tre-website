const SCREENSHOT_CACHE_TTL = 24 * 60 * 60 // 24 hours for screenshot URLs

export interface ScreenshotCache {
  [projectName: string]: {
    urls: string[] // GitHub URLs (fallback)
    cloudflareIds: string[] // Cloudflare Image IDs
    timestamp: number
  }
}

// Cloudflare-compatible image cache service using KV
export class CloudflareImageCacheService {
  private kv: KVNamespace
  private cacheKey: string
  private cacheTTL: number

  constructor(kv: KVNamespace) {
    this.kv = kv
    this.cacheKey = 'screenshot_cache'
    this.cacheTTL = SCREENSHOT_CACHE_TTL
  }

  async getCachedScreenshots(projectName: string): Promise<string[] | null> {
    try {
      const cacheData = await this.kv.get(this.cacheKey)
      if (!cacheData) {
        return null
      }

      const cache: ScreenshotCache = JSON.parse(cacheData)
      const projectCache = cache[projectName]

      if (!projectCache) {
        return null
      }

      // Check if cache is still valid
      const now = Math.floor(Date.now() / 1000)
      if (now - projectCache.timestamp > this.cacheTTL) {
        return null
      }

      return projectCache.urls
    } catch (error) {
      console.error(
        `Error retrieving cached screenshots for ${projectName}:`,
        error
      )
      return null
    }
  }

  async setCachedScreenshots(
    projectName: string,
    urls: string[]
  ): Promise<void> {
    try {
      // Read existing cache or create new
      let cache: ScreenshotCache = {}
      try {
        const existingData = await this.kv.get(this.cacheKey)
        if (existingData) {
          cache = JSON.parse(existingData)
        }
      } catch {
        // Cache doesn't exist, start with empty cache
      }

      // Update cache for this project
      const timestamp = Math.floor(Date.now() / 1000)
      cache[projectName] = {
        urls,
        cloudflareIds: cache[projectName]?.cloudflareIds || [],
        timestamp,
      }

      // Write updated cache
      await this.kv.put(this.cacheKey, JSON.stringify(cache))
    } catch (error) {
      console.error(`Error caching screenshots for ${projectName}:`, error)
    }
  }

  async clearAllScreenshots(): Promise<void> {
    try {
      await this.kv.delete(this.cacheKey)
    } catch (error) {
      console.error('Error clearing screenshot caches:', error)
    }
  }
}

// Simple fallback service for development
export class FallbackImageCacheService {
  async getCachedScreenshots(): Promise<string[] | null> {
    return null
  }

  async setCachedScreenshots(): Promise<void> {
    // No-op in development
  }

  async clearAllScreenshots(): Promise<void> {
    // No-op in development
  }
}

// Factory function to create appropriate image cache service based on environment
export function createImageCacheService():
  | CloudflareImageCacheService
  | FallbackImageCacheService {
  // Check if we're in a Cloudflare Workers environment with KV binding
  // Try multiple ways to detect the KV binding
  let kv: KVNamespace | undefined

  // Method 1: Check globalThis (most common in Cloudflare Workers)
  if (
    typeof globalThis.GITHUB_CACHE !== 'undefined' &&
    typeof globalThis.GITHUB_CACHE.get === 'function'
  ) {
    kv = globalThis.GITHUB_CACHE
  }

  // Method 2: Check if we're in a Cloudflare Workers environment by other indicators
  if (
    !kv &&
    typeof globalThis !== 'undefined' &&
    '__CLOUDFLARE_WORKER__' in globalThis
  ) {
    console.warn(
      'Detected Cloudflare Worker but GITHUB_CACHE not accessible on globalThis'
    )
  }

  if (kv) {
    return new CloudflareImageCacheService(kv)
  }

  // Fallback for development or when KV is not available
  console.warn(
    'GITHUB_CACHE KV binding not available, using fallback image cache service'
  )
  return new FallbackImageCacheService()
}

// Factory function for KV-based image cache service (used in Cloudflare Workers)
export function createKVImageCacheService(
  kv: KVNamespace
): CloudflareImageCacheService {
  return new CloudflareImageCacheService(kv)
}

// Function to initialize image cache service with Cloudflare environment
// This should be called from the worker context where env is available
export function initializeImageCacheService(env: {
  GITHUB_CACHE?: KVNamespace
}): CloudflareImageCacheService | FallbackImageCacheService {
  if (env.GITHUB_CACHE) {
    return new CloudflareImageCacheService(env.GITHUB_CACHE)
  }
  return new FallbackImageCacheService()
}

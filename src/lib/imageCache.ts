import {
  getCloudflareEnvironment,
  CloudflareEnvironment,
} from './cloudflareContext'

// Logger function that can be easily mocked in tests
const logger = {
  warn: (message: string) => {
    if (typeof console !== 'undefined' && console.warn) {
      console.warn(message)
    }
  },
}

const SCREENSHOT_CACHE_TTL = 24 * 60 * 60 // 24 hours for screenshot URLs

export interface ScreenshotCache {
  [projectName: string]: {
    urls: string[] // GitHub URLs (fallback)
    cloudflareIds: string[] // Cloudflare Image IDs
    timestamp: number
  }
}

// Cloudflare-compatible image cache service using KV
export function createCloudflareImageCacheService(kv: KVNamespace) {
  const cacheKey = 'screenshot_cache'
  const cacheTTL = SCREENSHOT_CACHE_TTL

  return {
    async getCachedScreenshots(projectName: string): Promise<string[] | null> {
      try {
        const cacheData = await kv.get(cacheKey)
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
        if (now - projectCache.timestamp > cacheTTL) {
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
    },

    async setCachedScreenshots(
      projectName: string,
      urls: string[]
    ): Promise<void> {
      try {
        // Read existing cache or create new
        let cache: ScreenshotCache = {}
        try {
          const existingData = await kv.get(cacheKey)
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
        await kv.put(cacheKey, JSON.stringify(cache))
      } catch (error) {
        console.error(`Error caching screenshots for ${projectName}:`, error)
      }
    },

    async clearAllScreenshots(): Promise<void> {
      try {
        await kv.delete(cacheKey)
      } catch (error) {
        console.error('Error clearing screenshot caches:', error)
      }
    },
  }
}

// Simple fallback service for development
export function createFallbackImageCacheService() {
  return {
    async getCachedScreenshots(): Promise<string[] | null> {
      return null
    },

    async setCachedScreenshots(): Promise<void> {
      // No-op in development
    },

    async clearAllScreenshots(): Promise<void> {
      // No-op in development
    }
  }
}

// Factory function to create appropriate image cache service based on environment
export function createImageCacheService(env?: CloudflareEnvironment) {
  // Use provided environment or try to get from context
  const cloudflareEnv = env || getCloudflareEnvironment()
  
  if (cloudflareEnv?.GITHUB_CACHE) {
    return createCloudflareImageCacheService(cloudflareEnv.GITHUB_CACHE)
  }

  // Fallback for development or when KV is not available
  logger.warn(
    'GITHUB_CACHE KV binding not available, using fallback image cache service'
  )
  return createFallbackImageCacheService()
}

// Factory function for KV-based image cache service (used in Cloudflare Workers)
export function createKVImageCacheService(kv: KVNamespace) {
  return createCloudflareImageCacheService(kv)
}

// Function to initialize image cache service with Cloudflare environment
// This should be called from the worker context where env is available
export function initializeImageCacheService(env: {
  GITHUB_CACHE?: KVNamespace
}) {
  if (env.GITHUB_CACHE) {
    return createCloudflareImageCacheService(env.GITHUB_CACHE)
  }
  return createFallbackImageCacheService()
}

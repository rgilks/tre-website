import fs from 'fs/promises'
import path from 'path'

const IMAGE_CACHE_DIR = '.cache/images'
const SCREENSHOT_CACHE_FILE = 'screenshot-urls.json'
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

  async getCachedCloudflareIds(projectName: string): Promise<string[] | null> {
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

      const now = Math.floor(Date.now() / 1000)
      if (now - projectCache.timestamp > this.cacheTTL) {
        return null
      }

      return projectCache.cloudflareIds || null
    } catch (error) {
      console.error(
        `Error retrieving cached Cloudflare IDs for ${projectName}:`,
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

  async setCachedCloudflareIds(
    projectName: string,
    cloudflareIds: string[]
  ): Promise<void> {
    try {
      let cache: ScreenshotCache = {}
      try {
        const existingData = await this.kv.get(this.cacheKey)
        if (existingData) {
          cache = JSON.parse(existingData)
        }
      } catch {
        // Cache doesn't exist, start with empty cache
      }

      const timestamp = Math.floor(Date.now() / 1000)
      cache[projectName] = {
        urls: cache[projectName]?.urls || [],
        cloudflareIds,
        timestamp,
      }

      await this.kv.put(this.cacheKey, JSON.stringify(cache))
    } catch (error) {
      console.error(`Error caching Cloudflare IDs for ${projectName}:`, error)
    }
  }

  async getAllCachedScreenshots(): Promise<ScreenshotCache> {
    try {
      const cacheData = await this.kv.get(this.cacheKey)
      if (!cacheData) {
        return {}
      }
      return JSON.parse(cacheData)
    } catch (error) {
      console.error('Error reading screenshot cache:', error)
      return {}
    }
  }

  async clearProjectScreenshots(projectName: string): Promise<void> {
    try {
      const cache = await this.getAllCachedScreenshots()
      delete cache[projectName]

      await this.kv.put(this.cacheKey, JSON.stringify(cache))
    } catch (error) {
      console.error(
        `Error clearing screenshot cache for ${projectName}:`,
        error
      )
    }
  }

  async clearAllScreenshots(): Promise<void> {
    try {
      await this.kv.delete(this.cacheKey)
    } catch (error) {
      console.error('Error clearing screenshot caches:', error)
    }
  }

  async isScreenshotCacheValid(projectName: string): Promise<boolean> {
    try {
      const urls = await this.getCachedScreenshots(projectName)
      return urls !== null
    } catch {
      return false
    }
  }

  async getCacheStats(): Promise<{
    projectCount: number
    totalUrls: number
    totalCloudflareIds: number
  }> {
    try {
      const cache = await this.getAllCachedScreenshots()
      const projectCount = Object.keys(cache).length
      const totalUrls = Object.values(cache).reduce(
        (sum, project) => sum + project.urls.length,
        0
      )
      const totalCloudflareIds = Object.values(cache).reduce(
        (sum, project) => sum + (project.cloudflareIds?.length || 0),
        0
      )

      return { projectCount, totalUrls, totalCloudflareIds }
    } catch (error) {
      console.error('Error getting cache stats:', error)
      return { projectCount: 0, totalUrls: 0, totalCloudflareIds: 0 }
    }
  }
}

export class ImageCacheService {
  private imageCacheDir: string
  private screenshotCacheFile: string

  constructor() {
    this.imageCacheDir = path.join(process.cwd(), IMAGE_CACHE_DIR)
    this.screenshotCacheFile = path.join(
      this.imageCacheDir,
      SCREENSHOT_CACHE_FILE
    )
  }

  private async ensureImageCacheDir(): Promise<void> {
    try {
      await fs.access(this.imageCacheDir)
    } catch {
      await fs.mkdir(this.imageCacheDir, { recursive: true })
    }
  }

  /**
   * Get cached screenshot URLs for a project
   */
  async getCachedScreenshots(projectName: string): Promise<string[] | null> {
    try {
      await this.ensureImageCacheDir()

      // Check if cache file exists
      try {
        await fs.access(this.screenshotCacheFile)
      } catch {
        return null
      }

      // Read and parse cache
      const cacheData = await fs.readFile(this.screenshotCacheFile, 'utf-8')
      const cache: ScreenshotCache = JSON.parse(cacheData)

      const projectCache = cache[projectName]
      if (!projectCache) {
        return null
      }

      // Check if cache is still valid
      const now = Math.floor(Date.now() / 1000)
      if (now - projectCache.timestamp > SCREENSHOT_CACHE_TTL) {
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

  /**
   * Get cached Cloudflare image IDs for a project
   */
  async getCachedCloudflareIds(projectName: string): Promise<string[] | null> {
    try {
      await this.ensureImageCacheDir()

      try {
        await fs.access(this.screenshotCacheFile)
      } catch {
        return null
      }

      const cacheData = await fs.readFile(this.screenshotCacheFile, 'utf-8')
      const cache: ScreenshotCache = JSON.parse(cacheData)

      const projectCache = cache[projectName]
      if (!projectCache) {
        return null
      }

      const now = Math.floor(Date.now() / 1000)
      if (now - projectCache.timestamp > SCREENSHOT_CACHE_TTL) {
        return null
      }

      return projectCache.cloudflareIds || null
    } catch (error) {
      console.error(
        `Error retrieving cached Cloudflare IDs for ${projectName}:`,
        error
      )
      return null
    }
  }

  /**
   * Cache screenshot URLs for a project
   */
  async setCachedScreenshots(
    projectName: string,
    urls: string[]
  ): Promise<void> {
    try {
      await this.ensureImageCacheDir()

      // Read existing cache or create new
      let cache: ScreenshotCache = {}
      try {
        const existingData = await fs.readFile(
          this.screenshotCacheFile,
          'utf-8'
        )
        cache = JSON.parse(existingData)
      } catch {
        // Cache file doesn't exist, start with empty cache
      }

      // Update cache for this project
      const timestamp = Math.floor(Date.now() / 1000)
      cache[projectName] = {
        urls,
        cloudflareIds: cache[projectName]?.cloudflareIds || [],
        timestamp,
      }

      // Write updated cache
      await fs.writeFile(
        this.screenshotCacheFile,
        JSON.stringify(cache, null, 2)
      )
    } catch (error) {
      console.error(`Error caching screenshots for ${projectName}:`, error)
    }
  }

  /**
   * Cache Cloudflare image IDs for a project
   */
  async setCachedCloudflareIds(
    projectName: string,
    cloudflareIds: string[]
  ): Promise<void> {
    try {
      await this.ensureImageCacheDir()

      let cache: ScreenshotCache = {}
      try {
        const existingData = await fs.readFile(
          this.screenshotCacheFile,
          'utf-8'
        )
        cache = JSON.parse(existingData)
      } catch {
        // Cache file doesn't exist, start with empty cache
      }

      const timestamp = Math.floor(Date.now() / 1000)
      cache[projectName] = {
        urls: cache[projectName]?.urls || [],
        cloudflareIds,
        timestamp,
      }

      await fs.writeFile(
        this.screenshotCacheFile,
        JSON.stringify(cache, null, 2)
      )
    } catch (error) {
      console.error(`Error caching Cloudflare IDs for ${projectName}:`, error)
    }
  }

  /**
   * Get all cached screenshot data
   */
  async getAllCachedScreenshots(): Promise<ScreenshotCache> {
    try {
      await this.ensureImageCacheDir()

      try {
        await fs.access(this.screenshotCacheFile)
      } catch {
        return {}
      }

      const cacheData = await fs.readFile(this.screenshotCacheFile, 'utf-8')
      return JSON.parse(cacheData)
    } catch (error) {
      console.error('Error reading screenshot cache:', error)
      return {}
    }
  }

  /**
   * Clear screenshot cache for a specific project
   */
  async clearProjectScreenshots(projectName: string): Promise<void> {
    try {
      const cache = await this.getAllCachedScreenshots()
      delete cache[projectName]

      await fs.writeFile(
        this.screenshotCacheFile,
        JSON.stringify(cache, null, 2)
      )
    } catch (error) {
      console.error(
        `Error clearing screenshot cache for ${projectName}:`,
        error
      )
    }
  }

  /**
   * Clear all screenshot caches
   */
  async clearAllScreenshots(): Promise<void> {
    try {
      await fs.unlink(this.screenshotCacheFile)
    } catch (error) {
      console.error('Error clearing screenshot caches:', error)
    }
  }

  /**
   * Check if screenshot cache is valid for a project
   */
  async isScreenshotCacheValid(projectName: string): Promise<boolean> {
    try {
      const urls = await this.getCachedScreenshots(projectName)
      return urls !== null
    } catch {
      return false
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{
    projectCount: number
    totalUrls: number
    totalCloudflareIds: number
  }> {
    try {
      const cache = await this.getAllCachedScreenshots()
      const projectCount = Object.keys(cache).length
      const totalUrls = Object.values(cache).reduce(
        (sum, project) => sum + project.urls.length,
        0
      )
      const totalCloudflareIds = Object.values(cache).reduce(
        (sum, project) => sum + (project.cloudflareIds?.length || 0),
        0
      )

      return { projectCount, totalUrls, totalCloudflareIds }
    } catch (error) {
      console.error('Error getting cache stats:', error)
      return { projectCount: 0, totalUrls: 0, totalCloudflareIds: 0 }
    }
  }
}

// Factory function to create appropriate image cache service based on environment
export function createImageCacheService(): ImageCacheService | CloudflareImageCacheService {
  // Check if we're in a Cloudflare Workers environment
  const isCloudflare = typeof globalThis.GITHUB_CACHE !== 'undefined' && 
                      typeof globalThis.GITHUB_CACHE.get === 'function'
  
  // In development or when KV is not available, use local file cache
  if (process.env.NODE_ENV === 'development' || !isCloudflare) {
    return new ImageCacheService()
  }

  // In production with Cloudflare Workers, use KV cache
  // At this point we know GITHUB_CACHE is defined and has the get method
  return new CloudflareImageCacheService(globalThis.GITHUB_CACHE!)
}

// Factory function for KV-based image cache service (used in Cloudflare Workers)
export function createKVImageCacheService(kv: KVNamespace): CloudflareImageCacheService {
  return new CloudflareImageCacheService(kv)
}

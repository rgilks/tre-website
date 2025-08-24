import { Project } from '@/types/project'
import { createGitHubCacheService } from './githubCache'
import { getCloudflareEnvironment, CloudflareEnvironment } from './cloudflareContext'

// Logger function that can be easily mocked in tests
const logger = {
  warn: (message: string) => {
    if (typeof console !== 'undefined' && console.warn) {
      console.warn(message)
    }
  }
}

export interface CacheService {
  getCachedProjects(): Promise<Project[] | null>
  setCachedProjects(projects: Project[]): Promise<void>
  clearCache(): Promise<void>
}

// Factory function to create appropriate cache service based on environment
export function createCacheService(env?: CloudflareEnvironment): CacheService {
  // Use provided environment or try to get from context
  const cloudflareEnv = env || getCloudflareEnvironment()
  
  if (cloudflareEnv?.GITHUB_CACHE) {
    return createGitHubCacheService(cloudflareEnv.GITHUB_CACHE)
  }

  // Fallback for development or when KV is not available
  logger.warn(
    'GITHUB_CACHE KV binding not available, using fallback cache service'
  )
  return createFallbackCacheService()
}

// Simple fallback cache service for development
class FallbackCacheService implements CacheService {
  async getCachedProjects(): Promise<Project[] | null> {
    // In development without KV, just return null to force fresh fetch
    return null
  }

  async setCachedProjects(): Promise<void> {
    // No-op in development
  }

  async clearCache(): Promise<void> {
    // No-op in development
  }
}

function createFallbackCacheService(): CacheService {
  return new FallbackCacheService()
}

// Factory function for KV-based cache service (used in Cloudflare Workers)
export function createKVCacheService(kv: KVNamespace): CacheService {
  return createGitHubCacheService(kv)
}

// Function to initialize cache service with Cloudflare environment
// This should be called from the worker context where env is available
export function initializeCacheService(env: {
  GITHUB_CACHE?: KVNamespace
}): CacheService {
  if (env.GITHUB_CACHE) {
    return createGitHubCacheService(env.GITHUB_CACHE)
  }
  return createFallbackCacheService()
}

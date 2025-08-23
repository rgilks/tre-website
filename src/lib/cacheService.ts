import { Project } from '@/types/project'
import { createGitHubCacheService } from './githubCache'

export interface CacheService {
  getCachedProjects(): Promise<Project[] | null>
  setCachedProjects(projects: Project[]): Promise<void>
  clearCache(): Promise<void>
}

// Extend globalThis to include our KV binding for Cloudflare environments
declare global {
  var GITHUB_CACHE: KVNamespace | undefined
}

// Factory function to create appropriate cache service based on environment
export function createCacheService(): CacheService {
  // Check if we're in a Cloudflare Workers environment with KV binding
  const isCloudflare = typeof globalThis.GITHUB_CACHE !== 'undefined' && 
                      typeof globalThis.GITHUB_CACHE.get === 'function'
  
  if (isCloudflare) {
    // In Cloudflare Workers environment, use KV cache
    return createGitHubCacheService(globalThis.GITHUB_CACHE!)
  }
  
  // Fallback for development or when KV is not available
  // This should only happen in local development
  console.warn('GITHUB_CACHE KV binding not available, using fallback cache service')
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

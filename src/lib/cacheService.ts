import { LocalCacheService } from './localCache'
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
  // In development or when KV is not available, use local file cache
  if (process.env.NODE_ENV === 'development' || !globalThis.GITHUB_CACHE) {
    return new LocalCacheService()
  }

  // In production with Cloudflare Workers, use KV cache
  return createGitHubCacheService(globalThis.GITHUB_CACHE)
}

// Factory function for KV-based cache service (used in Cloudflare Workers)
export function createKVCacheService(kv: KVNamespace): CacheService {
  return createGitHubCacheService(kv)
}

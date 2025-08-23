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
    return createGitHubCacheService(kv)
  }

  // Fallback for development or when KV is not available
  console.warn(
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

import { fetchGitHubProjects } from './github'
import { createCacheService } from './cacheService'
import { createImageCacheService } from './imageCache'
import { Project } from '@/types/project'

// Extend globalThis to include our KV binding
declare global {
  var GITHUB_CACHE: KVNamespace | undefined
}

// This will be available in server components and server actions
export async function getProjects(): Promise<Project[]> {
  try {
    // Create appropriate cache services based on environment
    const cacheService = createCacheService()
    const imageCacheService = createImageCacheService()

    // Try to get cached data first
    const cachedProjects = await cacheService.getCachedProjects()
    if (cachedProjects) {
      return cachedProjects
    }

    // If no cache, fetch fresh data and store it
    const projects = await fetchGitHubProjects(cacheService, imageCacheService)
    return projects
  } catch (error) {
    console.error(
      'Error with cache service, falling back to direct fetch:',
      error
    )
    // Fallback to direct fetch without caching
    return fetchGitHubProjects(undefined, createImageCacheService())
  }
}

// Server action for refreshing projects (can be called from client)
export async function refreshProjects(): Promise<{
  success: boolean
  message: string
}> {
  try {
    // Create cache services and clear existing caches
    const cacheService = createCacheService()
    const imageCacheService = createImageCacheService()

    await cacheService.clearCache()
    await imageCacheService.clearAllScreenshots()

    // Force refresh by fetching new data
    const projects = await fetchGitHubProjects(cacheService, imageCacheService)
    return {
      success: true,
      message: `Successfully refreshed ${projects.length} projects`,
    }
  } catch (error) {
    console.error('Error refreshing projects:', error)
    return {
      success: false,
      message: 'Failed to refresh projects',
    }
  }
}

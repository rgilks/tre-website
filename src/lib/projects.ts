import { fetchGitHubProjects } from './github'
import { createCacheService } from './cacheService'
import { createImageCacheService } from './imageCache'
import { Project } from '@/types/project'
import { CloudflareEnvironment } from './cloudflareContext'

export async function getProjects(env?: CloudflareEnvironment): Promise<Project[]> {
  try {
    const cacheService = createCacheService(env)
    const imageCacheService = createImageCacheService(env)

    // Try to get cached data first
    const cachedProjects = await cacheService.getCachedProjects()
    if (cachedProjects) {
      return cachedProjects
    }

    // If no cache, fetch fresh data and store it
    const projects = await fetchGitHubProjects(cacheService, imageCacheService)
    return projects
  } catch (error) {
    console.error('Error with cache service, falling back to direct fetch:', error)
    // Fallback to direct fetch without caching
    return fetchGitHubProjects(undefined, createImageCacheService(env))
  }
}

export async function refreshProjects(env?: CloudflareEnvironment): Promise<{
  success: boolean
  message: string
}> {
  try {
    const cacheService = createCacheService(env)
    const imageCacheService = createImageCacheService(env)

    await cacheService.clearCache()
    await imageCacheService.clearAllScreenshots()

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

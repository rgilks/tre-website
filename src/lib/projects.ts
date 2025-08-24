import { fetchGitHubProjects } from './github'
import { createCacheService } from './cacheService'
import { createImageCacheService } from './imageCache'
import { Project } from '@/types/project'
import { CloudflareEnvironment } from './cloudflareContext'

function createServices(env?: CloudflareEnvironment) {
  return {
    cacheService: createCacheService(env),
    imageCacheService: createImageCacheService(env),
  }
}

// Fallback projects for when GitHub API is not available
const getFallbackProjects = (): Project[] => [
  {
    id: '1',
    name: 'tre-website',
    fullName: 'rgilks/tre-website',
    description: 'Personal portfolio website built with Next.js and TypeScript',
    homepageUrl: 'https://tre.systems',
    htmlUrl: 'https://github.com/rgilks/tre-website',
    topics: ['nextjs', 'typescript', 'tailwindcss', 'portfolio'],
    language: 'TypeScript',
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    screenshotUrl: undefined,
    isCurrentlyWorking: true,
  },
  {
    id: '2',
    name: 'geno-1',
    fullName: 'rgilks/geno-1',
    description: 'Genetic algorithm implementation for optimization problems',
    homepageUrl: undefined,
    htmlUrl: 'https://github.com/rgilks/geno-1',
    topics: ['genetic-algorithm', 'optimization', 'python'],
    language: 'Python',
    updatedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    createdAt: new Date(Date.now() - 2592000000).toISOString(), // 30 days ago
    screenshotUrl: undefined,
    isCurrentlyWorking: false,
  },
]

export async function getProjects(
  env?: CloudflareEnvironment
): Promise<Project[]> {
  try {
    const { cacheService, imageCacheService } = createServices(env)

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
    
    try {
      // Fallback to direct fetch without caching
      return await fetchGitHubProjects(undefined, createImageCacheService(env))
    } catch (directFetchError) {
      console.error('GitHub API not available, using fallback projects:', directFetchError)
      
      // Return fallback projects for local development
      return getFallbackProjects()
    }
  }
}

export async function refreshProjects(env?: CloudflareEnvironment): Promise<{
  success: boolean
  message: string
}> {
  try {
    const { cacheService, imageCacheService } = createServices(env)

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

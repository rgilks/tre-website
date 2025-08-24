import { Project, GitHubApiResponse } from '@/types/project'
import { type CacheService } from './cacheService'
import {
  createCloudflareImageCacheService,
  createFallbackImageCacheService,
} from './imageCache'

const GITHUB_API_BASE = 'https://api.github.com'
const GITHUB_USERNAME = process.env.GITHUB_USERNAME || 'rgilks'

// Extend globalThis to include Cloudflare environment variables
declare global {
  var GITHUB_TOKEN: string | undefined
  var GITHUB_USERNAME: string | undefined
}

// Type alias for the cache services
type ImageCacheService = ReturnType<
  | typeof createCloudflareImageCacheService
  | typeof createFallbackImageCacheService
>

export async function fetchGitHubProjects(
  cacheService?: CacheService,
  imageCacheService?: ImageCacheService,
  fetchScreenshots: boolean = false
): Promise<Project[]> {
  // Try to get cached data first
  if (cacheService) {
    const cachedProjects = await cacheService.getCachedProjects()
    if (cachedProjects) {
      return cachedProjects
    }
  }

  try {
    const headers = getGitHubHeaders()
    const url = `${GITHUB_API_BASE}/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`

    const response = await fetch(url, {
      headers,
      next: { revalidate: 3600 }, // Cache for 1 hour
    })

    if (!response.ok) {
      throw new Error(
        `GitHub API error: ${response.status} ${response.statusText}`
      )
    }

    const repos: GitHubApiResponse[] = await response.json()
    const projects = transformGitHubReposToProjects(repos)

    // Fetch screenshots if requested
    if (fetchScreenshots && imageCacheService) {
      await fetchProjectScreenshots(projects.slice(0, 10), imageCacheService)
    }

    // Mark the most recently updated project as "currently working on"
    if (projects.length > 0) {
      projects[0].isCurrentlyWorking = true
    }

    // Cache the fresh data
    if (cacheService) {
      await cacheService.setCachedProjects(projects)
    }

    return projects
  } catch (error) {
    console.error('Error fetching GitHub projects:', error)

    if (
      error instanceof Error &&
      error.message.startsWith('GitHub API error:')
    ) {
      throw error
    }

    throw new Error('Failed to fetch projects from GitHub')
  }
}

function getGitHubHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'tre-website',
  }

  const token = globalThis.GITHUB_TOKEN || process.env.GITHUB_TOKEN
  if (token) {
    headers.Authorization = `token ${token}`
  }

  return headers
}

function transformGitHubReposToProjects(repos: GitHubApiResponse[]): Project[] {
  return repos
    .filter(repo => !repo.private)
    .map(repo => ({
      id: repo.id.toString(),
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description || 'No description available',
      homepageUrl: repo.homepage || undefined,
      htmlUrl: repo.html_url,
      topics: repo.topics || [],
      language: repo.language || undefined,
      updatedAt: repo.updated_at,
      createdAt: repo.created_at,
      screenshotUrl: undefined,
      isCurrentlyWorking: false,
    }))
}

async function fetchProjectScreenshots(
  projects: Project[],
  imageCacheService: ImageCacheService
): Promise<void> {
  for (const project of projects) {
    try {
      let screenshots: string[] = []

      // Try to get cached screenshots first
      const cachedScreenshots = await imageCacheService.getCachedScreenshots(
        project.name
      )
      if (cachedScreenshots) {
        screenshots = cachedScreenshots
      }

      // If no cached screenshots, fetch from GitHub
      if (screenshots.length === 0) {
        screenshots = await fetchProjectScreenshotsFromGitHub(project.name)

        // Cache the screenshots for future use
        if (screenshots.length > 0) {
          await imageCacheService.setCachedScreenshots(
            project.name,
            screenshots
          )
        }
      }

      if (screenshots.length > 0) {
        project.screenshotUrl = screenshots[0]
      }
    } catch (error) {
      console.warn(`Could not fetch screenshot for ${project.name}:`, error)
    }
  }
}

export async function fetchProjectScreenshotsFromGitHub(
  projectName: string
): Promise<string[]> {
  try {
    const headers = getGitHubHeaders()
    const screenshotPaths = [`docs/screenshot.png`, `public/screenshot.png`]
    const screenshots: string[] = []

    for (const path of screenshotPaths) {
      try {
        const response = await fetch(
          `https://api.github.com/repos/${GITHUB_USERNAME}/${projectName}/contents/${path}`,
          { headers }
        )

        if (!response.ok) continue

        const data = (await response.json()) as { download_url?: string }
        if (data.download_url) {
          screenshots.push(data.download_url)
        }
      } catch (error) {
        console.error(`Error checking path ${path}:`, error)
      }
    }

    return screenshots
  } catch (error) {
    console.error(`Error fetching screenshots for ${projectName}:`, error)
    return []
  }
}

export async function checkIframeEmbeddable(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' })
    const xFrameOptions = response.headers.get('x-frame-options')
    const contentSecurityPolicy = response.headers.get(
      'content-security-policy'
    )

    // Check if embedding is explicitly blocked
    if (xFrameOptions === 'DENY' || xFrameOptions === 'SAMEORIGIN') {
      return false
    }

    // Check CSP frame-ancestors directive
    if (
      contentSecurityPolicy &&
      contentSecurityPolicy.includes('frame-ancestors')
    ) {
      if (contentSecurityPolicy.includes("frame-ancestors 'none'")) {
        return false
      }
    }

    return true
  } catch (error) {
    console.error(`Error checking iframe embeddability for ${url}:`, error)
    return false
  }
}

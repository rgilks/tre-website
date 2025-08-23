import { GitHubApiResponse, Project } from '@/types/project'
import { CacheService } from './cacheService'
import { ImageCacheService } from './imageCache'

const GITHUB_API_BASE = 'https://api.github.com'
const GITHUB_USERNAME = process.env.GITHUB_USERNAME || 'rgilks'

// GitHub API content response type
interface GitHubContentResponse {
  download_url: string
  [key: string]: unknown
}

export async function fetchGitHubProjects(
  cacheService?: CacheService,
  imageCacheService?: ImageCacheService
): Promise<Project[]> {
  // Try to get cached data first
  if (cacheService) {
    const cachedProjects = await cacheService.getCachedProjects()
    if (cachedProjects) {
      return cachedProjects
    }
  }

  try {
    const baseHeaders: Record<string, string> = {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'tre-website',
    }

    // Prepare auth headers if a token is provided. Trim to avoid invisible
    // whitespace issues from copy/paste into .env files.
    const rawToken = process.env.GITHUB_TOKEN
    const token = typeof rawToken === 'string' ? rawToken.trim() : undefined
    const authHeaders: Record<string, string> = { ...baseHeaders }
    if (token) {
      authHeaders.Authorization = `token ${token}`
    }

    const url = `${GITHUB_API_BASE}/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`

    // First attempt: with auth if provided
    let response = await fetch(url, {
      headers: authHeaders,
      next: { revalidate: 3600 }, // Cache for 1 hour
    })

    // If token was provided but is invalid/expired (401), try Bearer scheme (for some environments),
    // then retry unauthenticated for resiliency
    if (!response.ok && response.status === 401 && token) {
      // Retry with Bearer scheme
      const bearerHeaders: Record<string, string> = {
        ...baseHeaders,
        Authorization: `Bearer ${token}`,
      }
      let bearerResponse: Response | undefined
      try {
        bearerResponse = await fetch(url, {
          headers: bearerHeaders,
          next: { revalidate: 3600 },
        })
      } catch {
        // ignore network errors and proceed to unauthenticated fallback
      }
      if (bearerResponse && bearerResponse.ok) {
        response = bearerResponse
      } else {
        console.error(
          'GitHub API returned 401 with provided token. Falling back to unauthenticated request. Ensure GITHUB_TOKEN is valid/authorized.'
        )
        // Bearer token failed, continue with unauthenticated fallback
        response = await fetch(url, {
          headers: baseHeaders,
          next: { revalidate: 3600 },
        })
      }
    }

    if (!response.ok) {
      if (response.status === 403) {
        console.warn(
          'GitHub API rate limit reached. Consider adding a GITHUB_TOKEN to your .env.local file.'
        )
      }
      throw new Error(
        `GitHub API error: ${response.status} ${response.statusText}`
      )
    }

    const repos: GitHubApiResponse[] = await response.json()

    // Filter for public repos and transform to our domain model
    const projects = repos
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
        stargazersCount: repo.stargazers_count,
        forksCount: repo.forks_count,
        updatedAt: repo.updated_at,
        createdAt: repo.created_at,
        screenshotUrl: undefined, // Will be populated below
        isCurrentlyWorking: false, // Will be determined by logic
      }))

    // Fetch screenshots for projects (increased limit for better coverage)
    const projectsToFetchScreenshots = projects.slice(0, 10) // Fetch screenshots for first 10 projects

    for (const project of projectsToFetchScreenshots) {
      try {
        let screenshots: string[] = []

        // Try to get cached screenshots first
        if (imageCacheService) {
          const cachedScreenshots =
            await imageCacheService.getCachedScreenshots(project.name)
          if (cachedScreenshots) {
            screenshots = cachedScreenshots
          }
        }

        // If no cached screenshots, fetch from GitHub
        if (screenshots.length === 0) {
          screenshots = await fetchProjectScreenshots(project.name)

          // Cache the screenshots for future use
          if (imageCacheService && screenshots.length > 0) {
            await imageCacheService.setCachedScreenshots(
              project.name,
              screenshots
            )
          }
        }

        if (screenshots.length > 0) {
          ;(project as Project).screenshotUrl = screenshots[0] // Use first screenshot found
        }

        // Add small delay between requests to be respectful of rate limits
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (error) {
        console.warn(`Could not fetch screenshot for ${project.name}:`, error)
        // Continue with other projects - screenshots are optional
      }
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
    throw new Error('Failed to fetch projects from GitHub')
  }
}

export async function fetchProjectScreenshots(
  projectName: string
): Promise<string[]> {
  try {
    const baseHeaders: Record<string, string> = {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'tre-website',
    }

    const rawToken = process.env.GITHUB_TOKEN
    const token = typeof rawToken === 'string' ? rawToken.trim() : undefined
    const authHeaders: Record<string, string> = { ...baseHeaders }
    if (token) {
      authHeaders.Authorization = `token ${token}`
    }

    // Check for screenshots in docs/ directory first (more common)
    const screenshotPaths = [`docs/screenshot.png`, `public/screenshot.png`]

    const screenshots: string[] = []

    for (const path of screenshotPaths) {
      try {
        const response = await fetch(
          `https://api.github.com/repos/${GITHUB_USERNAME}/${projectName}/contents/${path}`,
          { headers: authHeaders }
        )

        if (!response.ok) {
          continue
        }

        const data = await response.json()

        // Handle both cases: when download_url is provided and when it's not (large files)
        let downloadUrl: string | undefined

        if (data.download_url) {
          // Standard case - GitHub provides download_url
          downloadUrl = data.download_url
        } else if (data._links?.git) {
          // Large file case - GitHub returns base64 content instead of download_url
          // We can construct the download URL from the git blob URL
          const gitUrl = data._links.git

          // Extract the blob SHA from the git URL
          const blobMatch = gitUrl.match(/\/blobs\/([a-f0-9]+)$/)
          if (blobMatch) {
            const blobSha = blobMatch[1]
            downloadUrl = `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${projectName}/main/${path}`
          }
        }

        if (downloadUrl) {
          screenshots.push(downloadUrl)
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
      // Could add more sophisticated CSP parsing here
    }

    return true
  } catch (error) {
    console.error(`Error checking iframe embeddability for ${url}:`, error)
    return false
  }
}

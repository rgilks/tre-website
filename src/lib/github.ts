import { GitHubApiResponse, Project } from '@/types/project'
import { CacheService } from './cacheService'
import {
  CloudflareImageCacheService,
  FallbackImageCacheService,
} from './imageCache'

const GITHUB_API_BASE = 'https://api.github.com'
const GITHUB_USERNAME = process.env.GITHUB_USERNAME || 'rgilks'

// Extend globalThis to include Cloudflare environment variables
declare global {
  var GITHUB_TOKEN: string | undefined
  var GITHUB_USERNAME: string | undefined
}

/**
 * Validates a GitHub token and provides helpful error messages
 */
async function validateGitHubToken(token: string): Promise<{ valid: boolean; error?: string; suggestions?: string[] }> {
  try {
    const response = await fetch(`${GITHUB_API_BASE}/user`, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'tre-website'
      }
    })

    if (response.status === 401) {
      return {
        valid: false,
        error: 'Token is invalid or expired',
        suggestions: [
          'Generate a new token at https://github.com/settings/tokens',
          'Ensure the token has the correct permissions (public_repo, read:user)',
          'Check that the token hasn\'t been revoked',
          'Update your .env.local file and restart the dev server'
        ]
      }
    }

    if (response.status === 403) {
      return {
        valid: false,
        error: 'Token lacks required permissions',
        suggestions: [
          'Ensure the token has public_repo scope',
          'Check if the token has been restricted to specific repositories',
          'Verify the token hasn\'t expired'
        ]
      }
    }

    if (response.ok) {
      return { valid: true }
    }

    return {
      valid: false,
      error: `Unexpected response: ${response.status} ${response.statusText}`,
      suggestions: ['Check GitHub API status at https://www.githubstatus.com/']
    }
  } catch {
    return {
      valid: false,
      error: 'Network error during token validation',
      suggestions: ['Check your internet connection', 'Verify GitHub API is accessible']
    }
  }
}

export async function fetchGitHubProjects(
  cacheService?: CacheService,
  imageCacheService?: CloudflareImageCacheService | FallbackImageCacheService
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

    // Get GitHub token from environment (Cloudflare or local)
    const rawToken = globalThis.GITHUB_TOKEN || process.env.GITHUB_TOKEN
    const token = typeof rawToken === 'string' ? rawToken.trim() : undefined
    const authHeaders: Record<string, string> = { ...baseHeaders }
    if (token) {
      authHeaders.Authorization = `token ${token}`
      
      // Validate token first to provide better error messages
      console.log('🔍 Validating GitHub token...')
      const tokenValidation = await validateGitHubToken(token)
      if (!tokenValidation.valid) {
        console.error(`🚨 GitHub Token Validation Failed: ${tokenValidation.error}`)
        if (tokenValidation.suggestions) {
          console.error('💡 Suggestions:')
          tokenValidation.suggestions.forEach(suggestion => {
            console.error(`   • ${suggestion}`)
          })
        }
        console.error('⚠️  Continuing with unauthenticated request (limited to 60 requests/hour)')
        // Remove token from headers and continue without authentication
        delete authHeaders.Authorization
      } else {
        console.log('✅ GitHub token validation successful')
      }
    }

    const url = `${GITHUB_API_BASE}/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`

    // First attempt: with auth if provided
    let response = await fetch(url, {
      headers: authHeaders,
      next: { revalidate: 3600 }, // Cache for 1 hour
    })

    // Debug logging to understand what's happening
    console.log(
      `GitHub API response status: ${response.status}, ok: ${response.ok}, token provided: ${!!token}`
    )
    console.log(
      `Response headers:`,
      Object.fromEntries(response.headers.entries())
    )
    console.log(`Response type:`, response.type)
    console.log(`Response url:`, response.url)

    // If the first request failed with 401 and we have a token, it means the token is invalid
    if (!response.ok && response.status === 401 && token) {
      console.error(
        '🚨 GITHUB TOKEN EXPIRED OR INVALID: The provided GitHub token has expired or is invalid.'
      )
      console.error(
        '💡 SOLUTION: Please update your GITHUB_TOKEN in .env.local or Cloudflare secrets.'
      )
      console.error(
        '📝 STEPS: 1) Generate new token at https://github.com/settings/tokens 2) Update .env.local 3) Restart dev server'
      )
      console.error(
        '⚠️  FALLING BACK: Using unauthenticated request (limited to 60 requests/hour)'
      )
      
      // Token is invalid, try without authentication
      response = await fetch(url, {
        headers: baseHeaders,
        next: { revalidate: 3600 },
      })
    } else if (response.ok && token) {
      console.log('✅ GitHub API request succeeded with token')
    } else if (!response.ok) {
      console.log(`❌ GitHub API request failed with status: ${response.status}`)
    }

    if (!response.ok) {
      if (response.status === 403) {
        const errorMessage = token 
          ? '🚨 GitHub API rate limit reached even with token. This is unusual - check if token has correct permissions.'
          : '🚨 GitHub API rate limit reached (60 requests/hour). Add a GITHUB_TOKEN to .env.local for 5000 requests/hour.'
        
        console.warn(errorMessage)
        console.warn('💡 Add GITHUB_TOKEN to .env.local for higher rate limits')
      } else if (response.status === 401) {
        console.error('🚨 GitHub API authentication failed. Check your GITHUB_TOKEN.')
      } else if (response.status === 404) {
        console.error('🚨 GitHub user not found. Check GITHUB_USERNAME in .env.local')
      }
      
      throw new Error(
        `GitHub API error: ${response.status} ${response.statusText}${
          response.status === 401 && token 
            ? ' - Token expired or invalid. Please update GITHUB_TOKEN in .env.local'
            : response.status === 403 && !token
            ? ' - Rate limited. Add GITHUB_TOKEN to .env.local for higher limits'
            : ''
        }`
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
    
    // If it's already a GitHub API error, re-throw it
    if (error instanceof Error && error.message.startsWith('GitHub API error:')) {
      throw error
    }
    
    // For other errors, throw a generic message
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

    const rawToken = globalThis.GITHUB_TOKEN || process.env.GITHUB_TOKEN
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

        const data = (await response.json()) as {
          download_url?: string
          _links?: { git?: string }
        }

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

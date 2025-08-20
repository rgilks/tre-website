import { GitHubApiResponse, Project } from '@/types/project'

const GITHUB_API_BASE = 'https://api.github.com'
const GITHUB_USERNAME = process.env.GITHUB_USERNAME || 'rgilks'

export async function fetchGitHubProjects(): Promise<Project[]> {
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
        response = await fetch(url, {
          headers: baseHeaders,
          next: { revalidate: 3600 },
        })
      }
    }

    if (!response.ok) {
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
        screenshotUrl: undefined, // Will be populated from docs/screenshot.* files
        isCurrentlyWorking: false, // Will be determined by logic
      }))

    // Mark the most recently updated project as "currently working on"
    if (projects.length > 0) {
      projects[0].isCurrentlyWorking = true
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
    // This would integrate with your screenshot storage system
    // For now, returning empty array - implement based on your setup
    const screenshotUrls: string[] = []

    // Example implementation:
    // const response = await fetch(`/api/screenshots/${projectName}`)
    // if (response.ok) {
    //   const screenshots = await response.json()
    //   return screenshots.urls
    // }

    return screenshotUrls
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

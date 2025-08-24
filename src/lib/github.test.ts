import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { type Project } from '@/types/project'

// Mock fetch before importing the module
const mockFetch = vi.fn()

// Import the module
import {
  fetchGitHubProjects,
  fetchProjectScreenshots,
  checkIframeEmbeddable,
} from './github'

// Set up global fetch mock
beforeEach(() => {
  vi.clearAllMocks()
  vi.stubGlobal('fetch', mockFetch)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

declare global {
  var GITHUB_TOKEN: string | undefined
  var GITHUB_USERNAME: string | undefined
}

describe('GitHub API', () => {
  let mockCacheService: {
    getCachedProjects: ReturnType<typeof vi.fn>
    setCachedProjects: ReturnType<typeof vi.fn>
    clearCache: ReturnType<typeof vi.fn>
  }
  let mockImageCacheService: {
    getCachedScreenshots: ReturnType<typeof vi.fn>
    setCachedScreenshots: ReturnType<typeof vi.fn>
    clearAllScreenshots: ReturnType<typeof vi.fn>
  }

  const mockRepos = [
    {
      id: 2,
      name: 'test-repo-2',
      description: 'Test repository 2',
      language: 'JavaScript',
      stargazers_count: 20,
      forks_count: 10,
      private: false,
      updated_at: '2023-01-02T00:00:00Z',
      created_at: '2023-01-02T00:00:00Z',
      homepage: null,
      topics: ['test', 'javascript'],
      full_name: 'rgilks/test-repo-2',
      html_url: 'https://github.com/rgilks/test-repo-2',
    },
    {
      id: 1,
      name: 'test-repo-1',
      description: 'Test repository 1',
      language: 'TypeScript',
      stargazers_count: 10,
      forks_count: 5,
      private: false,
      updated_at: '2023-01-01T00:00:00Z',
      created_at: '2023-01-01T00:00:00Z',
      homepage: 'https://test1.tre.systems',
      topics: ['test', 'typescript'],
      full_name: 'rgilks/test-repo-1',
      html_url: 'https://github.com/rgilks/test-repo-1',
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()

    globalThis.GITHUB_TOKEN = 'test-token'
    globalThis.GITHUB_USERNAME = 'rgilks'

    mockCacheService = {
      getCachedProjects: vi.fn(),
      setCachedProjects: vi.fn(),
      clearCache: vi.fn(),
    }
    mockImageCacheService = {
      getCachedScreenshots: vi.fn(),
      setCachedScreenshots: vi.fn(),
      clearAllScreenshots: vi.fn(),
    }
  })

  afterEach(() => {
    globalThis.GITHUB_TOKEN = undefined
    globalThis.GITHUB_USERNAME = undefined
  })

  describe('fetchGitHubProjects', () => {
    it('should return cached projects when available', async () => {
      const cachedProjects: Project[] = [
        {
          id: '1',
          name: 'cached-project',
          fullName: 'rgilks/cached-project',
          description: 'Cached project',
          language: 'TypeScript',
          htmlUrl: 'https://github.com/rgilks/cached-project',
          topics: [],
          updatedAt: '2023-01-01T00:00:00Z',
          createdAt: '2023-01-01T00:00:00Z',
          isCurrentlyWorking: false,
        },
      ]

      mockCacheService.getCachedProjects.mockResolvedValue(cachedProjects)

      const result = await fetchGitHubProjects(
        mockCacheService,
        mockImageCacheService
      )

      expect(result).toEqual(cachedProjects)
      expect(mockCacheService.getCachedProjects).toHaveBeenCalled()
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should fetch projects from GitHub when no cache available', async () => {
      mockCacheService.getCachedProjects.mockResolvedValue(null)

      const mockRepoResponse = new Response(JSON.stringify(mockRepos), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })

      mockFetch.mockResolvedValue(mockRepoResponse)

      const result = await fetchGitHubProjects(
        mockCacheService,
        mockImageCacheService
      )

      expect(result).toHaveLength(2)
      expect(result[0].name).toBe('test-repo-2') // Most recent first
      expect(result[1].name).toBe('test-repo-1')
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.github.com/users/rgilks/repos?sort=updated&per_page=100',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'token test-token',
          }),
        })
      )
    })

    it('should filter out private repositories', async () => {
      mockCacheService.getCachedProjects.mockResolvedValue(null)

      const reposWithPrivate = [
        { ...mockRepos[0], private: false },
        { ...mockRepos[1], private: true },
      ]

      const mockResponse = new Response(JSON.stringify(reposWithPrivate), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })

      mockFetch.mockResolvedValue(mockResponse)

      const result = await fetchGitHubProjects(
        mockCacheService,
        mockImageCacheService
      )

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('test-repo-2')
    })

    it('should mark most recent project as currently working', async () => {
      mockCacheService.getCachedProjects.mockResolvedValue(null)

      const mockResponse = new Response(JSON.stringify(mockRepos), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })

      mockFetch.mockResolvedValue(mockResponse)

      const result = await fetchGitHubProjects(
        mockCacheService,
        mockImageCacheService
      )

      expect(result[0].isCurrentlyWorking).toBe(true)
      expect(result[1].isCurrentlyWorking).toBe(false)
    })

    it('should cache projects after fetching', async () => {
      mockCacheService.getCachedProjects.mockResolvedValue(null)

      const mockResponse = new Response(JSON.stringify(mockRepos), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })

      mockFetch.mockResolvedValue(mockResponse)

      await fetchGitHubProjects(mockCacheService, mockImageCacheService)

      expect(mockCacheService.setCachedProjects).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ name: 'test-repo-1' }),
          expect.objectContaining({ name: 'test-repo-2' }),
        ])
      )
    })

    it('should handle missing cache service', async () => {
      const mockResponse = new Response(JSON.stringify(mockRepos), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })

      mockFetch.mockResolvedValue(mockResponse)

      const result = await fetchGitHubProjects(undefined, undefined)

      expect(result).toHaveLength(2)
      expect(mockFetch).toHaveBeenCalled()
    })

    it('should handle GitHub API errors', async () => {
      mockCacheService.getCachedProjects.mockResolvedValue(null)

      const mockResponse = new Response('Forbidden', {
        status: 403,
        statusText: 'Forbidden',
      })

      mockFetch.mockResolvedValue(mockResponse)

      await expect(
        fetchGitHubProjects(mockCacheService, mockImageCacheService)
      ).rejects.toThrow('GitHub API error: 403 Forbidden')
    })

    it('should handle JSON parsing errors gracefully', async () => {
      mockCacheService.getCachedProjects.mockResolvedValue(null)

      const mockResponse = new Response('invalid-json', {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })

      mockFetch.mockResolvedValue(mockResponse)

      await expect(
        fetchGitHubProjects(mockCacheService, mockImageCacheService)
      ).rejects.toThrow('Failed to fetch projects from GitHub')
    })

    it('should fetch screenshots when fetchScreenshots is true', async () => {
      mockCacheService.getCachedProjects.mockResolvedValue(null)

      const mockRepoResponse = new Response(JSON.stringify(mockRepos), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })

      const mockScreenshotResponse = new Response(
        JSON.stringify({
          download_url: 'https://example.com/screenshot.png',
        }),
        {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }
      )

      mockFetch
        .mockResolvedValueOnce(mockRepoResponse) // Main repo fetch
        .mockResolvedValue(mockScreenshotResponse) // Screenshot calls

      const result = await fetchGitHubProjects(
        mockCacheService,
        mockImageCacheService,
        true // fetchScreenshots = true
      )

      expect(result).toHaveLength(2)
      expect(mockFetch).toHaveBeenCalledTimes(5) // 1 repo fetch + 4 screenshot fetches (2 repos × 2 paths each)
    })
  })

  describe('fetchProjectScreenshots', () => {
    it('should fetch screenshots from GitHub', async () => {
      const mockResponse = new Response(
        JSON.stringify({
          download_url:
            'https://raw.githubusercontent.com/rgilks/test-repo/main/docs/screenshot.png',
        }),
        {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }
      )

      mockFetch.mockResolvedValue(mockResponse)

      const result = await fetchProjectScreenshots('test-repo')

      expect(result).toEqual([
        'https://raw.githubusercontent.com/rgilks/test-repo/main/docs/screenshot.png',
      ])
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.github.com/repos/rgilks/test-repo/contents/docs/screenshot.png',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'token test-token',
          }),
        })
      )
    })

    it('should handle missing download_url gracefully', async () => {
      const mockResponse = new Response(
        JSON.stringify({ download_url: null }),
        {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }
      )

      mockFetch.mockResolvedValue(mockResponse)

      const result = await fetchProjectScreenshots('test-repo')

      expect(result).toEqual([])
    })

    it('should handle API errors gracefully', async () => {
      const mockResponse = new Response('Not Found', {
        status: 404,
        statusText: 'Not Found',
      })

      mockFetch.mockResolvedValue(mockResponse)

      const result = await fetchProjectScreenshots('test-repo')

      expect(result).toEqual([])
    })

    it('should handle network errors gracefully', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))

      const result = await fetchProjectScreenshots('test-repo')

      expect(result).toEqual([])
    })
  })

  describe('checkIframeEmbeddable', () => {
    it('should return false for DENY x-frame-options', async () => {
      const mockResponse = new Response('', {
        headers: { 'x-frame-options': 'DENY' },
      })

      mockFetch.mockResolvedValue(mockResponse)

      const result = await checkIframeEmbeddable('https://example.com')

      expect(result).toBe(false)
    })

    it('should return false for SAMEORIGIN x-frame-options', async () => {
      const mockResponse = new Response('', {
        headers: { 'x-frame-options': 'SAMEORIGIN' },
      })

      mockFetch.mockResolvedValue(mockResponse)

      const result = await checkIframeEmbeddable('https://example.com')

      expect(result).toBe(false)
    })

    it('should return false for frame-ancestors none CSP', async () => {
      const mockResponse = new Response('', {
        headers: {
          'content-security-policy': "frame-ancestors 'none'",
        },
      })

      mockFetch.mockResolvedValue(mockResponse)

      const result = await checkIframeEmbeddable('https://example.com')

      expect(result).toBe(false)
    })

    it('should return true for embeddable content', async () => {
      const mockResponse = new Response('', {
        headers: {},
      })

      mockFetch.mockResolvedValue(mockResponse)

      const result = await checkIframeEmbeddable('https://example.com')

      expect(result).toBe(true)
    })

    it('should handle network errors gracefully', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))

      const result = await checkIframeEmbeddable('https://example.com')

      expect(result).toBe(false)
    })
  })
})

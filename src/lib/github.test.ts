import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { type Project } from '@/types/project'

// Mock fetch before importing the module
const mockFetch = vi.fn()

// Import after mocking
import {
  fetchGitHubProjects,
  fetchProjectScreenshots,
  checkIframeEmbeddable,
} from './github'

// Set up global fetch mock
beforeEach(() => {
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
      id: 1,
      name: 'test-repo-1',
      description: 'Test repository 1',
      language: 'TypeScript',
      stargazers_count: 10,
      forks_count: 5,
      private: false,
      updated_at: '2023-01-01T00:00:00Z',
      homepage: 'https://test1.tre.systems',
      topics: ['test', 'typescript'],
    },
    {
      id: 2,
      name: 'test-repo-2',
      description: 'Test repository 2',
      language: 'JavaScript',
      stargazers_count: 20,
      forks_count: 10,
      private: false,
      updated_at: '2023-01-02T00:00:00Z',
      homepage: null,
      topics: ['test', 'javascript'],
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()

    globalThis.GITHUB_TOKEN = 'test-token'
    globalThis.GITHUB_USERNAME = 'test-user'

    vi.stubEnv('GITHUB_TOKEN', '')
    vi.stubEnv('GITHUB_USERNAME', '')

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
    vi.unstubAllEnvs()
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

    it('should fetch projects from GitHub when cache is empty', async () => {
      mockCacheService.getCachedProjects.mockResolvedValue(null)

      const mockResponse = new Response(JSON.stringify(mockRepos), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })

      mockFetch.mockResolvedValueOnce(mockResponse)

      const result = await fetchGitHubProjects(
        mockCacheService,
        mockImageCacheService
      )

      expect(result).toHaveLength(2)
      expect(result[0].name).toBe('test-repo-1')
      expect(result[1].name).toBe('test-repo-2')
      expect(mockCacheService.setCachedProjects).toHaveBeenCalledWith(result)
    })

    it('should handle missing GitHub token gracefully', async () => {
      globalThis.GITHUB_TOKEN = undefined
      vi.stubEnv('GITHUB_TOKEN', '')

      mockCacheService.getCachedProjects.mockResolvedValue(null)

      const mockResponse = new Response(JSON.stringify(mockRepos), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })

      mockFetch.mockResolvedValueOnce(mockResponse)

      const result = await fetchGitHubProjects(
        mockCacheService,
        mockImageCacheService
      )

      expect(result).toHaveLength(2)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/test-user/repos'),
        expect.not.objectContaining({
          headers: expect.objectContaining({
            Authorization: expect.any(String),
          }),
        })
      )
    })

    it('should handle GitHub API errors', async () => {
      mockCacheService.getCachedProjects.mockResolvedValue(null)

      const mockResponse = new Response('Forbidden', {
        status: 403,
        statusText: 'Forbidden',
      })

      mockFetch.mockResolvedValueOnce(mockResponse)

      await expect(
        fetchGitHubProjects(mockCacheService, mockImageCacheService)
      ).rejects.toThrow('GitHub API error: 403 Forbidden')
    })

    it('should handle 401 errors with token fallback', async () => {
      globalThis.GITHUB_TOKEN = 'invalid-token'
      vi.stubEnv('GITHUB_TOKEN', 'invalid-token')

      mockCacheService.getCachedProjects.mockResolvedValue(null)

      const mockResponse = new Response('Unauthorized', {
        status: 401,
        statusText: 'Unauthorized',
      })

      mockFetch.mockResolvedValueOnce(mockResponse)

      await expect(
        fetchGitHubProjects(mockCacheService, mockImageCacheService)
      ).rejects.toThrow(
        'GitHub API error: 401 Unauthorized - Token expired or invalid. Please update GITHUB_TOKEN in .env.local'
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

      mockFetch.mockResolvedValueOnce(mockResponse)

      const result = await fetchGitHubProjects(
        mockCacheService,
        mockImageCacheService
      )

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('test-repo-1')
    })

    it('should mark most recent project as currently working', async () => {
      mockCacheService.getCachedProjects.mockResolvedValue(null)

      const mockResponse = new Response(JSON.stringify(mockRepos), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })

      mockFetch.mockResolvedValueOnce(mockResponse)

      const result = await fetchGitHubProjects(
        mockCacheService,
        mockImageCacheService
      )

      expect(result[0].name).toBe('test-repo-2') // Most recent
      expect(result[1].name).toBe('test-repo-1')
    })

    it('should cache projects after fetching', async () => {
      mockCacheService.getCachedProjects.mockResolvedValue(null)

      const mockResponse = new Response(JSON.stringify(mockRepos), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })

      mockFetch.mockResolvedValueOnce(mockResponse)

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

      mockFetch.mockResolvedValueOnce(mockResponse)

      const result = await fetchGitHubProjects(undefined, undefined)

      expect(result).toHaveLength(2)
      expect(mockFetch).toHaveBeenCalled()
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

      mockFetch.mockResolvedValueOnce(mockResponse)

      const result = await fetchProjectScreenshots('test-repo')

      expect(result).toEqual([
        'https://raw.githubusercontent.com/rgilks/test-repo/main/docs/screenshot.png',
      ])
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('docs/screenshot.png')
      )
    })

    it('should handle missing download_url gracefully', async () => {
      const mockResponse = new Response('Not Found', { status: 404 })

      mockFetch.mockResolvedValueOnce(mockResponse)

      const result = await fetchProjectScreenshots('test-repo')

      expect(result).toEqual([])
    })

    it('should handle API errors gracefully', async () => {
      const mockResponse = new Response('Server Error', { status: 500 })

      mockFetch.mockResolvedValueOnce(mockResponse)

      const result = await fetchProjectScreenshots('test-repo')

      expect(result).toEqual([])
    })

    it('should handle network errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const result = await fetchProjectScreenshots('test-repo')

      expect(result).toEqual([])
    })

    it('should check multiple screenshot paths', async () => {
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

      mockFetch.mockResolvedValueOnce(mockResponse)

      const result = await fetchProjectScreenshots('test-repo')

      expect(result).toEqual([
        'https://raw.githubusercontent.com/rgilks/test-repo/main/docs/screenshot.png',
      ])
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('docs/screenshot.png')
      )
    })
  })

  describe('checkIframeEmbeddable', () => {
    it('should return false for DENY x-frame-options', async () => {
      const mockResponse = new Response('', {
        status: 200,
        headers: { 'x-frame-options': 'DENY' },
      })

      mockFetch.mockResolvedValueOnce(mockResponse)

      const result = await checkIframeEmbeddable('https://example.com')

      expect(result).toBe(false)
    })

    it('should return false for SAMEORIGIN x-frame-options', async () => {
      const mockResponse = new Response('', {
        status: 200,
        headers: { 'x-frame-options': 'SAMEORIGIN' },
      })

      mockFetch.mockResolvedValueOnce(mockResponse)

      const result = await checkIframeEmbeddable('https://example.com')

      expect(result).toBe(false)
    })

    it('should return false for frame-ancestors none CSP', async () => {
      const mockResponse = new Response('', {
        status: 200,
        headers: { 'content-security-policy': "frame-ancestors 'none'" },
      })

      mockFetch.mockResolvedValueOnce(mockResponse)

      const result = await checkIframeEmbeddable('https://example.com')

      expect(result).toBe(false)
    })

    it('should return true for embeddable content', async () => {
      const mockResponse = new Response('', {
        status: 200,
        headers: {},
      })

      mockFetch.mockResolvedValueOnce(mockResponse)

      const result = await checkIframeEmbeddable('https://example.com')

      expect(result).toBe(true)
    })

    it('should handle network errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const result = await checkIframeEmbeddable('https://example.com')

      expect(result).toBe(false)
    })
  })

  describe('token validation', () => {
    it('should validate GitHub token before use', async () => {
      mockCacheService.getCachedProjects.mockResolvedValue(null)

      const mockResponse = new Response(JSON.stringify(mockRepos), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })

      mockFetch.mockResolvedValueOnce(mockResponse)

      const result = await fetchGitHubProjects(
        mockCacheService,
        mockImageCacheService
      )

      expect(result).toHaveLength(2)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/test-user/repos'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      )
    })

    it('should handle invalid token gracefully', async () => {
      globalThis.GITHUB_TOKEN = 'invalid-token'
      vi.stubEnv('GITHUB_TOKEN', 'invalid-token')

      mockCacheService.getCachedProjects.mockResolvedValue(null)

      const mockResponse = new Response('Unauthorized', {
        status: 401,
        statusText: 'Unauthorized',
      })

      mockFetch.mockResolvedValueOnce(mockResponse)

      await expect(
        fetchGitHubProjects(mockCacheService, mockImageCacheService)
      ).rejects.toThrow(
        'GitHub API error: 401 Unauthorized - Token expired or invalid. Please update GITHUB_TOKEN in .env.local'
      )
    })
  })

  describe('error handling', () => {
    it('should handle missing username gracefully', async () => {
      globalThis.GITHUB_USERNAME = undefined
      vi.stubEnv('GITHUB_USERNAME', '')

      mockCacheService.getCachedProjects.mockResolvedValue(null)

      const mockResponse = new Response('Not Found', {
        status: 404,
        statusText: 'Not Found',
      })

      mockFetch.mockResolvedValueOnce(mockResponse)

      await expect(
        fetchGitHubProjects(mockCacheService, mockImageCacheService)
      ).rejects.toThrow('GitHub API error: 404 Not Found')
    })

    it('should handle JSON parsing errors gracefully', async () => {
      mockCacheService.getCachedProjects.mockResolvedValue(null)

      const mockResponse = new Response('invalid-json', {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })

      mockFetch.mockResolvedValueOnce(mockResponse)

      await expect(
        fetchGitHubProjects(mockCacheService, mockImageCacheService)
      ).rejects.toThrow('Failed to parse GitHub API response')
    })
  })
})

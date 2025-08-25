import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import {
  fetchGitHubProjects,
  fetchProjectScreenshotsFromGitHub,
  checkIframeEmbeddable,
} from './github'

// Mock fetch globally
global.fetch = vi.fn()

// Mock response types
interface MockResponse {
  ok?: boolean
  status?: number
  statusText?: string
  json?: () => Promise<unknown>
  text?: () => Promise<string>
  headers?: {
    get: (header: string) => string | null
  }
}

// Mock the image cache service
const mockImageCacheService = {
  getCachedScreenshots: vi.fn(),
  setCachedScreenshots: vi.fn(),
  clearAllScreenshots: vi.fn(),
}

describe('GitHub API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Set up test environment variables
    globalThis.TOKEN_GITHUB = 'test-token'
    globalThis.GITHUB_USERNAME = 'rgilks'
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('fetchGitHubProjects', () => {
    it('should fetch projects successfully', async () => {
      const mockRepos = [
        {
          id: 1,
          name: 'test-repo',
          full_name: 'rgilks/test-repo',
          description: 'Test repository',
          homepage: 'https://example.com',
          html_url: 'https://github.com/rgilks/test-repo',
          topics: ['test', 'example'],
          language: 'TypeScript',
          updated_at: '2023-01-01T00:00:00Z',
          created_at: '2023-01-01T00:00:00Z',
          private: false,
          stargazers_count: 10,
          forks_count: 5,
        },
      ]

      const mockResponse: MockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockRepos),
      }

      vi.mocked(fetch).mockResolvedValue(mockResponse as Response)

      const result = await fetchGitHubProjects()

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('test-repo')
      expect(result[0].isCurrentlyWorking).toBe(true)
    })

    it('should filter out private repositories', async () => {
      const mockRepos = [
        {
          id: 1,
          name: 'public-repo',
          full_name: 'rgilks/public-repo',
          description: 'Public repository',
          homepage: null,
          html_url: 'https://github.com/rgilks/public-repo',
          topics: [],
          language: 'JavaScript',
          updated_at: '2023-01-01T00:00:00Z',
          created_at: '2023-01-01T00:00:00Z',
          private: false,
          stargazers_count: 5,
          forks_count: 2,
        },
        {
          id: 2,
          name: 'private-repo',
          full_name: 'rgilks/private-repo',
          description: 'Private repository',
          homepage: null,
          html_url: 'https://github.com/rgilks/private-repo',
          topics: [],
          language: 'Python',
          updated_at: '2023-01-01T00:00:00Z',
          created_at: '2023-01-01T00:00:00Z',
          private: true,
          stargazers_count: 0,
          forks_count: 0,
        },
      ]

      const mockResponse: MockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockRepos),
      }

      vi.mocked(fetch).mockResolvedValue(mockResponse as Response)

      const result = await fetchGitHubProjects(undefined, undefined, true)

      expect(result).toHaveLength(1)
    })

    it('should handle API errors gracefully', async () => {
      const mockResponse: MockResponse = {
        ok: false,
        status: 403,
        statusText: 'Forbidden',
      }

      vi.mocked(fetch).mockResolvedValue(mockResponse as Response)

      await expect(fetchGitHubProjects()).rejects.toThrow(
        'GitHub API rate limit exceeded. Status: 403 Forbidden'
      )
    })

    it('should handle network errors gracefully', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('Network error'))

      await expect(fetchGitHubProjects()).rejects.toThrow(
        'Failed to fetch projects from GitHub'
      )
    })

    it('should handle JSON parsing errors gracefully', async () => {
      const mockResponse: MockResponse = {
        ok: true,
        json: vi.fn().mockRejectedValue(new Error('Invalid JSON')),
      }

      vi.mocked(fetch).mockResolvedValue(mockResponse as Response)

      await expect(fetchGitHubProjects()).rejects.toThrow(
        'Failed to fetch projects from GitHub'
      )
    })

    it('should handle missing environment variables gracefully', async () => {
      delete globalThis.TOKEN_GITHUB
      delete globalThis.GITHUB_USERNAME

      await expect(fetchGitHubProjects()).rejects.toThrow(
        'Failed to fetch projects from GitHub'
      )
    })

    it('should work with cache service when provided', async () => {
      const mockRepos = [
        {
          id: 1,
          name: 'test-repo',
          full_name: 'rgilks/test-repo',
          description: 'Test repository',
          homepage: null,
          html_url: 'https://github.com/rgilks/test-repo',
          topics: [],
          language: 'TypeScript',
          updated_at: '2023-01-01T00:00:00Z',
          created_at: '2023-01-01T00:00:00Z',
          private: false,
          stargazers_count: 0,
          forks_count: 0,
        },
      ]

      const mockResponse: MockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockRepos),
      }

      vi.mocked(fetch).mockResolvedValue(mockResponse as Response)

      const result = await fetchGitHubProjects(
        undefined,
        mockImageCacheService,
        true
      )

      expect(result).toHaveLength(1)
      expect(mockImageCacheService.getCachedScreenshots).toHaveBeenCalledWith(
        'test-repo'
      )
    })

    it('should handle screenshot fetch errors gracefully', async () => {
      const mockRepos = [
        {
          id: 1,
          name: 'test-repo',
          full_name: 'rgilks/test-repo',
          description: 'Test repository',
          homepage: null,
          html_url: 'https://github.com/rgilks/test-repo',
          topics: [],
          language: 'TypeScript',
          updated_at: '2023-01-01T00:00:00Z',
          created_at: '2023-01-01T00:00:00Z',
          private: false,
          stargazers_count: 0,
          forks_count: 0,
        },
      ]

      const mockResponse: MockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockRepos),
      }

      // Mock successful repo fetch but failed screenshot fetch
      vi.mocked(fetch)
        .mockResolvedValueOnce(mockResponse as Response)
        .mockRejectedValueOnce(new Error('Screenshot fetch failed'))

      const result = await fetchGitHubProjects(
        undefined,
        mockImageCacheService,
        true
      )

      expect(result).toHaveLength(1)
      expect(result[0].screenshotUrl).toBeUndefined()
    })
  })

  describe('fetchProjectScreenshotsFromGitHub', () => {
    it('should fetch screenshots from GitHub', async () => {
      const mockScreenshotResponse: MockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          download_url: 'https://example.com/screenshot.png',
        }),
      }

      vi.mocked(fetch).mockResolvedValue(mockScreenshotResponse as Response)

      const result = await fetchProjectScreenshotsFromGitHub('test-repo')

      expect(result).toContain('https://example.com/screenshot.png')
    })

    it('should handle missing download_url gracefully', async () => {
      const mockScreenshotResponse: MockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({}),
      }

      vi.mocked(fetch).mockResolvedValue(mockScreenshotResponse as Response)

      const result = await fetchProjectScreenshotsFromGitHub('test-repo')

      expect(result).toHaveLength(0)
    })

    it('should handle network errors gracefully', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('Network error'))

      const result = await fetchProjectScreenshotsFromGitHub('test-repo')

      expect(result).toHaveLength(0)
    })

    it('should handle multiple screenshot paths', async () => {
      const mockResponses = [
        { ok: false, status: 404 },
        {
          ok: true,
          json: vi
            .fn()
            .mockResolvedValue({
              download_url: 'https://example.com/screenshot.png',
            }),
        },
        { ok: false, status: 404 },
      ]

      vi.mocked(fetch)
        .mockResolvedValueOnce(mockResponses[0] as unknown as Response)
        .mockResolvedValueOnce(mockResponses[1] as unknown as Response)
        .mockResolvedValueOnce(mockResponses[2] as unknown as Response)

      const result = await fetchProjectScreenshotsFromGitHub('test-repo')

      expect(result).toContain('https://example.com/screenshot.png')
      expect(result).toHaveLength(1)
    })

    it('should handle individual path fetch errors gracefully', async () => {
      const mockResponses = [
        {
          ok: true,
          json: vi.fn().mockRejectedValue(new Error('JSON parse error')),
        },
        {
          ok: true,
          json: vi
            .fn()
            .mockResolvedValue({
              download_url: 'https://example.com/screenshot.png',
            }),
        },
      ]

      // Use a more robust mocking approach
      let callCount = 0
      vi.mocked(fetch).mockImplementation(() => {
        const response = mockResponses[callCount % mockResponses.length]
        callCount++
        return Promise.resolve(response as unknown as Response)
      })

      const result = await fetchProjectScreenshotsFromGitHub('test-repo')

      expect(result).toContain('https://example.com/screenshot.png')
      expect(result).toHaveLength(1)
    })

    it('should handle non-OK responses gracefully', async () => {
      const mockResponse: MockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
      }

      // Mock both screenshot paths to return 404
      vi.mocked(fetch).mockResolvedValue(mockResponse as Response)

      const result = await fetchProjectScreenshotsFromGitHub('test-repo')

      expect(result).toHaveLength(0)
    })
  })

  describe('checkIframeEmbeddable', () => {
    it('should return false for DENY x-frame-options', async () => {
      const mockResponse: MockResponse = {
        headers: {
          get: vi.fn((header: string) => {
            if (header === 'x-frame-options') return 'DENY'
            return null
          }),
        },
      }

      vi.mocked(fetch).mockResolvedValue(mockResponse as Response)

      const result = await checkIframeEmbeddable('https://example.com')

      expect(result).toBe(false)
    })

    it('should return false for SAMEORIGIN x-frame-options', async () => {
      const mockResponse: MockResponse = {
        headers: {
          get: vi.fn((header: string) => {
            if (header === 'x-frame-options') return 'SAMEORIGIN'
            return null
          }),
        },
      }

      vi.mocked(fetch).mockResolvedValue(mockResponse as Response)

      const result = await checkIframeEmbeddable('https://example.com')

      expect(result).toBe(false)
    })

    it('should return false for CSP frame-ancestors none', async () => {
      const mockResponse: MockResponse = {
        headers: {
          get: vi.fn((header: string) => {
            if (header === 'content-security-policy')
              return "frame-ancestors 'none'"
            return null
          }),
        },
      }

      vi.mocked(fetch).mockResolvedValue(mockResponse as Response)

      const result = await checkIframeEmbeddable('https://example.com')

      expect(result).toBe(false)
    })

    it('should return true for embeddable content', async () => {
      const mockResponse: MockResponse = {
        headers: {
          get: vi.fn(() => null),
        },
      }

      vi.mocked(fetch).mockResolvedValue(mockResponse as Response)

      const result = await checkIframeEmbeddable('https://example.com')

      expect(result).toBe(true)
    })

    it('should handle network errors gracefully', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('Network error'))

      const result = await checkIframeEmbeddable('https://example.com')

      expect(result).toBe(false)
    })

    it('should handle CSP frame-ancestors with other directives', async () => {
      const mockResponse: MockResponse = {
        headers: {
          get: vi.fn((header: string) => {
            if (header === 'content-security-policy')
              return "default-src 'self'; frame-ancestors 'self'"
            return null
          }),
        },
      }

      vi.mocked(fetch).mockResolvedValue(mockResponse as Response)

      const result = await checkIframeEmbeddable('https://example.com')

      expect(result).toBe(true)
    })

    it('should handle CSP without frame-ancestors directive', async () => {
      const mockResponse: MockResponse = {
        headers: {
          get: vi.fn((header: string) => {
            if (header === 'content-security-policy')
              return "default-src 'self'"
            return null
          }),
        },
      }

      vi.mocked(fetch).mockResolvedValue(mockResponse as Response)

      const result = await checkIframeEmbeddable('https://example.com')

      expect(result).toBe(true)
    })
  })
})

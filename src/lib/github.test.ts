import { describe, it, expect, vi, beforeEach } from 'vitest'

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

describe('GitHub API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Set up test environment variables
    globalThis.GITHUB_TOKEN = 'test-token'
    globalThis.GITHUB_USERNAME = 'rgilks'
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

      const result = await fetchGitHubProjects()

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('public-repo')
    })

    it('should handle missing description', async () => {
      const mockRepos = [
        {
          id: 1,
          name: 'no-description-repo',
          full_name: 'rgilks/no-description-repo',
          description: null,
          homepage: null,
          html_url: 'https://github.com/rgilks/no-description-repo',
          topics: [],
          language: null,
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

      const result = await fetchGitHubProjects()

      expect(result[0].description).toBe('No description available')
    })

    it('should handle GitHub API errors', async () => {
      const mockResponse: MockResponse = {
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        text: vi.fn().mockResolvedValue('Rate limit exceeded'),
      }

      vi.mocked(fetch).mockResolvedValue(mockResponse as Response)

      await expect(fetchGitHubProjects()).rejects.toThrow(
        'GitHub API rate limit exceeded. Status: 403 Forbidden'
      )
    })

    it('should handle GitHub API authentication errors', async () => {
      const mockResponse: MockResponse = {
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: vi.fn().mockResolvedValue('Unauthorized'),
      }

      vi.mocked(fetch).mockResolvedValue(mockResponse as Response)

      await expect(fetchGitHubProjects()).rejects.toThrow(
        'GitHub API authentication failed. Please check your GITHUB_TOKEN environment variable. Status: 401 Unauthorized'
      )
    })

    it('should handle JSON parsing errors gracefully', async () => {
      const mockResponse: MockResponse = {
        ok: true,
        json: vi.fn().mockRejectedValue(new SyntaxError('Unexpected token')),
      }

      vi.mocked(fetch).mockResolvedValue(mockResponse as Response)

      await expect(fetchGitHubProjects()).rejects.toThrow(
        'Failed to fetch projects from GitHub'
      )
    })

    it('should fetch screenshots when fetchScreenshots is true', async () => {
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

      const result = await fetchGitHubProjects(undefined, undefined, true)

      expect(result).toHaveLength(1)
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
  })
})

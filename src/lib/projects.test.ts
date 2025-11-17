import { describe, it, expect, vi, beforeEach } from 'vitest'

import { Project } from '@/types/project'

import { getProjects, refreshProjects } from './projects'
import { createCacheService } from './cacheService'
import { createImageCacheService } from './imageCache'
import { fetchGitHubProjects } from './github'
import { CloudflareEnvironment } from './cloudflareContext'

// Mock the dependencies
vi.mock('./cacheService')
vi.mock('./imageCache')
vi.mock('./github')

const mockCreateCacheService = vi.mocked(createCacheService)
const mockCreateImageCacheService = vi.mocked(createImageCacheService)
const mockFetchGitHubProjects = vi.mocked(fetchGitHubProjects)

describe('projects', () => {
  const mockEnv: CloudflareEnvironment = {
    GITHUB_CACHE: {
      get: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      list: vi.fn(),
    } as unknown as KVNamespace,
  }

  const mockCacheService = {
    clearCache: vi.fn(),
    getCachedProjects: vi.fn(),
    setCachedProjects: vi.fn(),
  }

  const mockImageCacheService = {
    clearAllScreenshots: vi.fn(),
    getCachedScreenshots: vi.fn(),
    setCachedScreenshots: vi.fn(),
  }

  const mockProjects: Project[] = [
    {
      id: '1',
      name: 'project-1',
      fullName: 'owner/project-1',
      description: 'Test project 1',
      htmlUrl: 'https://github.com/owner/project-1',
      topics: ['test', 'example'],
      updatedAt: '2024-01-01T00:00:00Z',
      createdAt: '2024-01-01T00:00:00Z',
      isCurrentlyWorking: false,
    },
    {
      id: '2',
      name: 'project-2',
      fullName: 'owner/project-2',
      description: 'Test project 2',
      htmlUrl: 'https://github.com/owner/project-2',
      topics: ['test', 'example'],
      updatedAt: '2024-01-01T00:00:00Z',
      createdAt: '2024-01-01T00:00:00Z',
      isCurrentlyWorking: false,
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()

    mockCreateCacheService.mockReturnValue(
      mockCacheService as ReturnType<typeof createCacheService>
    )
    mockCreateImageCacheService.mockReturnValue(
      mockImageCacheService as ReturnType<typeof createImageCacheService>
    )
    mockFetchGitHubProjects.mockResolvedValue(mockProjects)

    mockCacheService.clearCache.mockResolvedValue(undefined)
    mockImageCacheService.clearAllScreenshots.mockResolvedValue(undefined)
  })

  describe('getProjects', () => {
    it('should return cached projects when available', async () => {
      mockCacheService.getCachedProjects.mockResolvedValue(mockProjects)

      const result = await getProjects(mockEnv)

      expect(result).toEqual(mockProjects)
      expect(mockCreateCacheService).toHaveBeenCalledWith(mockEnv)
      expect(mockCreateImageCacheService).toHaveBeenCalledWith(mockEnv)
      expect(mockCacheService.getCachedProjects).toHaveBeenCalledOnce()
      expect(mockFetchGitHubProjects).not.toHaveBeenCalled()
    })

    it('should fetch fresh projects when cache is empty', async () => {
      mockCacheService.getCachedProjects.mockResolvedValue(null)

      const result = await getProjects(mockEnv)

      expect(result).toEqual(mockProjects)
      expect(mockCacheService.getCachedProjects).toHaveBeenCalledOnce()
      expect(mockFetchGitHubProjects).toHaveBeenCalledWith(
        mockCacheService,
        mockImageCacheService
      )
    })

    it('should work without environment parameter', async () => {
      mockCacheService.getCachedProjects.mockResolvedValue(null)

      const result = await getProjects()

      expect(result).toEqual(mockProjects)
      expect(mockCreateCacheService).toHaveBeenCalledWith(undefined)
      expect(mockCreateImageCacheService).toHaveBeenCalledWith(undefined)
    })

    it('should handle cache service errors and fallback to direct fetch', async () => {
      const cacheError = new Error('Cache service failed')
      mockCacheService.getCachedProjects.mockRejectedValue(cacheError)

      const result = await getProjects(mockEnv)

      expect(result).toEqual(mockProjects)
      expect(mockCacheService.getCachedProjects).toHaveBeenCalledOnce()
      expect(mockFetchGitHubProjects).toHaveBeenCalledWith(
        undefined,
        expect.any(Object)
      )
    })

    it('should handle both cache and direct fetch errors and return fallback projects', async () => {
      const cacheError = new Error('Cache service failed')
      const fetchError = new Error('GitHub API failed')

      mockCacheService.getCachedProjects.mockRejectedValue(cacheError)
      mockFetchGitHubProjects.mockRejectedValue(fetchError)

      const result = await getProjects(mockEnv)

      expect(result).toHaveLength(2)
      expect(result[0].name).toBe('tre-website')
      expect(result[1].name).toBe('geno-1')
      expect(mockCacheService.getCachedProjects).toHaveBeenCalledOnce()
      expect(mockFetchGitHubProjects).toHaveBeenCalledTimes(1)
    })

    it('should handle empty projects array from GitHub', async () => {
      mockCacheService.getCachedProjects.mockResolvedValue(null)
      mockFetchGitHubProjects.mockResolvedValue([])

      const result = await getProjects(mockEnv)

      expect(result).toEqual([])
      expect(mockFetchGitHubProjects).toHaveBeenCalledWith(
        mockCacheService,
        mockImageCacheService
      )
    })

    it('should handle null projects from cache gracefully', async () => {
      mockCacheService.getCachedProjects.mockResolvedValue(null)

      const result = await getProjects(mockEnv)

      expect(result).toEqual(mockProjects)
      expect(mockFetchGitHubProjects).toHaveBeenCalledWith(
        mockCacheService,
        mockImageCacheService
      )
    })
  })

  describe('refreshProjects', () => {
    it('should successfully refresh projects and clear caches', async () => {
      const result = await refreshProjects(mockEnv)

      expect(result).toEqual({
        success: true,
        message: 'Successfully refreshed 2 projects',
      })

      expect(mockCreateCacheService).toHaveBeenCalledWith(mockEnv)
      expect(mockCreateImageCacheService).toHaveBeenCalledWith(mockEnv)
      expect(mockCacheService.clearCache).toHaveBeenCalledOnce()
      expect(mockImageCacheService.clearAllScreenshots).toHaveBeenCalledOnce()
      expect(mockFetchGitHubProjects).toHaveBeenCalledWith(
        mockCacheService,
        mockImageCacheService
      )
    })

    it('should work without environment parameter', async () => {
      const result = await refreshProjects()

      expect(result.success).toBe(true)
      expect(mockCreateCacheService).toHaveBeenCalledWith(undefined)
      expect(mockCreateImageCacheService).toHaveBeenCalledWith(undefined)
    })

    it('should handle cache clearing errors gracefully', async () => {
      const cacheError = new Error('Cache clear failed')
      mockCacheService.clearCache.mockRejectedValue(cacheError)

      const result = await refreshProjects(mockEnv)

      expect(result).toEqual({
        success: false,
        message: 'Failed to refresh projects',
      })

      expect(mockCacheService.clearCache).toHaveBeenCalledOnce()
      expect(mockImageCacheService.clearAllScreenshots).not.toHaveBeenCalled()
      expect(mockFetchGitHubProjects).not.toHaveBeenCalled()
    })

    it('should handle image cache clearing errors gracefully', async () => {
      const imageError = new Error('Image cache clear failed')
      mockImageCacheService.clearAllScreenshots.mockRejectedValue(imageError)

      const result = await refreshProjects(mockEnv)

      expect(result).toEqual({
        success: false,
        message: 'Failed to refresh projects',
      })

      expect(mockCacheService.clearCache).toHaveBeenCalledOnce()
      expect(mockImageCacheService.clearAllScreenshots).toHaveBeenCalledOnce()
      expect(mockFetchGitHubProjects).not.toHaveBeenCalled()
    })

    it('should handle fetch errors gracefully', async () => {
      const fetchError = new Error('GitHub fetch failed')
      mockFetchGitHubProjects.mockRejectedValue(fetchError)

      const result = await refreshProjects(mockEnv)

      expect(result).toEqual({
        success: false,
        message: 'Failed to refresh projects',
      })

      expect(mockCacheService.clearCache).toHaveBeenCalledOnce()
      expect(mockImageCacheService.clearAllScreenshots).toHaveBeenCalledOnce()
      expect(mockFetchGitHubProjects).toHaveBeenCalledWith(
        mockCacheService,
        mockImageCacheService
      )
    })

    it('should handle empty projects array', async () => {
      mockFetchGitHubProjects.mockResolvedValue([])

      const result = await refreshProjects(mockEnv)

      expect(result).toEqual({
        success: true,
        message: 'Successfully refreshed 0 projects',
      })
    })
  })
})

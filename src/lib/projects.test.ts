import { describe, it, expect, vi, beforeEach } from 'vitest'

import { Project } from '@/types/project'

import { refreshProjects } from './projects'
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

describe('refreshProjects', () => {
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

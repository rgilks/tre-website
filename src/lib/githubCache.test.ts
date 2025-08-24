import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GitHubCacheService } from './githubCache'
import { Project } from '@/types/project'

// Mock KV namespace interface
interface MockKV {
  get: ReturnType<typeof vi.fn>
  put: ReturnType<typeof vi.fn>
  delete: ReturnType<typeof vi.fn>
}

const mockKV: MockKV = {
  get: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
}

describe('GitHubCacheService', () => {
  let cacheService: GitHubCacheService
  let mockProjects: Project[]

  beforeEach(() => {
    vi.clearAllMocks()
    cacheService = new GitHubCacheService(mockKV as unknown as KVNamespace)

    mockProjects = [
      {
        id: '1',
        name: 'test-project',
        fullName: 'rgilks/test-project',
        description: 'Test project',
        homepageUrl: 'https://test.tre.systems',
        htmlUrl: 'https://github.com/rgilks/test-project',
        topics: ['test', 'demo'],
        language: 'TypeScript',
        updatedAt: '2024-01-01T00:00:00Z',
        createdAt: '2024-01-01T00:00:00Z',
        screenshotUrl: 'https://example.com/screenshot.png',
        isCurrentlyWorking: true,
      },
    ]
  })

  describe('getCachedProjects', () => {
    it('should return cached projects when cache is valid', async () => {
      const now = Math.floor(Date.now() / 1000)
      mockKV.get.mockResolvedValueOnce(JSON.stringify(mockProjects))
      mockKV.get.mockResolvedValueOnce(now.toString())

      const result = await cacheService.getCachedProjects()

      expect(result).toEqual(mockProjects)
      expect(mockKV.get).toHaveBeenCalledTimes(2)
    })

    it('should return null when cache is expired', async () => {
      const expiredTimestamp = Math.floor(Date.now() / 1000) - 7 * 60 * 60 // 7 hours ago
      mockKV.get.mockResolvedValueOnce(JSON.stringify(mockProjects))
      mockKV.get.mockResolvedValueOnce(expiredTimestamp.toString())

      const result = await cacheService.getCachedProjects()

      expect(result).toBeNull()
    })

    it('should return null when cache data is missing', async () => {
      mockKV.get.mockResolvedValueOnce(null)
      mockKV.get.mockResolvedValueOnce(null)

      const result = await cacheService.getCachedProjects()

      expect(result).toBeNull()
    })

    it('should handle JSON parsing errors gracefully', async () => {
      mockKV.get.mockResolvedValueOnce('invalid-json')
      mockKV.get.mockResolvedValueOnce(Math.floor(Date.now() / 1000).toString())

      const result = await cacheService.getCachedProjects()

      expect(result).toBeNull()
    })
  })

  describe('setCachedProjects', () => {
    it('should store projects and timestamp in KV', async () => {
      await cacheService.setCachedProjects(mockProjects)

      expect(mockKV.put).toHaveBeenCalledTimes(2)
      expect(mockKV.put).toHaveBeenCalledWith(
        'github_projects',
        JSON.stringify(mockProjects)
      )
      expect(mockKV.put).toHaveBeenCalledWith(
        'github_projects_timestamp',
        expect.any(String)
      )
    })
  })

  describe('clearCache', () => {
    it('should delete cache keys from KV', async () => {
      await cacheService.clearCache()

      expect(mockKV.delete).toHaveBeenCalledTimes(2)
      expect(mockKV.delete).toHaveBeenCalledWith('github_projects')
      expect(mockKV.delete).toHaveBeenCalledWith('github_projects_timestamp')
    })
  })

  describe('isCacheValid', () => {
    it('should return true when cache timestamp is within TTL', async () => {
      const now = Math.floor(Date.now() / 1000)
      mockKV.get.mockResolvedValueOnce(now.toString())

      const result = await cacheService.isCacheValid()

      expect(result).toBe(true)
    })

    it('should return false when cache timestamp is expired', async () => {
      const expiredTimestamp = Math.floor(Date.now() / 1000) - 7 * 60 * 60 // 7 hours ago
      mockKV.get.mockResolvedValueOnce(expiredTimestamp.toString())

      const result = await cacheService.isCacheValid()

      expect(result).toBe(false)
    })

    it('should return false when timestamp is missing', async () => {
      mockKV.get.mockResolvedValueOnce(null)

      const result = await cacheService.isCacheValid()

      expect(result).toBe(false)
    })
  })
})

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import fs from 'fs/promises'
import path from 'path'
import { LocalCacheService } from './localCache'
import { Project } from '@/types/project'

// Mock fs module
vi.mock('fs/promises')

const mockFs = vi.mocked(fs)

describe('LocalCacheService', () => {
  let cacheService: LocalCacheService
  let mockProjects: Project[]
  const testCacheDir = path.join(process.cwd(), '.cache')
  const testCacheFile = path.join(testCacheDir, 'github-projects.json')
  const testTimestampFile = path.join(
    testCacheDir,
    'github-projects-timestamp.txt'
  )

  beforeEach(() => {
    vi.clearAllMocks()
    cacheService = new LocalCacheService()

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
        stargazersCount: 10,
        forksCount: 2,
        updatedAt: '2024-01-01T00:00:00Z',
        createdAt: '2024-01-01T00:00:00Z',
        screenshotUrl: 'https://example.com/screenshot.png',
        isCurrentlyWorking: true,
      },
    ]
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getCachedProjects', () => {
    it('should return cached projects when cache is valid', async () => {
      const now = Math.floor(Date.now() / 1000)

      // Mock file existence checks
      mockFs.access.mockResolvedValue(undefined)

      // Mock file reads
      mockFs.readFile
        .mockResolvedValueOnce(now.toString()) // timestamp file
        .mockResolvedValueOnce(JSON.stringify(mockProjects)) // projects file

      const result = await cacheService.getCachedProjects()

      expect(result).toEqual(mockProjects)
      expect(mockFs.readFile).toHaveBeenCalledWith(testTimestampFile, 'utf-8')
      expect(mockFs.readFile).toHaveBeenCalledWith(testCacheFile, 'utf-8')
    })

    it('should return null when cache is expired', async () => {
      const expiredTimestamp = Math.floor(Date.now() / 1000) - 7 * 60 * 60 // 7 hours ago

      // Mock file existence checks
      mockFs.access.mockResolvedValue(undefined)

      // Mock timestamp file read
      mockFs.readFile.mockResolvedValueOnce(expiredTimestamp.toString())

      const result = await cacheService.getCachedProjects()

      expect(result).toBeNull()
      expect(mockFs.readFile).toHaveBeenCalledWith(testTimestampFile, 'utf-8')
      expect(mockFs.readFile).toHaveBeenCalledTimes(1) // Should not read projects file
    })

    it('should return null when cache files do not exist', async () => {
      // Mock file existence checks to fail
      mockFs.access.mockRejectedValue(new Error('File not found'))

      const result = await cacheService.getCachedProjects()

      expect(result).toBeNull()
    })

    it('should handle JSON parsing errors gracefully', async () => {
      const now = Math.floor(Date.now() / 1000)

      // Mock file existence checks
      mockFs.access.mockResolvedValue(undefined)

      // Mock file reads
      mockFs.readFile
        .mockResolvedValueOnce(now.toString()) // timestamp file
        .mockResolvedValueOnce('invalid-json') // invalid projects file

      const result = await cacheService.getCachedProjects()

      expect(result).toBeNull()
    })
  })

  describe('setCachedProjects', () => {
    it('should store projects and timestamp in files', async () => {
      // Mock directory creation and file writes
      mockFs.access.mockRejectedValueOnce(new Error('Directory not found'))
      mockFs.mkdir.mockResolvedValue(undefined)
      mockFs.writeFile.mockResolvedValue(undefined)

      await cacheService.setCachedProjects(mockProjects)

      expect(mockFs.mkdir).toHaveBeenCalledWith(testCacheDir, {
        recursive: true,
      })
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        testCacheFile,
        JSON.stringify(mockProjects, null, 2)
      )
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        testTimestampFile,
        expect.any(String)
      )
      expect(mockFs.writeFile).toHaveBeenCalledTimes(2)
    })

    it('should not create directory if it already exists', async () => {
      // Mock directory already exists
      mockFs.access.mockResolvedValue(undefined)
      mockFs.writeFile.mockResolvedValue(undefined)

      await cacheService.setCachedProjects(mockProjects)

      expect(mockFs.mkdir).not.toHaveBeenCalled()
      expect(mockFs.writeFile).toHaveBeenCalledTimes(2)
    })
  })

  describe('clearCache', () => {
    it('should delete cache files', async () => {
      mockFs.unlink.mockResolvedValue(undefined)

      await cacheService.clearCache()

      expect(mockFs.unlink).toHaveBeenCalledWith(testCacheFile)
      expect(mockFs.unlink).toHaveBeenCalledWith(testTimestampFile)
      expect(mockFs.unlink).toHaveBeenCalledTimes(2)
    })

    it('should handle missing files gracefully', async () => {
      mockFs.unlink.mockRejectedValue(new Error('File not found'))

      await expect(cacheService.clearCache()).resolves.not.toThrow()
    })
  })

  describe('isCacheValid', () => {
    it('should return true when cache timestamp is within TTL', async () => {
      const now = Math.floor(Date.now() / 1000)

      mockFs.access.mockResolvedValue(undefined)
      mockFs.readFile.mockResolvedValue(now.toString())

      const result = await cacheService.isCacheValid()

      expect(result).toBe(true)
    })

    it('should return false when cache timestamp is expired', async () => {
      const expiredTimestamp = Math.floor(Date.now() / 1000) - 7 * 60 * 60 // 7 hours ago

      mockFs.access.mockResolvedValue(undefined)
      mockFs.readFile.mockResolvedValue(expiredTimestamp.toString())

      const result = await cacheService.isCacheValid()

      expect(result).toBe(false)
    })

    it('should return false when timestamp file does not exist', async () => {
      mockFs.access.mockRejectedValue(new Error('File not found'))

      const result = await cacheService.isCacheValid()

      expect(result).toBe(false)
    })
  })
})

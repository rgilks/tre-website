import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { Project } from '@/types/project'
import { createCacheService, createKVCacheService, initializeCacheService } from './cacheService'
import { createGitHubCacheService } from './githubCache'
import { getCloudflareEnvironment, setCloudflareEnvironment, type CloudflareEnvironment } from './cloudflareContext'

// Mock the dependencies
vi.mock('./githubCache')
vi.mock('./cloudflareContext')

const mockCreateGitHubCacheService = vi.mocked(createGitHubCacheService)
const mockGetCloudflareEnvironment = vi.mocked(getCloudflareEnvironment)
const mockSetCloudflareEnvironment = vi.mocked(setCloudflareEnvironment)

describe('CacheService', () => {
  let mockKV: KVNamespace
  let mockEnv: CloudflareEnvironment
  let mockGitHubCacheService: ReturnType<typeof createGitHubCacheService>

  beforeEach(() => {
    vi.clearAllMocks()
    
    mockKV = {
      get: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    } as unknown as KVNamespace
    
    mockEnv = {
      GITHUB_CACHE: mockKV,
    }

    mockGitHubCacheService = {
      getCachedProjects: vi.fn(),
      setCachedProjects: vi.fn(),
      clearCache: vi.fn(),
      kv: mockKV,
      isCacheValid: vi.fn(),
    } as unknown as ReturnType<typeof createGitHubCacheService>
    
    // Reset the global environment
    mockGetCloudflareEnvironment.mockReturnValue(undefined)
  })

  afterEach(() => {
    // Clean up any global state
    mockSetCloudflareEnvironment(undefined)
  })

  describe('createCacheService', () => {
    it('should create GitHub cache service when GITHUB_CACHE is available', () => {
      mockCreateGitHubCacheService.mockReturnValue(mockGitHubCacheService)
      mockGetCloudflareEnvironment.mockReturnValue(mockEnv)

      const result = createCacheService()

      expect(mockCreateGitHubCacheService).toHaveBeenCalledWith(mockKV)
      expect(result).toBe(mockGitHubCacheService)
    })

    it('should create fallback cache service when GITHUB_CACHE is not available', () => {
      mockGetCloudflareEnvironment.mockReturnValue(undefined)

      const result = createCacheService()

      expect(mockCreateGitHubCacheService).not.toHaveBeenCalled()
      expect(result).toBeInstanceOf(Object)
      expect(typeof result.getCachedProjects).toBe('function')
      expect(typeof result.setCachedProjects).toBe('function')
      expect(typeof result.clearCache).toBe('function')
    })

    it('should create GitHub cache service when environment is provided', () => {
      mockCreateGitHubCacheService.mockReturnValue(mockGitHubCacheService)

      const result = createCacheService(mockEnv)

      expect(mockCreateGitHubCacheService).toHaveBeenCalledWith(mockKV)
      expect(result).toBe(mockGitHubCacheService)
    })

    it('should create fallback cache service when provided environment has no GITHUB_CACHE', () => {
      const envWithoutKV: CloudflareEnvironment = {}

      const result = createCacheService(envWithoutKV)

      expect(mockCreateGitHubCacheService).not.toHaveBeenCalled()
      expect(result).toBeInstanceOf(Object)
      expect(typeof result.getCachedProjects).toBe('function')
      expect(typeof result.setCachedProjects).toBe('function')
      expect(typeof result.clearCache).toBe('function')
    })
  })

  describe('createKVCacheService', () => {
    it('should create GitHub cache service with KV namespace', () => {
      mockCreateGitHubCacheService.mockReturnValue(mockGitHubCacheService)

      const result = createKVCacheService(mockKV)

      expect(mockCreateGitHubCacheService).toHaveBeenCalledWith(mockKV)
      expect(result).toBe(mockGitHubCacheService)
    })
  })

  describe('initializeCacheService', () => {
    it('should create GitHub cache service when GITHUB_CACHE is available', () => {
      mockCreateGitHubCacheService.mockReturnValue(mockGitHubCacheService)

      const result = initializeCacheService(mockEnv)

      expect(mockCreateGitHubCacheService).toHaveBeenCalledWith(mockKV)
      expect(result).toBe(mockGitHubCacheService)
    })

    it('should create fallback cache service when GITHUB_CACHE is not available', () => {
      const envWithoutKV: CloudflareEnvironment = {}

      const result = initializeCacheService(envWithoutKV)

      expect(mockCreateGitHubCacheService).not.toHaveBeenCalled()
      expect(result).toBeInstanceOf(Object)
      expect(typeof result.getCachedProjects).toBe('function')
      expect(typeof result.setCachedProjects).toBe('function')
      expect(typeof result.clearCache).toBe('function')
    })
  })

  describe('FallbackCacheService', () => {
    it('should return null for getCachedProjects', async () => {
      const service = createCacheService()
      const result = await service.getCachedProjects()
      expect(result).toBeNull()
    })

    it('should do nothing for setCachedProjects', async () => {
      const service = createCacheService()
      const projects = [{ id: '1', name: 'test' } as Project]
      
      // Should not throw
      await expect(service.setCachedProjects(projects)).resolves.toBeUndefined()
    })

    it('should do nothing for clearCache', async () => {
      const service = createCacheService()
      
      // Should not throw
      await expect(service.clearCache()).resolves.toBeUndefined()
    })
  })

  describe('integration with cloudflare context', () => {
    it('should use cloudflare environment when available', () => {
      mockCreateGitHubCacheService.mockReturnValue(mockGitHubCacheService)
      mockGetCloudflareEnvironment.mockReturnValue(mockEnv)

      const result = createCacheService()

      expect(mockGetCloudflareEnvironment).toHaveBeenCalled()
      expect(mockCreateGitHubCacheService).toHaveBeenCalledWith(mockKV)
      expect(result).toBe(mockGitHubCacheService)
    })

    it('should handle undefined cloudflare environment gracefully', () => {
      mockGetCloudflareEnvironment.mockReturnValue(undefined)

      const result = createCacheService()

      expect(mockGetCloudflareEnvironment).toHaveBeenCalled()
      expect(result).toBeInstanceOf(Object)
      expect(typeof result.getCachedProjects).toBe('function')
    })
  })
})

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  setCloudflareEnvironment,
  getCloudflareEnvironment,
  isCloudflareWorker,
  type CloudflareEnvironment,
} from './cloudflareContext'

describe('CloudflareContext', () => {
  let mockEnv: CloudflareEnvironment

  beforeEach(() => {
    vi.clearAllMocks()

    mockEnv = {
      GITHUB_CACHE: {} as KVNamespace,
    }

    // Reset the module's internal state by re-importing
    vi.resetModules()
  })

  afterEach(() => {
    // Clean up any global state
    setCloudflareEnvironment(undefined)
  })

  describe('setCloudflareEnvironment', () => {
    it('should set the cloudflare environment', () => {
      setCloudflareEnvironment(mockEnv)
      const result = getCloudflareEnvironment()
      expect(result).toBe(mockEnv)
    })

    it('should set undefined environment', () => {
      setCloudflareEnvironment(undefined)
      const result = getCloudflareEnvironment()
      expect(result).toBeUndefined()
    })

    it('should overwrite existing environment', () => {
      const firstEnv: CloudflareEnvironment = {
        GITHUB_CACHE: {} as KVNamespace,
      }
      const secondEnv: CloudflareEnvironment = {
        GITHUB_CACHE: {} as KVNamespace,
      }

      setCloudflareEnvironment(firstEnv)
      expect(getCloudflareEnvironment()).toBe(firstEnv)

      setCloudflareEnvironment(secondEnv)
      expect(getCloudflareEnvironment()).toBe(secondEnv)
    })
  })

  describe('getCloudflareEnvironment', () => {
    it('should return undefined when no environment is set', () => {
      const result = getCloudflareEnvironment()
      expect(result).toBeUndefined()
    })

    it('should return the set environment', () => {
      setCloudflareEnvironment(mockEnv)
      const result = getCloudflareEnvironment()
      expect(result).toBe(mockEnv)
    })

    it('should return the same reference', () => {
      setCloudflareEnvironment(mockEnv)
      const result1 = getCloudflareEnvironment()
      const result2 = getCloudflareEnvironment()
      expect(result1).toBe(result2)
    })
  })

  describe('isCloudflareWorker', () => {
    it('should return false when __CLOUDFLARE_WORKER__ is not in globalThis', () => {
      // Ensure __CLOUDFLARE_WORKER__ is not present
      delete (globalThis as Record<string, unknown>).__CLOUDFLARE_WORKER__

      const result = isCloudflareWorker()
      expect(result).toBe(false)
    })

    it('should return true when __CLOUDFLARE_WORKER__ is in globalThis', () => {
      // Mock __CLOUDFLARE_WORKER__ property
      ;(globalThis as Record<string, unknown>).__CLOUDFLARE_WORKER__ = true

      const result = isCloudflareWorker()
      expect(result).toBe(true)
    })

    it('should return true when __CLOUDFLARE_WORKER__ is truthy', () => {
      // Mock __CLOUDFLARE_WORKER__ property with truthy value
      ;(globalThis as Record<string, unknown>).__CLOUDFLARE_WORKER__ = 'worker'

      const result = isCloudflareWorker()
      expect(result).toBe(true)
    })

    it('should return false when __CLOUDFLARE_WORKER__ is falsy', () => {
      // Mock __CLOUDFLARE_WORKER__ property with falsy value
      ;(globalThis as Record<string, unknown>).__CLOUDFLARE_WORKER__ = false

      const result = isCloudflareWorker()
      expect(result).toBe(false)
    })

    it('should handle undefined globalThis gracefully', () => {
      // Mock undefined globalThis (edge case)
      ;(global as Record<string, unknown>).globalThis = undefined

      const result = isCloudflareWorker()
      expect(result).toBe(false)
    })
  })

  describe('environment persistence', () => {
    it('should maintain environment across multiple calls', () => {
      setCloudflareEnvironment(mockEnv)

      expect(getCloudflareEnvironment()).toBe(mockEnv)
      expect(getCloudflareEnvironment()).toBe(mockEnv)
      expect(getCloudflareEnvironment()).toBe(mockEnv)
    })

    it('should isolate environment between different instances', () => {
      // This test verifies that the module-level variable is properly isolated
      setCloudflareEnvironment(mockEnv)
      expect(getCloudflareEnvironment()).toBe(mockEnv)

      // Reset and verify isolation
      setCloudflareEnvironment(undefined)
      expect(getCloudflareEnvironment()).toBeUndefined()
    })
  })

  describe('type safety', () => {
    it('should accept valid CloudflareEnvironment', () => {
      const validEnv: CloudflareEnvironment = {
        GITHUB_CACHE: {} as KVNamespace,
      }

      setCloudflareEnvironment(validEnv)
      const result = getCloudflareEnvironment()
      expect(result).toEqual(validEnv)
    })

    it('should accept undefined', () => {
      setCloudflareEnvironment(undefined)
      const result = getCloudflareEnvironment()
      expect(result).toBeUndefined()
    })
  })
})

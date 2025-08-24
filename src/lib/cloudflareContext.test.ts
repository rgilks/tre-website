import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  setCloudflareEnvironment,
  getCloudflareEnvironment,
  isCloudflareWorker,
  CloudflareEnvironment,
} from './cloudflareContext'

describe('cloudflareContext', () => {
  const mockEnv: CloudflareEnvironment = {
    GITHUB_CACHE: {} as KVNamespace,
  }

  beforeEach(() => {
    // Clear any existing environment
    setCloudflareEnvironment(undefined)
  })

  afterEach(() => {
    // Clean up
    setCloudflareEnvironment(undefined)
  })

  describe('setCloudflareEnvironment', () => {
    it('should set the cloudflare environment', () => {
      setCloudflareEnvironment(mockEnv)
      const result = getCloudflareEnvironment()

      expect(result).toEqual(mockEnv)
    })

    it('should set environment to undefined', () => {
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
      expect(getCloudflareEnvironment()).toEqual(firstEnv)

      setCloudflareEnvironment(secondEnv)
      expect(getCloudflareEnvironment()).toEqual(secondEnv)
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

      expect(result).toEqual(mockEnv)
    })
  })

  describe('isCloudflareWorker', () => {
    it('should return false in Node.js environment', () => {
      const result = isCloudflareWorker()
      expect(result).toBe(false)
    })

    it('should return true when __CLOUDFLARE_WORKER__ is present', () => {
      // Mock the globalThis to simulate Cloudflare Worker environment
      ;(globalThis as Record<string, unknown>).__CLOUDFLARE_WORKER__ = true

      try {
        const result = isCloudflareWorker()
        expect(result).toBe(true)
      } finally {
        // Restore original globalThis
        delete (globalThis as Record<string, unknown>).__CLOUDFLARE_WORKER__
      }
    })

    it('should return false when __CLOUDFLARE_WORKER__ is not present', () => {
      // Ensure __CLOUDFLARE_WORKER__ is not present
      delete (globalThis as Record<string, unknown>).__CLOUDFLARE_WORKER__

      const result = isCloudflareWorker()
      expect(result).toBe(false)
    })
  })
})

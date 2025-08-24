import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import {
  withCloudflareContext,
  withCloudflareContextSync,
} from './workerWrapper'
import {
  setCloudflareEnvironment,
  type CloudflareEnvironment,
} from './cloudflareContext'

// Mock the cloudflareContext module
vi.mock('./cloudflareContext', () => ({
  setCloudflareEnvironment: vi.fn(),
}))

const mockSetCloudflareEnvironment = vi.mocked(setCloudflareEnvironment)

describe('WorkerWrapper', () => {
  let mockEnv: CloudflareEnvironment
  let mockFn: () => Promise<string>
  let mockSyncFn: () => string

  beforeEach(() => {
    vi.clearAllMocks()

    mockEnv = {
      GITHUB_CACHE: {} as KVNamespace,
    }

    mockFn = vi.fn().mockResolvedValue('async result')
    mockSyncFn = vi.fn().mockReturnValue('sync result')
  })

  afterEach(() => {
    // Clean up any global state
    mockSetCloudflareEnvironment(undefined)
  })

  describe('withCloudflareContext', () => {
    it('should set cloudflare environment before executing async function', async () => {
      const result = await withCloudflareContext(mockEnv, mockFn)

      expect(mockSetCloudflareEnvironment).toHaveBeenCalledWith(mockEnv)
      expect(mockFn).toHaveBeenCalled()
      expect(result).toBe('async result')
    })

    it('should clean up environment after async function execution', async () => {
      await withCloudflareContext(mockEnv, mockFn)

      expect(mockSetCloudflareEnvironment).toHaveBeenCalledWith(mockEnv)
      expect(mockSetCloudflareEnvironment).toHaveBeenCalledWith(undefined)
    })

    it('should clean up environment even if async function throws', async () => {
      const errorFn = vi.fn().mockRejectedValue(new Error('Test error'))

      await expect(withCloudflareContext(mockEnv, errorFn)).rejects.toThrow(
        'Test error'
      )

      expect(mockSetCloudflareEnvironment).toHaveBeenCalledWith(mockEnv)
      expect(mockSetCloudflareEnvironment).toHaveBeenCalledWith(undefined)
    })

    it('should execute function with correct context', async () => {
      let capturedEnv: CloudflareEnvironment | undefined

      const contextAwareFn = vi.fn().mockImplementation(async () => {
        capturedEnv = mockEnv
        return 'context result'
      })

      await withCloudflareContext(mockEnv, contextAwareFn)

      expect(capturedEnv).toBe(mockEnv)
    })

    it('should handle function that returns void', async () => {
      const voidFn = vi.fn().mockResolvedValue(undefined)

      const result = await withCloudflareContext(mockEnv, voidFn)

      expect(mockSetCloudflareEnvironment).toHaveBeenCalledWith(mockEnv)
      expect(mockSetCloudflareEnvironment).toHaveBeenCalledWith(undefined)
      expect(result).toBeUndefined()
    })
  })

  describe('withCloudflareContextSync', () => {
    it('should set cloudflare environment before executing sync function', () => {
      const result = withCloudflareContextSync(mockEnv, mockSyncFn)

      expect(mockSetCloudflareEnvironment).toHaveBeenCalledWith(mockEnv)
      expect(mockSyncFn).toHaveBeenCalled()
      expect(result).toBe('sync result')
    })

    it('should clean up environment after sync function execution', () => {
      withCloudflareContextSync(mockEnv, mockSyncFn)

      expect(mockSetCloudflareEnvironment).toHaveBeenCalledWith(mockEnv)
      expect(mockSetCloudflareEnvironment).toHaveBeenCalledWith(undefined)
    })

    it('should clean up environment even if sync function throws', () => {
      const errorFn = vi.fn().mockImplementation(() => {
        throw new Error('Test error')
      })

      expect(() => withCloudflareContextSync(mockEnv, errorFn)).toThrow(
        'Test error'
      )

      expect(mockSetCloudflareEnvironment).toHaveBeenCalledWith(mockEnv)
      expect(mockSetCloudflareEnvironment).toHaveBeenCalledWith(undefined)
    })

    it('should execute function with correct context', () => {
      let capturedEnv: CloudflareEnvironment | undefined

      const contextAwareFn = vi.fn().mockImplementation(() => {
        capturedEnv = mockEnv
        return 'context result'
      })

      withCloudflareContextSync(mockEnv, contextAwareFn)

      expect(capturedEnv).toBe(mockEnv)
    })

    it('should handle function that returns void', () => {
      const voidFn = vi.fn().mockReturnValue(undefined)

      const result = withCloudflareContextSync(mockEnv, voidFn)

      expect(mockSetCloudflareEnvironment).toHaveBeenCalledWith(mockEnv)
      expect(mockSetCloudflareEnvironment).toHaveBeenCalledWith(undefined)
      expect(result).toBeUndefined()
    })
  })

  describe('error handling and cleanup', () => {
    it('should ensure cleanup happens in finally block for async function', async () => {
      const cleanupSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      try {
        await withCloudflareContext(mockEnv, async () => {
          throw new Error('Intentional error')
        })
      } catch {
        // Expected to throw
      }

      expect(mockSetCloudflareEnvironment).toHaveBeenCalledWith(undefined)
      cleanupSpy.mockRestore()
    })

    it('should ensure cleanup happens in finally block for sync function', () => {
      const cleanupSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      try {
        withCloudflareContextSync(mockEnv, () => {
          throw new Error('Intentional error')
        })
      } catch {
        // Expected to throw
      }

      expect(mockSetCloudflareEnvironment).toHaveBeenCalledWith(undefined)
      cleanupSpy.mockRestore()
    })
  })

  describe('type safety', () => {
    it('should preserve return type for async functions', async () => {
      const numberFn = vi.fn().mockResolvedValue(42)
      const stringFn = vi.fn().mockResolvedValue('hello')
      const objectFn = vi.fn().mockResolvedValue({ key: 'value' })

      const numberResult = await withCloudflareContext(mockEnv, numberFn)
      const stringResult = await withCloudflareContext(mockEnv, stringFn)
      const objectResult = await withCloudflareContext(mockEnv, objectFn)

      expect(typeof numberResult).toBe('number')
      expect(typeof stringResult).toBe('string')
      expect(typeof objectResult).toBe('object')
    })

    it('should preserve return type for sync functions', () => {
      const numberFn = vi.fn().mockReturnValue(42)
      const stringFn = vi.fn().mockReturnValue('hello')
      const objectFn = vi.fn().mockReturnValue({ key: 'value' })

      const numberResult = withCloudflareContextSync(mockEnv, numberFn)
      const stringResult = withCloudflareContextSync(mockEnv, stringFn)
      const objectResult = withCloudflareContextSync(mockEnv, objectFn)

      expect(typeof numberResult).toBe('number')
      expect(typeof stringResult).toBe('string')
      expect(typeof objectResult).toBe('object')
    })
  })
})

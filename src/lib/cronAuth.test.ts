import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { validateCronAuth } from './cronAuth'
import { NextRequest } from 'next/server'

// Mock NextRequest
const createMockRequest = (authHeader?: string): NextRequest => {
  const headers = new Map()
  if (authHeader) {
    headers.set('authorization', authHeader)
  }

  return {
    headers: {
      get: (name: string) => headers.get(name) || null,
    },
  } as NextRequest
}

describe('cronAuth', () => {
  const originalEnv = process.env
  const mockCronSecret = 'test-cron-secret-123'

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }

    // Clear global variables
    delete (globalThis as Record<string, unknown>).CRON_SECRET
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('validateCronAuth', () => {
    it('should return valid result when CRON_SECRET is configured and auth header matches', () => {
      // Set environment variable
      process.env.CRON_SECRET = mockCronSecret

      const request = createMockRequest(`Bearer ${mockCronSecret}`)
      const result = validateCronAuth(request)

      expect(result).toEqual({
        isValid: true,
        status: 200,
      })
    })

    it('should return valid result when CRON_SECRET is set in globalThis', () => {
      // Set global variable (Cloudflare environment)
      ;(globalThis as Record<string, unknown>).CRON_SECRET = mockCronSecret

      const request = createMockRequest(`Bearer ${mockCronSecret}`)
      const result = validateCronAuth(request)

      expect(result).toEqual({
        isValid: true,
        status: 200,
      })
    })

    it('should return error when CRON_SECRET is not configured', () => {
      const request = createMockRequest('Bearer some-token')
      const result = validateCronAuth(request)

      expect(result).toEqual({
        isValid: false,
        error: 'CRON_SECRET not configured',
        details: 'Please add CRON_SECRET to your environment variables',
        status: 500,
      })
    })

    it('should return error when auth header is missing', () => {
      process.env.CRON_SECRET = mockCronSecret

      const request = createMockRequest() // No auth header
      const result = validateCronAuth(request)

      expect(result).toEqual({
        isValid: false,
        error: 'Unauthorized',
        details:
          'Invalid or missing Authorization header. Check CRON_SECRET configuration.',
        status: 401,
      })
    })

    it('should return error when auth header does not match', () => {
      process.env.CRON_SECRET = mockCronSecret

      const request = createMockRequest('Bearer wrong-secret')
      const result = validateCronAuth(request)

      expect(result).toEqual({
        isValid: false,
        error: 'Unauthorized',
        details:
          'Invalid or missing Authorization header. Check CRON_SECRET configuration.',
        status: 401,
      })
    })

    it('should return error when auth header format is incorrect', () => {
      process.env.CRON_SECRET = mockCronSecret

      const request = createMockRequest('InvalidFormat secret')
      const result = validateCronAuth(request)

      expect(result).toEqual({
        isValid: false,
        error: 'Unauthorized',
        details:
          'Invalid or missing Authorization header. Check CRON_SECRET configuration.',
        status: 401,
      })
    })

    it('should prioritize globalThis.CRON_SECRET over process.env.CRON_SECRET', () => {
      // Set both, globalThis should take precedence
      process.env.CRON_SECRET = 'env-secret'
      ;(globalThis as Record<string, unknown>).CRON_SECRET = 'global-secret'

      const request = createMockRequest('Bearer global-secret')
      const result = validateCronAuth(request)

      expect(result).toEqual({
        isValid: true,
        status: 200,
      })
    })
  })
})

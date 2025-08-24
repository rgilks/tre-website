import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import { validateCronAuth } from './cronAuth'

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

describe('validateCronAuth', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.clearAllMocks()
    process.env = { ...originalEnv }

    // Reset globalThis.CRON_SECRET
    if ('CRON_SECRET' in globalThis) {
      delete (globalThis as { CRON_SECRET?: string }).CRON_SECRET
    }
  })

  afterEach(() => {
    process.env = originalEnv
    // Note: We can't reassign globalThis, so we just clean up the CRON_SECRET property
    if ('CRON_SECRET' in globalThis) {
      delete (globalThis as { CRON_SECRET?: string }).CRON_SECRET
    }
  })

  it('should validate correct Bearer token from process.env', () => {
    process.env.CRON_SECRET = 'test-secret-123'

    const request = createMockRequest('Bearer test-secret-123')
    const result = validateCronAuth(request)

    expect(result).toEqual({
      isValid: true,
      status: 200,
    })
  })

  it('should validate correct Bearer token from globalThis', () => {
    ;(globalThis as { CRON_SECRET?: string }).CRON_SECRET = 'cloudflare-secret-456'

    const request = createMockRequest('Bearer cloudflare-secret-456')
    const result = validateCronAuth(request)

    expect(result).toEqual({
      isValid: true,
      status: 200,
    })
  })

  it('should prioritize globalThis over process.env', () => {
    process.env.CRON_SECRET = 'env-secret'
    ;(globalThis as { CRON_SECRET?: string }).CRON_SECRET = 'global-secret'

    const request = createMockRequest('Bearer global-secret')
    const result = validateCronAuth(request)

    expect(result).toEqual({
      isValid: true,
      status: 200,
    })
  })

  it('should reject invalid Bearer token', () => {
    process.env.CRON_SECRET = 'test-secret-123'

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

  it('should reject missing Authorization header', () => {
    process.env.CRON_SECRET = 'test-secret-123'

    const request = createMockRequest()
    const result = validateCronAuth(request)

    expect(result).toEqual({
      isValid: false,
      error: 'Unauthorized',
      details:
        'Invalid or missing Authorization header. Check CRON_SECRET configuration.',
      status: 401,
    })
  })

  it('should reject malformed Authorization header', () => {
    process.env.CRON_SECRET = 'test-secret-123'

    const request = createMockRequest('InvalidFormat test-secret-123')
    const result = validateCronAuth(request)

    expect(result).toEqual({
      isValid: false,
      error: 'Unauthorized',
      details:
        'Invalid or missing Authorization header. Check CRON_SECRET configuration.',
      status: 401,
    })
  })

  it('should handle missing CRON_SECRET in environment', () => {
    const request = createMockRequest('Bearer any-token')
    const result = validateCronAuth(request)

    expect(result).toEqual({
      isValid: false,
      error: 'CRON_SECRET not configured',
      details: 'Please add CRON_SECRET to your environment variables',
      status: 500,
    })
  })

  it('should handle empty CRON_SECRET', () => {
    process.env.CRON_SECRET = ''

    const request = createMockRequest('Bearer any-token')
    const result = validateCronAuth(request)

    expect(result).toEqual({
      isValid: false,
      error: 'CRON_SECRET not configured',
      details: 'Please add CRON_SECRET to your environment variables',
      status: 500,
    })
  })

  it('should handle case-sensitive token matching', () => {
    process.env.CRON_SECRET = 'Test-Secret-123'

    const request = createMockRequest('Bearer test-secret-123')
    const result = validateCronAuth(request)

    expect(result).toEqual({
      isValid: false,
      error: 'Unauthorized',
      details:
        'Invalid or missing Authorization header. Check CRON_SECRET configuration.',
      status: 401,
    })
  })
})

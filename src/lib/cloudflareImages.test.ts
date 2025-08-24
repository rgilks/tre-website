import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock fetch before importing the module
const mockFetch = vi.fn()

// Import after mocking
import {
  CloudflareImagesService,
  createCloudflareImagesService
} from './cloudflareImages'

declare global {
  var CLOUDFLARE_ACCOUNT_ID: string | undefined
  var CLOUDFLARE_IMAGES_API_TOKEN: string | undefined
}

// Set up global fetch mock
beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('CloudflareImagesService', () => {
  let service: CloudflareImagesService

  beforeEach(() => {
    vi.clearAllMocks()

    globalThis.CLOUDFLARE_ACCOUNT_ID = 'test-account-id'
    globalThis.CLOUDFLARE_IMAGES_API_TOKEN = 'test-api-token'

    vi.stubEnv('CLOUDFLARE_ACCOUNT_ID', '')
    vi.stubEnv('CLOUDFLARE_IMAGES_API_TOKEN', '')

    service = new CloudflareImagesService()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    globalThis.CLOUDFLARE_ACCOUNT_ID = undefined
    globalThis.CLOUDFLARE_IMAGES_API_TOKEN = undefined
  })

  describe('constructor', () => {
    it('should use global variables when available', () => {
      const serviceWithGlobals = new CloudflareImagesService()
      expect(serviceWithGlobals.isConfigured()).toBe(true)
    })

    it('should fall back to process.env when global variables are not available', () => {
      globalThis.CLOUDFLARE_ACCOUNT_ID = undefined
      globalThis.CLOUDFLARE_IMAGES_API_TOKEN = undefined

      vi.stubEnv('CLOUDFLARE_ACCOUNT_ID', 'env-account-id')
      vi.stubEnv('CLOUDFLARE_IMAGES_API_TOKEN', 'env-api-token')

      const serviceWithEnv = new CloudflareImagesService()
      expect(serviceWithEnv.isConfigured()).toBe(true)
    })

    it('should handle missing credentials gracefully', () => {
      globalThis.CLOUDFLARE_ACCOUNT_ID = undefined
      globalThis.CLOUDFLARE_IMAGES_API_TOKEN = undefined

      vi.stubEnv('CLOUDFLARE_ACCOUNT_ID', '')
      vi.stubEnv('CLOUDFLARE_IMAGES_API_TOKEN', '')

      const serviceWithoutCreds = new CloudflareImagesService()
      expect(serviceWithoutCreds.isConfigured()).toBe(false)
    })
  })

  describe('uploadImageFromUrl', () => {
    it('should return null when credentials are not configured', async () => {
      globalThis.CLOUDFLARE_IMAGES_API_TOKEN = undefined
      vi.stubEnv('CLOUDFLARE_IMAGES_API_TOKEN', '')

      const serviceWithoutCreds = new CloudflareImagesService()
      const result = await serviceWithoutCreds.uploadImageFromUrl('test-project', 'https://example.com/image.jpg')

      expect(result).toBeNull()
    })

    it('should successfully upload an image', async () => {
      const mockImageResponse = new Response('fake-image-data', {
        status: 200,
        headers: { 'content-type': 'image/jpeg' }
      })

      const mockUploadResponse = new Response(JSON.stringify({ 
        success: true,
        result: { 
          id: 'image-123', 
          variants: ['public'],
          uploaded: '2024-01-01T00:00:00Z'
        }
      }), {
        status: 200,
        headers: { 'content-type': 'application/json' }
      })

      mockFetch
        .mockResolvedValueOnce(mockImageResponse)
        .mockResolvedValueOnce(mockUploadResponse)

      const result = await service.uploadImageFromUrl('https://example.com/image.jpg', 'test-project')

      expect(result).toEqual({
        id: 'image-123',
        variants: ['public'],
        uploaded: '2024-01-01T00:00:00Z'
      })
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    it('should handle image fetch failure', async () => {
      const mockImageResponse = new Response('Not Found', { status: 404 })

      mockFetch.mockResolvedValueOnce(mockImageResponse)

      const result = await service.uploadImageFromUrl('https://example.com/image.jpg', 'test-project')

      expect(result).toBeNull()
    })

    it('should handle Cloudflare upload failure', async () => {
      const mockImageResponse = new Response('fake-image-data', {
        status: 200,
        headers: { 'content-type': 'image/jpeg' }
      })

      const mockUploadResponse = new Response('Upload failed', { status: 400 })

      mockFetch
        .mockResolvedValueOnce(mockImageResponse)
        .mockResolvedValueOnce(mockUploadResponse)

      const result = await service.uploadImageFromUrl('https://example.com/image.jpg', 'test-project')

      expect(result).toBeNull()
    })

    it('should handle Cloudflare API error response', async () => {
      const mockImageResponse = new Response('fake-image-data', {
        status: 200,
        headers: { 'content-type': 'image/jpeg' }
      })

      const mockUploadResponse = new Response(JSON.stringify({ error: 'Invalid image format' }), {
        status: 400,
        headers: { 'content-type': 'application/json' }
      })

      mockFetch
        .mockResolvedValueOnce(mockImageResponse)
        .mockResolvedValueOnce(mockUploadResponse)

      const result = await service.uploadImageFromUrl('https://example.com/image.jpg', 'test-project')

      expect(result).toBeNull()
    })

    it('should handle network errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const result = await service.uploadImageFromUrl('https://example.com/image.jpg', 'test-project')

      expect(result).toBeNull()
    })

    it('should include correct metadata in upload', async () => {
      const mockImageResponse = new Response('fake-image-data', {
        status: 200,
        headers: { 'content-type': 'image/jpeg' }
      })

      const mockUploadResponse = new Response(JSON.stringify({ 
        success: true,
        result: { 
          id: 'image-123', 
          variants: ['public'],
          uploaded: '2024-01-01T00:00:00Z'
        }
      }), {
        status: 200,
        headers: { 'content-type': 'application/json' }
      })

      mockFetch
        .mockResolvedValueOnce(mockImageResponse)
        .mockResolvedValueOnce(mockUploadResponse)

      await service.uploadImageFromUrl('https://example.com/image.jpg', 'test-project')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/images/v1'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-api-token'
          })
        })
      )
    })
  })

  describe('getImageUrl', () => {
    it('should return correct URL with default variant', () => {
      const url = service.getImageUrl('image-123')
      expect(url).toBe('https://imagedelivery.net/test-account-id/image-123/public')
    })

    it('should return correct URL with custom variant', () => {
      const url = service.getImageUrl('image-123', 'thumbnail')
      expect(url).toBe('https://imagedelivery.net/test-account-id/image-123/thumbnail')
    })
  })

  describe('deleteImage', () => {
    it('should return false when credentials are not configured', async () => {
      globalThis.CLOUDFLARE_IMAGES_API_TOKEN = undefined
      vi.stubEnv('CLOUDFLARE_IMAGES_API_TOKEN', '')

      const serviceWithoutCreds = new CloudflareImagesService()
      const result = await serviceWithoutCreds.deleteImage('image-123')

      expect(result).toBe(false)
    })

    it('should successfully delete an image', async () => {
      const mockResponse = new Response('', { status: 200 })
      mockFetch.mockResolvedValueOnce(mockResponse)

      const result = await service.deleteImage('image-123')

      expect(result).toBe(true)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/images/v1/image-123'),
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-api-token'
          })
        })
      )
    })

    it('should handle delete failure', async () => {
      const mockResponse = new Response('Not Found', { status: 404 })
      mockFetch.mockResolvedValueOnce(mockResponse)

      const result = await service.deleteImage('image-123')

      expect(result).toBe(false)
    })

    it('should handle network errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const result = await service.deleteImage('image-123')

      expect(result).toBe(false)
    })
  })

  describe('isConfigured', () => {
    it('should return true when both credentials are available', () => {
      expect(service.isConfigured()).toBe(true)
    })

    it('should return false when account ID is missing', () => {
      globalThis.CLOUDFLARE_ACCOUNT_ID = undefined
      vi.stubEnv('CLOUDFLARE_ACCOUNT_ID', '')

      const serviceWithoutAccountId = new CloudflareImagesService()
      expect(serviceWithoutAccountId.isConfigured()).toBe(false)
    })

    it('should return false when API token is missing', () => {
      globalThis.CLOUDFLARE_IMAGES_API_TOKEN = undefined
      vi.stubEnv('CLOUDFLARE_IMAGES_API_TOKEN', '')

      const serviceWithoutToken = new CloudflareImagesService()
      expect(serviceWithoutToken.isConfigured()).toBe(false)
    })

    it('should return false when both credentials are missing', () => {
      globalThis.CLOUDFLARE_ACCOUNT_ID = undefined
      globalThis.CLOUDFLARE_IMAGES_API_TOKEN = undefined
      vi.stubEnv('CLOUDFLARE_ACCOUNT_ID', '')
      vi.stubEnv('CLOUDFLARE_IMAGES_API_TOKEN', '')

      const serviceWithoutCreds = new CloudflareImagesService()
      expect(serviceWithoutCreds.isConfigured()).toBe(false)
    })
  })

  describe('getImageVariants', () => {
    it('should return expected image variants', () => {
      const variants = service.getImageVariants()
      expect(variants).toEqual(['public', 'thumbnail', 'card', 'hero', 'responsive'])
    })
  })

  describe('createCloudflareImagesService', () => {
    it('should create a new service instance', () => {
      const newService = createCloudflareImagesService()
      expect(newService).toBeInstanceOf(CloudflareImagesService)
    })
  })

  describe('error handling', () => {
    it('should log errors appropriately', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      mockFetch.mockRejectedValueOnce(new Error('Test error'))

      await service.uploadImageFromUrl('https://example.com/image.jpg', 'test-project')

      expect(consoleSpy).toHaveBeenCalledWith('Error uploading image for test-project:', expect.any(Error))

      consoleSpy.mockRestore()
    })
  })
})

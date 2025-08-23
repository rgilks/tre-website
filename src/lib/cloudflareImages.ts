import { Project } from '@/types/project'

export interface CloudflareImageUpload {
  id: string
  variants: string[]
  uploaded: string
}

export interface CloudflareImageService {
  uploadImageFromUrl(imageUrl: string, projectName: string): Promise<CloudflareImageUpload | null>
  getImageUrl(imageId: string, variant?: string): string
  deleteImage(imageId: string): Promise<boolean>
}

export class CloudflareImagesService implements CloudflareImageService {
  private accountId: string
  private apiToken: string
  private baseUrl: string

  constructor() {
    this.accountId = process.env.CLOUDFLARE_ACCOUNT_ID || ''
    this.apiToken = process.env.CLOUDFLARE_IMAGES_API_TOKEN || ''
    this.baseUrl = `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/images/v1`
  }

  /**
   * Upload an image from a GitHub URL to Cloudflare Images
   */
  async uploadImageFromUrl(imageUrl: string, projectName: string): Promise<CloudflareImageUpload | null> {
    if (!this.accountId || !this.apiToken) {
      console.warn('Cloudflare Images not configured, skipping upload')
      return null
    }

    try {
      // Download the image from GitHub
      const response = await fetch(imageUrl)
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`)
      }

      const imageBuffer = await response.arrayBuffer()
      const formData = new FormData()
      
      // Add the image file
      const blob = new Blob([imageBuffer])
      formData.append('file', blob, `${projectName}-screenshot.png`)
      
      // Add metadata
      formData.append('metadata', JSON.stringify({
        project: projectName,
        source: 'github',
        uploaded: new Date().toISOString()
      }))

      // Upload to Cloudflare Images
      const uploadResponse = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
        },
        body: formData
      })

      if (!uploadResponse.ok) {
        const error = await uploadResponse.text()
        throw new Error(`Cloudflare upload failed: ${error}`)
      }

      const result = await uploadResponse.json()
      
      if (result.success) {
        console.log(`Successfully uploaded image for ${projectName} to Cloudflare Images`)
        return {
          id: result.result.id,
          variants: result.result.variants || [],
          uploaded: result.result.uploaded
        }
      } else {
        throw new Error(`Upload failed: ${result.errors?.[0]?.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error(`Error uploading image for ${projectName}:`, error)
      return null
    }
  }

  /**
   * Get the URL for a Cloudflare Image
   */
  getImageUrl(imageId: string, variant: string = 'public'): string {
    return `https://imagedelivery.net/${this.accountId}/${imageId}/${variant}`
  }

  /**
   * Delete an image from Cloudflare Images
   */
  async deleteImage(imageId: string): Promise<boolean> {
    if (!this.accountId || !this.apiToken) {
      return false
    }

    try {
      const response = await fetch(`${this.baseUrl}/${imageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
        }
      })

      return response.ok
    } catch (error) {
      console.error(`Error deleting image ${imageId}:`, error)
      return false
    }
  }

  /**
   * Check if Cloudflare Images is configured
   */
  isConfigured(): boolean {
    return !!(this.accountId && this.apiToken)
  }

  /**
   * Get available image variants
   */
  getImageVariants(): string[] {
    return [
      'public',           // Original size
      'thumbnail',        // 150x150
      'card',            // 300x300
      'hero',            // 600x600
      'responsive'        // Auto-responsive
    ]
  }
}

// Factory function to create Cloudflare Images service
export function createCloudflareImagesService(): CloudflareImagesService {
  return new CloudflareImagesService()
}

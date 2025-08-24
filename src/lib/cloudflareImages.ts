export interface CloudflareImageUpload {
  id: string
  variants: string[]
  uploaded: string
}

export interface CloudflareImageService {
  uploadImageFromUrl(
    imageUrl: string,
    projectName: string
  ): Promise<CloudflareImageUpload | null>
  getImageUrl(imageId: string, variant?: string): string
  deleteImage(imageId: string): Promise<boolean>
  isConfigured(): boolean
  getImageVariants(): string[]
}

// Extend globalThis to include Cloudflare environment variables
declare global {
  var CLOUDFLARE_ACCOUNT_ID: string | undefined
  var CLOUDFLARE_IMAGES_API_TOKEN: string | undefined
}

export function createCloudflareImagesService(): CloudflareImageService {
  // Get credentials from Cloudflare environment variables or fall back to process.env for local development
  const accountId =
    globalThis.CLOUDFLARE_ACCOUNT_ID || process.env.CLOUDFLARE_ACCOUNT_ID || ''
  const apiToken =
    globalThis.CLOUDFLARE_IMAGES_API_TOKEN ||
    process.env.CLOUDFLARE_IMAGES_API_TOKEN ||
    ''
  const baseUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1`

  return {
    /**
     * Upload an image from a GitHub URL to Cloudflare Images
     */
    async uploadImageFromUrl(
      imageUrl: string,
      projectName: string
    ): Promise<CloudflareImageUpload | null> {
      if (!accountId || !apiToken) {
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
        formData.append(
          'metadata',
          JSON.stringify({
            project: projectName,
            source: 'github',
            uploaded: new Date().toISOString(),
          })
        )

        // Upload to Cloudflare Images
        const uploadResponse = await fetch(baseUrl, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiToken}`,
          },
          body: formData,
        })

        if (!uploadResponse.ok) {
          const error = await uploadResponse.text()
          throw new Error(`Cloudflare upload failed: ${error}`)
        }

        const result = (await uploadResponse.json()) as {
          success: boolean
          result: {
            id: string
            variants?: string[]
            uploaded: string
          }
          errors?: Array<{ message: string }>
        }

        if (result.success) {
          console.log(
            `Successfully uploaded image for ${projectName} to Cloudflare Images`
          )
          return {
            id: result.result.id,
            variants: result.result.variants || [],
            uploaded: result.result.uploaded,
          }
        } else {
          throw new Error(
            `Upload failed: ${result.errors?.[0]?.message || 'Unknown error'}`
          )
        }
      } catch (error) {
        console.error(`Error uploading image for ${projectName}:`, error)
        return null
      }
    },

    /**
     * Get the URL for a Cloudflare Image
     */
    getImageUrl(imageId: string, variant: string = 'public'): string {
      return `https://imagedelivery.net/${accountId}/${imageId}/${variant}`
    },

    /**
     * Delete an image from Cloudflare Images
     */
    async deleteImage(imageId: string): Promise<boolean> {
      if (!accountId || !apiToken) {
        return false
      }

      try {
        const response = await fetch(`${baseUrl}/${imageId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${apiToken}`,
          },
        })

        return response.ok
      } catch (error) {
        console.error(`Error deleting image ${imageId}:`, error)
        return false
      }
    },

    /**
     * Check if Cloudflare Images is configured
     */
    isConfigured(): boolean {
      return !!(accountId && apiToken)
    },

    /**
     * Get available image variants
     */
    getImageVariants(): string[] {
      return [
        'public', // Original size
        'thumbnail', // 150x150
        'card', // 300x300
        'hero', // 600x600
        'responsive', // Auto-responsive
      ]
    },
  }
}

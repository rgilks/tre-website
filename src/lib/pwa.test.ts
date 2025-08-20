import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  isAppInstalled,
  isInstallPromptAvailable,
  showInstallPrompt,
} from './pwa'

// Mock window object
const mockWindow = {
  matchMedia: vi.fn(),
  navigator: {
    standalone: false,
  } as Navigator & { standalone?: boolean },
}

describe('PWA Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Reset global mocks
    Object.defineProperty(global, 'window', {
      value: mockWindow,
      writable: true,
    })
    Object.defineProperty(global, 'navigator', {
      value: mockWindow.navigator,
      writable: true,
    })
  })

  describe('isAppInstalled', () => {
    it('should return true when display-mode is standalone', () => {
      mockWindow.matchMedia.mockReturnValue({
        matches: true,
      } as MediaQueryList)

      const result = isAppInstalled()
      expect(result).toBe(true)
    })

    it('should return true when navigator.standalone is true', () => {
      mockWindow.matchMedia.mockReturnValue({
        matches: false,
      } as MediaQueryList)

      mockWindow.navigator.standalone = true

      const result = isAppInstalled()
      expect(result).toBe(true)
    })

    it('should return false when neither condition is met', () => {
      mockWindow.matchMedia.mockReturnValue({
        matches: false,
      } as MediaQueryList)

      mockWindow.navigator.standalone = false

      const result = isAppInstalled()
      expect(result).toBe(false)
    })
  })

  describe('isInstallPromptAvailable', () => {
    it('should return false when no deferred prompt exists', () => {
      const result = isInstallPromptAvailable()
      expect(result).toBe(false)
    })
  })

  describe('showInstallPrompt', () => {
    it('should return false when no deferred prompt exists', async () => {
      const result = await showInstallPrompt()
      expect(result).toBe(false)
    })
  })
})

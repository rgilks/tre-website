import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { 
  registerServiceWorker, 
  setupInstallPrompt, 
  showInstallPrompt, 
  isAppInstalled, 
  isInstallPromptAvailable,
  clearDeferredPrompt,
  initializePWA,
  type BeforeInstallPromptEvent 
} from './pwa'

/* eslint-disable @typescript-eslint/no-explicit-any */

// Mock global objects
const mockNavigator = {
  serviceWorker: {
    register: vi.fn(),
  },
  standalone: false,
}

const mockWindow = {
  addEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
  matchMedia: vi.fn(),
}

const mockConsole = {
  log: vi.fn(),
  error: vi.fn(),
}

// Use vi.stubGlobal to properly mock global objects
vi.stubGlobal('navigator', mockNavigator)
vi.stubGlobal('window', mockWindow)
vi.stubGlobal('console', mockConsole)

describe('PWA Utilities', () => {
  let mockServiceWorker: {
    register: ReturnType<typeof vi.fn>
    controller: boolean | null
  }
  let mockRegistration: {
    addEventListener: ReturnType<typeof vi.fn>
    installing: {
      addEventListener: ReturnType<typeof vi.fn>
      state: string
    }
  }
  let mockInstallingWorker: {
    addEventListener: ReturnType<typeof vi.fn>
    state: string
  }
  let mockBeforeInstallPromptEvent: {
    preventDefault: ReturnType<typeof vi.fn>
    platforms: string[]
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
    prompt: ReturnType<typeof vi.fn>
  }
  let mockMatchMedia: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
    clearDeferredPrompt()
    
    // Reset global mocks
    mockServiceWorker = {
      register: vi.fn(),
      controller: true,
    }
    
    mockInstallingWorker = {
      addEventListener: vi.fn(),
      state: 'installing',
    }
    
    mockRegistration = {
      addEventListener: vi.fn(),
      installing: mockInstallingWorker,
    }
    
    mockBeforeInstallPromptEvent = {
      preventDefault: vi.fn(),
      platforms: ['web'],
      userChoice: Promise.resolve({ outcome: 'accepted', platform: 'web' }),
      prompt: vi.fn(),
    }
    
    mockMatchMedia = vi.fn().mockReturnValue({
      matches: false,
    })
    
    // Setup mocks using type assertion
    ;(global as any).navigator.serviceWorker = mockServiceWorker
    ;(global as any).window.matchMedia = mockMatchMedia
    ;(global as any).window.addEventListener = vi.fn()
    ;(global as any).window.dispatchEvent = vi.fn()
    
    // Update the mocked navigator.standalone property
    ;(global as any).navigator.standalone = false
    
    // Reset module state
    vi.resetModules()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('registerServiceWorker', () => {
    it('should register service worker when available', async () => {
      mockServiceWorker.register.mockResolvedValue(mockRegistration)
      
      await registerServiceWorker()
      
      expect(mockServiceWorker.register).toHaveBeenCalledWith('/sw.js')
      expect(mockRegistration.addEventListener).toHaveBeenCalledWith('updatefound', expect.any(Function))
    })

    it('should handle service worker registration failure', async () => {
      const error = new Error('Registration failed')
      mockServiceWorker.register.mockRejectedValue(error)
      
      await registerServiceWorker()
      
      expect(mockServiceWorker.register).toHaveBeenCalledWith('/sw.js')
      expect(console.error).toHaveBeenCalledWith('Service Worker registration failed:', error)
    })

    it('should handle missing service worker gracefully', async () => {
      ;(global as any).navigator.serviceWorker = undefined
      
      await registerServiceWorker()
      
      expect(console.error).not.toHaveBeenCalled()
    })

    it('should handle service worker updates', async () => {
      mockServiceWorker.register.mockResolvedValue(mockRegistration)
      
      await registerServiceWorker()
      
      // Simulate updatefound event
      const updateFoundHandler = mockRegistration.addEventListener.mock.calls[0][1] as () => void
      updateFoundHandler()
      
      // Simulate state change
      const stateChangeHandler = mockInstallingWorker.addEventListener.mock.calls[0][1] as () => void
      mockInstallingWorker.state = 'installed'
      stateChangeHandler()
      
      expect(mockInstallingWorker.addEventListener).toHaveBeenCalledWith('statechange', expect.any(Function))
    })

    it('should not log new service worker when controller is missing', async () => {
      mockServiceWorker.controller = null
      mockServiceWorker.register.mockResolvedValue(mockRegistration)
      
      await registerServiceWorker()
      
      // Simulate updatefound event
      const updateFoundHandler = mockRegistration.addEventListener.mock.calls[0][1] as () => void
      updateFoundHandler()
      
      // Simulate state change
      const stateChangeHandler = mockInstallingWorker.addEventListener.mock.calls[0][1] as () => void
      mockInstallingWorker.state = 'installed'
      stateChangeHandler()
      
      expect(console.log).not.toHaveBeenCalledWith('New service worker available')
    })
  })

  describe('setupInstallPrompt', () => {
    it('should set up beforeinstallprompt event listener', () => {
      setupInstallPrompt()
      
      expect((global as any).window.addEventListener).toHaveBeenCalledWith('beforeinstallprompt', expect.any(Function))
    })

    it('should handle beforeinstallprompt event', () => {
      setupInstallPrompt()
      
      const eventHandler = (global as any).window.addEventListener.mock.calls[0][1] as (event: typeof mockBeforeInstallPromptEvent) => void
      eventHandler(mockBeforeInstallPromptEvent)
      
      expect(mockBeforeInstallPromptEvent.preventDefault).toHaveBeenCalled()
      expect((global as any).window.dispatchEvent).toHaveBeenCalledWith(
        new CustomEvent('pwa-install-available')
      )
    })
  })

  describe('showInstallPrompt', () => {
    it('should return false when no deferred prompt is available', async () => {
      const result = await showInstallPrompt()
      
      expect(result).toBe(false)
    })

    it('should show install prompt when available', async () => {
      // Setup deferred prompt
      setupInstallPrompt()
      const eventHandler = (global as any).window.addEventListener.mock.calls[0][1] as (event: typeof mockBeforeInstallPromptEvent) => void
      eventHandler(mockBeforeInstallPromptEvent)
      
      const result = await showInstallPrompt()
      
      expect(mockBeforeInstallPromptEvent.prompt).toHaveBeenCalled()
      expect(result).toBe(true)
    })

    it('should handle prompt errors gracefully', async () => {
      // Setup deferred prompt
      setupInstallPrompt()
      const eventHandler = (global as any).window.addEventListener.mock.calls[0][1] as (event: typeof mockBeforeInstallPromptEvent) => void
      eventHandler(mockBeforeInstallPromptEvent)
      
      // Mock prompt to throw error and userChoice to reject
      mockBeforeInstallPromptEvent.prompt.mockRejectedValue(new Error('Prompt failed'))
      mockBeforeInstallPromptEvent.userChoice = Promise.reject(new Error('User choice failed'))
      
      const result = await showInstallPrompt()
      
      expect(result).toBe(false)
      expect(console.error).toHaveBeenCalledWith('Error showing install prompt:', expect.any(Error))
    })

    it('should clear deferred prompt after use', async () => {
      // Setup deferred prompt
      setupInstallPrompt()
      const eventHandler = (global as any).window.addEventListener.mock.calls[0][1] as (event: typeof mockBeforeInstallPromptEvent) => void
      eventHandler(mockBeforeInstallPromptEvent)
      
      await showInstallPrompt()
      
      // Second call should return false
      const result = await showInstallPrompt()
      expect(result).toBe(false)
    })
  })

  describe('isAppInstalled', () => {
    it('should return true for standalone display mode', () => {
      mockMatchMedia.mockReturnValue({ matches: true })
      
      const result = isAppInstalled()
      
      expect(result).toBe(true)
      expect(mockMatchMedia).toHaveBeenCalledWith('(display-mode: standalone)')
    })

    it('should return true for iOS standalone mode', () => {
      mockMatchMedia.mockReturnValue({ matches: false })
      ;(global as any).navigator.standalone = true
      
      const result = isAppInstalled()
      
      expect(result).toBe(true)
    })

    it('should return false when not installed', () => {
      mockMatchMedia.mockReturnValue({ matches: false })
      ;(global as any).navigator.standalone = false
      
      const result = isAppInstalled()
      
      expect(result).toBe(false)
    })
  })

  describe('isInstallPromptAvailable', () => {
    it('should return false when no deferred prompt', () => {
      const result = isInstallPromptAvailable()
      
      expect(result).toBe(false)
    })

    it('should return true when deferred prompt is available', () => {
      // Setup deferred prompt
      setupInstallPrompt()
      const eventHandler = (global as any).window.addEventListener.mock.calls[0][1] as (event: typeof mockBeforeInstallPromptEvent) => void
      eventHandler(mockBeforeInstallPromptEvent)
      
      const result = isInstallPromptAvailable()
      
      expect(result).toBe(true)
    })
  })

  describe('initializePWA', () => {
    it('should call registerServiceWorker and setupInstallPrompt', () => {
      const registerSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      
      initializePWA()
      
      expect((global as any).window.addEventListener).toHaveBeenCalledWith('beforeinstallprompt', expect.any(Function))
      
      registerSpy.mockRestore()
    })
  })

  describe('error handling', () => {
    it('should handle missing navigator gracefully', () => {
      const originalNavigator = (global as any).navigator
      ;(global as any).navigator = undefined
      
      expect(() => isAppInstalled()).not.toThrow()
      
      ;(global as any).navigator = originalNavigator
    })

    it('should handle missing window gracefully', () => {
      const originalWindow = (global as any).window
      ;(global as any).window = undefined
      
      expect(() => setupInstallPrompt()).not.toThrow()
      
      ;(global as any).window = originalWindow
    })
  })

  describe('type safety', () => {
    it('should handle BeforeInstallPromptEvent interface correctly', () => {
      const event: BeforeInstallPromptEvent = {
        preventDefault: vi.fn(),
        platforms: ['web', 'android'],
        userChoice: Promise.resolve({ outcome: 'dismissed', platform: 'web' }),
        prompt: vi.fn(),
      } as unknown as BeforeInstallPromptEvent
      
      expect(event.platforms).toEqual(['web', 'android'])
      expect(typeof event.userChoice).toBe('object')
      expect(typeof event.prompt).toBe('function')
    })
  })
})

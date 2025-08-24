// PWA utilities for service worker registration and install prompts

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;

// Register service worker
export async function registerServiceWorker(): Promise<void> {
  if (typeof navigator !== 'undefined' && navigator.serviceWorker && 'serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered successfully:', registration);
      
      // Handle service worker updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker available
              console.log('New service worker available');
              // You could show a notification to the user here
            }
          });
        }
      });
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
}

// Handle install prompt
export function setupInstallPrompt(): void {
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      deferredPrompt = e;
      
      // Dispatch custom event to notify components
      window.dispatchEvent(new CustomEvent('pwa-install-available'));
    });
  }
}

// Show install prompt
export async function showInstallPrompt(): Promise<boolean> {
  if (!deferredPrompt) {
    return false;
  }
  
  try {
    // Show the install prompt
    try {
      deferredPrompt.prompt();
    } catch (promptError) {
      console.error('Error calling prompt():', promptError);
      deferredPrompt = null;
      return false;
    }
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    // Clear the deferred prompt
    deferredPrompt = null;
    
    return outcome === 'accepted';
  } catch (error) {
    console.error('Error showing install prompt:', error);
    // Clear the deferred prompt on error
    deferredPrompt = null;
    return false;
  }
}

// Check if app is installed
export function isAppInstalled(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }
  return window.matchMedia('(display-mode: standalone)').matches ||
         (navigator as { standalone?: boolean }).standalone === true;
}

// Check if install prompt is available
export function isInstallPromptAvailable(): boolean {
  return deferredPrompt !== null;
}

// Clear deferred prompt (useful for testing)
export function clearDeferredPrompt(): void {
  deferredPrompt = null;
}

// Initialize PWA functionality
export function initializePWA(): void {
  registerServiceWorker();
  setupInstallPrompt();
}

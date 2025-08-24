'use client'

import { useState, useEffect } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'

import {
  showInstallPrompt,
  isInstallPromptAvailable,
  isAppInstalled,
} from '@/lib/pwa'

export function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if app is already installed
    setIsInstalled(isAppInstalled())

    // Listen for install prompt availability
    const handleInstallAvailable = () => {
      if (!isInstalled) {
        setShowPrompt(true)
      }
    }

    // Check if install prompt is available on mount
    if (isInstallPromptAvailable() && !isInstalled) {
      setShowPrompt(true)
    }

    window.addEventListener('pwa-install-available', handleInstallAvailable)

    return () => {
      window.removeEventListener(
        'pwa-install-available',
        handleInstallAvailable
      )
    }
  }, [isInstalled])

  const handleInstall = async () => {
    try {
      const accepted = await showInstallPrompt()
      if (accepted) {
        setShowPrompt(false)
        setIsInstalled(true)
      }
    } catch (error) {
      console.error('Install failed:', error)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    // Store dismissal preference in localStorage
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
  }

  // Don't show if already installed or dismissed recently
  if (!showPrompt || isInstalled) {
    return null
  }

  // Check if user dismissed recently (within 24 hours)
  const dismissedTime = localStorage.getItem('pwa-install-dismissed')
  if (dismissedTime) {
    const dismissedDate = new Date(parseInt(dismissedTime))
    const now = new Date()
    const hoursSinceDismissed =
      (now.getTime() - dismissedDate.getTime()) / (1000 * 60 * 60)
    if (hoursSinceDismissed < 24) {
      return null
    }
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50">
      <div className="bg-tre-black border border-tre-green/30 rounded-lg p-4 shadow-lg backdrop-blur-sm">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-tre-green font-mono font-semibold text-sm mb-1">
              Install TRE Portfolio
            </h3>
            <p className="text-tre-white/80 text-xs font-mono">
              Add to your home screen for quick access
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="text-tre-white/60 hover:text-tre-white transition-colors duration-200 ml-2"
            aria-label="Dismiss install prompt"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={handleInstall}
            className="flex-1 bg-tre-green text-tre-black font-mono font-semibold py-2 px-3 rounded text-xs hover:bg-tre-green/80 transition-colors duration-200"
          >
            Install
          </button>
          <button
            onClick={handleDismiss}
            className="px-3 py-2 text-tre-white/60 hover:text-tre-white font-mono text-xs transition-colors duration-200"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { isAppInstalled, isInstallPromptAvailable } from '@/lib/pwa'

export function PWAStatus() {
  const [isInstalled, setIsInstalled] = useState(false)
  const [installAvailable, setInstallAvailable] = useState(false)
  const [swStatus, setSwStatus] = useState<string>('Unknown')

  useEffect(() => {
    // Check PWA status
    setIsInstalled(isAppInstalled())
    setInstallAvailable(isInstallPromptAvailable())

    // Check service worker status
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        if (registration.active) {
          setSwStatus('Active')
        } else if (registration.installing) {
          setSwStatus('Installing')
        } else if (registration.waiting) {
          setSwStatus('Waiting')
        }
      })
    } else {
      setSwStatus('Not Supported')
    }
  }, [])

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null
  }

  return (
    <div className="fixed top-20 right-4 bg-tre-black/90 border border-tre-green/30 rounded-lg p-3 text-xs font-mono backdrop-blur-sm z-40">
      <div className="text-tre-green font-semibold mb-2">PWA Status</div>
      <div className="space-y-1 text-tre-white/80">
        <div>Installed: {isInstalled ? '✅' : '❌'}</div>
        <div>Install Available: {installAvailable ? '✅' : '❌'}</div>
        <div>Service Worker: {swStatus}</div>
      </div>
    </div>
  )
}

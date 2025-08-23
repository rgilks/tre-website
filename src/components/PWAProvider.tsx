'use client'

import { useEffect } from 'react'
import { initializePWA } from '@/lib/pwa'
import { InstallPrompt } from './InstallPrompt'

export function PWAProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize PWA functionality
    initializePWA()
  }, [])

  return (
    <>
      {children}
      <InstallPrompt />
    </>
  )
}

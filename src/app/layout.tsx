import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'

import './globals.css'
import { TRELogo } from '@/components/TRELogo'
import { PWAProvider } from '@/components/PWAProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Total Reality Engineering',
  description:
    'A minimal, flashy portfolio showcasing innovative GitHub projects with a modern, terminal-inspired design.',
  keywords: [
    'engineering',
    'portfolio',
    'GitHub',
    'projects',
    'technology',
    'innovation',
  ],
  authors: [{ name: 'Total Reality Engineering' }],
  creator: 'Total Reality Engineering',
  publisher: 'Total Reality Engineering',
  robots: 'index, follow',
  openGraph: {
    title: 'Total Reality Engineering',
    description: 'Innovative engineering projects and portfolio',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Total Reality Engineering',
    description: 'Innovative engineering projects and portfolio',
  },
  manifest: '/manifest.webmanifest',
}

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black"
        />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/logo192.png" />
      </head>
      <body
        className={`${inter.className} bg-tre-black text-tre-white antialiased`}
      >
        <PWAProvider>
          <div className="min-h-screen flex flex-col">
            <header className="border-b border-tre-green/20 bg-tre-black/95 backdrop-blur-sm sticky top-0 z-50">
              <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <TRELogo className="animate-fade-in w-10 h-10" />
                  <h1 className="text-2xl font-bold text-tre-green font-mono">
                    Total Reality Engineering
                  </h1>
                </div>
                <nav className="hidden md:flex items-center space-x-6">
                  <a
                    href="#projects"
                    className="text-tre-white hover:text-tre-green transition-colors duration-200 font-mono"
                  >
                    Projects
                  </a>
                  <a
                    href="#about"
                    className="text-tre-white hover:text-tre-green transition-colors duration-200 font-mono"
                  >
                    About
                  </a>
                  <a
                    href="#contact"
                    className="text-tre-white hover:text-tre-green transition-colors duration-200 font-mono"
                  >
                    Contact
                  </a>
                </nav>
              </div>
            </header>

            <main className="flex-1">{children}</main>

            <footer className="border-t border-tre-green/20 bg-tre-black/95 backdrop-blur-sm">
              <div className="container mx-auto px-4 py-6 text-center">
                <p className="text-tre-white/70 font-mono">
                  © {new Date().getFullYear()} Total Reality Engineering. Built
                  with innovation.
                </p>
              </div>
            </footer>
          </div>
        </PWAProvider>
      </body>
    </html>
  )
}

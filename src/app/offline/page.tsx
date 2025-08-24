'use client'

import { TRELogo } from '@/components/TRELogo'

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-tre-black text-tre-white flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="mb-8 flex justify-center">
          <TRELogo width={80} height={80} className="text-tre-green" />
        </div>

        <h1 className="text-3xl font-bold text-tre-green font-mono mb-4">
          You&apos;re Offline
        </h1>

        <p className="text-tre-white/80 mb-6 font-mono">
          It looks like you&apos;ve lost your connection. Don&apos;t worry - you
          can still access previously visited pages.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-tre-green text-tre-black font-mono font-semibold py-3 px-6 rounded-lg hover:bg-tre-green/80 transition-colors duration-200"
          >
            Try Again
          </button>

          <button
            onClick={() => window.history.back()}
            className="w-full border border-tre-green/50 text-tre-green font-mono py-3 px-6 rounded-lg hover:bg-tre-green/10 transition-colors duration-200"
          >
            Go Back
          </button>
        </div>

        <div className="mt-8 text-tre-white/60 text-sm font-mono">
          <p>Total Reality Engineering</p>
          <p>Always innovating, even offline</p>
        </div>
      </div>
    </div>
  )
}

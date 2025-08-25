'use client'

import { motion } from 'framer-motion'

import { getHeroAnimations } from '@/lib/animationUtils'

import { TRELogo } from './TRELogo'

export function HeroSection() {
  const animations = getHeroAnimations()

  return (
    <section
      data-testid="hero-section"
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-tre-black via-tre-black to-tre-black/95 relative overflow-hidden"
    >
      {/* Darker background overlay for better text readability */}
      <div className="absolute inset-0 bg-tre-black/80" />

      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-radial from-tre-green/5 via-transparent to-transparent" />

      <div className="container mx-auto px-4 text-center relative z-10">
        <motion.div
          key="hero-logo"
          {...animations[0]}
          className="mb-12"
          suppressHydrationWarning
        >
          <TRELogo className="mx-auto mb-6 animate-glow w-full max-w-[min(600px,90vw)] h-auto max-h-[min(600px,80vh)]" />
        </motion.div>

        {/* Full-width white line */}
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-screen h-px bg-tre-white/30" />

        {/* Mission Statement */}
        <motion.div
          key="hero-mission"
          {...animations[1]}
          className="mb-16"
          suppressHydrationWarning
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-tre-white mb-6 leading-tight drop-shadow-lg">
            Bridge the gap between
          </h2>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-tre-green mb-6 leading-tight drop-shadow-lg">
            dreams and reality
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-tre-white max-w-4xl mx-auto leading-relaxed drop-shadow-lg">
            through cutting-edge engineering
          </p>
        </motion.div>

        {/* Technology Stack */}
        <motion.div
          key="hero-tech"
          {...animations[2]}
          className="mb-8"
          suppressHydrationWarning
        >
          <div
            className="inline-flex flex-wrap items-center justify-center gap-6 px-6 py-4 bg-tre-black/80 backdrop-blur-md rounded-2xl border border-tre-green shadow-lg"
            style={{
              boxShadow:
                '0 0 6px rgba(57, 255, 20, 0.3), inset 0 0 6px rgba(57, 255, 20, 0.05)',
            }}
          >
            <span className="text-tre-white text-sm font-medium">
              Powered by
            </span>
            <div className="flex flex-wrap items-center gap-4 text-tre-green font-semibold">
              <span className="text-base sm:text-lg">Next.js</span>
              <span className="text-tre-white/50">•</span>
              <span className="text-base sm:text-lg">Rust/Wasm</span>
              <span className="text-tre-white/50">•</span>
              <span className="text-base sm:text-lg">WebGPU/WGSL</span>
              <span className="text-tre-white/50">•</span>
              <span className="text-base sm:text-lg">Cloudflare Hosting</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

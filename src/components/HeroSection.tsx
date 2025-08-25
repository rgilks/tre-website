'use client'

import { motion } from 'framer-motion'

import { getHeroAnimations } from '@/lib/animationUtils'

import { TRELogo } from './TRELogo'

export function HeroSection() {
  const animations = getHeroAnimations()

  return (
    <section data-testid="hero-section" className="min-h-screen flex items-center justify-center bg-gradient-to-br from-tre-black via-tre-black to-tre-black/95 relative overflow-hidden">
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-radial from-tre-green/10 via-transparent to-transparent" />

      <div className="container mx-auto px-4 text-center relative z-10">
        <motion.div
          key="hero-logo"
          {...animations[0]}
          className="mb-8"
          suppressHydrationWarning
        >
          <TRELogo
            className="mx-auto mb-6 animate-glow w-full max-w-[600px] h-auto"
          />
        </motion.div>

        <motion.h1
          key="hero-title"
          {...animations[1]}
          className="text-6xl md:text-7xl font-bold text-tre-green font-mono mb-6 tracking-tight"
          suppressHydrationWarning
        >
          Total Reality Engineering
        </motion.h1>

        <motion.p
          key="hero-description"
          {...animations[2]}
          className="text-xl md:text-2xl text-tre-white/80 max-w-3xl mx-auto mb-12 leading-relaxed"
          suppressHydrationWarning
        >
          Where imagination meets implementation. We build innovative solutions
          that bridge the gap between dreams and reality through cutting-edge
          engineering.
        </motion.p>
      </div>
    </section>
  )
}

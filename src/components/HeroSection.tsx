'use client'

import { motion } from 'framer-motion'
import { TRELogo } from './TRELogo'

export function HeroSection() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-tre-black via-tre-black to-tre-black/95 relative overflow-hidden">
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-radial from-tre-green/10 via-transparent to-transparent" />

      <div className="container mx-auto px-4 text-center relative z-10">
        <motion.div
          key="hero-logo"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="mb-8"
        >
          <TRELogo
            width={600}
            height={600}
            className="mx-auto mb-6 animate-glow"
          />
        </motion.div>

        <motion.h1
          key="hero-title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          className="text-6xl md:text-7xl font-bold text-tre-green font-mono mb-6 tracking-tight"
        >
          Total Reality Engineering
        </motion.h1>

        <motion.p
          key="hero-description"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
          className="text-xl md:text-2xl text-tre-white/80 max-w-3xl mx-auto mb-12 leading-relaxed"
        >
          Where imagination meets implementation. We build innovative solutions
          that bridge the gap between dreams and reality through cutting-edge
          engineering.
        </motion.p>


      </div>
    </section>
  )
}

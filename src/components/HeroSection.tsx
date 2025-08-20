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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          className="text-6xl md:text-7xl font-bold text-tre-green font-mono mb-6 tracking-tight"
        >
          Total Reality Engineering
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
          className="text-xl md:text-2xl text-tre-white/80 max-w-3xl mx-auto mb-12 leading-relaxed"
        >
          Where imagination meets implementation. We build innovative solutions
          that bridge the gap between dreams and reality through cutting-edge
          engineering.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <a
            href="#projects"
            className="px-8 py-4 bg-tre-green text-tre-black font-bold font-mono rounded-lg hover:bg-tre-green-dark transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-tre-green/25"
          >
            View Projects
          </a>
          <a
            href="#about"
            className="px-8 py-4 border-2 border-tre-green text-tre-green font-bold font-mono rounded-lg hover:bg-tre-green hover:text-tre-black transition-all duration-200 transform hover:scale-105"
          >
            Learn More
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1, ease: 'easeOut' }}
          className="mt-16 text-tre-white/60 font-mono text-sm"
        >
          <p>Scroll to explore our portfolio</p>
          <div className="mt-2 animate-bounce">
            <svg
              className="w-6 h-6 mx-auto"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

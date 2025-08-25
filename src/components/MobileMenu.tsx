'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => setIsOpen(!isOpen)

  const menuItems = [
    { href: '#projects', label: 'Projects', icon: '🚀' },
    { href: '#about', label: 'About', icon: '⚡' },
    { href: '#contact', label: 'Contact', icon: '💬' },
  ]

  return (
    <div className="md:hidden">
      {/* Hamburger Button */}
      <button
        onClick={toggleMenu}
        className="relative p-2 text-tre-green hover:text-tre-white transition-all duration-300 group"
        aria-label="Toggle mobile menu"
        data-testid="mobile-menu-button"
      >
        <div className="w-6 h-6 flex flex-col justify-center items-center">
          <span
            className={`block w-5 h-0.5 bg-current transition-all duration-300 ease-out ${
              isOpen ? 'rotate-45 translate-y-1' : '-translate-y-1'
            }`}
          />
          <span
            className={`block w-5 h-0.5 bg-current transition-all duration-300 ease-out ${
              isOpen ? 'opacity-0' : 'opacity-100'
            }`}
          />
          <span
            className={`block w-5 h-0.5 bg-current transition-all duration-300 ease-out ${
              isOpen ? '-rotate-45 -translate-y-1' : 'translate-y-1'
            }`}
          />
        </div>
        {/* Glow effect */}
        <div className="absolute inset-0 bg-tre-green/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
      </button>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="fixed inset-0 bg-gradient-to-br from-black/95 via-black/90 to-tre-green/20 z-40 backdrop-blur-sm"
              onClick={toggleMenu}
            />
            
            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ 
                type: 'spring', 
                damping: 30, 
                stiffness: 300,
                opacity: { duration: 0.2 }
              }}
              className="fixed right-0 top-0 h-full w-80 bg-gradient-to-b from-black via-black/95 to-tre-black/90 border-l border-tre-green/30 z-50 shadow-2xl backdrop-blur-md"
            >
              {/* Animated background elements */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-20 right-10 w-32 h-32 bg-tre-green/5 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-20 right-20 w-24 h-24 bg-tre-green/10 rounded-full blur-2xl animate-pulse delay-1000" />
              </div>

              <div className="relative z-10 p-8">
                {/* Header */}
                <motion.div 
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                  className="flex justify-between items-center mb-12 pb-6 border-b border-gradient-to-r from-tre-green/40 via-tre-green/20 to-transparent"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-tre-green to-tre-green/70 rounded-lg flex items-center justify-center">
                      <span className="text-black font-bold text-sm">TRE</span>
                    </div>
                    <h2 className="text-2xl font-bold text-tre-green font-mono tracking-wider">
                      Menu
                    </h2>
                  </div>
                  <button
                    onClick={toggleMenu}
                    className="p-3 text-tre-white hover:text-tre-green transition-all duration-300 rounded-xl hover:bg-tre-green/10 hover:scale-110 border border-tre-green/20 hover:border-tre-green/40"
                    aria-label="Close mobile menu"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </motion.div>

                {/* Navigation */}
                <nav className="space-y-6">
                  {menuItems.map((item, index) => (
                    <motion.a
                      key={item.href}
                      href={item.href}
                      onClick={toggleMenu}
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ 
                        delay: 0.2 + index * 0.1, 
                        duration: 0.4,
                        type: 'spring',
                        stiffness: 200
                      }}
                      className="group block relative overflow-hidden"
                      data-testid={`mobile-menu-${item.label.toLowerCase()}`}
                    >
                      <div className="relative p-6 bg-gradient-to-r from-tre-green/5 via-tre-green/10 to-tre-green/5 rounded-2xl border border-tre-green/20 hover:border-tre-green/40 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-tre-green/20">
                        <div className="flex items-center space-x-4">
                          <span className="text-2xl">{item.icon}</span>
                          <span className="text-xl font-semibold text-tre-white group-hover:text-tre-green transition-colors duration-300 font-mono tracking-wide">
                            {item.label}
                          </span>
                        </div>
                        
                        {/* Hover effect line */}
                        <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-tre-green to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                        
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-tre-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                      </div>
                    </motion.a>
                  ))}
                </nav>

                {/* Footer */}
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.3 }}
                  className="absolute bottom-8 left-8 right-8 text-center"
                >
                  <div className="text-tre-green/60 text-sm font-mono">
                    Total Reality Engineering
                  </div>
                  <div className="text-tre-white/40 text-xs mt-1">
                    Where imagination meets implementation
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

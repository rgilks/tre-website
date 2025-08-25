'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => setIsOpen(!isOpen)

  const menuItems = [
    { href: '#projects', label: 'Projects' },
    { href: '#about', label: 'About' },
    { href: '#contact', label: 'Contact' },
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
        {/* Subtle glow effect */}
        <div className="absolute inset-0 bg-tre-green/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </button>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop with blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-40"
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
              className="fixed right-0 top-0 h-full w-72 bg-black/90 backdrop-blur-xl border-l border-tre-green/30 z-50 shadow-2xl"
            >
              <div className="relative z-10 p-6">
                {/* Header */}
                <motion.div 
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                  className="flex justify-between items-center mb-8 pb-4 border-b border-tre-green/20"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-tre-green rounded-lg flex items-center justify-center">
                      <span className="text-black font-bold text-sm">TRE</span>
                    </div>
                    <h2 className="text-xl font-bold text-tre-green font-mono tracking-wide">
                      Menu
                    </h2>
                  </div>
                  <button
                    onClick={toggleMenu}
                    className="p-2 text-tre-white hover:text-tre-green transition-all duration-300 rounded-lg hover:bg-tre-green/10 border border-tre-green/20 hover:border-tre-green/40"
                    aria-label="Close mobile menu"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </motion.div>

                {/* Navigation */}
                <nav className="space-y-3">
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
                      className="group block relative"
                      data-testid={`mobile-menu-${item.label.toLowerCase()}`}
                    >
                      <div className="relative p-4 bg-tre-green/5 hover:bg-tre-green/10 rounded-lg border border-tre-green/20 hover:border-tre-green/40 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-tre-green/20">
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-medium text-tre-white group-hover:text-tre-green transition-colors duration-300 font-mono">
                            {item.label}
                          </span>
                          <div className="w-2 h-2 bg-tre-green/40 rounded-full group-hover:bg-tre-green transition-colors duration-300" />
                        </div>
                        
                        {/* Hover effect line */}
                        <div className="absolute bottom-0 left-0 h-0.5 bg-tre-green transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                      </div>
                    </motion.a>
                  ))}
                </nav>

                {/* Footer */}
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.3 }}
                  className="absolute bottom-6 left-6 right-6 text-center"
                >
                  <div className="text-tre-green/80 text-sm font-mono mb-1">
                    Total Reality Engineering
                  </div>
                  <div className="text-tre-white/50 text-xs">
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

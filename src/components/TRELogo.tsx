'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface TRELogoProps {
  className?: string
  animated?: boolean
}

export const TRELogo: React.FC<TRELogoProps> = ({
  className,
  animated = true,
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  }

  const elementVariants = {
    hidden: {
      opacity: 0,
      filter: 'blur(8px) brightness(1.2)',
    },
    visible: {
      opacity: 1,
      filter: 'blur(0px) brightness(1)',
      transition: {
        duration: 0.8,
      },
    },
  }

  const greenBarVariants = {
    hidden: {
      opacity: 0,
      filter: 'blur(8px) brightness(1.2)',
    },
    visible: {
      opacity: 1,
      filter: 'blur(0px) brightness(1)',
      transition: {
        duration: 0.8,
        delay: 1.2, // Wait for other elements to complete: 0.1 + 0.2 + 0.2 + 0.2 + 0.8 = 1.4s total, so start at 1.2s
      },
    },
  }

  if (!animated) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
        className={className}
        suppressHydrationWarning
        preserveAspectRatio="xMidYMid meet"
      >
        {/* background; remove if you want transparent */}
        <rect width="100%" height="100%" fill="#000000" />

        {/* Original 512x512 artwork - no scaling needed */}
        <g>
          {/* Green rounded bar (rotated rounded-rect)
          Center at (262, 295) so we can rotate around its center */}
          <rect
            x="214"
            y="288"
            width="80"
            height="206"
            fill="#19C15E"
            transform="rotate(22, 262, 295)"
          />

          {/* White triangular outline */}
          <path
            d="M256 36 L72 476 L440 476 Z"
            fill="none"
            stroke="#F5F5F5"
            strokeWidth="30"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* White circle overlapping the bar */}
          <circle cx="256" cy="288" r="40" fill="#F5F5F5" />
        </g>
      </svg>
    )
  }

  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      suppressHydrationWarning
      preserveAspectRatio="xMidYMid meet"
    >
      {/* background; remove if you want transparent */}
      <motion.rect
        width="100%"
        height="100%"
        fill="#000000"
        variants={elementVariants}
      />

      {/* Original 512x512 artwork - no scaling needed */}
      <g>
        {/* Green rounded bar (rotated rounded-rect)
        Center at (262, 295) so we can rotate around its center */}
        <motion.rect
          x="214"
          y="288"
          width="80"
          height="206"
          fill="#19C15E"
          transform="rotate(22, 262, 295)"
          variants={greenBarVariants}
        />

        {/* White triangular outline */}
        <motion.path
          d="M256 36 L72 476 L440 476 Z"
          fill="none"
          stroke="#F5F5F5"
          strokeWidth="30"
          strokeLinejoin="round"
          strokeLinecap="round"
          variants={elementVariants}
        />

        {/* White circle overlapping the bar */}
        <motion.circle
          cx="256"
          cy="288"
          r="40"
          fill="#F5F5F5"
          variants={elementVariants}
        />
      </g>
    </motion.svg>
  )
}

export default TRELogo

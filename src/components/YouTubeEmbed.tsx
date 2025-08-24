'use client'

import { motion } from 'framer-motion'

import { extractYouTubeVideoId, generateYouTubeEmbedUrl } from '@/lib/youtube'

interface YouTubeEmbedProps {
  videoIdOrUrl: string
  title?: string
  className?: string
}

export function YouTubeEmbed({
  videoIdOrUrl,
  title,
  className = '',
}: YouTubeEmbedProps) {
  const videoId = extractYouTubeVideoId(videoIdOrUrl)

  if (!videoId) {
    return (
      <div
        data-testid="youtube-embed-error"
        className={`w-full p-8 text-center border border-tre-red/20 rounded-lg bg-tre-red/5 ${className}`}
      >
        <p className="text-tre-red text-sm font-mono">
          Invalid YouTube URL or video ID
        </p>
      </div>
    )
  }

  const embedUrl = generateYouTubeEmbedUrl(videoId)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`w-full ${className}`}
    >
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        <iframe
          data-testid={`youtube-embed-${videoId}`}
          src={embedUrl}
          title={title || `YouTube video: ${videoId}`}
          className="absolute top-0 left-0 w-full h-full rounded-lg border border-tre-green/20"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
        />
      </div>
      {title && (
        <h3
          data-testid={`youtube-title-${videoId}`}
          className="mt-3 text-lg font-semibold text-tre-white font-mono"
        >
          {title}
        </h3>
      )}
    </motion.div>
  )
}

export default YouTubeEmbed

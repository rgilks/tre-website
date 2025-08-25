'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

import { Project } from '@/types/project'

import { TRELogo } from './TRELogo'
import { YouTubeEmbed } from './YouTubeEmbed'

interface ProjectViewerProps {
  project: Project
}

export function ProjectViewer({ project }: ProjectViewerProps) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(false)
  }, [])

  const handleIframeLoad = () => {
    setIsLoading(false)
  }

  return (
    <div className="relative w-full h-screen">
      {/* Header with project info */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-tre-black/90 backdrop-blur-sm border-b border-tre-green/20 p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-tre-green font-mono mb-2">
            {project.name}
          </h1>
          <p className="text-tre-white/80 text-sm">{project.description}</p>
        </div>
      </div>

      {/* YouTube video if available */}
      {project.youtubeUrl && (
        <div className="absolute top-20 left-0 right-0 z-10 bg-tre-black/80 backdrop-blur-sm p-4">
          <div className="max-w-4xl mx-auto">
            <YouTubeEmbed
              videoIdOrUrl={project.youtubeUrl}
              title={`${project.name} Demo`}
              className="w-full"
            />
          </div>
        </div>
      )}

      {/* Main content area */}
      <div
        className={`w-full h-full ${project.youtubeUrl ? 'pt-48' : 'pt-20'}`}
      >
        <div className="relative w-full h-full">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-tre-black/50 z-10">
              <div className="text-tre-green font-mono">Loading project...</div>
            </div>
          )}
          <iframe
            data-testid={`project-iframe-${project.id}`}
            src={project.homepageUrl}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
            onLoad={handleIframeLoad}
            title={`${project.name} Demo`}
          />
        </div>
      </div>

      {/* Overlay TRE Logo - Bottom Right */}
      <div className="absolute bottom-6 right-6 z-30">
        <Link
          href="/"
          data-testid="tre-logo-overlay"
          className="block group"
          title="Back to Project Selector"
        >
          <div className="relative">
            <TRELogo
              animated={false}
              className="transition-transform duration-200 group-hover:scale-110 w-15 h-15"
            />
            {/* Green glow effect on hover */}
            <div className="absolute inset-0 bg-tre-green/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </div>
        </Link>
      </div>
    </div>
  )
}

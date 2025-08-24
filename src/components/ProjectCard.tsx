'use client'

import { motion } from 'framer-motion'
import { ProjectCardProps } from '@/types/project'
import { CalendarIcon } from '@heroicons/react/24/outline'
import { formatDate } from '@/lib/dateUtils'
import { 
  getVisibleTopics, 
  getProjectCardBorderClass, 
  getProjectButtonClass, 
  getProjectBackgroundStyle 
} from '@/lib/projectUtils'
import { getQuickFadeInAnimation, getHoverAnimation } from '@/lib/animationUtils'

export function ProjectCard({ project, isHighlighted = false }: ProjectCardProps) {
  const { visibleTopics, overflowCount, hasOverflow } = getVisibleTopics(project.topics)
  const borderClass = getProjectCardBorderClass(isHighlighted)
  const websiteButtonClass = getProjectButtonClass(!!project.homepageUrl)
  const githubButtonClass = getProjectButtonClass(!project.homepageUrl)
  const backgroundStyle = getProjectBackgroundStyle(project.screenshotUrl)

  return (
    <motion.div
      data-testid={`project-card-${project.id}`}
      {...getQuickFadeInAnimation()}
      {...getHoverAnimation()}
      className={`
        relative border rounded-lg p-6 cursor-pointer transition-all duration-200 overflow-hidden
        ${borderClass}
      `}
    >
      {/* Screenshot background */}
      <div
        className="absolute inset-0 -z-10"
        style={backgroundStyle}
      />

      {/* Content overlay */}
      <div className="relative z-10">
        <div className="mb-4">
          <h3
            data-testid={`project-title-${project.id}`}
            className="text-xl font-bold text-tre-green font-mono mb-2 line-clamp-2"
          >
            {project.name}
          </h3>
          <p
            data-testid={`project-description-${project.id}`}
            className="text-tre-white/80 text-sm line-clamp-3 leading-relaxed"
          >
            {project.description}
          </p>
        </div>

        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {visibleTopics.map(topic => (
              <span
                key={topic}
                data-testid={`project-topic-${project.id}-${topic}`}
                className="px-2 py-1 bg-tre-green/20 text-tre-green text-xs rounded font-mono"
              >
                {topic}
              </span>
            ))}
            {hasOverflow && (
              <span className="px-2 py-1 bg-tre-white/20 text-tre-white/60 text-xs rounded font-mono">
                +{overflowCount}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end text-sm text-tre-white/60 mb-4">
          <div className="flex items-center space-x-1">
            <CalendarIcon className="w-4 h-4" />
            <span
              data-testid={`project-updated-${project.id}`}
              suppressHydrationWarning
            >
              {formatDate(project.updatedAt)}
            </span>
          </div>
        </div>

        <div className="flex space-x-2">
          {project.homepageUrl && (
            <a
              data-testid={`project-website-${project.id}`}
              href={`/project/${project.name}`}
              className={`px-4 py-2 border border-tre-green text-tre-green font-bold font-mono rounded text-center hover:bg-tre-green hover:text-tre-black transition-all duration-200 ${websiteButtonClass}`}
              onClick={e => e.stopPropagation()}
            >
              Website
            </a>
          )}
          <a
            data-testid={`project-github-${project.id}`}
            href={project.htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`px-4 py-2 border border-tre-green text-tre-green font-bold font-mono rounded text-center hover:bg-tre-green hover:text-tre-black transition-all duration-200 ${githubButtonClass}`}
            onClick={e => e.stopPropagation()}
          >
            GitHub
          </a>
        </div>
      </div>
    </motion.div>
  )
}

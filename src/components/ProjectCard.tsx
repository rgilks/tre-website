'use client'

import { motion } from 'framer-motion'
import { ProjectCardProps } from '@/types/project'
import { CalendarIcon } from '@heroicons/react/24/outline'

export function ProjectCard({ project, isHighlighted }: ProjectCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ]
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
  }

  return (
    <motion.div
      data-testid={`project-card-${project.id}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      whileHover={{ y: -5 }}
      className={`
        relative border rounded-lg p-6 cursor-pointer transition-all duration-200 overflow-hidden
        ${
          isHighlighted
            ? 'border-tre-green shadow-lg shadow-tre-green/25'
            : 'border-tre-green/20 hover:border-tre-green/40'
        }
      `}
    >
      {/* Screenshot background */}
      {project.screenshotUrl ? (
        <>
          {/* Blurred background */}
          <div
            className="absolute inset-0 -z-10"
            style={{
              backgroundImage: `url(${project.screenshotUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(20px) brightness(0.3)',
              transform: 'scale(1.1)', // Prevent blur edges from showing
            }}
          />
        </>
      ) : (
        <div className="absolute inset-0 -z-10 bg-tre-black/50" />
      )}

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
            {project.topics.slice(0, 3).map(topic => (
              <span
                key={topic}
                data-testid={`project-topic-${project.id}-${topic}`}
                className="px-2 py-1 bg-tre-green/20 text-tre-green text-xs rounded font-mono"
              >
                {topic}
              </span>
            ))}
            {project.topics.length > 3 && (
              <span className="px-2 py-1 bg-tre-white/20 text-tre-white/60 text-xs rounded font-mono">
                +{project.topics.length - 3}
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
              className="flex-1 px-4 py-2 border border-tre-green text-tre-green font-bold font-mono rounded text-center hover:bg-tre-green hover:text-tre-black transition-all duration-200"
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
            className={`px-4 py-2 border border-tre-green text-tre-green font-bold font-mono rounded text-center hover:bg-tre-green hover:text-tre-black transition-all duration-200 ${
              project.homepageUrl ? 'flex-1' : 'w-full'
            }`}
            onClick={e => e.stopPropagation()}
          >
            GitHub
          </a>
        </div>
      </div>
    </motion.div>
  )
}

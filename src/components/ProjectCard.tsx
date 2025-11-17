'use client'

import { Project } from '@/types/project'

import { ProjectCardHeader } from './ProjectCardHeader'
import { ProjectCardTopics } from './ProjectCardTopics'
import { ProjectCardFooter } from './ProjectCardFooter'

interface ProjectCardProps {
  project: Project
  isHighlighted?: boolean
}

export function ProjectCard({
  project,
  isHighlighted = false,
}: ProjectCardProps) {
  const borderClass = isHighlighted
    ? 'border-tre-green shadow-lg shadow-tre-green/25'
    : 'border-tre-green/20 hover:border-tre-green/60 hover:shadow-xl hover:shadow-tre-green/40 hover:bg-tre-green/5'

  const backgroundStyle = project.screenshotUrl
    ? {
        backgroundImage: `url(${project.screenshotUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'blur(20px) brightness(0.3)',
        transform: 'scale(1.1)',
      }
    : {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      }

  return (
    <div
      data-testid="project-card"
      data-testid-specific={`project-card-${project.id}`}
      className={`relative border rounded-lg p-6 overflow-hidden transition-all duration-300 flex flex-col ${borderClass}`}
    >
      {/* Screenshot background */}
      <div className="absolute inset-0 -z-10" style={backgroundStyle} />

      {/* Content overlay */}
      <div className="relative z-10 flex h-full flex-col">
        <div className="space-y-4">
          <ProjectCardHeader
            name={project.name}
            description={project.description}
          />

          <ProjectCardTopics topics={project.topics} />
        </div>

        <div className="mt-auto pt-6">
          <ProjectCardFooter
            updatedAt={project.updatedAt}
            homepageUrl={project.homepageUrl}
            htmlUrl={project.htmlUrl}
          />
        </div>
      </div>
    </div>
  )
}

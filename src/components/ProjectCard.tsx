'use client'

import { motion } from 'framer-motion'
import { ProjectCardProps } from '@/types/project'
import { ProjectCardHeader } from './ProjectCardHeader'
import { ProjectCardTopics } from './ProjectCardTopics'
import { ProjectCardFooter } from './ProjectCardFooter'
import {
  getProjectCardBorderClass,
  getProjectBackgroundStyle,
} from '@/lib/projectUtils'
import {
  getQuickFadeInAnimation,
  getHoverAnimation,
} from '@/lib/animationUtils'

export function ProjectCard({
  project,
  isHighlighted = false,
}: ProjectCardProps) {
  const borderClass = getProjectCardBorderClass(isHighlighted)
  const backgroundStyle = getProjectBackgroundStyle(project.screenshotUrl)

  return (
    <motion.div
      data-testid={`project-card-${project.id}`}
      {...getQuickFadeInAnimation()}
      {...getHoverAnimation()}
      className={`relative border rounded-lg p-6 cursor-pointer transition-all duration-200 overflow-hidden ${borderClass}`}
    >
      {/* Screenshot background */}
      <div className="absolute inset-0 -z-10" style={backgroundStyle} />

      {/* Content overlay */}
      <div className="relative z-10">
        <ProjectCardHeader
          projectId={project.id}
          name={project.name}
          description={project.description}
        />

        <ProjectCardTopics projectId={project.id} topics={project.topics} />

        <ProjectCardFooter
          projectId={project.id}
          updatedAt={project.updatedAt}
          homepageUrl={project.homepageUrl}
          htmlUrl={project.htmlUrl}
        />
      </div>
    </motion.div>
  )
}

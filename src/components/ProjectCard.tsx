'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

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
  const router = useRouter()

  const borderClass = isHighlighted
    ? 'border-tre-green shadow-lg shadow-tre-green/25'
    : 'border-tre-green/20 hover:border-tre-green/40'

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

  const handleClick = () => {
    router.push(`/project/${project.name}`)
  }

  return (
    <motion.div
      data-testid="project-card"
      data-testid-specific={`project-card-${project.id}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      whileHover={{ y: -5 }}
      className={`relative border rounded-lg p-6 cursor-pointer transition-all duration-200 overflow-hidden ${borderClass}`}
      onClick={handleClick}
    >
      {/* Screenshot background */}
      <div className="absolute inset-0 -z-10" style={backgroundStyle} />

      {/* Content overlay */}
      <div className="relative z-10">
        <ProjectCardHeader
          name={project.name}
          description={project.description}
        />

        <ProjectCardTopics topics={project.topics} />

        <ProjectCardFooter
          updatedAt={project.updatedAt}
          homepageUrl={project.homepageUrl}
          htmlUrl={project.htmlUrl}
        />
      </div>
    </motion.div>
  )
}

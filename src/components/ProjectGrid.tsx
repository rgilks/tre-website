'use client'

import { useEffect } from 'react'

import { useProjectStore } from '@/store/projectStore'
import { Project } from '@/types/project'

import { ProjectCard } from './ProjectCard'
import { LoadingSkeleton } from './LoadingSkeleton'
import { ErrorMessage } from './ErrorMessage'
import { EmptyState } from './EmptyState'


interface ProjectGridProps {
  initialProjects: Project[]
}

export function ProjectGrid({ initialProjects }: ProjectGridProps) {
  const { projects, filteredProjects, isLoading, error, setProjects } =
    useProjectStore()

  useEffect(() => {
    if (projects.length === 0 && initialProjects.length > 0) {
      setProjects(initialProjects)
    }
  }, [projects.length, initialProjects, setProjects])

  if (isLoading) return <LoadingSkeleton />
  if (error)
    return (
      <ErrorMessage error={error} onRetry={() => window.location.reload()} />
    )
  if (filteredProjects.length === 0) return <EmptyState />

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredProjects.map((project, index) => (
        <ProjectCard
          key={project.id}
          project={project}
          isHighlighted={index === 0}
        />
      ))}
    </div>
  )
}

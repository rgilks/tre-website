'use client'

import { ProjectCard } from './ProjectCard'
import { useProjectStore } from '@/store/projectStore'
import { useEffect } from 'react'
import { fetchGitHubProjects } from '@/lib/github'

export function ProjectGrid() {
  const {
    projects,
    filteredProjects,
    isLoading,
    error,
    setProjects,
    setLoading,
    setError,
  } = useProjectStore()

  useEffect(() => {
    async function loadProjects() {
      if (projects.length === 0) {
        setLoading(true)
        try {
          const fetchedProjects = await fetchGitHubProjects()
          setProjects(fetchedProjects)
        } catch (err) {
          setError(
            err instanceof Error ? err.message : 'Failed to load projects'
          )
        } finally {
          setLoading(false)
        }
      }
    }

    loadProjects()
  }, [projects.length, setProjects, setLoading, setError])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-tre-black/50 border border-tre-green/20 rounded-lg p-6 animate-pulse"
          >
            <div className="h-4 bg-tre-green/20 rounded mb-4"></div>
            <div className="h-3 bg-tre-green/20 rounded mb-2"></div>
            <div className="h-3 bg-tre-green/20 rounded mb-4"></div>
            <div className="flex space-x-2">
              <div className="h-6 bg-tre-green/20 rounded px-2 py-1"></div>
              <div className="h-6 bg-tre-green/20 rounded px-2 py-1"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-tre-red text-xl mb-4">
          ⚠️ Error loading projects
        </div>
        <p className="text-tre-white/70 mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-tre-green text-tre-black font-bold font-mono rounded-lg hover:bg-tre-green-dark transition-colors duration-200"
        >
          Retry
        </button>
      </div>
    )
  }

  if (filteredProjects.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-tre-white/70 text-xl">No projects found</div>
        <p className="text-tre-white/50 mt-2">Check back later for updates</p>
      </div>
    )
  }

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

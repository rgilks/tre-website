import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { Project, ProjectFilters } from '@/types/project'

interface ProjectState {
  projects: Project[]
  filteredProjects: Project[]
  highlightedProject: Project | null
  isLoading: boolean
  error: string | null
  filters: ProjectFilters
}

interface ProjectActions {
  setProjects: (projects: Project[]) => void
  setHighlightedProject: (project: Project | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  updateFilters: (filters: Partial<ProjectFilters>) => void
  clearFilters: () => void
  reset: () => void
}

const initialState: ProjectState = {
  projects: [],
  filteredProjects: [],
  highlightedProject: null,
  isLoading: false,
  error: null,
  filters: {
    search: '',
    language: '',
    topic: '',
  },
}

// Simplified filtering logic
function applyFilters(projects: Project[], filters: ProjectFilters): Project[] {
  let filtered = projects

  // Apply search filter
  if (filters.search) {
    const searchLower = filters.search.toLowerCase()
    filtered = filtered.filter(project =>
      project.name.toLowerCase().includes(searchLower) ||
      project.description.toLowerCase().includes(searchLower) ||
      project.topics.some(topic => topic.toLowerCase().includes(searchLower))
    )
  }

  // Apply language filter
  if (filters.language) {
    filtered = filtered.filter(project => project.language === filters.language)
  }

  // Apply topic filter
  if (filters.topic) {
    filtered = filtered.filter(project => project.topics.includes(filters.topic!))
  }

  // Apply sorting
  if (filters.sortBy) {
    filtered.sort((a, b) => {
      const aValue = new Date(filters.sortBy === 'created' ? a.createdAt : a.updatedAt).getTime()
      const bValue = new Date(filters.sortBy === 'created' ? b.createdAt : b.updatedAt).getTime()
      return filters.sortOrder === 'asc' ? aValue - bValue : bValue - aValue
    })
  }

  return filtered
}

export const useProjectStore = create<ProjectState & ProjectActions>()(
  immer(set => ({
    ...initialState,

    setProjects: projects =>
      set(state => {
        state.projects = projects
        state.filteredProjects = projects
        // Auto-set highlighted project to most recently updated
        if (projects.length > 0) {
          const sorted = [...projects].sort(
            (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          )
          state.highlightedProject = sorted[0]
        }
      }),

    setHighlightedProject: project =>
      set(state => {
        state.highlightedProject = project
      }),

    setLoading: loading =>
      set(state => {
        state.isLoading = loading
      }),

    setError: error =>
      set(state => {
        state.error = error
      }),

    updateFilters: newFilters =>
      set(state => {
        state.filters = { ...state.filters, ...newFilters }
        state.filteredProjects = applyFilters(state.projects, state.filters)
      }),

    clearFilters: () =>
      set(state => {
        state.filters = { search: '', language: '', topic: '' }
        state.filteredProjects = state.projects
      }),

    reset: () => set(initialState),
  }))
)

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

export const useProjectStore = create<ProjectState & ProjectActions>()(
  immer((set) => ({
    ...initialState,

    setProjects: (projects) =>
      set((state) => {
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

    setHighlightedProject: (project) =>
      set((state) => {
        state.highlightedProject = project
      }),

    setLoading: (loading) =>
      set((state) => {
        state.isLoading = loading
      }),

    setError: (error) =>
      set((state) => {
        state.error = error
      }),

    updateFilters: (newFilters) =>
      set((state) => {
        state.filters = { ...state.filters, ...newFilters }
        
        // Apply filters to projects
        let filtered = state.projects

        if (state.filters.search) {
          const searchLower = state.filters.search.toLowerCase()
          filtered = filtered.filter(
            (project) =>
              project.name.toLowerCase().includes(searchLower) ||
              project.description.toLowerCase().includes(searchLower) ||
              project.topics.some((topic) => topic.toLowerCase().includes(searchLower))
          )
        }

        if (state.filters.language) {
          filtered = filtered.filter((project) => project.language === state.filters.language)
        }

        if (state.filters.topic) {
          filtered = filtered.filter((project) =>
            project.topics.includes(state.filters.topic!)
          )
        }

        // Apply sorting
        if (state.filters.sortBy) {
          filtered.sort((a, b) => {
            let aValue: string | number
            let bValue: string | number

            switch (state.filters.sortBy) {
              case 'created':
                aValue = new Date(a.createdAt).getTime()
                bValue = new Date(b.createdAt).getTime()
                break
              default: // 'updated'
                aValue = new Date(a.updatedAt).getTime()
                bValue = new Date(b.updatedAt).getTime()
                break
            }

            if (state.filters.sortOrder === 'asc') {
              return aValue > bValue ? 1 : -1
            }
            return aValue < bValue ? 1 : -1
          })
        }

        state.filteredProjects = filtered
      }),

    clearFilters: () =>
      set((state) => {
        state.filters = {
          search: '',
          language: '',
          topic: '',
        }
        state.filteredProjects = state.projects
      }),

    reset: () => set(initialState),
  }))
)

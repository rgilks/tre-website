import { describe, it, expect, beforeEach } from 'vitest'

import { Project } from '@/types/project'

import { useProjectStore } from './projectStore'

describe('Project Store', () => {
  beforeEach(() => {
    useProjectStore.getState().reset()
  })

  it('should initialize with default state', () => {
    const state = useProjectStore.getState()

    expect(state.projects).toEqual([])
    expect(state.filteredProjects).toEqual([])
    expect(state.highlightedProject).toBeNull()
    expect(state.isLoading).toBe(false)
    expect(state.error).toBeNull()
    expect(state.filters).toEqual({
      search: '',
      language: '',
      topic: '',
    })
  })

  it('should set projects and auto-highlight most recent', () => {
    const mockProjects: Project[] = [
      {
        id: '1',
        name: 'Project A',
        fullName: 'user/project-a',
        description: 'Description A',
        htmlUrl: 'https://github.com/user/project-a',
        topics: ['react', 'typescript'],
        updatedAt: '2024-01-01T00:00:00Z',
        createdAt: '2024-01-01T00:00:00Z',
        isCurrentlyWorking: false,
      },
      {
        id: '2',
        name: 'Project B',
        fullName: 'user/project-b',
        description: 'Description B',
        htmlUrl: 'https://github.com/user/project-b',
        topics: ['node', 'javascript'],
        updatedAt: '2024-01-02T00:00:00Z',
        createdAt: '2024-01-01T00:00:00Z',
        isCurrentlyWorking: false,
      },
    ]

    useProjectStore.getState().setProjects(mockProjects)

    const state = useProjectStore.getState()
    expect(state.projects).toEqual(mockProjects)
    expect(state.filteredProjects).toEqual(mockProjects)
    expect(state.highlightedProject).toEqual(mockProjects[1]) // Most recent
  })

  it('should update loading state', () => {
    useProjectStore.getState().setLoading(true)
    expect(useProjectStore.getState().isLoading).toBe(true)

    useProjectStore.getState().setLoading(false)
    expect(useProjectStore.getState().isLoading).toBe(false)
  })

  it('should update error state', () => {
    const errorMessage = 'Something went wrong'
    useProjectStore.getState().setError(errorMessage)
    expect(useProjectStore.getState().error).toBe(errorMessage)

    useProjectStore.getState().setError(null)
    expect(useProjectStore.getState().error).toBeNull()
  })

  it('should filter projects by search term', () => {
    const mockProjects: Project[] = [
      {
        id: '1',
        name: 'React App',
        fullName: 'user/react-app',
        description: 'A React application',
        htmlUrl: 'https://github.com/user/react-app',
        topics: ['react', 'typescript'],
        updatedAt: '2024-01-01T00:00:00Z',
        createdAt: '2024-01-01T00:00:00Z',
        isCurrentlyWorking: false,
      },
      {
        id: '2',
        name: 'Node API',
        fullName: 'user/node-api',
        description: 'A Node.js API',
        htmlUrl: 'https://github.com/user/node-api',
        topics: ['node', 'javascript'],
        updatedAt: '2024-01-02T00:00:00Z',
        createdAt: '2024-01-01T00:00:00Z',
        isCurrentlyWorking: false,
      },
    ]

    useProjectStore.getState().setProjects(mockProjects)
    useProjectStore.getState().updateFilters({ search: 'React' })

    const state = useProjectStore.getState()
    expect(state.filteredProjects).toHaveLength(1)
    expect(state.filteredProjects[0].name).toBe('React App')
  })

  it('should filter projects by language', () => {
    const mockProjects: Project[] = [
      {
        id: '1',
        name: 'React App',
        fullName: 'user/react-app',
        description: 'A React application',
        htmlUrl: 'https://github.com/user/react-app',
        topics: ['react', 'typescript'],
        language: 'TypeScript',
        updatedAt: '2024-01-01T00:00:00Z',
        createdAt: '2024-01-01T00:00:00Z',
        isCurrentlyWorking: false,
      },
      {
        id: '2',
        name: 'Node API',
        fullName: 'user/node-api',
        description: 'A Node.js API',
        htmlUrl: 'https://github.com/user/node-api',
        topics: ['node', 'javascript'],
        language: 'JavaScript',
        updatedAt: '2024-01-02T00:00:00Z',
        createdAt: '2024-01-01T00:00:00Z',
        isCurrentlyWorking: false,
      },
    ]

    useProjectStore.getState().setProjects(mockProjects)
    useProjectStore.getState().updateFilters({ language: 'TypeScript' })

    const state = useProjectStore.getState()
    expect(state.filteredProjects).toHaveLength(1)
    expect(state.filteredProjects[0].language).toBe('TypeScript')
  })

  it('should filter projects by topic', () => {
    const mockProjects: Project[] = [
      {
        id: '1',
        name: 'React App',
        fullName: 'user/react-app',
        description: 'A React application',
        htmlUrl: 'https://github.com/user/react-app',
        topics: ['react', 'typescript'],
        language: 'TypeScript',
        updatedAt: '2024-01-01T00:00:00Z',
        createdAt: '2024-01-01T00:00:00Z',
        isCurrentlyWorking: false,
      },
      {
        id: '2',
        name: 'Node API',
        fullName: 'user/node-api',
        description: 'A Node.js API',
        htmlUrl: 'https://github.com/user/node-api',
        topics: ['node', 'javascript'],
        language: 'JavaScript',
        updatedAt: '2024-01-02T00:00:00Z',
        createdAt: '2024-01-01T00:00:00Z',
        isCurrentlyWorking: false,
      },
    ]

    useProjectStore.getState().setProjects(mockProjects)
    useProjectStore.getState().updateFilters({ topic: 'react' })

    const state = useProjectStore.getState()
    expect(state.filteredProjects).toHaveLength(1)
    expect(state.filteredProjects[0].topics).toContain('react')
  })

  it('should sort projects by created date', () => {
    const mockProjects: Project[] = [
      {
        id: '1',
        name: 'Project A',
        fullName: 'user/project-a',
        description: 'Description A',
        htmlUrl: 'https://github.com/user/project-a',
        topics: ['react'],
        updatedAt: '2024-01-02T00:00:00Z',
        createdAt: '2024-01-02T00:00:00Z',
        isCurrentlyWorking: false,
      },
      {
        id: '2',
        name: 'Project B',
        fullName: 'user/project-b',
        description: 'Description B',
        htmlUrl: 'https://github.com/user/project-b',
        topics: ['node'],
        updatedAt: '2024-01-01T00:00:00Z',
        createdAt: '2024-01-01T00:00:00Z',
        isCurrentlyWorking: false,
      },
    ]

    useProjectStore.getState().setProjects(mockProjects)
    useProjectStore.getState().updateFilters({
      sortBy: 'created',
      sortOrder: 'asc',
    })

    const state = useProjectStore.getState()
    expect(state.filteredProjects[0].id).toBe('2')
    expect(state.filteredProjects[1].id).toBe('1')
  })

  it('should sort projects by updated date descending', () => {
    const mockProjects: Project[] = [
      {
        id: '1',
        name: 'Project A',
        fullName: 'user/project-a',
        description: 'Description A',
        htmlUrl: 'https://github.com/user/project-a',
        topics: ['react'],
        updatedAt: '2024-01-01T00:00:00Z',
        createdAt: '2024-01-01T00:00:00Z',
        isCurrentlyWorking: false,
      },
      {
        id: '2',
        name: 'Project B',
        fullName: 'user/project-b',
        description: 'Description B',
        htmlUrl: 'https://github.com/user/project-b',
        topics: ['node'],
        updatedAt: '2024-01-02T00:00:00Z',
        createdAt: '2024-01-01T00:00:00Z',
        isCurrentlyWorking: false,
      },
    ]

    useProjectStore.getState().setProjects(mockProjects)
    useProjectStore.getState().updateFilters({
      sortBy: 'updated',
      sortOrder: 'desc',
    })

    const state = useProjectStore.getState()
    expect(state.filteredProjects[0].id).toBe('2')
    expect(state.filteredProjects[1].id).toBe('1')
  })

  it('should clear filters', () => {
    const mockProjects: Project[] = [
      {
        id: '1',
        name: 'React App',
        fullName: 'user/react-app',
        description: 'A React application',
        htmlUrl: 'https://github.com/user/react-app',
        topics: ['react', 'typescript'],
        updatedAt: '2024-01-01T00:00:00Z',
        createdAt: '2024-01-01T00:00:00Z',
        isCurrentlyWorking: false,
      },
    ]

    useProjectStore.getState().setProjects(mockProjects)
    useProjectStore.getState().updateFilters({ search: 'React' })
    useProjectStore.getState().clearFilters()

    const state = useProjectStore.getState()
    expect(state.filters).toEqual({
      search: '',
      language: '',
      topic: '',
    })
    expect(state.filteredProjects).toEqual(mockProjects)
  })

  it('should reset to initial state', () => {
    const store = useProjectStore.getState()

    store.setProjects([
      {
        id: '1',
        name: 'Test Project',
        fullName: 'user/test-project',
        description: 'A test project',
        htmlUrl: 'https://github.com/user/test-project',
        topics: ['test'],
        updatedAt: '2024-01-01T00:00:00Z',
        createdAt: '2024-01-01T00:00:00Z',
        isCurrentlyWorking: false,
      },
    ])
    store.setLoading(true)
    store.setError('Test error')

    store.reset()

    expect(store.projects).toEqual([])
    expect(store.filteredProjects).toEqual([])
    expect(store.highlightedProject).toBeNull()
    expect(store.isLoading).toBe(false)
    expect(store.error).toBeNull()
    expect(store.filters).toEqual({
      search: '',
      language: '',
      topic: '',
    })
  })

  it('should set highlighted project', () => {
    const mockProject: Project = {
      id: '1',
      name: 'Test Project',
      fullName: 'user/test-project',
      description: 'A test project',
      htmlUrl: 'https://github.com/user/test-project',
      topics: ['test'],
      updatedAt: '2024-01-01T00:00:00Z',
      createdAt: '2024-01-01T00:00:00Z',
      isCurrentlyWorking: false,
    }

    useProjectStore.getState().setHighlightedProject(mockProject)

    expect(useProjectStore.getState().highlightedProject).toEqual(mockProject)

    useProjectStore.getState().setHighlightedProject(null)
    expect(useProjectStore.getState().highlightedProject).toBeNull()
  })
})

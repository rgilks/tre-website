import { describe, it, expect, beforeEach } from 'vitest'
import { useProjectStore } from './projectStore'
import { Project } from '@/types/project'

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
        stargazersCount: 10,
        forksCount: 5,
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
        stargazersCount: 20,
        forksCount: 10,
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
        stargazersCount: 10,
        forksCount: 5,
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
        stargazersCount: 20,
        forksCount: 10,
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
        stargazersCount: 10,
        forksCount: 5,
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
        stargazersCount: 20,
        forksCount: 10,
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

  it('should clear filters', () => {
    const mockProjects: Project[] = [
      {
        id: '1',
        name: 'React App',
        fullName: 'user/react-app',
        description: 'A React application',
        htmlUrl: 'https://github.com/user/react-app',
        topics: ['react', 'typescript'],
        stargazersCount: 10,
        forksCount: 5,
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
    const mockProjects: Project[] = [
      {
        id: '1',
        name: 'React App',
        fullName: 'user/react-app',
        description: 'A React application',
        htmlUrl: 'https://github.com/user/react-app',
        topics: ['react', 'typescript'],
        stargazersCount: 10,
        forksCount: 5,
        updatedAt: '2024-01-01T00:00:00Z',
        createdAt: '2024-01-01T00:00:00Z',
        isCurrentlyWorking: false,
      },
    ]

    useProjectStore.getState().setProjects(mockProjects)
    useProjectStore.getState().setLoading(true)
    useProjectStore.getState().setError('Error')
    useProjectStore.getState().updateFilters({ search: 'test' })
    
    useProjectStore.getState().reset()
    
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
})

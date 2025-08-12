export interface Project {
  id: string
  name: string
  fullName: string
  description: string
  homepageUrl?: string
  htmlUrl: string
  topics: string[]
  language?: string
  stargazersCount: number
  forksCount: number
  updatedAt: string
  createdAt: string
  screenshotUrl?: string
  isCurrentlyWorking: boolean
}

export interface ProjectCardProps {
  project: Project
  isHighlighted?: boolean
}

export interface ProjectGridProps {
  projects: Project[]
  highlightedProject?: Project
}

export interface ProjectDetailProps {
  project: Project
}

export interface GitHubApiResponse {
  id: number
  name: string
  full_name: string
  description: string | null
  homepage: string | null
  html_url: string
  topics: string[]
  language: string | null
  stargazers_count: number
  forks_count: number
  updated_at: string
  created_at: string
  owner: {
    login: string
    avatar_url: string
  }
}

export interface ProjectFilters {
  search?: string
  language?: string
  topic?: string
  sortBy?: 'updated' | 'stars' | 'forks' | 'created'
  sortOrder?: 'asc' | 'desc'
}

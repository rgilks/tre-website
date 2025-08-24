export interface Project {
  id: string
  name: string
  fullName: string
  description: string
  homepageUrl?: string
  youtubeUrl?: string
  htmlUrl: string
  topics: string[]
  language?: string
  updatedAt: string
  createdAt: string
  screenshotUrl?: string
  isCurrentlyWorking: boolean
}

// GitHub API response type
export interface GitHubApiResponse {
  id: number
  name: string
  full_name: string
  description: string | null
  homepage: string | null
  html_url: string
  topics: string[]
  language: string | null
  updated_at: string
  created_at: string
  private: boolean
  stargazers_count: number
  forks_count: number
}

export interface ProjectFilters {
  search: string
  language: string
  topic: string
  sortBy?: 'created' | 'updated'
  sortOrder?: 'asc' | 'desc'
}

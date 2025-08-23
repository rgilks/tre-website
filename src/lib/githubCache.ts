import { Project } from '@/types/project'

const CACHE_TTL = 6 * 60 * 60 // 6 hours in seconds
const CACHE_KEY = 'github_projects'
const CACHE_TIMESTAMP_KEY = 'github_projects_timestamp'

export interface CachedGitHubData {
  projects: Project[]
  timestamp: number
}

export class GitHubCacheService {
  private kv: KVNamespace

  constructor(kv: KVNamespace) {
    this.kv = kv
  }

  async getCachedProjects(): Promise<Project[] | null> {
    try {
      const [projectsData, timestampData] = await Promise.all([
        this.kv.get(CACHE_KEY),
        this.kv.get(CACHE_TIMESTAMP_KEY),
      ])

      if (!projectsData || !timestampData) {
        return null
      }

      const timestamp = parseInt(timestampData, 10)
      const now = Math.floor(Date.now() / 1000)

      // Check if cache is still valid
      if (now - timestamp > CACHE_TTL) {
        return null
      }

      const projects: Project[] = JSON.parse(projectsData)
      return projects
    } catch (error) {
      console.error('Error retrieving cached projects:', error)
      return null
    }
  }

  async setCachedProjects(projects: Project[]): Promise<void> {
    try {
      const timestamp = Math.floor(Date.now() / 1000)

      await Promise.all([
        this.kv.put(CACHE_KEY, JSON.stringify(projects)),
        this.kv.put(CACHE_TIMESTAMP_KEY, timestamp.toString()),
      ])
    } catch (error) {
      console.error('Error caching projects:', error)
    }
  }

  async clearCache(): Promise<void> {
    try {
      await Promise.all([
        this.kv.delete(CACHE_KEY),
        this.kv.delete(CACHE_TIMESTAMP_KEY),
      ])
    } catch (error) {
      console.error('Error clearing cache:', error)
    }
  }

  async isCacheValid(): Promise<boolean> {
    try {
      const timestampData = await this.kv.get(CACHE_TIMESTAMP_KEY)
      if (!timestampData) {
        return false
      }

      const timestamp = parseInt(timestampData, 10)
      const now = Math.floor(Date.now() / 1000)
      return now - timestamp <= CACHE_TTL
    } catch (error) {
      console.error('Error checking cache validity:', error)
      return false
    }
  }
}

// Factory function to create cache service
export function createGitHubCacheService(kv: KVNamespace): GitHubCacheService {
  return new GitHubCacheService(kv)
}

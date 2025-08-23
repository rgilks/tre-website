import fs from 'fs/promises'
import path from 'path'
import { Project } from '@/types/project'

const CACHE_DIR = '.cache'
const CACHE_FILE = 'github-projects.json'
const CACHE_TIMESTAMP_FILE = 'github-projects-timestamp.txt'
const CACHE_TTL = 6 * 60 * 60 // 6 hours in seconds

export interface LocalCachedData {
  projects: Project[]
  timestamp: number
}

export class LocalCacheService {
  private cacheDir: string
  private cacheFilePath: string
  private timestampFilePath: string

  constructor() {
    this.cacheDir = path.join(process.cwd(), CACHE_DIR)
    this.cacheFilePath = path.join(this.cacheDir, CACHE_FILE)
    this.timestampFilePath = path.join(this.cacheDir, CACHE_TIMESTAMP_FILE)
  }

  private async ensureCacheDir(): Promise<void> {
    try {
      await fs.access(this.cacheDir)
    } catch {
      await fs.mkdir(this.cacheDir, { recursive: true })
    }
  }

  async getCachedProjects(): Promise<Project[] | null> {
    try {
      await this.ensureCacheDir()

      // Check if both files exist
      const [projectsExist, timestampExist] = await Promise.all([
        this.fileExists(this.cacheFilePath),
        this.fileExists(this.timestampFilePath),
      ])

      if (!projectsExist || !timestampExist) {
        return null
      }

      // Read timestamp and check if cache is still valid
      const timestampData = await fs.readFile(this.timestampFilePath, 'utf-8')
      const timestamp = parseInt(timestampData.trim(), 10)
      const now = Math.floor(Date.now() / 1000)

      if (now - timestamp > CACHE_TTL) {
        return null
      }

      // Read and parse projects data
      const projectsData = await fs.readFile(this.cacheFilePath, 'utf-8')
      const projects: Project[] = JSON.parse(projectsData)

      return projects
    } catch (error) {
      console.error(
        'Error retrieving cached projects from local storage:',
        error
      )
      return null
    }
  }

  async setCachedProjects(projects: Project[]): Promise<void> {
    try {
      await this.ensureCacheDir()

      const timestamp = Math.floor(Date.now() / 1000)

      await Promise.all([
        fs.writeFile(this.cacheFilePath, JSON.stringify(projects, null, 2)),
        fs.writeFile(this.timestampFilePath, timestamp.toString()),
      ])
    } catch (error) {
      console.error('Error caching projects to local storage:', error)
    }
  }

  async clearCache(): Promise<void> {
    try {
      await Promise.all([
        this.deleteFile(this.cacheFilePath),
        this.deleteFile(this.timestampFilePath),
      ])
    } catch (error) {
      console.error('Error clearing local cache:', error)
    }
  }

  async isCacheValid(): Promise<boolean> {
    try {
      const timestampExist = await this.fileExists(this.timestampFilePath)
      if (!timestampExist) {
        return false
      }

      const timestampData = await fs.readFile(this.timestampFilePath, 'utf-8')
      const timestamp = parseInt(timestampData.trim(), 10)
      const now = Math.floor(Date.now() / 1000)

      return now - timestamp <= CACHE_TTL
    } catch (error) {
      console.error('Error checking local cache validity:', error)
      return false
    }
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath)
      return true
    } catch {
      return false
    }
  }

  private async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath)
    } catch {
      // File doesn't exist, ignore
    }
  }
}

// Factory function to create local cache service
export function createLocalCacheService(): LocalCacheService {
  return new LocalCacheService()
}

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { fetchGitHubProjects } from '@/lib/github'
import { ProjectViewer } from '@/components/ProjectViewer'

interface ProjectPageProps {
  params: Promise<{ name: string }>
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { name } = await params
  
  try {
    const projects = await fetchGitHubProjects()
    const project = projects.find(p => p.name === name)
    
    if (!project) {
      notFound()
    }

    return (
      <div className="min-h-screen bg-tre-black">
        <ProjectViewer 
          project={project} 
        />
      </div>
    )
  } catch (error) {
    console.error('Error loading project:', error)
    
    // Return a fallback page when GitHub API fails
    return (
      <div className="min-h-screen bg-tre-black flex items-center justify-center">
        <div className="text-center p-8 max-w-2xl">
          <h1 className="text-3xl font-bold text-tre-green font-mono mb-4">
            Project: {name}
          </h1>
          <p className="text-tre-white/80 mb-6">
            Unable to load project details at the moment. Please try again later or check the project directly on GitHub.
          </p>
          <div className="flex space-x-4 justify-center">
              <a
                href={`https://github.com/rgilks/${name}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-tre-green text-tre-black font-bold font-mono rounded hover:bg-tre-green-dark transition-colors duration-200"
              >
                View on GitHub
              </a>
            <Link
              href="/"
              className="px-6 py-3 border border-tre-green text-tre-green font-bold font-mono rounded hover:bg-tre-green hover:text-tre-black transition-all duration-200"
            >
              Back to Projects
            </Link>
          </div>
        </div>
      </div>
    )
  }
}

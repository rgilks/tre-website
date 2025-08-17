import { notFound } from 'next/navigation'
import { fetchGitHubProjects } from '@/lib/github'
import { checkIframeEmbeddable } from '@/lib/github'
import { ProjectViewer } from '@/components/ProjectViewer'

interface ProjectPageProps {
  params: { name: string }
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const projects = await fetchGitHubProjects()
  const project = projects.find(p => p.name === params.name)
  
  if (!project) {
    notFound()
  }

  // Check if the project homepage can be embedded in an iframe
  const isEmbeddable = project.homepageUrl 
    ? await checkIframeEmbeddable(project.homepageUrl)
    : false

  return (
    <div className="min-h-screen bg-tre-black">
      <ProjectViewer 
        project={project} 
        isEmbeddable={isEmbeddable}
      />
    </div>
  )
}

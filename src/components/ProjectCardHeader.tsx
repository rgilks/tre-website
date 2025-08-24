interface ProjectCardHeaderProps {
  projectId: string
  name: string
  description: string
}

export function ProjectCardHeader({ projectId, name, description }: ProjectCardHeaderProps) {
  return (
    <div className="mb-4">
      <h3
        data-testid={`project-title-${projectId}`}
        className="text-xl font-bold text-tre-green font-mono mb-2 line-clamp-2"
      >
        {name}
      </h3>
      <p
        data-testid={`project-description-${projectId}`}
        className="text-tre-white/80 text-sm line-clamp-3 leading-relaxed"
      >
        {description}
      </p>
    </div>
  )
}

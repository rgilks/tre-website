interface ProjectCardHeaderProps {
  name: string
  description: string
}

export function ProjectCardHeader({
  name,
  description,
}: ProjectCardHeaderProps) {
  return (
    <div className="mb-4">
      <h3
        data-testid="project-title"
        className="text-xl font-bold text-tre-green font-mono mb-2 line-clamp-2"
      >
        {name}
      </h3>
      <p
        data-testid="project-description"
        className="text-tre-white/80 text-sm leading-relaxed"
      >
        {description}
      </p>
    </div>
  )
}

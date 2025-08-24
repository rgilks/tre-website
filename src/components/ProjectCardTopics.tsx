import { getVisibleTopics } from '@/lib/projectUtils'

interface ProjectCardTopicsProps {
  projectId: string
  topics: string[]
}

export function ProjectCardTopics({ projectId, topics }: ProjectCardTopicsProps) {
  const { visibleTopics, overflowCount, hasOverflow } = getVisibleTopics(topics)

  return (
    <div className="mb-4">
      <div className="flex flex-wrap gap-2">
        {visibleTopics.map(topic => (
          <span
            key={topic}
            data-testid={`project-topic-${projectId}-${topic}`}
            className="px-2 py-1 bg-tre-green/20 text-tre-green text-xs rounded font-mono"
          >
            {topic}
          </span>
        ))}
        {hasOverflow && (
          <span className="px-2 py-1 bg-tre-white/20 text-tre-white/60 text-xs rounded font-mono">
            +{overflowCount}
          </span>
        )}
      </div>
    </div>
  )
}

interface EmptyStateProps {
  title?: string
  message?: string
  className?: string
}

export function EmptyState({
  title = 'No projects found',
  message = 'Check back later for updates',
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="text-tre-white/70 text-xl">{title}</div>
      <p className="text-tre-white/50 mt-2">{message}</p>
    </div>
  )
}

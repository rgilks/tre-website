interface LoadingSkeletonProps {
  count?: number
  className?: string
}

export function LoadingSkeleton({ count = 6, className = '' }: LoadingSkeletonProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="bg-tre-black/50 border border-tre-green/20 rounded-lg p-6 animate-pulse"
        >
          <div className="h-4 bg-tre-green/20 rounded mb-4"></div>
          <div className="h-3 bg-tre-green/20 rounded mb-2"></div>
          <div className="h-3 bg-tre-green/20 rounded mb-4"></div>
          <div className="flex space-x-2">
            <div className="h-6 bg-tre-green/20 rounded px-2 py-1"></div>
            <div className="h-6 bg-tre-green/20 rounded px-2 py-1"></div>
          </div>
        </div>
      ))}
    </div>
  )
}

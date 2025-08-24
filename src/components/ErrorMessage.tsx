interface ErrorMessageProps {
  error: string
  onRetry?: () => void
  className?: string
}

export function ErrorMessage({
  error,
  onRetry,
  className = '',
}: ErrorMessageProps) {
  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="text-tre-red text-xl mb-4">⚠️ Error loading projects</div>
      <p className="text-tre-white/70 mb-6">{error}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-6 py-3 bg-tre-green text-tre-black font-bold font-mono rounded-lg hover:bg-tre-green-dark transition-colors duration-200"
        >
          Retry
        </button>
      )}
    </div>
  )
}

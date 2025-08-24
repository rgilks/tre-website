import { CalendarIcon } from '@heroicons/react/24/outline'
import { formatDate } from '@/lib/dateUtils'
import { getProjectButtonClass } from '@/lib/projectUtils'

interface ProjectCardFooterProps {
  projectId: string
  updatedAt: string
  homepageUrl?: string
  htmlUrl: string
}

export function ProjectCardFooter({ 
  projectId, 
  updatedAt, 
  homepageUrl, 
  htmlUrl 
}: ProjectCardFooterProps) {
  return (
    <>
      <div className="flex items-center justify-end text-sm text-tre-white/60 mb-4">
        <div className="flex items-center space-x-1">
          <CalendarIcon className="w-4 h-4" />
          <span
            data-testid={`project-updated-${projectId}`}
            suppressHydrationWarning
          >
            {formatDate(updatedAt)}
          </span>
        </div>
      </div>

      <div className="flex space-x-2">
        {homepageUrl && (
          <a
            data-testid={`project-website-${projectId}`}
            href={`/project/${projectId}`}
            className={`px-4 py-2 border border-tre-green text-tre-green font-bold font-mono rounded text-center hover:bg-tre-green hover:text-tre-black transition-all duration-200 ${getProjectButtonClass(true)}`}
            onClick={e => e.stopPropagation()}
          >
            Website
          </a>
        )}
        <a
          data-testid={`project-github-${projectId}`}
          href={htmlUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`px-4 py-2 border border-tre-green text-tre-green font-bold font-mono rounded text-center hover:bg-tre-green hover:text-tre-black transition-all duration-200 ${getProjectButtonClass(!!homepageUrl)}`}
          onClick={e => e.stopPropagation()}
        >
          GitHub
        </a>
      </div>
    </>
  )
}

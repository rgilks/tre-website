import { CalendarIcon } from '@heroicons/react/24/outline'

import { formatDate } from '@/lib/dateUtils'

interface ProjectCardFooterProps {
  updatedAt: string
  homepageUrl?: string
  htmlUrl: string
}

export function ProjectCardFooter({
  updatedAt,
  homepageUrl,
  htmlUrl,
}: ProjectCardFooterProps) {
  return (
    <>
      <div className="flex items-center justify-end text-sm text-tre-white/60 mb-4">
        <div className="flex items-center space-x-1">
          <CalendarIcon className="w-4 h-4" />
          <span data-testid="project-updated" suppressHydrationWarning>
            {formatDate(updatedAt)}
          </span>
        </div>
      </div>

      <div className="flex space-x-2">
        {homepageUrl && (
          <a
            data-testid="project-website"
            href={homepageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="relative px-4 py-2 border border-tre-green text-tre-green font-bold font-mono rounded text-center overflow-hidden group transition-all duration-300 hover:scale-105 active:scale-95 flex-1"
            onClick={e => e.stopPropagation()}
          >
            <div className="absolute inset-0 bg-tre-green transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-left" />
            <span className="relative z-10 group-hover:text-tre-black transition-colors duration-300">
              Website
            </span>
          </a>
        )}
        <a
          data-testid="project-github"
          href={htmlUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`relative px-4 py-2 border border-tre-green text-tre-green font-bold font-mono rounded text-center overflow-hidden group transition-all duration-300 hover:scale-105 active:scale-95 ${homepageUrl ? 'flex-1' : 'w-full'}`}
          onClick={e => e.stopPropagation()}
        >
          <div className="absolute inset-0 bg-tre-green transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-left" />
          <span className="relative z-10 group-hover:text-tre-black transition-colors duration-300">
            GitHub
          </span>
        </a>
      </div>
    </>
  )
}

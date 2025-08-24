/**
 * Utility functions for project operations
 */

/**
 * Limits the number of topics displayed for a project
 * @param topics - Array of project topics
 * @param maxVisible - Maximum number of topics to show
 * @returns Object with visible topics and overflow count
 */
export function getVisibleTopics(topics: string[], maxVisible: number = 3) {
  const visibleTopics = topics.slice(0, maxVisible)
  const overflowCount = topics.length > maxVisible ? topics.length - maxVisible : 0
  
  return {
    visibleTopics,
    overflowCount,
    hasOverflow: overflowCount > 0
  }
}

/**
 * Generates a CSS class for project card borders based on highlight status
 * @param isHighlighted - Whether the project is highlighted
 * @returns CSS class string
 */
export function getProjectCardBorderClass(isHighlighted: boolean): string {
  return isHighlighted
    ? 'border-tre-green shadow-lg shadow-tre-green/25'
    : 'border-tre-green/20 hover:border-tre-green/40'
}

/**
 * Generates a CSS class for project card buttons based on homepage availability
 * @param hasHomepage - Whether the project has a homepage
 * @returns CSS class string
 */
export function getProjectButtonClass(hasHomepage: boolean): string {
  return hasHomepage ? 'flex-1' : 'w-full'
}

/**
 * Creates a background style object for project card screenshots
 * @param screenshotUrl - URL of the project screenshot
 * @returns CSS style object
 */
export function getProjectBackgroundStyle(screenshotUrl?: string | null) {
  if (!screenshotUrl || screenshotUrl.trim() === '') {
    return {
      backgroundImage: 'none',
      backgroundColor: 'rgba(0, 0, 0, 0.5)'
    }
  }
  
  return {
    backgroundImage: `url(${screenshotUrl})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    filter: 'blur(20px) brightness(0.3)',
    transform: 'scale(1.1)'
  }
}

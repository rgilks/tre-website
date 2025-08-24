/**
 * Utility functions for project operations
 */

/**
 * Limits the number of topics displayed for a project
 */
export function getVisibleTopics(topics: string[], maxVisible: number = 3) {
  if (maxVisible <= 0) {
    return {
      visibleTopics: [],
      overflowCount: topics.length,
      hasOverflow: topics.length > 0,
    }
  }

  const visibleTopics = topics.slice(0, maxVisible)
  const overflowCount =
    topics.length > maxVisible ? topics.length - maxVisible : 0

  return {
    visibleTopics,
    overflowCount,
    hasOverflow: overflowCount > 0,
  }
}

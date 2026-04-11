/**
 * Normalise a task string for comparison:
 * lowercase, trim, remove punctuation, collapse spaces.
 */
function normalise(str) {
  return (str || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
}

function words(str) {
  return normalise(str).split(' ').filter(Boolean)
}

/**
 * Jaccard word-overlap score between two task strings.
 * Returns 0–1, where 1 = identical.
 */
function overlapScore(a, b) {
  const wa = new Set(words(a))
  const wb = new Set(words(b))
  if (wa.size === 0 || wb.size === 0) return 0
  const intersection = [...wa].filter((w) => wb.has(w))
  const union = new Set([...wa, ...wb])
  return intersection.length / union.size
}

/**
 * Returns true if two task strings are similar enough to be considered duplicates.
 * Default threshold: 0.7 (70 % word overlap, Jaccard).
 */
export function areSimilar(a, b, threshold = 0.7) {
  return overlapScore(a, b) >= threshold
}

/**
 * Merge priorityTasks (AI-generated, preferred — may have subtitles) and
 * otherTasks (chip-selected or typed), returning a deduplicated list.
 *
 * Rules:
 * - Priority tasks always win over other tasks when similar.
 * - otherTasks that have no similar match in priorityTasks are appended.
 * - Exact duplicates within either list are also removed.
 *
 * @param {string[]} priorityTasks
 * @param {string[]} otherTasks
 * @returns {string[]}
 */
export function deduplicateTasks(priorityTasks = [], otherTasks = []) {
  // Deduplicate within priorityTasks first
  const result = []
  for (const task of priorityTasks) {
    if (task && !result.some((r) => areSimilar(r, task))) {
      result.push(task)
    }
  }

  // Append other tasks that are not similar to anything already in result
  for (const task of otherTasks) {
    if (task && !result.some((r) => areSimilar(r, task))) {
      result.push(task)
    }
  }

  return result
}

export function getStateLevel({ energy, sleep, mood }) {
  const moodId = (mood || '').toLowerCase()
  const sleepId = (sleep || '').toLowerCase()
  const isLow =
    energy <= 2 ||
    ['poor', 'terrible'].includes(sleepId) ||
    ['overwhelmed', 'anxious', 'flat'].includes(moodId)
  const isHigh =
    energy >= 4 &&
    ['great', 'ok'].includes(sleepId) &&
    ['focused', 'motivated', 'clear-headed'].includes(moodId)
  if (isLow) return 'low'
  if (isHigh) return 'high'
  return 'neutral'
}

export function isOverwhelmedOrAnxious(mood) {
  return ['overwhelmed', 'anxious'].includes((mood || '').toLowerCase())
}

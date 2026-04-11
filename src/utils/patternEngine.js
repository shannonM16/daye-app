/**
 * Derives a single insight string from check-in history.
 * Returns an empty string if no meaningful pattern is detected.
 * Callers must guard: only render if history.length >= 3 AND result is non-empty.
 */
export function getInsight(history) {
  if (!history || history.length < 3) return ''

  const recent = history.slice(-7)

  const lowEnergy = recent.filter((d) => d.energy <= 2).length
  if (lowEnergy >= 3)
    return `You've logged low energy ${lowEnergy} times recently. Protecting your mornings may help.`

  const highEnergy = recent.filter((d) => d.energy >= 4).length
  if (highEnergy >= 4)
    return `${highEnergy} high-energy days in the last week — you're on a strong run.`

  const stressed = recent.filter((d) =>
    ['overwhelmed', 'anxious', 'stressed'].includes(d.mood)
  ).length
  if (stressed >= 3)
    return `You've felt overwhelmed or anxious several times this week. Worth reviewing your load.`

  const poorSleep = recent.filter((d) =>
    ['poor', 'terrible'].includes(d.sleep)
  ).length
  if (poorSleep >= 3)
    return `Your sleep has been rough recently — it tends to show up in focus and mood.`

  const deepWork = recent.filter((d) => d.dayType === 'deep-work').length
  if (deepWork >= 4)
    return `You've been carving out deep-work days consistently — keep protecting that time.`

  return ''
}

export function calculateStreak(history) {
  if (!history || history.length === 0) return 0
  const dateSet = new Set(history.map((h) => h.date))
  let streak = 0
  const d = new Date()
  for (let i = 0; i < 365; i++) {
    const dateStr = d.toISOString().split('T')[0]
    if (dateSet.has(dateStr)) {
      streak++
      d.setDate(d.getDate() - 1)
    } else {
      break
    }
  }
  return streak
}

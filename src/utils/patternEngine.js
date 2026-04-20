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

export function getPlanInsight(history, streakCount) {
  if (!history || history.length < 3) return ''
  const recent = history.slice(-7)
  const today = history[history.length - 1]
  const yesterday = history.length >= 2 ? history[history.length - 2] : null

  const recentLow = recent.filter((d) => d.energy <= 2).length
  if (recentLow >= 4) return 'Your plan has been adjusted for a low-energy week — shorter blocks and lighter priorities.'

  if (streakCount >= 5 && today?.energy >= 4) return `${streakCount} days in a row. This one has potential.`
  if (streakCount >= 3 && today?.energy >= 4) return `${streakCount}-day streak and good energy — a good day to make real progress.`

  if (yesterday && yesterday.energy <= 2 && today && today.energy >= 3) return 'Yesterday was a tough one. Today has more in it.'
  if (yesterday && yesterday.energy >= 4 && today && today.energy >= 4) return 'Two strong days running. Carry it forward.'

  return ''
}

export function getWeeklyMomentumData(history) {
  if (!history || history.length < 4) return null

  const today = new Date()
  if (today.getDay() !== 1) return null

  const todayStr = today.toISOString().split('T')[0]
  const shownDate = localStorage.getItem('daye_weekly_shown_date')
  if (shownDate === todayStr) return null

  const lastMonday = new Date(today)
  lastMonday.setDate(today.getDate() - 7)
  const lastSunday = new Date(today)
  lastSunday.setDate(today.getDate() - 1)
  const lastMondayStr = lastMonday.toISOString().split('T')[0]
  const lastSundayStr = lastSunday.toISOString().split('T')[0]

  const entries = history.filter((h) => h.date >= lastMondayStr && h.date <= lastSundayStr)
  if (entries.length < 4) return null

  const days = entries.length
  const avgEnergy = Math.round((entries.reduce((s, h) => s + (h.energy || 3), 0) / days) * 10) / 10
  return { days, avgEnergy, todayStr }
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

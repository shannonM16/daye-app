export const TIME_OPTIONS = (() => {
  const opts = []
  for (let h = 6; h <= 23; h++) {
    for (let m = 0; m < 60; m += 15) {
      const ampm = h >= 12 ? 'pm' : 'am'
      const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
      opts.push(`${h12}:${String(m).padStart(2, '0')}${ampm}`)
    }
  }
  return opts
})()

export function timeStringToMinutes(t) {
  const match = t.match(/^(\d+):(\d+)(am|pm)$/i)
  if (!match) return 0
  let h = parseInt(match[1])
  const min = parseInt(match[2])
  const ap = match[3].toLowerCase()
  if (ap === 'pm' && h !== 12) h += 12
  if (ap === 'am' && h === 12) h = 0
  return h * 60 + min
}

// Returns a time string 'offsetMins' after 'start', clamped to TIME_OPTIONS
export function getAutoEndTime(start, offsetMins = 60) {
  const match = start.match(/^(\d+):(\d+)(am|pm)$/i)
  if (!match) return TIME_OPTIONS[TIME_OPTIONS.length - 1]
  let h = parseInt(match[1])
  const min = parseInt(match[2])
  const ap = match[3].toLowerCase()
  if (ap === 'pm' && h !== 12) h += 12
  if (ap === 'am' && h === 12) h = 0
  let total = h * 60 + min + offsetMins
  if (total >= 24 * 60) total = total % (24 * 60)
  const newH = Math.floor(total / 60)
  const newM = total % 60
  const newAmpm = newH >= 12 ? 'pm' : 'am'
  const newH12 = newH === 0 ? 12 : newH > 12 ? newH - 12 : newH
  const result = `${newH12}:${String(newM).padStart(2, '0')}${newAmpm}`
  return TIME_OPTIONS.includes(result) ? result : TIME_OPTIONS[TIME_OPTIONS.length - 1]
}

export function getNextQuarterHour() {
  const now = new Date()
  const totalMins = now.getHours() * 60 + now.getMinutes()
  const next = Math.ceil(totalMins / 15) * 15
  const clamped = Math.min(Math.max(next, 6 * 60), 23 * 60 + 45)
  const h24 = Math.floor(clamped / 60)
  const m = clamped % 60
  const ampm = h24 >= 12 ? 'pm' : 'am'
  const h12 = h24 === 0 ? 12 : h24 > 12 ? h24 - 12 : h24
  return `${h12}:${String(m).padStart(2, '0')}${ampm}`
}

export function getMeetingsForToday() {
  try {
    const raw = localStorage.getItem('df_meetings')
    if (!raw) return []
    const parsed = JSON.parse(raw)
    // Legacy format (plain array) — treat as stale
    if (Array.isArray(parsed)) return []
    const today = new Date().toISOString().split('T')[0]
    if (parsed.date !== today) return []
    return Array.isArray(parsed.list) ? parsed.list : []
  } catch {
    return []
  }
}

export function saveMeetingsForToday(list) {
  const today = new Date().toISOString().split('T')[0]
  localStorage.setItem('df_meetings', JSON.stringify({ date: today, list }))
}

// Keep old name as alias so ActionMode's direct import still works
export const getTodayMeetings = getMeetingsForToday

export function getNextMeeting(meetings) {
  const now = new Date()
  const currentMins = now.getHours() * 60 + now.getMinutes()
  return meetings
    .map(m => ({ ...m, startMins: timeStringToMinutes(m.startTime) }))
    .filter(m => m.startMins > currentMins)
    .sort((a, b) => a.startMins - b.startMins)[0] || null
}

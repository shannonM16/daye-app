const COMP_PREFIX = 'daye_comp_'

export const REVENUE_KEYWORDS = [
  'invoice', 'client', 'proposal', 'outreach', 'pitch', 'deal',
  'payment', 'sales', 'quote', 'contract', 'follow up', 'follow-up',
]

export function getCompletionsForDate(dateStr) {
  try {
    const raw = localStorage.getItem(COMP_PREFIX + dateStr)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveCompletionsForDate(dateStr, tasks) {
  localStorage.setItem(COMP_PREFIX + dateStr, JSON.stringify(tasks))
}

export function isRevenueTask(task) {
  const lower = (task || '').toLowerCase()
  return REVENUE_KEYWORDS.some((kw) => lower.includes(kw))
}

export function getRevenueActivityForDate(dateStr) {
  return getCompletionsForDate(dateStr).some(isRevenueTask)
}

export function getRevenueActivityLast7Days() {
  const days = []
  const d = new Date()
  for (let i = 0; i < 7; i++) {
    days.push(d.toISOString().split('T')[0])
    d.setDate(d.getDate() - 1)
  }
  return days.filter((date) => getRevenueActivityForDate(date)).length
}

export function getGoalCompletionCount() {
  return parseInt(localStorage.getItem('daye_goal_completions') || '0')
}

export function incrementGoalCompletionCount() {
  const c = getGoalCompletionCount()
  localStorage.setItem('daye_goal_completions', String(c + 1))
  return c + 1
}

const GOAL_KEYWORDS = {
  promotion: ['promoted', 'lead', 'manager', 'presentation', 'visibility', 'stakeholder', 'leadership'],
  revenue: ['invoice', 'client', 'sale', 'deal', 'outreach', 'pitch', 'revenue', 'payment'],
  audience: ['post', 'content', 'audience', 'video', 'article', 'caption', 'publish', 'upload'],
  product: ['feature', 'bug', 'deploy', 'code', 'build', 'test', 'launch', 'ship'],
  direction: ['apply', 'cv', 'network', 'research', 'interview', 'explore', 'reach out', 'connect'],
  study: ['revision', 'notes', 'practice', 'chapter', 'study', 'exam', 'assignment', 'essay'],
}

function detectGoalCategory(goal) {
  if (!goal) return null
  const lower = goal.toLowerCase()
  if (lower.includes('promot') || lower.includes('manage') || lower.includes('senior') || lower.includes('lead')) return 'promotion'
  if (lower.includes('revenue') || lower.includes('sales') || lower.includes('client') || lower.includes('invoice') || lower.includes('grow')) return 'revenue'
  if (lower.includes('audience') || lower.includes('content') || lower.includes('creator') || lower.includes('subscribers')) return 'audience'
  if (lower.includes('product') || lower.includes('build') || lower.includes('ship') || lower.includes('launch') || lower.includes('feature')) return 'product'
  if (lower.includes('direction') || lower.includes('figuring') || lower.includes('career change') || lower.includes('next step')) return 'direction'
  if (lower.includes('exam') || lower.includes('study') || lower.includes('degree') || lower.includes('qualif') || lower.includes('dissertation')) return 'study'
  return null
}

export function taskMatchesGoal(task, goal) {
  const category = detectGoalCategory(goal)
  if (!category) return false
  const lower = (task || '').toLowerCase()
  return GOAL_KEYWORDS[category].some((kw) => lower.includes(kw))
}

const TOAST_POOLS = {
  promotion: [
    "That's the kind of work that gets noticed.",
    "That moves you closer to the next level.",
    "Visibility built one task at a time.",
    "That's a career move, not just a task.",
    "The right people notice this kind of output.",
  ],
  revenue: [
    "Revenue doesn't build itself — well done.",
    "That keeps the pipeline moving.",
    "Every outreach compounds over time.",
    "That's the work that pays the bills.",
    "Consistent revenue action. That's the job.",
  ],
  audience: [
    "Revenue doesn't build itself — well done.",
    "That keeps the pipeline moving.",
    "Every outreach compounds over time.",
    "That's the work that pays the bills.",
    "Consistent revenue action. That's the job.",
  ],
  product: [
    "One step closer to shipping.",
    "Builders build. You're building.",
    "Progress over perfection. Always.",
    "That feature won't ship itself — but you will.",
    "Small steps, real momentum.",
  ],
  study: [
    "That's revision that sticks.",
    "Exam-ready, one session at a time.",
    "Past you will thank present you for this.",
    "That's the grade taking shape.",
    "Consistent effort beats last-minute panic.",
  ],
  direction: [
    "Clarity comes from doing, not waiting.",
    "One small move in the right direction.",
    "You're further along than you think.",
    "That's momentum. Keep it.",
    "The path gets clearer as you walk it.",
  ],
  default: [
    "That's today's plan working.",
    "Progress. Keep going.",
    "One done. What's next?",
    "That's momentum.",
    "Well done. Seriously.",
  ],
}

const SECOND_LINES = [
  "Keep going.",
  "That counts.",
  "Well done.",
  "One step at a time.",
  "That matters.",
  "",
]

export function getGoalToastContent(goal) {
  const category = detectGoalCategory(goal) || 'default'
  const pool = TOAST_POOLS[category] || TOAST_POOLS.default
  const lastToast = localStorage.getItem('daye_last_toast') || ''
  const available = pool.length > 1 ? pool.filter((m) => m !== lastToast) : pool
  const line1 = available[Math.floor(Math.random() * available.length)]
  localStorage.setItem('daye_last_toast', line1)
  const line2 = SECOND_LINES[Math.floor(Math.random() * SECOND_LINES.length)]
  return { line1, line2 }
}

export function getMondayOfWeek(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d.toISOString().split('T')[0]
}

export function getWeeklyWin(mondayDateStr) {
  return localStorage.getItem('daye_weekly_win_' + mondayDateStr) || null
}

export function saveWeeklyWin(mondayDateStr, text) {
  localStorage.setItem('daye_weekly_win_' + mondayDateStr, text)
}

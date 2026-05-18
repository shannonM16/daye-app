const SUPABASE_URL = process.env.SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

async function sbFetch(path, opts = {}) {
  return fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      Prefer: 'return=representation',
      ...(opts.headers || {}),
    },
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { userId, firstName } = req.body || {}
  if (!userId) return res.status(400).json({ error: 'userId is required' })
  if (!ANTHROPIC_API_KEY) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' })

  const ninetyDaysAgo = new Date()
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
  const periodStart = ninetyDaysAgo.toISOString().split('T')[0]
  const periodEnd = new Date().toISOString().split('T')[0]

  // Fetch last 90 days of plans
  let plans = []
  try {
    const r = await sbFetch(
      `plans?user_id=eq.${userId}&date=gte.${periodStart}&order=date.desc&limit=90&select=date,plan_data,check_in,reflection`,
      { method: 'GET', headers: { Accept: 'application/json' } }
    )
    if (r.ok) plans = await r.json()
  } catch { /* continue with empty */ }

  const daysLogged = plans.length
  const checkIns = plans
    .map(p => p.check_in || p.plan_data?.check_in || {})
    .filter(c => c && Object.keys(c).length > 0)
  const reflections = plans.map(p => p.reflection).filter(Boolean)

  const avgEnergy = checkIns.length > 0
    ? (checkIns.reduce((s, c) => s + (c.energy || 3), 0) / checkIns.length).toFixed(1)
    : null

  const moodFreq = {}
  checkIns.forEach(c => { if (c.mood) moodFreq[c.mood] = (moodFreq[c.mood] || 0) + 1 })
  const topMood = Object.entries(moodFreq).sort((a, b) => b[1] - a[1])[0]?.[0]

  const carryForwards = reflections.map(r => r.carryForward).filter(Boolean).slice(0, 4)
  const focusRatings = reflections.map(r => r.focusRating).filter(Boolean)
  const yesCount = focusRatings.filter(r => r === 'yes' || r === 'mostly').length
  const totalTasks = plans.flatMap(p => p.plan_data?.plannedTasks || []).length

  const name = firstName || 'you'

  const prompt = `Write a warm, personal, reflective quarterly letter to ${name}.

Data from the last 90 days (${periodStart} to ${periodEnd}):
- Days logged: ${daysLogged}
${avgEnergy ? `- Average energy level: ${avgEnergy}/5` : ''}
${topMood ? `- Most common mood: ${topMood}` : ''}
${totalTasks > 0 ? `- Total tasks planned: ${totalTasks}` : ''}
${focusRatings.length > 0 ? `- Days they felt they focused on what mattered: ${yesCount} out of ${focusRatings.length}` : ''}
${carryForwards.length > 0 ? `- Things they carried forward: ${carryForwards.join('; ')}` : ''}

Write the letter in second person, directly to ${name}. Tone: warm, human, like a thoughtful friend who has been quietly watching.

Structure:
- Open with "Dear ${name},"
- 3–4 paragraphs: notice patterns, acknowledge hard days, celebrate consistency, name something specific from the data
- End with one forward-looking encouragement
- Sign off as "— Daye"

Use British English. Do not just recite numbers — interpret them warmly. If data is sparse, write about the act of showing up at all. Return only the letter text.`

  let content
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      }),
    })
    if (!r.ok) {
      const body = await r.text()
      return res.status(500).json({ error: `Claude API error: ${body}` })
    }
    const data = await r.json()
    content = data.content?.[0]?.text?.trim() || ''
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }

  // Save / upsert to letters table (one letter per user — replace existing)
  try {
    const existing = await sbFetch(
      `letters?user_id=eq.${userId}&select=id`,
      { method: 'GET', headers: { Accept: 'application/json' } }
    )
    const rows = existing.ok ? await existing.json() : []

    if (rows.length > 0) {
      await sbFetch(`letters?user_id=eq.${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({ content, period_start: periodStart, period_end: periodEnd, created_at: new Date().toISOString() }),
      })
    } else {
      await sbFetch('letters', {
        method: 'POST',
        body: JSON.stringify({ user_id: userId, content, period_start: periodStart, period_end: periodEnd }),
      })
    }
  } catch { /* fail silently — still return the letter */ }

  return res.status(200).json({ content, period_start: periodStart, period_end: periodEnd })
}

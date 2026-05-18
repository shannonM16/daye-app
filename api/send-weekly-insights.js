// Cron: every Sunday at 8am UTC (see vercel.json)
// Sends weekly insight emails to all users via Loops.

const SUPABASE_URL = process.env.SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
const LOOPS_API_KEY = process.env.LOOPS_API_KEY
const LOOPS_WEEKLY_FREE_ID = process.env.LOOPS_WEEKLY_FREE_ID
const LOOPS_WEEKLY_PRO_ID = process.env.LOOPS_WEEKLY_PRO_ID
const APP_URL = 'https://withdaye.com'

async function sbFetch(path, opts = {}) {
  return fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      ...(opts.headers || {}),
    },
  })
}

async function generateInsight(checkIns, firstName) {
  if (!ANTHROPIC_API_KEY || checkIns.length === 0) return null

  const avgEnergy = (checkIns.reduce((s, c) => s + (c.energy || 3), 0) / checkIns.length).toFixed(1)
  const moodFreq = {}
  checkIns.forEach(c => { if (c.mood) moodFreq[c.mood] = (moodFreq[c.mood] || 0) + 1 })
  const topMood = Object.entries(moodFreq).sort((a, b) => b[1] - a[1])[0]?.[0]
  const daysLogged = checkIns.length

  const prompt = `Write 2–3 short sentences of warm, personalised insight for a weekly summary email for ${firstName || 'the user'}.

Their week: ${daysLogged} days logged, average energy ${avgEnergy}/5, most common mood: ${topMood || 'varied'}.

Be warm, specific, and encouraging. Use British English. No bullet points — flowing sentences only. No sign-off needed.`

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
        max_tokens: 150,
        messages: [{ role: 'user', content: prompt }],
      }),
    })
    if (!r.ok) return null
    const data = await r.json()
    return data.content?.[0]?.text?.trim() || null
  } catch { return null }
}

async function sendLoopsEmail(email, transactionalId, variables) {
  try {
    await fetch('https://app.loops.so/api/v1/transactional', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOOPS_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ transactionalId, email, dataVariables: variables }),
    })
  } catch { /* log but don't throw */ }
}

export default async function handler(req, res) {
  // Allow both GET (cron) and POST (manual trigger)
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!SERVICE_KEY || !LOOPS_API_KEY) {
    return res.status(500).json({ error: 'Required environment variables not configured' })
  }

  // Fetch all users who have completed onboarding (profile.user_type set)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const cutoff7 = sevenDaysAgo.toISOString().split('T')[0]

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const cutoff30 = thirtyDaysAgo.toISOString().split('T')[0]

  let users = []
  try {
    const r = await sbFetch(
      `users?select=id,email,first_name,profile,is_pro,last_seen&last_seen=gte.${cutoff30}`,
      { method: 'GET', headers: { Accept: 'application/json' } }
    )
    if (r.ok) users = await r.json()
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch users', detail: err.message })
  }

  // Filter to users who completed onboarding
  const eligible = users.filter(u => u.profile?.userType || u.profile?.user_type)

  let sent = 0
  let errors = 0

  for (const user of eligible) {
    if (!user.email) continue

    const firstName = user.first_name || ''
    const isPro = user.is_pro === true

    try {
      if (isPro && LOOPS_WEEKLY_PRO_ID) {
        // Fetch last 7 days of check-ins for Pro insight
        let checkIns = []
        try {
          const r = await sbFetch(
            `plans?user_id=eq.${user.id}&date=gte.${cutoff7}&select=check_in,plan_data`,
            { method: 'GET', headers: { Accept: 'application/json' } }
          )
          if (r.ok) {
            const rows = await r.json()
            checkIns = rows
              .map(p => p.check_in || p.plan_data?.check_in || {})
              .filter(c => c && Object.keys(c).length > 0)
          }
        } catch { /* continue without check-ins */ }

        const insightText = await generateInsight(checkIns, firstName)

        await sendLoopsEmail(user.email, LOOPS_WEEKLY_PRO_ID, {
          firstName: firstName || 'there',
          insightText: insightText || `You showed up ${checkIns.length} time${checkIns.length !== 1 ? 's' : ''} this week. That matters.`,
          appUrl: APP_URL,
        })
      } else if (!isPro && LOOPS_WEEKLY_FREE_ID) {
        await sendLoopsEmail(user.email, LOOPS_WEEKLY_FREE_ID, {
          firstName: firstName || 'there',
          appUrl: APP_URL,
        })
      }
      sent++
    } catch (err) {
      console.error(`Failed to send to ${user.email}:`, err.message)
      errors++
    }
  }

  return res.status(200).json({ sent, errors, total: eligible.length })
}

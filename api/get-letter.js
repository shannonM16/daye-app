const SUPABASE_URL = process.env.SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

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

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { userId } = req.body || {}
  if (!userId) return res.status(400).json({ error: 'userId required' })

  const r = await sbFetch(
    `letters?user_id=eq.${userId}&order=created_at.desc&limit=1`,
    { method: 'GET', headers: { Accept: 'application/json' } }
  )

  if (!r.ok) return res.status(200).json({ letter: null })

  const rows = await r.json()
  return res.status(200).json({ letter: rows?.[0] || null })
}

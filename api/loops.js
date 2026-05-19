const LOOPS_ENDPOINTS = {
  'create-contact': 'https://app.loops.so/api/v1/contacts/create',
  'update-contact': 'https://app.loops.so/api/v1/contacts/update',
  'send-transactional': 'https://app.loops.so/api/v1/transactional',
  'send-event': 'https://app.loops.so/api/v1/events/send',
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { action, ...payload } = req.body
  const endpoint = LOOPS_ENDPOINTS[action]

  if (!endpoint) {
    return res.status(400).json({ error: `Unknown action: ${action}` })
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + process.env.LOOPS_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const data = await response.json()
  return res.status(response.status).json(data)
}

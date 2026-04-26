export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const response = await fetch('https://app.loops.so/api/v1/contacts/create', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + process.env.LOOPS_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req.body),
  })

  const data = await response.json()
  return res.status(response.status).json(data)
}

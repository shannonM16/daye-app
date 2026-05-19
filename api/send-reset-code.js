import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { email } = req.body || {}
  if (!email) return res.status(400).json({ error: 'email is required' })

  const normalised = email.toLowerCase().trim()
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

  const code = String(crypto.randomInt(100000, 999999))
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()

  // Invalidate any existing unused codes for this email
  await supabase
    .from('password_reset_codes')
    .update({ used: true })
    .eq('email', normalised)
    .eq('used', false)

  const { error: insertError } = await supabase
    .from('password_reset_codes')
    .insert({ email: normalised, code, expires_at: expiresAt, used: false })

  if (insertError) {
    console.error('send-reset-code insert error:', insertError)
    return res.status(500).json({ error: 'Failed to store reset code' })
  }

  const loopsRes = await fetch('https://app.loops.so/api/v1/transactional', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + process.env.LOOPS_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      transactionalId: process.env.LOOPS_RESET_CODE_ID,
      email: normalised,
      dataVariables: { code },
    }),
  })

  if (!loopsRes.ok) {
    console.error('send-reset-code loops error:', await loopsRes.text())
    return res.status(500).json({ error: 'Failed to send email' })
  }

  return res.status(200).json({ success: true })
}

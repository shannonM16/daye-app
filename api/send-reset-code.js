import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

export default async function handler(req, res) {
  console.log('[send-reset-code] function called, method:', req.method)

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { email } = req.body || {}
  console.log('[send-reset-code] email received:', email)

  if (!email) return res.status(400).json({ error: 'email is required' })

  console.log('[send-reset-code] LOOPS_API_KEY defined:', !!process.env.LOOPS_API_KEY)
  console.log('[send-reset-code] LOOPS_RESET_CODE_ID defined:', !!process.env.LOOPS_RESET_CODE_ID)
  console.log('[send-reset-code] SUPABASE_URL defined:', !!process.env.SUPABASE_URL)
  console.log('[send-reset-code] SUPABASE_SERVICE_ROLE_KEY defined:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)

  const normalised = email.toLowerCase().trim()
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabase = createClient(supabaseUrl, supabaseKey)

  const code = String(crypto.randomInt(100000, 999999))
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()
  console.log('[send-reset-code] generated code length:', code.length, '| expires:', expiresAt)

  const { error: invalidateError } = await supabase
    .from('password_reset_codes')
    .update({ used: true })
    .eq('email', normalised)
    .eq('used', false)
  console.log('[send-reset-code] invalidate old codes result:', invalidateError ? 'ERROR: ' + invalidateError.message : 'ok')

  const { error: insertError } = await supabase
    .from('password_reset_codes')
    .insert({ email: normalised, code, expires_at: expiresAt, used: false })

  if (insertError) {
    console.error('[send-reset-code] insert error:', insertError.message, insertError.code)
    return res.status(500).json({ error: 'Failed to store reset code', detail: insertError.message })
  }
  console.log('[send-reset-code] code inserted successfully')

  const loopsPayload = {
    transactionalId: process.env.LOOPS_RESET_CODE_ID,
    email: normalised,
    dataVariables: { code },
  }
  console.log('[send-reset-code] loops payload:', JSON.stringify(loopsPayload))

  let loopsRes
  try {
    loopsRes = await fetch('https://app.loops.so/api/v1/transactional', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + process.env.LOOPS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loopsPayload),
    })
  } catch (fetchErr) {
    console.error('[send-reset-code] loops fetch threw:', fetchErr.message)
    return res.status(500).json({ error: 'Failed to reach Loops', detail: fetchErr.message })
  }

  const loopsBody = await loopsRes.text()
  console.log('[send-reset-code] loops response status:', loopsRes.status)
  console.log('[send-reset-code] loops response body:', loopsBody)

  if (!loopsRes.ok) {
    return res.status(500).json({ error: 'Failed to send email', detail: loopsBody })
  }

  console.log('[send-reset-code] success')
  return res.status(200).json({ success: true })
}

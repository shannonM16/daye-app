import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  console.log('[verify-reset-code] function called, method:', req.method)
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { email, code, newPassword } = req.body || {}
  if (!email || !code || !newPassword) {
    return res.status(400).json({ error: 'email, code, and newPassword are required' })
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' })
  }

  const normalised = email.toLowerCase().trim()
  console.log('[verify-reset-code] email:', normalised)
  console.log('[verify-reset-code] code received:', code)
  console.log('[verify-reset-code] SUPABASE_URL defined:', !!process.env.SUPABASE_URL)
  console.log('[verify-reset-code] VITE_SUPABASE_URL defined:', !!process.env.VITE_SUPABASE_URL)
  console.log('[verify-reset-code] SUPABASE_SERVICE_ROLE_KEY defined:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabase = createClient(supabaseUrl, supabaseKey)

  const now = new Date().toISOString()
  const { data: rows, error: lookupError } = await supabase
    .from('password_reset_codes')
    .select('*')
    .eq('email', normalised)
    .eq('code', code.trim())
    .eq('used', false)
    .gt('expires_at', now)
    .order('created_at', { ascending: false })
    .limit(1)

  console.log('[verify-reset-code] query time (now):', now)
  console.log('[verify-reset-code] row found:', rows?.length > 0)
  console.log('[verify-reset-code] lookup rows:', JSON.stringify(rows))
  console.log('[verify-reset-code] lookup error:', lookupError ? JSON.stringify(lookupError) : null)

  if (lookupError || !rows?.length) {
    console.log('[verify-reset-code] returning 400: Invalid or expired code')
    return res.status(400).json({ error: 'Invalid or expired code' })
  }

  const record = rows[0]
  console.log('[verify-reset-code] record expires_at:', record.expires_at, '| now:', now, '| valid:', record.expires_at > now)

  // Find auth user by email
  const { data: usersData, error: listError } = await supabase.auth.admin.listUsers({
    filter: normalised,
    page: 1,
    perPage: 10,
  })
  if (listError) {
    console.error('verify-reset-code listUsers error:', listError)
    return res.status(500).json({ error: 'Failed to find account' })
  }

  const user = usersData?.users?.find(u => u.email?.toLowerCase() === normalised)
  if (!user) {
    return res.status(400).json({ error: 'No account found for this email' })
  }

  const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
    password: newPassword,
  })
  if (updateError) {
    console.error('verify-reset-code updateUser error:', updateError)
    return res.status(500).json({ error: 'Failed to update password' })
  }

  // Mark code as used
  await supabase
    .from('password_reset_codes')
    .update({ used: true })
    .eq('id', record.id)

  return res.status(200).json({ success: true })
}

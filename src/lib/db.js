import { supabase } from './supabase'

// Partial plan upsert — updates only the provided fields on today's plan row.
// These nullable columns must exist in the plans table for full support:
//   ALTER TABLE plans ADD COLUMN IF NOT EXISTS check_in jsonb;
//   ALTER TABLE plans ADD COLUMN IF NOT EXISTS meetings jsonb;
//   ALTER TABLE plans ADD COLUMN IF NOT EXISTS completed_tasks jsonb;
//   ALTER TABLE plans ADD COLUMN IF NOT EXISTS timer_log jsonb;
//   ALTER TABLE plans ADD COLUMN IF NOT EXISTS reflection jsonb;
export async function upsertPlanPartial(userId, date, fields) {
  const { error } = await supabase
    .from('plans')
    .upsert(
      { user_id: userId, date, ...fields },
      { onConflict: 'user_id,date' }
    )
  if (error) throw error
}

// Update last_seen on the users table for DAU tracking.
// Requires: ALTER TABLE users ADD COLUMN IF NOT EXISTS last_seen timestamptz;
export async function updateUserLastSeen(userId) {
  const { error } = await supabase
    .from('users')
    .update({ last_seen: new Date().toISOString() })
    .eq('id', userId)
  if (error) throw error
}

export async function upsertUser({ firstName, email, profile = {} }) {
  console.log('Supabase: attempting to save user', email)
  const { data, error } = await supabase
    .from('users')
    .upsert(
      { email, first_name: firstName, profile, updated_at: new Date().toISOString() },
      { onConflict: 'email' }
    )
    .select('id, email, first_name, profile')
    .single()
  if (error) {
    console.log('Supabase: error saving user', error.message)
    throw error
  }
  console.log('Supabase: user saved successfully', data.id)
  return data
}

export async function fetchUserByEmail(email) {
  const { data, error } = await supabase
    .from('users')
    .select('id, email, first_name, profile')
    .eq('email', email)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function savePlan(userId, date, planData) {
  console.log('Supabase: attempting to save plan for user', userId)
  const { error } = await supabase
    .from('plans')
    .upsert(
      { user_id: userId, date, plan_data: planData },
      { onConflict: 'user_id,date' }
    )
  if (error) {
    console.log('Supabase: error saving plan', error.message)
    throw error
  }
  console.log('Supabase: plan saved successfully')
}

export async function fetchPlans(userId) {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const cutoff = thirtyDaysAgo.toISOString().split('T')[0]
  const { data, error } = await supabase
    .from('plans')
    .select('date, plan_data')
    .eq('user_id', userId)
    .gte('date', cutoff)
    .order('date', { ascending: false })
    .limit(30)
  if (error) throw error
  return (data || []).map(row => ({ date: row.date, ...row.plan_data }))
}

export async function saveWeeklyWinDB(userId, weekStart, winText) {
  const { error } = await supabase
    .from('weekly_wins')
    .upsert(
      { user_id: userId, week_start: weekStart, win_text: winText },
      { onConflict: 'user_id,week_start' }
    )
  if (error) throw error
}

export async function fetchWeeklyWins(userId) {
  const { data, error } = await supabase
    .from('weekly_wins')
    .select('week_start, win_text')
    .eq('user_id', userId)
  if (error) throw error
  return data || []
}

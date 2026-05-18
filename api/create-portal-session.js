import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { userId } = req.body
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' })
  }

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  // Look up the user's Stripe customer ID from Supabase
  const { data: user, error } = await supabase
    .from('users')
    .select('stripe_customer_id, email')
    .eq('id', userId)
    .maybeSingle()

  if (error || !user) {
    return res.status(404).json({ error: 'User not found' })
  }

  if (!user.stripe_customer_id) {
    return res.status(400).json({ error: 'No Stripe customer found for this user' })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripe_customer_id,
    return_url: 'https://withdaye.com',
  })

  return res.status(200).json({ url: session.url })
}

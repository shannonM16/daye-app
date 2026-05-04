import Stripe from 'stripe'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { priceId, userId } = req.body
  if (!priceId) {
    return res.status(400).json({ error: 'priceId is required' })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: 'https://withdaye.com/pro-success',
    cancel_url: 'https://withdaye.com/pricing',
    allow_promotion_codes: true,
    subscription_data: {
      trial_period_days: 7,
      ...(userId && { metadata: { userId } }),
    },
    ...(userId && { metadata: { userId } }),
  })

  return res.status(200).json({ url: session.url })
}

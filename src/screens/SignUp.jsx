import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { upsertUser, fetchUserByEmail } from '../lib/db'
import { addLoopsContact, sendLoopsWelcomeEmail } from '../lib/loops'

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

const inputStyle = {
  width: '100%',
  background: 'white',
  border: '1px solid var(--color-border)',
  borderRadius: '10px',
  padding: '12px 14px',
  fontFamily: 'var(--font-sans)',
  fontSize: '14px',
  color: 'var(--color-ink)',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s',
}

const PRICE_MONTHLY = 'price_1TTRgF2LFIh1ZwramSLMYfSK'
const PRICE_ANNUAL = 'price_1TTRga2LFIh1Zwra08LHcdn9'

export default function SignUp({ onNewUser, onExistingUser }) {
  const [mode, setMode] = useState('signin')
  const [firstName, setFirstName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)

  async function handlePendingProPlan(userId) {
    const pendingPlan = localStorage.getItem('pendingProPlan')
    if (!pendingPlan) return false
    localStorage.removeItem('pendingProPlan')
    setCheckoutLoading(true)
    try {
      const priceId = pendingPlan === 'annual' ? PRICE_ANNUAL : PRICE_MONTHLY
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, userId }),
      })
      const data = await res.json()
      if (data.url) { window.location.href = data.url; return true }
    } catch { /* fall through */ }
    setCheckoutLoading(false)
    return false
  }

  const handleGoogle = async () => {
    setGoogleLoading(true)
    localStorage.setItem('oauth_redirect_pending', 'true')
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: 'https://withdaye.com' },
    })
  }

  const switchMode = (next) => {
    setMode(next)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'signup') {
        const { data, error: err } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { first_name: firstName.trim() } },
        })
        if (err) { setError(err.message); setLoading(false); return }
        if (data.user) {
          const trimFirst = firstName.trim()
          const trimEmail = email.trim()
          const dbUser = await upsertUser({ firstName: trimFirst, email: trimEmail, profile: {} })
          localStorage.setItem('daye_user_id', dbUser.id)
          if (!localStorage.getItem('daye_member_since')) {
            localStorage.setItem('daye_member_since', new Date().toISOString())
          }
          addLoopsContact(trimEmail, trimFirst)
          setTimeout(() => sendLoopsWelcomeEmail(trimEmail, trimFirst), 2000)
          const redirected = await handlePendingProPlan(dbUser.id)
          if (!redirected) onNewUser({ firstName: trimFirst, email: trimEmail })
        }
      } else {
        const { data, error: err } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })
        if (err) { setError(err.message); setLoading(false); return }
        if (data.user) {
          const trimEmail = email.trim()
          const dbUser = await fetchUserByEmail(trimEmail)
          if (dbUser) {
            localStorage.setItem('daye_user_id', dbUser.id)
            const redirected = await handlePendingProPlan(dbUser.id)
            if (!redirected) {
              const hasProfile = !!(dbUser.profile && Object.keys(dbUser.profile).length > 0)
              onExistingUser({
                firstName: dbUser.first_name || '',
                email: trimEmail,
                hasProfile,
                profile: dbUser.profile || {},
                userId: dbUser.id,
                isPro: dbUser.is_pro === true,
              })
            }
          } else {
            // Auth record exists but no DB record yet — treat as new
            const newDbUser = await upsertUser({ firstName: '', email: trimEmail, profile: {} })
            localStorage.setItem('daye_user_id', newDbUser.id)
            const redirected = await handlePendingProPlan(newDbUser.id)
            if (!redirected) onNewUser({ firstName: '', email: trimEmail })
          }
        }
      }
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  if (checkoutLoading) {
    return (
      <div className="screen" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '32px', color: 'var(--color-ink)', fontWeight: 300, display: 'block', marginBottom: '32px', textAlign: 'center' }}>daye</span>
        <div className="animate-pulse" style={{ width: '48px', height: '3px', borderRadius: '2px', background: 'var(--color-lavender)', margin: '0 auto 20px' }} />
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--color-muted)', textAlign: 'center' }}>Setting up your trial...</p>
      </div>
    )
  }

  return (
    <div className="screen">
      <div className="flex-1 overflow-y-auto flex flex-col" style={{ paddingTop: '36px' }}>

        {/* Wordmark */}
        <div className="flex flex-col items-center mb-7">
          <h1
            style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--color-ink)' }}
            className="text-[36px] font-light leading-none mb-5"
          >
            daye
          </h1>
          <div className="w-10 h-px" style={{ background: 'var(--color-border-dark)' }} />
        </div>

        {/* Heading + subtext */}
        <h2 style={{
          fontFamily: 'var(--font-serif)',
          fontStyle: 'italic',
          fontSize: '26px',
          fontWeight: 300,
          color: 'var(--color-ink)',
          textAlign: 'center',
          marginBottom: '8px',
          lineHeight: 1.2,
        }}>
          Let's get started.
        </h2>
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '13px',
          color: 'var(--color-muted)',
          textAlign: 'center',
          lineHeight: 1.6,
          margin: '0 auto 24px',
          maxWidth: '280px',
        }}>
          Sign in to save your progress and access your plan from any device.
        </p>

        {/* Google */}
        <button
          type="button"
          onClick={handleGoogle}
          disabled={googleLoading || loading}
          className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl text-sm font-medium transition-all active:scale-[0.98] disabled:opacity-60"
          style={{ background: 'white', color: 'var(--color-ink)', border: '1px solid var(--color-border)' }}
        >
          {googleLoading
            ? <div className="w-4 h-4 border-2 border-stone-200 border-t-stone-600 rounded-full animate-spin" />
            : <GoogleLogo />
          }
          {googleLoading ? 'Connecting...' : 'Continue with Google'}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--color-muted)', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>or</span>
          <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {mode === 'signup' && (
            <input
              type="text"
              placeholder="First name"
              value={firstName}
              onChange={(e) => { setFirstName(e.target.value); setError('') }}
              required
              autoFocus
              style={inputStyle}
            />
          )}
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError('') }}
            required
            autoFocus={mode === 'signin'}
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError('') }}
            required
            style={inputStyle}
          />

          {error && (
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: '#c0392b', margin: '2px 0 0' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || googleLoading}
            style={{
              width: '100%',
              background: 'var(--color-ink)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              padding: '13px 24px',
              fontFamily: 'var(--font-sans)',
              fontSize: '14px',
              fontWeight: 500,
              cursor: loading || googleLoading ? 'default' : 'pointer',
              opacity: loading || googleLoading ? 0.7 : 1,
              marginTop: '2px',
              letterSpacing: '0.01em',
            }}
          >
            {loading ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Sign in'}
          </button>
        </form>

        {/* Mode toggle */}
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '13px',
          color: 'var(--color-muted)',
          textAlign: 'center',
          marginTop: '20px',
          paddingBottom: '32px',
        }}>
          {mode === 'signin' ? (
            <>Don't have an account?{' '}
              <button
                type="button"
                onClick={() => switchMode('signup')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-ink)', fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 500, padding: 0, textDecoration: 'underline', textUnderlineOffset: '2px' }}
              >
                Create one
              </button>
            </>
          ) : (
            <>Already have an account?{' '}
              <button
                type="button"
                onClick={() => switchMode('signin')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-ink)', fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 500, padding: 0, textDecoration: 'underline', textUnderlineOffset: '2px' }}
              >
                Sign in
              </button>
            </>
          )}
        </p>

      </div>
    </div>
  )
}

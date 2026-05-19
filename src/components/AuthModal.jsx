import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { upsertUser, fetchUserByEmail } from '../lib/db'
import { addLoopsContact, sendLoopsWelcomeEmail } from '../lib/loops'
import { useAuth } from '../context/AuthContext'

const PRICE_MONTHLY = 'price_1TTRgF2LFIh1ZwramSLMYfSK'
const PRICE_ANNUAL = 'price_1TTRga2LFIh1Zwra08LHcdn9'

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
  fontSize: '16px',
  color: 'var(--color-ink)',
  outline: 'none',
  boxSizing: 'border-box',
}

export default function AuthModal({ onNewUser, onExistingUser }) {
  const { isModalOpen, initialMode, hideAuthModal, updateNavUser } = useAuth()
  // mode: 'signin' | 'signup' | 'forgot' | 'code'
  const [mode, setMode] = useState('signin')
  const [firstName, setFirstName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [resetCode, setResetCode] = useState('')
  const [resetLoading, setResetLoading] = useState(false)

  useEffect(() => {
    if (isModalOpen) {
      setMode(initialMode)
      setError('')
      setFirstName('')
      setEmail('')
      setPassword('')
      setConfirmPassword('')
      setResetCode('')
    }
  }, [isModalOpen, initialMode])

  const confirmTouched = confirmPassword.length > 0
  const passwordsMatch = !confirmPassword || password === confirmPassword

  async function handlePendingProPlan() {
    const pendingPlan = localStorage.getItem('pendingProPlan') || sessionStorage.getItem('pendingProPlan')
    if (!pendingPlan) return false
    setCheckoutLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.id) { setCheckoutLoading(false); return false }
      localStorage.removeItem('pendingProPlan')
      sessionStorage.removeItem('pendingProPlan')
      const priceId = pendingPlan === 'annual' ? PRICE_ANNUAL : PRICE_MONTHLY
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, userId: user.id }),
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
    const pendingPlan = localStorage.getItem('pendingProPlan')
    if (pendingPlan) sessionStorage.setItem('pendingProPlan', pendingPlan)
    const redirectTo = pendingPlan
      ? `https://withdaye.com?pendingProPlan=${pendingPlan}`
      : 'https://withdaye.com'
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } })
  }

  const handleSendCode = async () => {
    if (!email.trim()) { setError('Enter your email address'); return }
    setError('')
    setResetLoading(true)
    try {
      const res = await fetch('/api/send-reset-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Something went wrong'); setResetLoading(false); return }
      setResetCode('')
      setPassword('')
      setConfirmPassword('')
      setMode('code')
    } catch {
      setError('Something went wrong. Please try again.')
    }
    setResetLoading(false)
  }

  const handleVerifyCode = async (e) => {
    e.preventDefault()
    if (resetCode.length !== 6) { setError('Enter the 6-digit code from your email'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    if (password !== confirmPassword) { setError("Passwords don't match"); return }
    setError('')
    setResetLoading(true)
    try {
      const res = await fetch('/api/verify-reset-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), code: resetCode.trim(), newPassword: password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Invalid or expired code'); setResetLoading(false); return }

      // Auto sign in with the new password
      const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      if (signInErr || !signInData.user) {
        setError('Password updated — please sign in.')
        setMode('signin')
        setResetLoading(false)
        return
      }

      const trimEmail = email.trim()
      const dbUser = await fetchUserByEmail(trimEmail)
      if (dbUser) {
        localStorage.setItem('daye_user_id', dbUser.id)
        updateNavUser({ firstName: dbUser.first_name || '', email: trimEmail })
        hideAuthModal()
        const redirected = await handlePendingProPlan()
        if (!redirected) {
          const hasProfile = !!(dbUser.profile && Object.keys(dbUser.profile).length > 0)
          onExistingUser({ firstName: dbUser.first_name || '', email: trimEmail, hasProfile, profile: dbUser.profile || {}, userId: dbUser.id, isPro: dbUser.is_pro === true })
        }
      } else {
        hideAuthModal()
        onNewUser({ firstName: '', email: trimEmail })
      }
    } catch {
      setError('Something went wrong. Please try again.')
    }
    setResetLoading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    if (mode === 'signup' && password !== confirmPassword) {
      setError("Passwords don't match")
      setLoading(false)
      return
    }

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
          setTimeout(() => sendLoopsWelcomeEmail(trimEmail, trimFirst), 3000)
          updateNavUser({ firstName: trimFirst, email: trimEmail })
          hideAuthModal()
          const redirected = await handlePendingProPlan()
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
            updateNavUser({ firstName: dbUser.first_name || '', email: trimEmail })
            hideAuthModal()
            const redirected = await handlePendingProPlan()
            if (!redirected) {
              const hasProfile = !!(dbUser.profile && Object.keys(dbUser.profile).length > 0)
              onExistingUser({ firstName: dbUser.first_name || '', email: trimEmail, hasProfile, profile: dbUser.profile || {}, userId: dbUser.id, isPro: dbUser.is_pro === true })
            }
          } else {
            const newDbUser = await upsertUser({ firstName: '', email: trimEmail, profile: {} })
            localStorage.setItem('daye_user_id', newDbUser.id)
            updateNavUser({ firstName: '', email: trimEmail })
            hideAuthModal()
            const redirected = await handlePendingProPlan()
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
      <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'var(--color-linen)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '32px', color: 'var(--color-ink)', fontWeight: 300, marginBottom: '32px' }}>daye</span>
        <div className="animate-pulse" style={{ width: '48px', height: '3px', borderRadius: '2px', background: 'var(--color-lavender)', marginBottom: '20px' }} />
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--color-muted)' }}>Setting up your trial...</p>
      </div>
    )
  }

  if (!isModalOpen) return null

  const headings = {
    signup: 'Create your account.',
    signin: 'Welcome back.',
    forgot: 'Reset your password.',
    code: 'Check your email.',
  }

  const subtexts = {
    signup: 'Sign up to save your progress and access your plan from any device.',
    signin: 'Sign in to continue.',
    forgot: "Enter your email and we'll send a 6-digit code.",
    code: `We've sent a code to ${email}. Enter it below along with your new password.`,
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(26,26,26,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
      onClick={hideAuthModal}
    >
      <div
        style={{ background: 'var(--color-linen)', borderRadius: '20px', boxShadow: '0 24px 80px rgba(0,0,0,0.2)', width: '100%', maxWidth: '400px', padding: '36px 32px', position: 'relative', maxHeight: '90dvh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={hideAuthModal}
          aria-label="Close"
          style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--color-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        {/* Wordmark */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '28px', color: 'var(--color-ink)', fontWeight: 300 }}>daye</span>
        </div>

        {/* Heading + subtext */}
        <h2 style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '22px', fontWeight: 300, color: 'var(--color-ink)', textAlign: 'center', margin: '0 0 6px', lineHeight: 1.2 }}>
          {headings[mode]}
        </h2>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--color-muted)', textAlign: 'center', margin: '0 0 24px', lineHeight: 1.5 }}>
          {subtexts[mode]}
        </p>

        {/* Google + divider (signin/signup only) */}
        {(mode === 'signin' || mode === 'signup') && (
          <>
            <button
              type="button"
              onClick={handleGoogle}
              disabled={googleLoading || loading}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-2xl text-sm font-medium transition-all active:scale-[0.98] disabled:opacity-60"
              style={{ background: 'white', color: 'var(--color-ink)', border: '1px solid var(--color-border)', marginBottom: '16px' }}
            >
              {googleLoading
                ? <div className="w-4 h-4 border-2 border-stone-200 border-t-stone-600 rounded-full animate-spin" />
                : <GoogleLogo />}
              {googleLoading ? 'Connecting...' : 'Continue with Google'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.6 }}>or</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
            </div>
          </>
        )}

        {/* Signin / Signup form */}
        {(mode === 'signin' || mode === 'signup') && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {mode === 'signup' && (
              <input
                type="text"
                name="given-name"
                placeholder="First name"
                value={firstName}
                onChange={e => {
                  const v = e.target.value
                  setFirstName(v.charAt(0).toUpperCase() + v.slice(1))
                  setError('')
                }}
                required
                autoFocus
                autoCapitalize="words"
                autoComplete="given-name"
                style={inputStyle}
              />
            )}
            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={email}
              onChange={e => { setEmail(e.target.value); setError('') }}
              required
              autoFocus={mode === 'signin'}
              autoComplete="email"
              style={inputStyle}
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError('') }}
              required
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              style={inputStyle}
            />
            {mode === 'signup' && (
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  name="confirm-password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={e => { setConfirmPassword(e.target.value); setError('') }}
                  required
                  autoComplete="new-password"
                  style={{
                    ...inputStyle,
                    borderColor: confirmTouched ? (passwordsMatch ? '#22c55e' : '#c0392b') : 'var(--color-border)',
                    paddingRight: confirmTouched ? '36px' : '14px',
                  }}
                />
                {confirmTouched && passwordsMatch && (
                  <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#22c55e', fontSize: '14px', pointerEvents: 'none' }}>✓</span>
                )}
                {confirmTouched && !passwordsMatch && (
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: '#c0392b', margin: '4px 0 0', lineHeight: 1.4 }}>Passwords don't match</p>
                )}
              </div>
            )}

            {mode === 'signin' && (
              <button
                type="button"
                onClick={() => { setMode('forgot'); setError('') }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--color-muted)', textAlign: 'left', padding: 0, textDecoration: 'underline', textUnderlineOffset: '2px' }}
              >
                Forgot password?
              </button>
            )}

            {error && (
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: '#c0392b', margin: 0 }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || googleLoading || (mode === 'signup' && confirmTouched && !passwordsMatch)}
              style={{ width: '100%', background: 'var(--color-ink)', color: 'white', border: 'none', borderRadius: '10px', padding: '13px 24px', fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 500, cursor: (loading || googleLoading) ? 'default' : 'pointer', opacity: (loading || googleLoading || (mode === 'signup' && confirmTouched && !passwordsMatch)) ? 0.7 : 1, marginTop: '2px', letterSpacing: '0.01em' }}
            >
              {loading ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Sign in'}
            </button>
          </form>
        )}

        {/* Forgot password — step 1: enter email */}
        {mode === 'forgot' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => { setEmail(e.target.value); setError('') }}
              autoFocus
              autoComplete="email"
              style={inputStyle}
            />
            {error && (
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: '#c0392b', margin: 0 }}>{error}</p>
            )}
            <button
              type="button"
              onClick={handleSendCode}
              disabled={resetLoading}
              style={{ width: '100%', background: 'var(--color-ink)', color: 'white', border: 'none', borderRadius: '10px', padding: '13px 24px', fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 500, cursor: resetLoading ? 'default' : 'pointer', opacity: resetLoading ? 0.7 : 1, letterSpacing: '0.01em' }}
            >
              {resetLoading ? 'Sending…' : 'Send code'}
            </button>
          </div>
        )}

        {/* Reset password — step 2: enter code + new password */}
        {mode === 'code' && (
          <form onSubmit={handleVerifyCode} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              placeholder="6-digit code"
              value={resetCode}
              onChange={e => { setResetCode(e.target.value.replace(/\D/g, '')); setError('') }}
              autoFocus
              autoComplete="one-time-code"
              style={{ ...inputStyle, letterSpacing: '0.2em', textAlign: 'center', fontSize: '22px' }}
            />
            <input
              type="password"
              placeholder="New password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError('') }}
              autoComplete="new-password"
              style={inputStyle}
            />
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={e => { setConfirmPassword(e.target.value); setError('') }}
                autoComplete="new-password"
                style={{
                  ...inputStyle,
                  borderColor: confirmTouched ? (passwordsMatch ? '#22c55e' : '#c0392b') : 'var(--color-border)',
                  paddingRight: confirmTouched ? '36px' : '14px',
                }}
              />
              {confirmTouched && passwordsMatch && (
                <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#22c55e', fontSize: '14px', pointerEvents: 'none' }}>✓</span>
              )}
              {confirmTouched && !passwordsMatch && (
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: '#c0392b', margin: '4px 0 0', lineHeight: 1.4 }}>Passwords don't match</p>
              )}
            </div>

            {error && (
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: '#c0392b', margin: 0 }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={resetLoading || (confirmTouched && !passwordsMatch)}
              style={{ width: '100%', background: 'var(--color-ink)', color: 'white', border: 'none', borderRadius: '10px', padding: '13px 24px', fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 500, cursor: resetLoading ? 'default' : 'pointer', opacity: (resetLoading || (confirmTouched && !passwordsMatch)) ? 0.7 : 1, letterSpacing: '0.01em' }}
            >
              {resetLoading ? 'Verifying…' : 'Verify & sign in'}
            </button>

            <button
              type="button"
              onClick={handleSendCode}
              disabled={resetLoading}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--color-muted)', textAlign: 'center', padding: '4px 0 0', textDecoration: 'underline', textUnderlineOffset: '2px' }}
            >
              Send a new code
            </button>
          </form>
        )}

        {/* Back to sign in (forgot / code modes) */}
        {(mode === 'forgot' || mode === 'code') && (
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--color-muted)', textAlign: 'center', marginTop: '20px', marginBottom: 0 }}>
            <button
              type="button"
              onClick={() => { setMode('signin'); setError(''); setResetCode(''); setPassword(''); setConfirmPassword('') }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-ink)', fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 500, padding: 0, textDecoration: 'underline', textUnderlineOffset: '2px' }}
            >
              Back to sign in
            </button>
          </p>
        )}

        {/* Mode toggle (signin / signup) */}
        {(mode === 'signin' || mode === 'signup') && (
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--color-muted)', textAlign: 'center', marginTop: '20px', marginBottom: 0 }}>
            {mode === 'signin' ? (
              <>Don't have an account?{' '}
                <button type="button" onClick={() => { setMode('signup'); setError(''); setConfirmPassword('') }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-ink)', fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 500, padding: 0, textDecoration: 'underline', textUnderlineOffset: '2px' }}>
                  Create one
                </button>
              </>
            ) : (
              <>Already have an account?{' '}
                <button type="button" onClick={() => { setMode('signin'); setError(''); setConfirmPassword('') }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-ink)', fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 500, padding: 0, textDecoration: 'underline', textUnderlineOffset: '2px' }}>
                  Sign in
                </button>
              </>
            )}
          </p>
        )}
      </div>
    </div>
  )
}

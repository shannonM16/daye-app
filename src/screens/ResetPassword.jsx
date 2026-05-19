import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const INK = '#1a1a1a'
const LINEN = '#f9f7f5'
const MUTED = '#8a8480'
const LAVENDER = '#c9b8d8'
const BORDER = '#e2ddd8'

const inputStyle = {
  width: '100%',
  background: 'white',
  border: `1px solid ${BORDER}`,
  borderRadius: '10px',
  padding: '12px 14px',
  fontFamily: 'var(--font-sans)',
  fontSize: '16px',
  color: INK,
  outline: 'none',
  boxSizing: 'border-box',
}

export default function ResetPassword() {
  const [status, setStatus] = useState('loading') // 'loading' | 'form' | 'invalid' | 'success'
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tokenHash = params.get('token_hash')
    const type = params.get('type')

    if (tokenHash && type === 'recovery') {
      supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'recovery' })
        .then(({ error: err }) => {
          setStatus(err ? 'invalid' : 'form')
        })
      return
    }

    // Hash-based flow: Supabase appends #access_token=...&type=recovery
    const hash = window.location.hash
    if (!hash.includes('access_token')) {
      setStatus('invalid')
      return
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setStatus('form')
    })

    // Fallback if the auth state change doesn't fire within 4 seconds
    const fallback = setTimeout(() => setStatus('invalid'), 4000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(fallback)
    }
  }, [])

  const confirmTouched = confirmPassword.length > 0
  const passwordsMatch = !confirmTouched || password === confirmPassword

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    if (password !== confirmPassword) { setError("Passwords don't match"); return }
    setError('')
    setLoading(true)
    const { error: err } = await supabase.auth.updateUser({ password })
    if (err) {
      setError(err.message)
      setLoading(false)
    } else {
      setStatus('success')
    }
  }

  return (
    <div style={{ minHeight: '100dvh', background: LINEN }}>
      <nav style={{ height: '56px', borderBottom: `0.5px solid ${BORDER}`, display: 'flex', alignItems: 'center', padding: '0 24px', background: LINEN }}>
        <a href="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '20px', color: INK, fontWeight: 300 }}>daye</span>
        </a>
      </nav>

      <div style={{ maxWidth: '440px', margin: '0 auto', padding: '80px 24px 48px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        {status === 'loading' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div className="animate-pulse" style={{ width: '48px', height: '3px', borderRadius: '2px', background: LAVENDER }} />
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: MUTED }}>Just a moment…</p>
          </div>
        )}

        {status === 'invalid' && (
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 300, fontSize: 'clamp(28px, 5vw, 40px)', color: INK, lineHeight: 1.2, margin: '0 0 20px 0' }}>
              This link has expired.
            </h1>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', color: MUTED, lineHeight: 1.65, margin: '0 0 40px 0', maxWidth: '340px' }}>
              Password reset links expire after one hour. Request a new one from the sign-in screen.
            </p>
            <a
              href="/"
              style={{ display: 'inline-block', background: INK, color: 'white', borderRadius: '10px', padding: '13px 28px', fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 500, textDecoration: 'none', letterSpacing: '0.01em' }}
            >
              Back to sign in
            </a>
          </div>
        )}

        {status === 'form' && (
          <div style={{ width: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <h1 style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 300, fontSize: 'clamp(28px, 5vw, 40px)', color: INK, lineHeight: 1.2, margin: '0 0 12px 0' }}>
                Choose a new password.
              </h1>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: MUTED, lineHeight: 1.6, margin: 0 }}>
                Must be at least 8 characters.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="password"
                placeholder="New password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError('') }}
                required
                autoFocus
                autoComplete="new-password"
                style={inputStyle}
              />
              <div>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={e => { setConfirmPassword(e.target.value); setError('') }}
                  required
                  autoComplete="new-password"
                  style={{
                    ...inputStyle,
                    borderColor: confirmTouched ? (passwordsMatch ? '#22c55e' : '#c0392b') : BORDER,
                  }}
                />
                {confirmTouched && !passwordsMatch && (
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: '#c0392b', margin: '6px 0 0', lineHeight: 1.4 }}>
                    Passwords don't match
                  </p>
                )}
              </div>

              {error && (
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: '#c0392b', margin: 0 }}>{error}</p>
              )}

              <button
                type="submit"
                disabled={loading || (confirmTouched && !passwordsMatch)}
                style={{ width: '100%', background: INK, color: 'white', border: 'none', borderRadius: '10px', padding: '13px 24px', fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 500, cursor: loading ? 'default' : 'pointer', opacity: (loading || (confirmTouched && !passwordsMatch)) ? 0.7 : 1, marginTop: '4px', letterSpacing: '0.01em' }}
              >
                {loading ? 'Updating…' : 'Update password'}
              </button>
            </form>
          </div>
        )}

        {status === 'success' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ background: LAVENDER, borderRadius: '50%', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px' }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 10L8.5 14.5L16 7" stroke={INK} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 300, fontSize: 'clamp(28px, 5vw, 40px)', color: INK, lineHeight: 1.2, margin: '0 0 16px 0' }}>
              Password updated.
            </h1>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', color: MUTED, lineHeight: 1.65, margin: '0 0 40px 0', maxWidth: '320px' }}>
              You can now sign in with your new password.
            </p>
            <a
              href="/"
              style={{ display: 'inline-block', background: INK, color: 'white', borderRadius: '10px', padding: '13px 28px', fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 500, textDecoration: 'none', letterSpacing: '0.01em' }}
            >
              Sign in
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

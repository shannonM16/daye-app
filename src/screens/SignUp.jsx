import { useState } from 'react'
import { supabase } from '../lib/supabase'

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

export default function SignUp() {
  const [loading, setLoading] = useState(false)

  const handleGoogle = async () => {
    setLoading(true)
    localStorage.setItem('oauth_redirect_pending', 'true')
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: 'https://withdaye.com' },
    })
  }

  return (
    <div className="screen">
      <div className="flex-1 overflow-y-auto flex flex-col justify-center" style={{ padding: '0 4px' }}>

        {/* Wordmark */}
        <div className="flex flex-col items-center mb-10">
          <h1
            style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--color-ink)' }}
            className="text-[36px] font-light leading-none mb-5"
          >
            daye
          </h1>
          <div className="w-10 h-px" style={{ background: 'var(--color-border-dark)' }} />
        </div>

        {/* Heading */}
        <h2 style={{
          fontFamily: 'var(--font-serif)',
          fontStyle: 'italic',
          fontSize: '28px',
          fontWeight: 300,
          color: 'var(--color-ink)',
          textAlign: 'center',
          marginBottom: '12px',
          lineHeight: 1.2,
        }}>
          Let's get started.
        </h2>

        {/* Subtext */}
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '14px',
          color: 'var(--color-muted)',
          textAlign: 'center',
          lineHeight: 1.6,
          maxWidth: '300px',
          margin: '0 auto 40px',
        }}>
          Sign in to save your progress and access your plan from any device.
        </p>

        {/* Google button */}
        <button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl text-sm font-medium transition-all active:scale-[0.98] disabled:opacity-60"
          style={{ background: 'var(--color-white)', color: 'var(--color-ink)', border: '1px solid var(--color-border)' }}
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-stone-200 border-t-stone-600 rounded-full animate-spin" />
          ) : (
            <GoogleLogo />
          )}
          {loading ? 'Connecting...' : 'Continue with Google'}
        </button>

      </div>
    </div>
  )
}

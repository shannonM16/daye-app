import { useState } from 'react'

function AppleLogo() {
  return (
    <svg width="17" height="20" viewBox="0 0 24 24" fill="white">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.32.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.37 2.83zM13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  )
}

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

function ProviderBadge({ provider }) {
  if (provider === 'apple') {
    return (
      <div style={{
        width: '52px',
        height: '52px',
        borderRadius: '50%',
        background: '#1a1a1a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 20px',
        flexShrink: 0,
      }}>
        <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: '20px', color: 'white', lineHeight: 1 }}>A</span>
      </div>
    )
  }
  return (
    <div style={{
      width: '52px',
      height: '52px',
      borderRadius: '50%',
      background: '#4285F4',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 20px',
      flexShrink: 0,
    }}>
      <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '22px', color: 'white', lineHeight: 1 }}>G</span>
    </div>
  )
}

function isValidEmail(val) {
  return val.includes('@') && val.includes('.') && val.indexOf('@') < val.lastIndexOf('.')
}

export default function SignUp({ onComplete }) {
  const [firstName, setFirstName] = useState('')
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState(false)
  const [socialLoading, setSocialLoading] = useState(null)
  const [socialPrompt, setSocialPrompt] = useState(null) // { provider }
  const [socialName, setSocialName] = useState('')
  const [socialEmail, setSocialEmail] = useState('')
  const [socialEmailError, setSocialEmailError] = useState(false)

  // ── Manual form ────────────────────────────────────────────────────

  const canSubmit = firstName.trim().length > 0 && isValidEmail(email)

  const handleSubmit = () => {
    if (!firstName.trim()) return
    if (!isValidEmail(email)) {
      setEmailError(true)
      return
    }
    onComplete({ firstName: firstName.trim(), email: email.trim() })
  }

  const handleKey = (e) => {
    if (e.key === 'Enter') handleSubmit()
  }

  // ── Social login ───────────────────────────────────────────────────

  const handleApple = () => {
    setSocialLoading('apple')
    setTimeout(() => {
      setSocialLoading(null)
      setSocialName('')
      setSocialEmail('')
      setSocialEmailError(false)
      setSocialPrompt({ provider: 'apple' })
    }, 800)
  }

  const handleGoogle = () => {
    setSocialLoading('google')
    setTimeout(() => {
      setSocialLoading(null)
      setSocialName('')
      setSocialEmail('')
      setSocialEmailError(false)
      setSocialPrompt({ provider: 'google' })
    }, 800)
  }

  const handleSocialContinue = () => {
    if (!socialName.trim()) return
    if (!isValidEmail(socialEmail)) {
      setSocialEmailError(true)
      return
    }
    onComplete({ firstName: socialName.trim(), email: socialEmail.trim() })
  }

  const handleSocialKey = (e) => {
    if (e.key === 'Enter') handleSocialContinue()
  }

  // ── Social confirmation screen ─────────────────────────────────────

  if (socialPrompt) {
    const canSocialSubmit = socialName.trim().length > 0 && isValidEmail(socialEmail)

    return (
      <div className="screen">
        <div className="flex-1 overflow-y-auto flex flex-col justify-center" style={{ paddingTop: '24px' }}>
          <ProviderBadge provider={socialPrompt.provider} />

          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            fontSize: '24px',
            fontWeight: 400,
            color: 'var(--color-ink)',
            textAlign: 'center',
            marginBottom: '8px',
            lineHeight: 1.2,
          }}>
            Almost there.
          </h2>

          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            color: 'var(--color-muted)',
            textAlign: 'center',
            marginBottom: '32px',
            lineHeight: 1.5,
          }}>
            Just confirm a couple of details to personalise your plan.
          </p>

          <div className="space-y-3">
            <input
              type="text"
              value={socialName}
              onChange={(e) => setSocialName(e.target.value)}
              onKeyDown={handleSocialKey}
              placeholder="Your first name"
              className="input-field"
              autoFocus
            />
            <div>
              <input
                type="email"
                value={socialEmail}
                onChange={(e) => { setSocialEmail(e.target.value); setSocialEmailError(false) }}
                onKeyDown={handleSocialKey}
                placeholder="Your email address"
                className="input-field"
              />
              {socialEmailError && (
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--color-muted)', marginTop: '6px' }}>
                  Please enter a valid email address
                </p>
              )}
            </div>
          </div>

          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '11px',
            color: 'var(--color-muted)',
            textAlign: 'center',
            marginTop: '16px',
            opacity: 0.7,
            lineHeight: 1.5,
          }}>
            We only use your email to save your plan. No spam, ever.
          </p>
        </div>

        <div className="flex-shrink-0 pt-4 space-y-2">
          <button
            className="btn-primary"
            onClick={handleSocialContinue}
            disabled={!canSocialSubmit}
          >
            Start with Daye
          </button>
          <button
            onClick={() => setSocialPrompt(null)}
            style={{
              width: '100%',
              background: 'none',
              border: 'none',
              fontFamily: 'var(--font-sans)',
              fontSize: '13px',
              color: 'var(--color-muted)',
              cursor: 'pointer',
              padding: '8px 0',
              textAlign: 'center',
            }}
          >
            Use a different method
          </button>
        </div>
      </div>
    )
  }

  // ── Main sign-up screen ────────────────────────────────────────────

  return (
    <div className="screen">
      <div className="flex-1 overflow-y-auto flex flex-col">
        {/* Wordmark */}
        <div className="flex flex-col items-center pt-10 pb-8">
          <h1
            style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--color-ink)' }}
            className="text-[36px] font-light leading-none mb-5"
          >
            daye
          </h1>
          <div className="w-10 h-px" style={{ background: 'var(--color-border-dark)' }} />
        </div>

        {/* Tagline */}
        <p className="text-center text-sm mb-8" style={{ color: 'var(--color-muted)' }}>
          Your daily focus plan, built around you.
        </p>

        {/* Social login */}
        <div className="space-y-2.5 mb-6">
          <button
            onClick={handleApple}
            disabled={socialLoading !== null}
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl text-sm font-medium transition-all active:scale-[0.98] disabled:opacity-60"
            style={{ background: 'var(--color-ink)', color: 'var(--color-white)' }}
          >
            {socialLoading === 'apple' ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <AppleLogo />
            )}
            {socialLoading === 'apple' ? 'Connecting...' : 'Continue with Apple'}
          </button>

          <button
            onClick={handleGoogle}
            disabled={socialLoading !== null}
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl text-sm font-medium transition-all active:scale-[0.98] disabled:opacity-60"
            style={{ background: 'var(--color-white)', color: 'var(--color-ink)', border: '1px solid var(--color-border)' }}
          >
            {socialLoading === 'google' ? (
              <div className="w-4 h-4 border-2 border-stone-200 border-t-stone-600 rounded-full animate-spin" />
            ) : (
              <GoogleLogo />
            )}
            {socialLoading === 'google' ? 'Connecting...' : 'Continue with Google'}
          </button>

          <p className="text-center text-xs pt-0.5" style={{ color: 'var(--color-muted)', opacity: 0.7 }}>
            We only use your email to save your plan. No spam.
          </p>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
          <span className="text-[11px] uppercase tracking-widest" style={{ color: 'var(--color-muted)', opacity: 0.5 }}>or</span>
          <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
        </div>

        {/* Manual fields */}
        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-medium uppercase tracking-widest block mb-1.5" style={{ color: 'var(--color-muted)' }}>
              First name
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Your first name"
              className="input-field"
            />
          </div>
          <div>
            <label className="text-[11px] font-medium uppercase tracking-widest block mb-1.5" style={{ color: 'var(--color-muted)' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setEmailError(false) }}
              onKeyDown={handleKey}
              placeholder="you@example.com"
              className="input-field"
            />
            {emailError && (
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--color-muted)', marginTop: '6px' }}>
                Please enter a valid email address
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex-shrink-0 pt-4">
        <button className="btn-primary" onClick={handleSubmit} disabled={!canSubmit}>
          Continue
        </button>
      </div>
    </div>
  )
}

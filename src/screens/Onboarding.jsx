import { useState } from 'react'
import { supabase } from '../lib/supabase'
import OnboardingCorporate from './OnboardingCorporate'
import OnboardingSelfEmployed from './OnboardingSelfEmployed'
import OnboardingStudent from './OnboardingStudent'
import OnboardingFiguringItOut from './OnboardingFiguringItOut'

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

const SITUATIONS = [
  { id: 'corporate', label: 'Corporate', sub: 'In a company or organisation' },
  { id: 'self-employed', label: 'Self-employed', sub: 'Freelance, founder, or solo' },
  { id: 'student', label: 'Student', sub: 'Full-time or part-time study' },
  { id: 'figuring-it-out', label: 'Figuring it out', sub: 'Between things or in flux' },
]

function SituationPicker({ onSelect, onBack }) {
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleGoogle = async () => {
    setGoogleLoading(true)
    localStorage.setItem('oauth_redirect_pending', 'true')
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: 'https://withdaye.com' },
    })
  }

  return (
    <div className="screen">
      <div className="flex-1 overflow-y-auto">
        <div className="mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm font-medium mb-5 transition-colors"
            style={{ color: 'var(--color-muted)' }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 13L5 8l5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back
          </button>

          <span
            style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--color-muted)' }}
            className="text-[13px] font-light block mb-4"
          >
            daye
          </span>

          <h1
            style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--color-ink)' }}
            className="text-[26px] font-light leading-tight mb-1"
          >
            Let's get started
          </h1>
          <p className="text-[13px] mb-5" style={{ color: 'var(--color-muted)' }}>
            Sign in to save your progress and access your plan from any device.
          </p>
        </div>

        <button
          onClick={handleGoogle}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-2.5 mb-5"
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '14px',
            fontWeight: 500,
            color: 'var(--color-ink)',
            background: '#fff',
            border: '1.5px solid var(--color-ink)',
            borderRadius: '10px',
            padding: '12px 16px',
            cursor: googleLoading ? 'not-allowed' : 'pointer',
            opacity: googleLoading ? 0.6 : 1,
            transition: 'opacity 0.15s',
          }}
        >
          <GoogleLogo />
          {googleLoading ? 'Redirecting…' : 'Continue with Google'}
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--color-muted)', whiteSpace: 'nowrap' }}>
            or continue without an account
          </span>
          <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
        </div>

        <div className="space-y-2">
          {SITUATIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => onSelect(s.id)}
              className="select-card w-full text-left"
            >
              <div className="font-medium text-sm" style={{ color: 'var(--color-ink)' }}>{s.label}</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>{s.sub}</div>
            </button>
          ))}
        </div>
      </div>

      <p className="flex-shrink-0 text-center text-xs pt-4" style={{ color: 'var(--color-muted)', opacity: 0.6 }}>
        You can update this any time in settings.
      </p>
    </div>
  )
}

export default function Onboarding({ onComplete, onBack }) {
  const [userType, setUserType] = useState(null)

  const handlePathBack = () => setUserType(null)

  if (!userType) {
    return <SituationPicker onSelect={setUserType} onBack={onBack} />
  }

  const wrap = (profile) => onComplete({ ...profile, userType })

  if (userType === 'corporate') return <OnboardingCorporate onComplete={wrap} onBack={handlePathBack} />
  if (userType === 'self-employed') return <OnboardingSelfEmployed onComplete={wrap} onBack={handlePathBack} />
  if (userType === 'student') return <OnboardingStudent onComplete={wrap} onBack={handlePathBack} />
  if (userType === 'figuring-it-out') return <OnboardingFiguringItOut onComplete={wrap} onBack={handlePathBack} />

  return null
}

import { useState } from 'react'
import OnboardingCorporate from './OnboardingCorporate'
import OnboardingSelfEmployed from './OnboardingSelfEmployed'
import OnboardingStudent from './OnboardingStudent'
import OnboardingFiguringItOut from './OnboardingFiguringItOut'

const SITUATIONS = [
  { id: 'corporate', label: 'Corporate', sub: 'In a company or organisation' },
  { id: 'self-employed', label: 'Self-employed', sub: 'Freelance, founder, or solo' },
  { id: 'student', label: 'Student', sub: 'Full-time or part-time study' },
  { id: 'figuring-it-out', label: 'Figuring it out', sub: 'Between things or in flux' },
]

function SituationPicker({ onSelect, onBack }) {
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
            What's your situation?
          </h1>
          <p className="text-[13px]" style={{ color: 'var(--color-muted)' }}>
            This tailors everything to what actually matters for you.
          </p>
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

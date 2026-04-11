import { useState } from 'react'
import { getInsight } from '../utils/patternEngine'

const MOOD_OPTIONS = [
  { id: 'focused', label: 'Focused' },
  { id: 'anxious', label: 'Anxious' },
  { id: 'flat', label: 'Flat' },
  { id: 'motivated', label: 'Motivated' },
  { id: 'overwhelmed', label: 'Overwhelmed' },
  { id: 'clear-headed', label: 'Clear-headed' },
  { id: 'tired', label: 'Tired' },
  { id: 'stressed', label: 'Stressed' },
]

const SLEEP_OPTIONS = [
  { id: 'great', label: 'Great' },
  { id: 'ok', label: 'OK' },
  { id: 'poor', label: 'Poor' },
  { id: 'terrible', label: 'Terrible' },
]

const DAY_TYPES = [
  { id: 'deep-work', label: 'Deep work' },
  { id: 'lots-of-meetings', label: 'Lots of meetings' },
  { id: 'low-energy-day', label: 'Low energy day' },
  { id: 'reactive-firefighting', label: 'Reactive / firefighting' },
]

const ENERGY_LABELS = ['', 'Depleted', 'Low', 'Okay', 'Good', 'Charged']

const SE_PRESSURE_BY_TYPE = {
  'freelance-creative': [
    { id: 'client-deadline', label: 'Client deadline today' },
    { id: 'waiting-on-feedback', label: 'Waiting on feedback' },
    { id: 'invoice-overdue', label: 'Invoice overdue' },
    { id: 'slow-period', label: 'Slow period for work' },
    { id: 'difficult-client', label: 'Difficult client situation' },
    { id: 'creative-block', label: 'Creative block' },
    { id: 'none', label: 'None right now' },
  ],
  'consultant': [
    { id: 'proposal-deadline', label: 'Proposal deadline' },
    { id: 'client-deliverable', label: 'Client deliverable due' },
    { id: 'pipeline-quiet', label: 'Pipeline feeling quiet' },
    { id: 'scope-creep', label: 'Scope creep on a project' },
    { id: 'contract-negotiation', label: 'Contract negotiation' },
    { id: 'client-at-risk', label: 'Key client at risk' },
    { id: 'none', label: 'None right now' },
  ],
  'coach-trainer': [
    { id: 'session-today', label: 'Session to deliver today' },
    { id: 'enrolments-low', label: 'Programme enrolments low' },
    { id: 'difficult-client-coach', label: 'Difficult client conversation' },
    { id: 'course-launch-pressure', label: 'Course launch pressure' },
    { id: 'content-deadline', label: 'Content deadline' },
    { id: 'discovery-calls-needed', label: 'Discovery calls needed' },
    { id: 'none', label: 'None right now' },
  ],
  'content-creator': [
    { id: 'post-due', label: 'Post due today' },
    { id: 'brand-deal-deadline', label: 'Brand deal deadline' },
    { id: 'engagement-dropping', label: 'Views or followers dropping' },
    { id: 'creative-block-content', label: 'Creative block' },
    { id: 'consistency-pressure', label: 'Consistency pressure' },
    { id: 'sponsorship-negotiation', label: 'Sponsorship negotiation' },
    { id: 'none', label: 'None right now' },
  ],
  'product-saas': [
    { id: 'shipping-today', label: 'Shipping a feature today' },
    { id: 'bug-reported', label: 'User reported a bug' },
    { id: 'cash-pressure', label: 'Runway or cash pressure' },
    { id: 'no-new-signups', label: 'No new signups' },
    { id: 'investor-meeting', label: 'Investor meeting' },
    { id: 'launch-deadline', label: 'Launch deadline' },
    { id: 'none', label: 'None right now' },
  ],
  'agency-owner': [
    { id: 'client-at-risk-agency', label: 'Client unhappy or at risk' },
    { id: 'team-issue', label: 'Team issue or conflict' },
    { id: 'cash-flow', label: 'Cash flow pressure' },
    { id: 'new-business-urgent', label: 'New business needed urgently' },
    { id: 'key-deadline-agency', label: 'Key deadline today' },
    { id: 'hiring-pressure', label: 'Hiring pressure' },
    { id: 'none', label: 'None right now' },
  ],
  'trades-service': [
    { id: 'job-overrun', label: 'Job running over time' },
    { id: 'diary-quiet', label: 'Booking diary quiet' },
    { id: 'invoice-unpaid', label: 'Invoice unpaid' },
    { id: 'materials-issue', label: 'Materials issue' },
    { id: 'difficult-customer', label: 'Difficult customer' },
    { id: 'pricing-pressure', label: 'Pricing pressure' },
    { id: 'none', label: 'None right now' },
  ],
}

function getPressureOptions(userType, selfEmployedType) {
  switch (userType) {
    case 'self-employed': {
      if (selfEmployedType && selfEmployedType !== 'other') {
        const typeOptions = SE_PRESSURE_BY_TYPE[selfEmployedType]
        if (typeOptions) return typeOptions
      }
      return [
        { id: 'invoice-overdue', label: 'Invoice overdue or unpaid' },
        { id: 'proposal-deadline', label: 'Proposal or pitch deadline' },
        { id: 'client-at-risk', label: 'Client unhappy or at risk' },
        { id: 'cash-running-low', label: 'Cash running low' },
        { id: 'big-pitch-today', label: 'Big pitch or sales call' },
        { id: 'pipeline-quiet', label: 'Pipeline feeling quiet' },
        { id: 'scope-creep', label: 'Scope creep on a project' },
        { id: 'none', label: 'None right now' },
      ]
    }
    case 'student':
      return [
        { id: 'exam-coming', label: 'Exam coming up' },
        { id: 'assignment-due', label: 'Assignment due soon' },
        { id: 'behind-on-notes', label: 'Behind on reading or notes' },
        { id: 'group-project-stress', label: 'Group project stress' },
        { id: 'dissertation-deadline', label: 'Dissertation or thesis deadline' },
        { id: 'placement-application', label: 'Placement or job application' },
        { id: 'resit-needed', label: 'Resit or catch-up needed' },
        { id: 'none', label: 'None right now' },
      ]
    case 'figuring-it-out':
      return [
        { id: 'money-tight', label: 'Money is getting tight' },
        { id: 'decision-soon', label: 'Need to make a decision soon' },
        { id: 'feeling-stuck', label: 'Feeling really stuck' },
        { id: 'comparison-spiral', label: 'Comparison spiral or self-doubt' },
        { id: 'pressure-from-others', label: 'Pressure from family or friends' },
        { id: 'opportunity-deadline', label: 'Application or opportunity deadline' },
        { id: 'unsure-today', label: 'Unsure what to do today' },
        { id: 'none', label: 'None right now' },
      ]
    default:
      return [
        { id: 'deadline-deliverable', label: 'Deadline on a deliverable' },
        { id: 'difficult-conversation', label: 'Difficult conversation today' },
        { id: 'big-presentation', label: 'Big presentation' },
        { id: 'performance-review', label: 'Performance review coming' },
        { id: 'budget-sign-off', label: 'Budget or sign-off needed' },
        { id: 'stakeholder-pressure', label: 'Stakeholder pressure' },
        { id: 'political-situation', label: 'Political situation at work' },
        { id: 'none', label: 'None right now' },
      ]
  }
}

function SectionLabel({ children }) {
  return (
    <label className="text-[11px] font-medium uppercase tracking-widest block mb-1.5" style={{ color: 'var(--color-muted)' }}>
      {children}
    </label>
  )
}

function getGreeting(firstName) {
  const hour = new Date().getHours()
  const time = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'
  return { time: `Good ${time}`, name: firstName }
}

function GridBtn({ label, active, onClick, amber }) {
  return (
    <button
      onClick={onClick}
      className="w-full py-1.5 px-3 rounded-full text-xs font-medium transition-all duration-150 active:scale-95 text-left"
      style={{
        border: '0.5px solid',
        borderColor: amber ? '#fcd34d' : active ? 'var(--color-ink)' : 'var(--color-border)',
        background: amber ? '#fffbeb' : active ? 'var(--color-ink)' : 'var(--color-white)',
        color: amber ? '#92400e' : active ? 'var(--color-white)' : 'var(--color-ink)',
      }}
    >
      {label}
    </button>
  )
}

function StepDots({ step }) {
  return (
    <div className="flex items-center justify-center gap-2">
      <div
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: step === 1 ? 'var(--color-ink)' : 'var(--color-border)',
          transition: 'background 0.2s',
        }}
      />
      <div
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: step === 2 ? 'var(--color-ink)' : 'var(--color-border)',
          transition: 'background 0.2s',
        }}
      />
    </div>
  )
}

export default function CheckIn({ user, userProfile, initialValues, history = [], streakCount = 0, onSubmit, onViewHistory, onViewSettings }) {
  const selfEmployedType = userProfile?.selfEmployedType || userProfile?.workType || null
  const pressureOptions = getPressureOptions(userProfile?.userType, selfEmployedType)

  const [step, setStep] = useState(1)

  const [energy, setEnergy] = useState(initialValues?.energy || 3)
  const [mood, setMood] = useState(initialValues?.mood || null)
  const [sleep, setSleep] = useState(initialValues?.sleep || null)
  const [dayType, setDayType] = useState(initialValues?.dayType || null)
  const [dayTypeAutoSet, setDayTypeAutoSet] = useState(null)
  const [pressure, setPressure] = useState(initialValues?.pressure || [])

  const handleEnergyChange = (val) => {
    setEnergy(val)
    if (val <= 2) {
      if (dayTypeAutoSet !== null || dayType === null) {
        setDayType('low-energy-day')
        setDayTypeAutoSet('energy')
      }
    } else if (dayTypeAutoSet === 'energy') {
      setDayType(null)
      setDayTypeAutoSet(null)
    }
  }

  const handleMoodChange = (id) => {
    setMood(id)
    if (['overwhelmed', 'anxious'].includes(id)) {
      if (dayTypeAutoSet !== null || dayType === null) {
        setDayType('reactive-firefighting')
        setDayTypeAutoSet('mood')
      }
    } else if (dayTypeAutoSet === 'mood') {
      setDayType(null)
      setDayTypeAutoSet(null)
    }
  }

  const handleDayTypeClick = (id) => {
    setDayType(id)
    setDayTypeAutoSet(null)
  }

  const togglePressure = (id) => {
    if (id === 'none') {
      setPressure(['none'])
      return
    }
    setPressure((prev) => {
      const without = prev.filter((p) => p !== 'none')
      return without.includes(id) ? without.filter((p) => p !== id) : [...without, id]
    })
  }

  const canAdvance = mood && sleep
  const canSubmit = dayType && pressure.length > 0

  const handleSubmit = () => {
    if (!canSubmit) return
    onSubmit({ energy, mood, sleep, dayType, pressure })
  }

  const firstName = user?.firstName || ''
  const greeting = firstName ? getGreeting(firstName) : null

  // Insight — guard: only compute if history is long enough
  const insight = history.length >= 3 ? getInsight(history) : ''

  // Install banner — show after 2+ plans, unless dismissed
  const [installDismissed, setInstallDismissed] = useState(
    () => localStorage.getItem('daye_install_dismissed') === '1'
  )
  const showInstallBanner = history.length >= 2 && !installDismissed
  const handleDismissInstall = () => {
    localStorage.setItem('daye_install_dismissed', '1')
    setInstallDismissed(true)
  }

  return (
    <div className="screen">
      <div className="flex-1 overflow-y-auto space-y-4">
        {/* Header */}
        <div>
          {/* Wordmark row with icon buttons */}
          <div className="flex items-center justify-between mb-3">
            <span
              style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--color-muted)' }}
              className="text-[13px] font-light"
            >
              daye
            </span>
            <div className="flex items-center" style={{ marginRight: '-8px' }}>
              {onViewSettings && (
                <div
                  onClick={onViewSettings}
                  role="button"
                  aria-label="Profile and settings"
                  className="flex items-center justify-center cursor-pointer"
                  style={{ width: '40px', height: '40px' }}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ color: 'var(--color-muted)' }}>
                    <circle cx="10" cy="7.5" r="3" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M3.5 17.5c0-3.59 2.91-6.5 6.5-6.5s6.5 2.91 6.5 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
              )}
              {onViewHistory && (
                <div
                  onClick={onViewHistory}
                  role="button"
                  aria-label="View history"
                  className="flex items-center justify-center cursor-pointer"
                  style={{ width: '40px', height: '40px' }}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ color: 'var(--color-muted)' }}>
                    <rect x="2.75" y="4.75" width="14.5" height="12.5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M2.75 8.25h14.5" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M6.5 2.75v3M13.5 2.75v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {greeting ? (
            <>
              <p className="text-[24px] leading-tight font-light" style={{ color: 'var(--color-ink)' }}>
                {greeting.time},
              </p>
              <p className="text-[24px] leading-tight font-medium mb-1" style={{ color: 'var(--color-ink)' }}>
                {greeting.name}.
              </p>
              <p className="text-sm" style={{ color: 'var(--color-muted)' }}>How's today looking?</p>
            </>
          ) : (
            <h1 className="text-[24px] font-medium leading-tight" style={{ color: 'var(--color-ink)' }}>
              How's today looking?
            </h1>
          )}
        </div>

        {/* Step dots */}
        <StepDots step={step} />

        {step === 1 && (
          <>
            {/* Streak — only renders if 2 or more consecutive days */}
            {streakCount >= 2 && (
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-full self-start"
                style={{
                  background: 'var(--color-linen)',
                  border: '0.5px solid var(--color-border)',
                  display: 'inline-flex',
                }}
              >
                <span className="text-sm" style={{ color: 'var(--color-ink)' }}>
                  {streakCount} day streak
                </span>
              </div>
            )}

            {/* Insight card — only renders if history >= 3 days AND insight is non-empty */}
            {history.length >= 3 && insight ? (
              <div
                className="rounded-2xl px-4 py-3"
                style={{
                  background: 'var(--color-white)',
                  border: '1px solid var(--color-border)',
                  borderLeft: '3px solid var(--color-lavender)',
                }}
              >
                <p className="text-[11px] font-medium uppercase tracking-widest mb-1" style={{ color: 'var(--color-muted)' }}>
                  Pattern
                </p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-ink)' }}>{insight}</p>
              </div>
            ) : null}

            {/* Energy */}
            <div>
              <div className="flex items-baseline justify-between mb-2">
                <SectionLabel>Energy</SectionLabel>
                <span className="text-xs -mt-2" style={{ color: 'var(--color-muted)' }}>{ENERGY_LABELS[energy]}</span>
              </div>
              <input
                type="range"
                min={1}
                max={5}
                value={energy}
                onChange={(e) => handleEnergyChange(Number(e.target.value))}
              />
              <div className="flex justify-between mt-0.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => handleEnergyChange(n)}
                    className="active:scale-110 transition-transform duration-100"
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '13px',
                      fontWeight: energy === n ? 500 : 400,
                      color: energy === n ? 'var(--color-ink)' : 'var(--color-muted)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px 6px',
                      minWidth: '28px',
                      textAlign: 'center',
                      lineHeight: 1,
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Mood */}
            <div>
              <SectionLabel>Mood</SectionLabel>
              <div className="grid grid-cols-2 gap-1.5">
                {MOOD_OPTIONS.map((m) => (
                  <GridBtn key={m.id} label={m.label} active={mood === m.id} onClick={() => handleMoodChange(m.id)} />
                ))}
              </div>
            </div>

            {/* Sleep */}
            <div>
              <SectionLabel>Sleep last night</SectionLabel>
              <div className="grid grid-cols-2 gap-1.5">
                {SLEEP_OPTIONS.map((s) => (
                  <GridBtn key={s.id} label={s.label} active={sleep === s.id} onClick={() => setSleep(s.id)} />
                ))}
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            {/* Day type */}
            <div>
              <SectionLabel>Day type</SectionLabel>
              <div className="grid grid-cols-2 gap-1.5">
                {DAY_TYPES.map((dt) => (
                  <GridBtn
                    key={dt.id}
                    label={dt.label}
                    active={dayType === dt.id}
                    amber={dayType === dt.id && dayTypeAutoSet !== null}
                    onClick={() => handleDayTypeClick(dt.id)}
                  />
                ))}
              </div>
              {dayTypeAutoSet && (
                <p className="text-xs mt-1.5" style={{ color: '#92400e' }}>
                  {dayTypeAutoSet === 'energy' ? 'Pre-selected based on your energy' : 'Pre-selected based on your mood'}
                </p>
              )}
            </div>

            {/* Pressure */}
            <div>
              <SectionLabel>Pressure today</SectionLabel>
              <div className="grid grid-cols-2 gap-1.5">
                {pressureOptions.map((po) => (
                  <GridBtn
                    key={po.id}
                    label={po.label}
                    active={pressure.includes(po.id)}
                    onClick={() => togglePressure(po.id)}
                  />
                ))}
              </div>
            </div>

            {/* PWA install banner — shown after 2+ plans, dismissable, never blocking */}
            {showInstallBanner && (
              <div
                className="flex items-start justify-between gap-3"
                style={{
                  background: 'var(--color-white)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '12px',
                  padding: '14px 16px',
                }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: 'var(--color-ink)' }}>
                    Add Daye to your home screen
                  </p>
                  <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                    Open your browser menu and tap Add to Home Screen.
                  </p>
                </div>
                <button
                  onClick={handleDismissInstall}
                  className="flex-shrink-0 flex items-center justify-center mt-0.5"
                  style={{ width: '24px', height: '24px', color: 'var(--color-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  aria-label="Dismiss"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex-shrink-0 pt-4 space-y-2">
        {step === 1 && (
          <button className="btn-primary" onClick={() => setStep(2)}>
            Next
          </button>
        )}
        {step === 2 && (
          <>
            <button className="btn-primary" onClick={handleSubmit}>
              Build my plan
            </button>
            <button
              className="btn-ghost"
              onClick={() => setStep(1)}
            >
              Back
            </button>
          </>
        )}
      </div>
    </div>
  )
}

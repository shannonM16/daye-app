import { useState, useEffect } from 'react'
import { getStateLevel } from '../utils/stateDetection'

const IC_CHIPS = {
  marketing: ['Write a brief', 'Draft copy', 'Review analytics', 'Schedule content', 'Research competitors', 'Reply to briefs', 'Admin'],
  sales: ['Prospect outreach', 'Follow up on leads', 'Prepare a pitch', 'Update CRM', 'Client call', 'Proposal writing', 'Admin'],
  engineering: ['Deep coding', 'Code review', 'Bug fixes', 'Write documentation', 'Team standup', 'Learning / research', 'Admin'],
  product: ['Write a spec', 'User research', 'Competitor analysis', 'Stakeholder update', 'Backlog grooming', 'Admin'],
  operations: ['Process review', 'Data analysis', 'Report writing', 'Vendor management', 'Project planning', 'Admin'],
  finance: ['Financial reporting', 'Data reconciliation', 'Budget tracking', 'Forecasting', 'Analysis', 'Admin'],
  design: ['Design work', 'User research', 'Prototyping', 'Feedback sessions', 'Design review', 'Admin'],
  'hr-people': ['Recruitment sourcing', 'Onboarding', 'HR admin', 'Policy updates', 'Employee comms', 'Admin'],
  legal: ['Document review', 'Legal research', 'Contract drafting', 'Client comms', 'Compliance checks', 'Admin'],
  executive: ['Strategy prep', 'Stakeholder meeting', 'Report review', 'Decision making', 'Team check-in', 'Admin'],
  other: ['Deep work', 'Team meetings', 'Planning', 'Communication', 'Review', 'Admin'],
}

const MANAGER_CHIPS = {
  marketing: ['Team check-in', 'Review campaign performance', 'Stakeholder update', 'Sign off creative', 'Strategy work', '1:1s', 'Hiring / interviews', 'Admin'],
  sales: ['Pipeline review', 'Coach the team', 'Forecast update', 'Key account call', 'Hiring', 'Strategy', 'Admin'],
  engineering: ['Sprint planning', 'Team 1:1s', 'Architecture review', 'Stakeholder update', 'Hiring', 'Process improvement', 'Admin'],
  product: ['Roadmap planning', 'Prioritisation', 'Stakeholder alignment', 'Team standup', 'User interviews', 'Strategy', 'Admin'],
  operations: ['Team standup', 'Process improvement', 'Stakeholder reporting', 'Vendor negotiations', 'Strategic planning', '1:1s', 'Admin'],
  finance: ['Budget review', 'Board reporting', 'Finance strategy', 'Team 1:1s', 'Stakeholder presentations', 'Audit prep', 'Admin'],
  design: ['Creative direction', 'Team feedback', 'Stakeholder sign-off', 'Design system', 'Hiring', 'Strategy', 'Admin'],
  'hr-people': ['Culture initiatives', 'Team 1:1s', 'HR strategy', 'Hiring process', 'Executive reporting', 'Wellbeing programmes', 'Admin'],
  legal: ['Risk oversight', 'Team management', 'Stakeholder advisory', 'Legal strategy', 'Regulatory reporting', 'Admin'],
  executive: ['Strategy sessions', 'Stakeholder meetings', 'Board prep', 'Budget reviews', 'Team leadership', 'External meetings', 'Admin'],
  other: ['Team meetings', '1:1s', 'Strategy work', 'Stakeholder update', 'Planning', 'Admin'],
}

const SE_CHIPS_UNIVERSAL = ['Chase or send an invoice', 'Admin and bookkeeping']

const SE_CHIPS_BY_TYPE = {
  'freelance-creative': [
    'Work on a client brief', 'Send a revision', 'Client feedback call',
    'New project pitch', 'Update portfolio', 'Plan next project',
    'Creative development time',
    ...SE_CHIPS_UNIVERSAL,
  ],
  'consultant': [
    'Write a proposal', 'Prepare a client workshop', 'Research and analysis',
    'Stakeholder call', 'New business outreach', 'Work on a deliverable',
    'Review a contract',
    ...SE_CHIPS_UNIVERSAL,
  ],
  'coach-trainer': [
    'Prepare a session', 'Follow up with a client', 'Create programme content',
    'Run a discovery call', 'Write a newsletter', 'Build or update a course',
    'Community engagement',
    ...SE_CHIPS_UNIVERSAL,
  ],
  'content-creator': [
    'Film or record content', 'Edit content', 'Write a caption or script',
    "Plan next week's content", 'Reply to comments and DMs',
    'Pitch a brand deal', 'Post something today', 'Batch create content',
    ...SE_CHIPS_UNIVERSAL,
  ],
  'product-saas': [
    'Build a feature', 'Fix a bug or issue', 'Talk to a user',
    'Write a spec or doc', 'Work on marketing', 'Investor or partner outreach',
    'Review metrics and data',
    ...SE_CHIPS_UNIVERSAL,
  ],
  'agency-owner': [
    'Client review or approval', 'Team check-in or 1:1', 'New business call',
    'Write a proposal', 'Financial review', 'Hiring or interviews',
    'Process improvement',
    ...SE_CHIPS_UNIVERSAL,
  ],
  'trades-service': [
    'Complete a job', 'Quote a new job', 'Order materials or supplies',
    'Reply to enquiries', 'Schedule upcoming work', 'Get or respond to a review',
    ...SE_CHIPS_UNIVERSAL,
  ],
}

const STUDENT_CHIPS = [
  'Study / revision', 'Assignment work', 'Research', 'Lectures / classes', 'Group work', 'Admin',
]

const LOW_EFFORT_CHIPS = [
  'Admin', 'Clear emails', 'Light review', 'Team catch-up', 'Reply to messages',
]

const FIGURING_IT_OUT_CHIPS = [
  'Explore options', 'Research a topic', 'Reach out to someone', 'Work on a CV or portfolio',
  'Apply for something', 'Have a useful conversation', 'Rest and reflect',
  'Learn something new', 'Take one small step', 'Admin and life tasks',
]

function getChips(userType, jobFunctions, seniority, selfEmployedType) {
  if (userType === 'student') return STUDENT_CHIPS
  if (userType === 'figuring-it-out') return FIGURING_IT_OUT_CHIPS
  if (userType === 'self-employed') {
    if (selfEmployedType && selfEmployedType !== 'other') {
      return SE_CHIPS_BY_TYPE[selfEmployedType] || SE_CHIPS_UNIVERSAL
    }
    return SE_CHIPS_UNIVERSAL
  }

  const isManager = seniority === 'manager' || seniority === 'director-plus'
  const chipSet = isManager ? MANAGER_CHIPS : IC_CHIPS
  const primaryFn = (Array.isArray(jobFunctions) ? jobFunctions : [jobFunctions])
    .find((jf) => jf && jf !== 'other') || 'other'
  return chipSet[primaryFn] || chipSet['other']
}

function GridChipBtn({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full py-2.5 px-3 rounded-xl text-[13px] font-normal transition-all duration-150 active:scale-95 text-left"
      style={{
        border: '0.5px solid',
        borderColor: active ? 'var(--color-ink)' : 'var(--color-border)',
        background: active ? 'var(--color-ink)' : 'var(--color-white)',
        color: active ? 'var(--color-white)' : 'var(--color-ink)',
      }}
    >
      {label}
    </button>
  )
}

function Spinner() {
  return (
    <div className="flex items-center justify-center py-6">
      <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--color-border)', borderTopColor: 'var(--color-ink)' }} />
    </div>
  )
}

async function parseTasksWithAI(text, userProfile) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('No API key configured')

  const fnLabel = Array.isArray(userProfile.jobFunctions)
    ? userProfile.jobFunctions[0]
    : (userProfile.jobFunction || userProfile.userType)

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: `Extract a concise task list from this work day description.

User context: ${fnLabel}, goal: ${userProfile.goal || 'general productivity'}

Their day: "${text}"

Return ONLY a JSON array of 3–6 short task strings (max 8 words each). No explanation, no markdown, just the raw JSON array.
Example: ["Finish the board deck", "1:1 with manager", "Clear email backlog"]`,
        },
      ],
    }),
  })

  if (!response.ok) throw new Error(`API error ${response.status}`)
  const data = await response.json()
  const content = data.content?.[0]?.text || ''
  const match = content.match(/\[[\s\S]*\]/)
  if (!match) throw new Error('No JSON array in response')
  return JSON.parse(match[0])
}

export default function TaskInput({ user, userProfile, checkInData, initialTasks, onSubmit, onBack, onTasksChange }) {
  const stateLevel = checkInData
    ? getStateLevel({ energy: checkInData.energy, sleep: checkInData.sleep, mood: checkInData.mood })
    : 'neutral'

  const selfEmployedType = userProfile?.selfEmployedType || userProfile?.workType || null
  const isOtherSE = userProfile?.userType === 'self-employed' && (!selfEmployedType || selfEmployedType === 'other')

  const allChips = getChips(
    userProfile?.userType,
    userProfile?.jobFunctions,
    userProfile?.seniority,
    selfEmployedType,
  )
  const chips =
    stateLevel === 'low'
      ? LOW_EFFORT_CHIPS
      : stateLevel === 'high'
      ? allChips
      : allChips.slice(0, 7)

  const [selected, setSelected] = useState(() => {
    const prev = initialTasks || []
    return prev.filter((t) => chips.includes(t))
  })
  const [freeText, setFreeText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    onTasksChange?.(selected)
  }, [selected]) // eslint-disable-line react-hooks/exhaustive-deps

  const toggleChip = (label) => {
    setSelected((prev) =>
      prev.includes(label) ? prev.filter((t) => t !== label) : [...prev, label]
    )
  }

  const canSubmit = selected.length > 0 || freeText.trim().length > 0

  const handleSubmit = async () => {
    if (!canSubmit) return

    let aiTasks = []
    if (freeText.trim().length > 0) {
      setLoading(true)
      setError(null)
      try {
        aiTasks = await parseTasksWithAI(freeText.trim(), userProfile || {})
      } catch (err) {
        console.error('AI parsing failed:', err)
        setError('Could not parse your text — using your selected tasks.')
      } finally {
        setLoading(false)
      }
    }

    const combined = [...selected]
    for (const t of aiTasks) {
      if (!combined.some((c) => c.toLowerCase().trim() === t.toLowerCase().trim())) {
        combined.push(t)
      }
    }

    onSubmit(combined.length > 0 ? combined : selected)
  }

  const firstName = user?.firstName || ''

  return (
    <div className="screen">
      <div className="flex-1 overflow-y-auto space-y-5">
        <div>
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-sm font-medium mb-4 transition-colors"
              style={{ color: 'var(--color-muted)' }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 13L5 8l5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back
            </button>
          )}

          <span
            style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--color-muted)' }}
            className="text-[13px] font-light block mb-2"
          >
            daye
          </span>

          <h1
            style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--color-ink)' }}
            className="text-[28px] font-normal leading-tight mb-1"
          >
            {firstName ? `What's on your plate, ${firstName}?` : "What's on your plate?"}
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-muted)' }}>Select your tasks for today.</p>
        </div>

        {stateLevel === 'low' && (
          <div className="rounded-2xl px-4 py-3" style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
            <p className="text-sm" style={{ color: '#92400e' }}>
              You flagged low energy today — we've kept things simple for you.
            </p>
          </div>
        )}

        {/* Role chips in 2-col grid */}
        <div>
          <label className="text-[11px] font-medium uppercase tracking-widest block mb-3" style={{ color: 'var(--color-muted)' }}>
            {stateLevel === 'low' ? 'Keep it simple today' : stateLevel === 'high' ? 'What are you working on today?' : 'Quick select'}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {chips.map((label) => (
              <GridChipBtn
                key={label}
                label={label}
                active={selected.includes(label)}
                onClick={() => toggleChip(label)}
              />
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
          <span className="text-[11px] uppercase tracking-widest" style={{ color: 'var(--color-muted)', opacity: 0.5 }}>or</span>
          <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
        </div>

        {/* Free text */}
        <div>
          <textarea
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            placeholder={stateLevel === 'low'
              ? "What is the one thing that really needs to happen today?"
              : isOtherSE
              ? "What are you working on today?"
              : "Or describe your day in your own words..."}
            rows={4}
            className="input-field resize-none"
            style={{ borderRadius: '14px' }}
          />
          {freeText.trim().length > 0 && (
            <p className="text-xs mt-1.5" style={{ color: 'var(--color-muted)' }}>We'll use AI to turn this into tasks.</p>
          )}
          {error && <p className="text-xs mt-1.5" style={{ color: '#b45309' }}>{error}</p>}
        </div>

        {loading && <Spinner />}
      </div>

      <div className="flex-shrink-0 pt-4">
        <button
          className="btn-primary"
          onClick={handleSubmit}
          disabled={!canSubmit || loading}
        >
          {loading ? 'Parsing your day…' : 'Build my focus plan'}
        </button>
      </div>
    </div>
  )
}

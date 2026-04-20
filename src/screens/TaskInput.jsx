import { useState, useEffect } from 'react'
import { getStateLevel } from '../utils/stateDetection'
import { getCustomChips, saveCustomChip, removeCustomChip } from '../utils/customChips'

const CORPORATE_CHIPS = {
  marketing: {
    ic: ['Write a brief', 'Draft copy or content', 'Review campaign performance', 'Competitor research', 'Brief a designer or agency', 'Prepare a report', 'Social media work', 'Email marketing', 'Admin'],
    manager: ['Review team output', 'Brief the team', 'Campaign sign-off', 'Stakeholder update', 'Budget review', 'Agency or supplier meeting', 'Strategy work', '1:1 with team member', 'Hiring or interviews', 'Admin'],
    director: ['Board or exec presentation', 'Brand strategy', 'Agency relationship', 'Budget ownership', 'Team performance review', 'Market opportunity assessment', 'Cross-functional alignment', 'Admin'],
  },
  sales: {
    ic: ['Prospect outreach', 'Follow up on leads', 'Prepare a pitch or demo', 'Update CRM', 'Client call or meeting', 'Proposal writing', 'Objection handling prep', 'Admin'],
    manager: ['Pipeline review', 'Coach the team', 'Forecast update', 'Key account strategy', 'Team 1:1s', 'Hiring', 'Deal support', 'Revenue reporting', 'Admin'],
    director: ['Revenue strategy', 'Board reporting', 'Key client relationships', 'Partnerships', 'Hiring senior talent', 'Sales process improvement', 'Cross-functional alignment', 'Admin'],
  },
  operations: {
    ic: ['Process documentation', 'Data analysis', 'Reporting', 'Vendor management', 'Project coordination', 'System improvement', 'Team support', 'Admin'],
    manager: ['Team standup', 'Process review', 'Vendor negotiation', 'Stakeholder reporting', 'Budget tracking', 'Project oversight', 'Hiring', '1:1s', 'Admin'],
    director: ['Strategic planning', 'Executive reporting', 'Organisational design', 'Cost optimisation', 'Cross-functional leadership', 'Board preparation', 'Admin'],
  },
  finance: {
    ic: ['Bookkeeping or reconciliation', 'Report preparation', 'Budget tracking', 'Invoice processing', 'Data analysis', 'Compliance work', 'Audit support', 'Admin'],
    manager: ['Financial reporting', 'Budget review', 'Forecasting', 'Stakeholder update', 'Team oversight', 'Audit coordination', 'Process improvement', 'Admin'],
    director: ['Board financial reporting', 'Strategic financial planning', 'Investor relations', 'Risk management', 'Treasury oversight', 'M&A work', 'Admin'],
  },
  product: {
    ic: ['Write a spec', 'User research', 'Competitor analysis', 'Backlog grooming', 'Stakeholder update', 'Data analysis', 'Design review', 'Admin'],
    manager: ['Roadmap planning', 'Sprint planning', 'Prioritisation decisions', 'Stakeholder alignment', 'User interviews', 'Team standup', 'Metrics review', 'Admin'],
    director: ['Product strategy', 'Executive alignment', 'Market opportunity', 'Team structure', 'OKR setting', 'Partnership assessment', 'Board presentation', 'Admin'],
  },
  engineering: {
    ic: ['Deep coding session', 'Code review', 'Bug fixing', 'Write documentation', 'Refactor work', 'Architecture thinking', 'Team standup', 'Admin'],
    manager: ['Sprint planning', 'Team 1:1s', 'Architecture review', 'Hiring', 'Stakeholder update', 'Process improvement', 'Technical debt decisions', 'Unblocking the team', 'Admin'],
    director: ['Technical strategy', 'Org design', 'Executive reporting', 'Hiring senior engineers', 'Build vs buy decisions', 'Cross-team alignment', 'Board technical update', 'Admin'],
  },
  design: {
    ic: ['Design work', 'User research', 'Prototype or wireframe', 'Design review', 'Stakeholder presentation', 'Design system work', 'Competitor analysis', 'Admin'],
    manager: ['Design critique', 'Team 1:1s', 'Stakeholder alignment', 'Hiring', 'Design process improvement', 'Creative direction', 'Cross-functional collaboration', 'Admin'],
    director: ['Design strategy', 'Executive alignment', 'Team structure', 'OKR setting', 'Brand or product vision', 'Cross-functional leadership', 'Board presentation', 'Admin'],
  },
  'hr-people': {
    ic: ['Recruitment screening', 'Onboarding support', 'Policy work', 'L&D coordination', 'Employee relations', 'Data reporting', 'Culture initiatives', 'Admin'],
    manager: ['Recruitment strategy', 'Performance management', 'Employee relations', 'L&D planning', 'Culture initiatives', 'Leadership coaching', 'HR reporting', 'Hiring', 'Admin'],
    director: ['People strategy', 'Executive coaching', 'Organisational design', 'Culture transformation', 'Board people reporting', 'Employer brand', 'Compensation strategy', 'Admin'],
  },
  legal: {
    ic: ['Contract review', 'Legal research', 'Compliance work', 'Advisory support', 'Document drafting', 'Risk assessment', 'Admin'],
    manager: ['Contract negotiation', 'Legal strategy', 'Risk management', 'Board advisory', 'External counsel management', 'Regulatory compliance', 'Admin'],
    director: ['Contract negotiation', 'Legal strategy', 'Risk management', 'Board advisory', 'External counsel management', 'Regulatory compliance', 'Admin'],
  },
  executive: {
    ic: ['Board preparation', 'Investor or stakeholder meeting', 'Strategic planning', 'Team leadership', 'Key decision making', 'External relationships', 'Market assessment', 'Admin'],
    manager: ['Board preparation', 'Investor or stakeholder meeting', 'Strategic planning', 'Team leadership', 'Key decision making', 'External relationships', 'Market assessment', 'Admin'],
    director: ['Board preparation', 'Investor or stakeholder meeting', 'Strategic planning', 'Team leadership', 'Key decision making', 'External relationships', 'Market assessment', 'Admin'],
  },
  other: {
    ic: ['Deep work', 'Team meetings', 'Planning', 'Communication', 'Review', 'Admin'],
    manager: ['Team meetings', '1:1s', 'Strategy work', 'Stakeholder update', 'Planning', 'Admin'],
    director: ['Strategic planning', 'Executive meetings', 'Stakeholder management', 'Team leadership', 'Decision making', 'Admin'],
  },
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

// Finance chips for SE users — ordered by business stage relevance
const SE_FINANCE_CHIPS_EARLY = [
  'Find or brief an accountant',
  'Sort my accounts',
  'Tax admin',
  'Review my finances',
  'Update my bookkeeping',
]

const SE_FINANCE_CHIPS_GROWN = [
  'Review my finances',
  'Update my bookkeeping',
  'Tax admin',
  'Sort my accounts',
  'Find or brief an accountant',
]

function getFinanceChips(businessStage) {
  const isEarly = ['just-launched', 'early-stage'].includes(businessStage)
  return isEarly ? SE_FINANCE_CHIPS_EARLY : SE_FINANCE_CHIPS_GROWN
}

const STUDENT_CHIPS_BY_LEVEL = {
  'secondary-school': {
    'science-tech': ['Past paper practice', 'Revision notes', 'Formula memorisation', 'Lab report', 'Homework', 'Revision flashcards', 'Ask teacher for help', 'Admin'],
    'business-econ': ['Case study revision', 'Past papers', 'Essay practice', 'Data response questions', 'Homework', 'Flashcard review', 'Admin'],
    'arts-humanities': ['Essay writing', 'Textbook reading', 'Past paper practice', 'Creative work', 'Homework', 'Annotation and close reading', 'Admin'],
    default: ['Catch up on missed work', 'Organise revision schedule', 'Study group', 'Past paper', 'Homework', 'Break and recharge'],
  },
  'undergraduate': {
    'science-tech': ['Problem set', 'Lab work or report', 'Lecture notes review', 'Past paper', 'Group project', 'Research reading', 'Assignment draft', 'Admin'],
    'business-econ': ['Case study', 'Essay or report writing', 'Group presentation prep', 'Data analysis', 'Lecture catch-up', 'Networking or career work', 'Admin'],
    'arts-humanities': ['Essay planning or writing', 'Close reading', 'Seminar prep', 'Research', 'Bibliography work', 'Creative or critical piece', 'Admin'],
    'law': ['Case reading', 'Problem question practice', 'Essay writing', 'Mooting prep', 'Lecture notes', 'Revision', 'Admin'],
    'medicine-health': ['Clinical skills practice', 'Case studies', 'Anatomy revision', 'Past papers', 'Portfolio work', 'Placement prep', 'Admin'],
    'social-sciences': ['Research methods work', 'Essay writing', 'Data analysis', 'Reading', 'Fieldwork prep', 'Presentation prep', 'Admin'],
    default: ['Lecture catch-up', 'Essay or assignment', 'Seminar prep', 'Research', 'Past paper', 'Group work', 'Admin'],
  },
  'masters': {
    default: ['Dissertation chapter', 'Literature review', 'Research methodology', 'Data collection or analysis', 'Supervisor meeting prep', 'Seminar paper', 'Module assignment', 'Admin'],
  },
  'phd': {
    default: ['Thesis writing', 'Data collection or analysis', 'Literature review', 'Conference paper', 'Supervisor meeting prep', 'Grant application', 'Teaching prep', 'Admin'],
  },
  'professional-qualification': {
    'business-econ': ['Past exam questions', 'Topic revision', 'Mock exam', 'Case study practice', 'Study text reading', 'Flashcard review', 'Admin'],
    'law': ['Problem question practice', 'Case reading', 'Mooting prep', 'Legal research', 'Past paper', 'Written exercise practice', 'Admin'],
    'social-sciences': ['Assignment writing', 'Case study analysis', 'Reflective practice', 'Reading', 'Presentation prep', 'Admin'],
    default: ['Timed practice questions', 'Topic consolidation', 'Mock exam', 'Study group', 'Tutor session prep', 'Admin'],
  },
  'online-self-study': {
    'science-tech': ['Coding exercise', 'Project work', 'Tutorial or course module', 'Debug a problem', 'Build something', 'Document learning', 'Admin'],
    default: ['Course module', 'Note taking', 'Practice exercise', 'Project milestone', 'Community engagement', 'Apply learning', 'Admin'],
  },
  'apprenticeship': {
    default: ['Work task', 'Study session', 'Assignment', 'Mentor meeting prep', 'Portfolio evidence', 'Skills practice', 'Admin'],
  },
}

function normalizeStudentSubject(subjectArea) {
  const s = (subjectArea || '').toLowerCase()
  if (s.includes('science') || s.includes('tech') || s.includes('engineering')) return 'science-tech'
  if (s.includes('business') || s.includes('economics')) return 'business-econ'
  if (s.includes('arts') || s.includes('humanities')) return 'arts-humanities'
  if (s.includes('law')) return 'law'
  if (s.includes('medicine') || s.includes('health')) return 'medicine-health'
  if (s.includes('social')) return 'social-sciences'
  return 'default'
}

function getStudentChips(studyLevel, subjectArea) {
  const levelMap = STUDENT_CHIPS_BY_LEVEL[studyLevel] || STUDENT_CHIPS_BY_LEVEL['undergraduate']
  const subjectKey = normalizeStudentSubject(subjectArea)
  return levelMap[subjectKey] || levelMap['default'] || levelMap[Object.keys(levelMap)[0]]
}

const LOW_EFFORT_CHIPS = [
  'Admin', 'Clear emails', 'Light review', 'Team catch-up', 'Reply to messages',
]

const FIGURING_IT_OUT_CHIPS = [
  'Explore options', 'Research a topic', 'Reach out to someone', 'Work on a CV or portfolio',
  'Apply for something', 'Have a useful conversation', 'Rest and reflect',
  'Learn something new', 'Take one small step', 'Admin and life tasks',
]

function getSeniorityTier(seniority) {
  if (seniority === 'director-plus') return 'director'
  if (seniority === 'manager') return 'manager'
  return 'ic'
}

function getChips(userType, jobFunctions, seniority, selfEmployedType, studyLevel, subjectArea) {
  if (userType === 'student') return getStudentChips(studyLevel, subjectArea)
  if (userType === 'figuring-it-out') return FIGURING_IT_OUT_CHIPS
  if (userType === 'self-employed') {
    if (selfEmployedType && selfEmployedType !== 'other') {
      return SE_CHIPS_BY_TYPE[selfEmployedType] || SE_CHIPS_UNIVERSAL
    }
    return SE_CHIPS_UNIVERSAL
  }

  const tier = getSeniorityTier(seniority)
  const primaryFn = (Array.isArray(jobFunctions) ? jobFunctions : [jobFunctions])
    .find((jf) => jf && jf !== 'other') || 'other'
  const fnChips = CORPORATE_CHIPS[primaryFn] || CORPORATE_CHIPS['other']
  return fnChips[tier] || fnChips['ic']
}

function getTaskChipKey(userProfile) {
  const ut = userProfile?.userType
  if (ut === 'self-employed') {
    const se = userProfile?.selfEmployedType || userProfile?.workType || 'se'
    return `tasks_${se}`
  }
  if (ut === 'student') {
    const sl = userProfile?.studyLevel || 'student'
    const subKey = normalizeStudentSubject(userProfile?.subjectArea)
    return `tasks_student_${sl}_${subKey}`
  }
  if (ut === 'figuring-it-out') return 'tasks_figuring'
  const jf = Array.isArray(userProfile?.jobFunctions) ? userProfile.jobFunctions[0] : 'other'
  const tier = getSeniorityTier(userProfile?.seniority)
  return `tasks_corp_${jf || 'other'}_${tier}`
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

export default function TaskInput({ user, userProfile, checkInData, initialTasks, onSubmit, onBack, onTasksChange, onHome }) {
  const stateLevel = checkInData
    ? getStateLevel({ energy: checkInData.energy, sleep: checkInData.sleep, mood: checkInData.mood })
    : 'neutral'

  const selfEmployedType = userProfile?.selfEmployedType || userProfile?.workType || null
  const isOtherSE = userProfile?.userType === 'self-employed' && (!selfEmployedType || selfEmployedType === 'other')
  const isSelfEmployed = userProfile?.userType === 'self-employed'

  const allChips = getChips(
    userProfile?.userType,
    userProfile?.jobFunctions,
    userProfile?.seniority,
    selfEmployedType,
    userProfile?.studyLevel,
    userProfile?.subjectArea,
  )
  const chips =
    stateLevel === 'low'
      ? LOW_EFFORT_CHIPS
      : stateLevel === 'high'
      ? allChips
      : allChips.slice(0, 7)

  const taskChipKey = getTaskChipKey(userProfile)

  // Custom task chips for this screen (persisted)
  const [customTaskChips, setCustomTaskChips] = useState(() => getCustomChips(taskChipKey))
  const [taskEditMode, setTaskEditMode] = useState(false)
  const [customTaskInput, setCustomTaskInput] = useState('')

  // Finance chips for SE users
  const financeChips = isSelfEmployed ? getFinanceChips(userProfile?.businessStage) : []
  const financeChipKey = `tasks_finance_${selfEmployedType || 'se'}`
  const [customFinanceChips, setCustomFinanceChips] = useState(() => getCustomChips(financeChipKey))
  const [financeEditMode, setFinanceEditMode] = useState(false)
  const [financeCustomInput, setFinanceCustomInput] = useState('')

  // All standard chips (for identifying custom vs standard on removal)
  const allStandardChips = [...allChips, ...financeChips]

  // Unified selected tasks array
  const [selected, setSelected] = useState(() => initialTasks || [])

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

  const removeTask = (task) => {
    setSelected(prev => prev.filter(t => t !== task))
    // If custom task (not in standard chips), also remove from storage
    if (!allStandardChips.includes(task)) {
      if (customTaskChips.includes(task)) {
        removeCustomChip(taskChipKey, task)
        setCustomTaskChips(prev => prev.filter(c => c !== task))
      }
      if (customFinanceChips.includes(task)) {
        removeCustomChip(financeChipKey, task)
        setCustomFinanceChips(prev => prev.filter(c => c !== task))
      }
    }
  }

  // Add a custom task chip
  const addCustomTaskChip = () => {
    const trimmed = customTaskInput.trim()
    if (!trimmed) return
    if (!customTaskChips.includes(trimmed)) {
      saveCustomChip(taskChipKey, trimmed)
      setCustomTaskChips(prev => [...prev, trimmed])
    }
    // Auto-select it
    setSelected(prev => prev.includes(trimmed) ? prev : [...prev, trimmed])
    setCustomTaskInput('')
  }

  const deleteCustomTaskChip = (chip) => {
    removeCustomChip(taskChipKey, chip)
    setCustomTaskChips(prev => prev.filter(c => c !== chip))
    setSelected(prev => prev.filter(t => t !== chip))
  }

  // Add custom finance chip
  const addCustomFinanceChip = () => {
    const trimmed = financeCustomInput.trim()
    if (!trimmed) return
    if (!customFinanceChips.includes(trimmed)) {
      saveCustomChip(financeChipKey, trimmed)
      setCustomFinanceChips(prev => [...prev, trimmed])
    }
    setSelected(prev => prev.includes(trimmed) ? prev : [...prev, trimmed])
    setFinanceCustomInput('')
  }

  const deleteCustomFinanceChip = (chip) => {
    removeCustomChip(financeChipKey, chip)
    setCustomFinanceChips(prev => prev.filter(c => c !== chip))
    setSelected(prev => prev.filter(t => t !== chip))
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

  const handleCustomTaskKey = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addCustomTaskChip() }
  }

  const handleFinanceCustomKey = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addCustomFinanceChip() }
  }

  const rawName = user?.firstName || ''
  const firstName = rawName ? rawName.charAt(0).toUpperCase() + rawName.slice(1) : ''

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
            onClick={onHome}
            role="button"
            tabIndex={0}
            style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--color-muted)', cursor: 'pointer' }}
            className="text-[13px] font-light block mb-2 hover:opacity-70 transition-opacity"
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

        {/* Main task chips */}
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
            {/* Custom task chips */}
            {customTaskChips.map((chip) => (
              <div key={chip} className="relative">
                <GridChipBtn
                  label={chip}
                  active={selected.includes(chip)}
                  onClick={() => !taskEditMode && toggleChip(chip)}
                />
                {taskEditMode && (
                  <button
                    onClick={() => deleteCustomTaskChip(chip)}
                    style={{
                      position: 'absolute', top: '-4px', right: '-4px',
                      width: '18px', height: '18px', borderRadius: '50%',
                      background: 'var(--color-ink)', color: 'var(--color-white)',
                      border: 'none', cursor: 'pointer', fontSize: '11px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                    aria-label={`Remove ${chip}`}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Something else? input */}
          <div className="flex items-center gap-1.5 mt-3">
            <input
              type="text"
              value={customTaskInput}
              onChange={(e) => {
                const v = e.target.value
                setCustomTaskInput(v.length === 1 ? v.toUpperCase() : v)
              }}
              onKeyDown={handleCustomTaskKey}
              placeholder="Add your own..."
              style={{
                flex: 1,
                fontFamily: 'var(--font-sans)',
                fontSize: '13px',
                padding: '6px 12px',
                borderRadius: '10px',
                border: '0.5px solid var(--color-border)',
                background: 'var(--color-white)',
                color: 'var(--color-ink)',
                outline: 'none',
              }}
            />
            <button
              onClick={addCustomTaskChip}
              disabled={!customTaskInput.trim()}
              style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: customTaskInput.trim() ? 'var(--color-ink)' : 'var(--color-border)',
                color: 'var(--color-white)', border: 'none',
                cursor: customTaskInput.trim() ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '18px', lineHeight: 1, flexShrink: 0,
                transition: 'background 0.15s',
              }}
              aria-label="Add task"
            >
              +
            </button>
          </div>
          {customTaskChips.length > 0 && (
            <button
              onClick={() => setTaskEditMode(e => !e)}
              style={{
                fontFamily: 'var(--font-sans)', fontSize: '11px',
                color: 'var(--color-muted)', textDecoration: 'underline',
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '4px 0 0 0', display: 'block',
              }}
            >
              {taskEditMode ? 'Done editing' : 'Edit my options'}
            </button>
          )}
        </div>

        {/* SE Finance chips — "Money and admin" section */}
        {isSelfEmployed && (
          <div>
            <label className="text-[11px] font-medium uppercase tracking-widest block mb-3" style={{ color: 'var(--color-muted)' }}>
              Money and admin
            </label>
            <div className="grid grid-cols-2 gap-2">
              {financeChips.map((label) => (
                <GridChipBtn
                  key={label}
                  label={label}
                  active={selected.includes(label)}
                  onClick={() => toggleChip(label)}
                />
              ))}
              {/* Custom finance chips */}
              {customFinanceChips.map((chip) => (
                <div key={chip} className="relative">
                  <GridChipBtn
                    label={chip}
                    active={selected.includes(chip)}
                    onClick={() => !financeEditMode && toggleChip(chip)}
                  />
                  {financeEditMode && (
                    <button
                      onClick={() => deleteCustomFinanceChip(chip)}
                      style={{
                        position: 'absolute', top: '-4px', right: '-4px',
                        width: '18px', height: '18px', borderRadius: '50%',
                        background: 'var(--color-ink)', color: 'var(--color-white)',
                        border: 'none', cursor: 'pointer', fontSize: '11px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                      aria-label={`Remove ${chip}`}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1.5 mt-3">
              <input
                type="text"
                value={financeCustomInput}
                onChange={(e) => {
                  const v = e.target.value
                  setFinanceCustomInput(v.length === 1 ? v.toUpperCase() : v)
                }}
                onKeyDown={handleFinanceCustomKey}
                placeholder="Add your own..."
                style={{
                  flex: 1, fontFamily: 'var(--font-sans)', fontSize: '13px',
                  padding: '6px 12px', borderRadius: '10px',
                  border: '0.5px solid var(--color-border)',
                  background: 'var(--color-white)', color: 'var(--color-ink)', outline: 'none',
                }}
              />
              <button
                onClick={addCustomFinanceChip}
                disabled={!financeCustomInput.trim()}
                style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: financeCustomInput.trim() ? 'var(--color-ink)' : 'var(--color-border)',
                  color: 'var(--color-white)', border: 'none',
                  cursor: financeCustomInput.trim() ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '18px', lineHeight: 1, flexShrink: 0, transition: 'background 0.15s',
                }}
                aria-label="Add finance task"
              >
                +
              </button>
            </div>
            {customFinanceChips.length > 0 && (
              <button
                onClick={() => setFinanceEditMode(e => !e)}
                style={{
                  fontFamily: 'var(--font-sans)', fontSize: '11px',
                  color: 'var(--color-muted)', textDecoration: 'underline',
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: '4px 0 0 0', display: 'block',
                }}
              >
                {financeEditMode ? 'Done editing' : 'Edit my options'}
              </button>
            )}
          </div>
        )}

        {/* Unified task list — "Today's tasks" */}
        {selected.length > 0 && (
          <div>
            <div className="flex items-baseline justify-between mb-2">
              <label className="text-[11px] font-medium uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>
                Today's tasks
              </label>
              <span className="text-[11px]" style={{ color: 'var(--color-muted)' }}>
                {selected.length} {selected.length === 1 ? 'task' : 'tasks'}
              </span>
            </div>
            <div className="space-y-1.5">
              {selected.map((task) => (
                <div
                  key={task}
                  className="flex items-center justify-between"
                  style={{
                    padding: '8px 12px',
                    borderRadius: '10px',
                    background: 'var(--color-white)',
                    border: '0.5px solid var(--color-border)',
                  }}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      style={{
                        width: '7px', height: '7px', borderRadius: '50%',
                        background: 'var(--color-lavender)', flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontFamily: 'var(--font-sans)', fontSize: '13px',
                        color: 'var(--color-ink)', lineHeight: 1.4,
                      }}
                      className="truncate"
                    >
                      {task}
                    </span>
                  </div>
                  <button
                    onClick={() => removeTask(task)}
                    style={{
                      flexShrink: 0, marginLeft: '8px',
                      color: 'var(--color-muted)', background: 'none',
                      border: 'none', cursor: 'pointer', padding: '2px',
                      fontSize: '16px', lineHeight: 1,
                    }}
                    aria-label={`Remove ${task}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
          <span className="text-[11px] uppercase tracking-widest" style={{ color: 'var(--color-muted)', opacity: 0.5 }}>or describe your day</span>
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
              : "Describe your day in your own words..."}
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

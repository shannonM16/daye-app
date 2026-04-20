import { useState, useEffect } from 'react'
import { getInsight, getWeeklyMomentumData } from '../utils/patternEngine'
import { getCustomChips, saveCustomChip, removeCustomChip } from '../utils/customChips'
import { getGoalCompletionCount, getMondayOfWeek, saveWeeklyWin } from '../utils/completions'

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

const FIO_DAY_TYPES = [
  { id: 'exploring', label: 'Exploring and researching' },
  { id: 'applying', label: 'Applying or reaching out' },
  { id: 'reflecting', label: 'Reflecting and planning' },
  { id: 'taking-a-break', label: 'Taking a break' },
  { id: 'life-admin', label: 'Doing life admin' },
  { id: 'creative', label: 'Working on something creative' },
  { id: 'learning', label: 'Learning something new' },
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

const CORPORATE_PRESSURE_BY_FUNCTION = {
  marketing: [
    { id: 'campaign-deadline', label: 'Campaign deadline' },
    { id: 'stakeholder-pres', label: 'Stakeholder presentation today' },
    { id: 'budget-sign-off', label: 'Budget sign-off needed' },
    { id: 'agency-issue', label: 'Agency issue' },
    { id: 'team-conflict', label: 'Team conflict' },
    { id: 'performance-review', label: 'Performance review coming' },
    { id: 'none', label: 'None right now' },
  ],
  sales: [
    { id: 'end-of-period', label: 'End of month or quarter pressure' },
    { id: 'key-deal-at-risk', label: 'Key deal at risk' },
    { id: 'pipeline-below', label: 'Pipeline below target' },
    { id: 'important-pitch', label: 'Important pitch today' },
    { id: 'client-escalation', label: 'Client escalation' },
    { id: 'team-performance', label: 'Team performance issue' },
    { id: 'none', label: 'None right now' },
  ],
  operations: [
    { id: 'critical-deadline', label: 'Critical project deadline' },
    { id: 'system-failure', label: 'System or process failure' },
    { id: 'stakeholder-unhappy', label: 'Key stakeholder unhappy' },
    { id: 'resource-shortage', label: 'Resource shortage' },
    { id: 'budget-pressure', label: 'Budget pressure' },
    { id: 'compliance-deadline', label: 'Compliance deadline' },
    { id: 'none', label: 'None right now' },
  ],
  finance: [
    { id: 'month-end', label: 'Month end or year end close' },
    { id: 'audit-pressure', label: 'Audit pressure' },
    { id: 'board-reporting', label: 'Board reporting deadline' },
    { id: 'budget-cycle', label: 'Budget cycle' },
    { id: 'regulatory-deadline', label: 'Regulatory deadline' },
    { id: 'cash-flow', label: 'Cash flow concern' },
    { id: 'none', label: 'None right now' },
  ],
  product: [
    { id: 'sprint-deadline', label: 'Sprint deadline' },
    { id: 'launch-pressure', label: 'Launch pressure' },
    { id: 'stakeholder-conflict', label: 'Stakeholder conflict on priorities' },
    { id: 'research-deadline', label: 'User research deadline' },
    { id: 'board-review', label: 'Board product review' },
    { id: 'tech-debt-crisis', label: 'Tech debt crisis' },
    { id: 'none', label: 'None right now' },
  ],
  engineering: [
    { id: 'release-deadline', label: 'Release deadline' },
    { id: 'production-incident', label: 'Production incident' },
    { id: 'tech-debt-pressure', label: 'Technical debt pressure' },
    { id: 'hiring-urgency', label: 'Hiring urgency' },
    { id: 'architecture-decision', label: 'Architecture decision needed' },
    { id: 'performance-issue', label: 'Performance issue' },
    { id: 'none', label: 'None right now' },
  ],
  design: [
    { id: 'design-deadline', label: 'Design deadline' },
    { id: 'creative-feedback', label: 'Creative feedback pressure' },
    { id: 'stakeholder-misalignment', label: 'Stakeholder misalignment' },
    { id: 'rebrand-project', label: 'Rebrand or major project' },
    { id: 'design-review-today', label: 'Design review today' },
    { id: 'none', label: 'None right now' },
  ],
  'hr-people': [
    { id: 'urgent-hiring', label: 'Urgent hiring need' },
    { id: 'employee-relations', label: 'Employee relations issue' },
    { id: 'culture-crisis', label: 'Culture crisis' },
    { id: 'perf-review-cycle', label: 'Performance review cycle' },
    { id: 'leadership-change', label: 'Leadership change' },
    { id: 'redundancy-process', label: 'Redundancy process' },
    { id: 'none', label: 'None right now' },
  ],
  legal: [
    { id: 'contract-deadline', label: 'Contract deadline' },
    { id: 'regulatory-filing', label: 'Regulatory filing' },
    { id: 'litigation-pressure', label: 'Litigation pressure' },
    { id: 'board-legal-advisory', label: 'Board legal advisory' },
    { id: 'compliance-audit', label: 'Compliance audit' },
    { id: 'none', label: 'None right now' },
  ],
  executive: [
    { id: 'board-meeting', label: 'Board meeting today' },
    { id: 'investor-pressure', label: 'Investor pressure' },
    { id: 'key-hire-decision', label: 'Key hire decision' },
    { id: 'strategic-pivot', label: 'Strategic pivot needed' },
    { id: 'crisis-management', label: 'Crisis management' },
    { id: 'media-pr', label: 'Media or PR situation' },
    { id: 'none', label: 'None right now' },
  ],
}

const MANAGER_PRESSURE_ADDITIONS = [
  { id: 'team-perf-concern', label: 'Team performance concern' },
  { id: 'difficult-1-1', label: 'Difficult 1:1 today' },
  { id: 'hiring-decision', label: 'Hiring decision needed' },
]

const DIRECTOR_PRESSURE_ADDITIONS = [
  { id: 'board-pres-today', label: 'Board presentation today' },
  { id: 'org-change', label: 'Organisational change' },
  { id: 'pl-pressure', label: 'P&L pressure' },
]

const GENERIC_CORPORATE_PRESSURE = [
  { id: 'deadline-deliverable', label: 'Deadline on a deliverable' },
  { id: 'difficult-conversation', label: 'Difficult conversation today' },
  { id: 'big-presentation', label: 'Big presentation' },
  { id: 'performance-review', label: 'Performance review coming' },
  { id: 'budget-sign-off', label: 'Budget or sign-off needed' },
  { id: 'stakeholder-pressure', label: 'Stakeholder pressure' },
  { id: 'none', label: 'None right now' },
]

function getPressureOptions(userType, selfEmployedType, jobFunctions, seniority, userProfile) {
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
    case 'student': {
      const studentPressure = {
        'secondary-school': [
          { id: 'exam-coming', label: 'Exam coming up' },
          { id: 'assignment-due', label: 'Assignment due tomorrow' },
          { id: 'behind-revision', label: 'Behind on revision' },
          { id: 'struggling-topic', label: 'Struggling with a topic' },
          { id: 'parent-pressure', label: 'Parents putting pressure on' },
          { id: 'mock-exams', label: 'Mock exams soon' },
          { id: 'falling-behind-class', label: 'Falling behind the class' },
          { id: 'none', label: 'None right now' },
        ],
        'undergraduate': [
          { id: 'deadline-this-week', label: 'Deadline this week' },
          { id: 'exam-period', label: 'Exam period' },
          { id: 'group-project-stress', label: 'Group project stress' },
          { id: 'behind-reading', label: 'Behind on reading' },
          { id: 'dissertation-pressure', label: 'Dissertation pressure' },
          { id: 'placement-application', label: 'Placement or internship application' },
          { id: 'resit-coming', label: 'Resit coming up' },
          { id: 'finances-stress', label: 'Finances stressing me' },
          { id: 'none', label: 'None right now' },
        ],
        'masters': [
          { id: 'dissertation-deadline', label: 'Dissertation deadline' },
          { id: 'chapter-submission', label: 'Chapter submission' },
          { id: 'supervisor-meeting', label: 'Supervisor meeting' },
          { id: 'funding-pressure', label: 'Funding pressure' },
          { id: 'research-not-going-well', label: 'Research not going well' },
          { id: 'viva-prep', label: 'Viva preparation' },
          { id: 'job-market-anxiety', label: 'Job market anxiety' },
          { id: 'none', label: 'None right now' },
        ],
        'phd': [
          { id: 'thesis-deadline', label: 'Thesis deadline' },
          { id: 'conference-paper', label: 'Conference paper due' },
          { id: 'supervisor-relationship', label: 'Supervisor relationship' },
          { id: 'funding-running-out', label: 'Funding running out' },
          { id: 'publication-pressure', label: 'Publication pressure' },
          { id: 'viva-anxiety', label: 'Viva anxiety' },
          { id: 'imposter-syndrome', label: 'Imposter syndrome' },
          { id: 'teaching-load', label: 'Teaching load' },
          { id: 'none', label: 'None right now' },
        ],
        'professional-qualification': [
          { id: 'exam-date-approaching', label: 'Exam date approaching' },
          { id: 'mock-results', label: 'Mock exam results' },
          { id: 'assignment-deadline', label: 'Assignment deadline' },
          { id: 'study-time-hard', label: 'Study time hard to find' },
          { id: 'work-study-balance', label: 'Work-study balance' },
          { id: 'resit-needed', label: 'Resit needed' },
          { id: 'none', label: 'None right now' },
        ],
        'online-self-study': [
          { id: 'project-deadline', label: 'Project deadline' },
          { id: 'losing-motivation', label: 'Losing motivation' },
          { id: 'falling-behind-course', label: 'Falling behind on course' },
          { id: 'job-application-pressure', label: 'Job application pressure' },
          { id: 'portfolio-not-ready', label: 'Portfolio not ready' },
          { id: 'none', label: 'None right now' },
        ],
        'apprenticeship': [
          { id: 'assessment-deadline', label: 'Assessment deadline' },
          { id: 'work-performance', label: 'Work performance pressure' },
          { id: 'assignment-due', label: 'Assignment due' },
          { id: 'skills-gap', label: 'Skills gap' },
          { id: 'mentor-feedback', label: 'Mentor feedback' },
          { id: 'none', label: 'None right now' },
        ],
      }
      const studyLevel = userProfile?.studyLevel || 'undergraduate'
      return studentPressure[studyLevel] || studentPressure['undergraduate']
    }
    case 'figuring-it-out':
      return [
        { id: 'money-tight', label: 'Money is getting tight' },
        { id: 'decision-soon', label: 'Need to make a decision soon' },
        { id: 'feeling-stuck', label: 'Feeling really stuck' },
        { id: 'comparison-spiral', label: 'Comparison spiral or self-doubt' },
        { id: 'pressure-from-others', label: 'Pressure from family or friends' },
        { id: 'opportunity-deadline', label: 'Application or opportunity deadline' },
        { id: 'should-have-it-figured', label: 'Feeling like I should have it figured out by now' },
        { id: 'unsure-today', label: 'Unsure what to do today' },
        { id: 'none', label: 'None right now' },
      ]
    default: {
      const primaryFn = (Array.isArray(jobFunctions) ? jobFunctions : [jobFunctions])
        .find((jf) => jf && jf !== 'other') || null
      const baseOptions = primaryFn && CORPORATE_PRESSURE_BY_FUNCTION[primaryFn]
        ? [...CORPORATE_PRESSURE_BY_FUNCTION[primaryFn]]
        : [...GENERIC_CORPORATE_PRESSURE]

      const noneIndex = baseOptions.findIndex((o) => o.id === 'none')
      const withoutNone = noneIndex >= 0 ? baseOptions.filter((o) => o.id !== 'none') : baseOptions
      const noneOption = noneIndex >= 0 ? [baseOptions[noneIndex]] : []

      if (seniority === 'director-plus') {
        return [...withoutNone, ...DIRECTOR_PRESSURE_ADDITIONS, ...MANAGER_PRESSURE_ADDITIONS, ...noneOption]
      }
      if (seniority === 'manager') {
        return [...withoutNone, ...MANAGER_PRESSURE_ADDITIONS, ...noneOption]
      }
      return [...withoutNone, ...noneOption]
    }
  }
}

function SectionLabel({ children }) {
  return (
    <label className="text-[11px] font-medium uppercase tracking-widest block mb-1.5" style={{ color: 'var(--color-muted)' }}>
      {children}
    </label>
  )
}

// Get time period and formatted strings
function getTimePeriod() {
  const hour = new Date().getHours()
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  return 'evening'
}

function formatCurrentTime12h() {
  const now = new Date()
  const h = now.getHours()
  const m = now.getMinutes()
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  const ampm = h >= 12 ? 'pm' : 'am'
  return `${h12}:${String(m).padStart(2, '0')}${ampm}`
}

function getGreeting(firstName) {
  const period = getTimePeriod()
  return { time: `Good ${period}`, name: firstName, period }
}

// Compact chip button for mood grid (fits 15 options)
function MoodBtn({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left transition-all duration-150 active:scale-95"
      style={{
        padding: '5px 10px',
        borderRadius: '20px',
        border: '0.5px solid',
        borderColor: active ? 'var(--color-ink)' : 'var(--color-border)',
        background: active ? 'var(--color-ink)' : 'var(--color-white)',
        color: active ? 'var(--color-white)' : 'var(--color-ink)',
        fontFamily: 'var(--font-sans)',
        fontSize: '12px',
        fontWeight: active ? 500 : 400,
      }}
    >
      {label}
    </button>
  )
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
      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: step === 1 ? 'var(--color-ink)' : 'var(--color-border)', transition: 'background 0.2s' }} />
      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: step === 2 ? 'var(--color-ink)' : 'var(--color-border)', transition: 'background 0.2s' }} />
    </div>
  )
}

// Custom chip input + edit mode for a single chip section
function CustomChipArea({ screenKey, customChips, onAddChip, onRemoveChip, editMode, onToggleEditMode, compact = false }) {
  const [inputVal, setInputVal] = useState('')

  const handleAdd = () => {
    const trimmed = inputVal.trim()
    if (!trimmed) return
    onAddChip(trimmed)
    setInputVal('')
  }

  const handleKey = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); handleAdd() }
  }

  return (
    <div className="mt-2">
      {/* Custom chips rendered inline — shown after standard chips in parent */}

      {/* "Something else?" input */}
      <div className="flex items-center gap-1.5 mt-2">
        <input
          type="text"
          value={inputVal}
          onChange={(e) => {
            const v = e.target.value
            setInputVal(v.length === 1 ? v.toUpperCase() : v)
          }}
          onKeyDown={handleKey}
          placeholder="Add your own..."
          style={{
            flex: 1,
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            padding: '5px 10px',
            borderRadius: '20px',
            border: '0.5px solid var(--color-border)',
            background: 'var(--color-white)',
            color: 'var(--color-ink)',
            outline: 'none',
          }}
        />
        <button
          onClick={handleAdd}
          disabled={!inputVal.trim()}
          style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: inputVal.trim() ? 'var(--color-ink)' : 'var(--color-border)',
            color: 'var(--color-white)',
            border: 'none',
            cursor: inputVal.trim() ? 'pointer' : 'default',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            lineHeight: 1,
            flexShrink: 0,
            transition: 'background 0.15s',
          }}
          aria-label="Add"
        >
          +
        </button>
      </div>

      {/* Edit my options link */}
      {customChips.length > 0 && (
        <button
          onClick={onToggleEditMode}
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '11px',
            color: 'var(--color-muted)',
            textDecoration: 'underline',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px 0 0 0',
            display: 'block',
          }}
        >
          {editMode ? 'Done editing' : 'Edit my options'}
        </button>
      )}
    </div>
  )
}

export default function CheckIn({ user, userProfile, initialValues, history = [], streakCount = 0, carryOverTask, onCarryOverAccept, onCarryOverDismiss, onActivateTestMode, onSubmit, onViewHistory, onViewSettings, onHome, onRetakeReflection }) {
  const isFiguringItOut = userProfile?.userType === 'figuring-it-out'
  const selfEmployedType = userProfile?.selfEmployedType || userProfile?.workType || null
  const pressureOptions = getPressureOptions(
    userProfile?.userType,
    selfEmployedType,
    userProfile?.jobFunctions,
    userProfile?.seniority,
    userProfile,
  )

  const [step, setStep] = useState(1)
  const [energy, setEnergy] = useState(initialValues?.energy || 3)
  const [mood, setMood] = useState(initialValues?.mood || null)
  const [sleep, setSleep] = useState(initialValues?.sleep || null)
  const [dayType, setDayType] = useState(initialValues?.dayType || null)
  const [dayTypeAutoSet, setDayTypeAutoSet] = useState(null)
  const [pressure, setPressure] = useState(initialValues?.pressure || [])
  const [eveningMode, setEveningMode] = useState(null) // null | 'plan-tomorrow' | 'late-session'

  // Planning start time — captured once on mount
  const [planningStartTime] = useState(() => {
    const now = new Date()
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  })

  // Clock display — updates every minute
  const [currentTimeStr, setCurrentTimeStr] = useState(() => formatCurrentTime12h())
  useEffect(() => {
    const interval = setInterval(() => setCurrentTimeStr(formatCurrentTime12h()), 60000)
    return () => clearInterval(interval)
  }, [])

  // Custom chips state — mood
  const [customMoods, setCustomMoods] = useState(() => getCustomChips('mood'))
  const [moodEditMode, setMoodEditMode] = useState(false)

  // Custom chips state — day type
  const [customDayTypes, setCustomDayTypes] = useState(() => getCustomChips('day-type'))
  const [dayTypeEditMode, setDayTypeEditMode] = useState(false)

  // Custom chips state — pressure
  const [customPressures, setCustomPressures] = useState(() => getCustomChips('pressure'))
  const [pressureEditMode, setPressureEditMode] = useState(false)

  const timePeriod = getTimePeriod()
  const isEvening = timePeriod === 'evening'
  const isAfternoon = timePeriod === 'afternoon'

  // Feature 4: Weekly momentum narrative (Monday morning)
  const weeklyMomentumData = getWeeklyMomentumData(history)
  const [momentumDismissed, setMomentumDismissed] = useState(false)

  // Feature 5: Friday end-of-week win question
  const isFridayAfternoon = (() => {
    const now = new Date()
    return now.getDay() === 5 && now.getHours() >= 16
  })()
  const mondayKey = getMondayOfWeek(new Date().toISOString().split('T')[0])
  const fridayWinAlreadySaved = !!localStorage.getItem('daye_weekly_win_' + mondayKey)
  const showFridayWinStep = isFridayAfternoon && !fridayWinAlreadySaved
  const [fridayWin, setFridayWin] = useState('')
  const [carryOverDismissedLocal, setCarryOverDismissedLocal] = useState(false)

  // Dev test mode trigger — remove before launch
  const [testModeToast, setTestModeToast] = useState(false)
  const handleDevTap = () => {
    onActivateTestMode?.()
    setTestModeToast(true)
    setTimeout(() => setTestModeToast(false), 2500)
  }

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
    if (id === 'none') { setPressure(['none']); return }
    setPressure((prev) => {
      const without = prev.filter((p) => p !== 'none')
      return without.includes(id) ? without.filter((p) => p !== id) : [...without, id]
    })
  }

  // Custom mood handlers
  const addCustomMood = (text) => {
    if (customMoods.includes(text)) { setMood(text); return }
    saveCustomChip('mood', text)
    setCustomMoods(prev => [...prev, text])
    handleMoodChange(text)
  }
  const deleteCustomMood = (chip) => {
    removeCustomChip('mood', chip)
    setCustomMoods(prev => prev.filter(c => c !== chip))
    if (mood === chip) setMood(null)
  }

  // Custom day type handlers
  const addCustomDayType = (text) => {
    if (customDayTypes.includes(text)) { handleDayTypeClick(text); return }
    saveCustomChip('day-type', text)
    setCustomDayTypes(prev => [...prev, text])
    handleDayTypeClick(text)
  }
  const deleteCustomDayType = (chip) => {
    removeCustomChip('day-type', chip)
    setCustomDayTypes(prev => prev.filter(c => c !== chip))
    if (dayType === chip) setDayType(null)
  }

  // Custom pressure handlers
  const addCustomPressure = (text) => {
    if (customPressures.includes(text)) {
      setPressure(prev => [...prev.filter(p => p !== 'none'), text])
      return
    }
    saveCustomChip('pressure', text)
    setCustomPressures(prev => [...prev, text])
    setPressure(prev => [...prev.filter(p => p !== 'none'), text])
  }
  const deleteCustomPressure = (chip) => {
    removeCustomChip('pressure', chip)
    setCustomPressures(prev => prev.filter(c => c !== chip))
    setPressure(prev => prev.filter(p => p !== chip))
  }

  const canAdvance = mood && sleep
  const canSubmit = dayType && pressure.length > 0

  const handleSubmit = () => {
    if (!canSubmit) return
    if (showFridayWinStep && step === 2) {
      setStep(3)
      return
    }
    onSubmit({ energy, mood, sleep, dayType, pressure, planningStartTime, eveningMode })
  }

  const handleFridayWinSubmit = () => {
    if (fridayWin.trim()) {
      saveWeeklyWin(mondayKey, fridayWin.trim())
    }
    onSubmit({ energy, mood, sleep, dayType, pressure, planningStartTime, eveningMode })
  }

  const rawName = user?.firstName || ''
  const firstName = rawName ? rawName.charAt(0).toUpperCase() + rawName.slice(1) : ''
  const greeting = firstName ? getGreeting(firstName) : { time: `Good ${timePeriod}`, name: '', period: timePeriod }

  const insight = history.length >= 3 ? getInsight(history) : ''

  const [installDismissed, setInstallDismissed] = useState(
    () => localStorage.getItem('daye_install_dismissed') === '1'
  )
  const showInstallBanner = history.length >= 2 && !installDismissed
  const handleDismissInstall = () => {
    localStorage.setItem('daye_install_dismissed', '1')
    setInstallDismissed(true)
  }

  // Evening mode — show reflection view unless user has chosen a path
  if (isEvening && !eveningMode) {
    return (
      <div className="screen">
        <div className="flex-1 overflow-y-auto space-y-5">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span
                onClick={onHome}
                role="button"
                tabIndex={0}
                style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--color-muted)', cursor: 'pointer' }}
                className="text-[13px] font-light hover:opacity-70 transition-opacity"
              >
                daye
              </span>
              <div className="flex items-center" style={{ marginRight: '-8px' }}>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--color-muted)' }} className="mr-1">
                  {currentTimeStr}
                </span>
                {onViewSettings && (
                  <div onClick={onViewSettings} role="button" className="flex items-center justify-center cursor-pointer" style={{ width: '40px', height: '40px' }}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ color: 'var(--color-muted)' }}>
                      <circle cx="10" cy="7.5" r="3" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M3.5 17.5c0-3.59 2.91-6.5 6.5-6.5s6.5 2.91 6.5 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                )}
                <a
                  href="/blog"
                  aria-label="Blog"
                  className="flex items-center justify-center hover:opacity-70 transition-opacity"
                  style={{ width: '40px', height: '40px', color: 'var(--color-muted)', textDecoration: 'none' }}
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ color: 'var(--color-muted)' }}>
                    <rect x="3.5" y="2.5" width="11" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M6 6.5h6M6 9h6M6 11.5h3" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
                  </svg>
                </a>
              </div>
            </div>
            <p className="text-[24px] leading-tight font-light" style={{ color: 'var(--color-ink)' }}>
              Good evening{firstName ? ',' : '.'}
            </p>
            {firstName && (
              <p className="text-[24px] leading-tight font-medium mb-1" style={{ color: 'var(--color-ink)' }}>
                {firstName}.
              </p>
            )}
            <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
              Your working day is wrapping up.
            </p>
          </div>

          <div className="rounded-2xl px-5 py-4 space-y-3" style={{ background: 'var(--color-white)', border: '1px solid var(--color-border)' }}>
            <p className="text-[11px] font-medium uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>End of day</p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-ink)' }}>
              Tomorrow is a fresh start. Come back in the morning to build your plan for the day.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '4px' }}>
            <button
              onClick={() => setEveningMode('plan-tomorrow')}
              style={{
                fontFamily: 'var(--font-sans)', fontSize: '13px',
                color: 'var(--color-muted)', background: 'none',
                border: 'none', cursor: 'pointer', padding: 0,
                textAlign: 'left', display: 'flex', alignItems: 'center', gap: '4px',
              }}
            >
              Plan ahead for tomorrow
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
                <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              onClick={() => setEveningMode('late-session')}
              style={{
                fontFamily: 'var(--font-sans)', fontSize: '13px',
                color: 'var(--color-muted)', background: 'none',
                border: 'none', cursor: 'pointer', padding: 0,
                textAlign: 'left', display: 'flex', alignItems: 'center', gap: '4px',
              }}
            >
              Planning a late session tonight
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
                <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {streakCount >= 2 && (
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-full self-start"
              style={{ background: 'var(--color-linen)', border: '0.5px solid var(--color-border)', display: 'inline-flex' }}
            >
              <span className="text-sm" style={{ color: 'var(--color-ink)' }}>{streakCount} day streak</span>
            </div>
          )}
        </div>

        <div className="flex-shrink-0 pt-4" />
      </div>
    )
  }

  // Feature 4: Weekly momentum narrative — Monday morning early return
  if (weeklyMomentumData && !momentumDismissed) {
    const { days, avgEnergy } = weeklyMomentumData
    const goalCompletions = getGoalCompletionCount()
    const rawName = user?.firstName || ''
    const name = rawName ? rawName.charAt(0).toUpperCase() + rawName.slice(1) : ''

    let narrative
    if (avgEnergy >= 3.5 && streakCount >= 5) {
      narrative = `You had a strong week, ${name ? name + '.' : 'this week.'} ${days} days checked in, averaging ${avgEnergy}/5 energy. That kind of consistency compounds.`
    } else if (avgEnergy >= 3.5) {
      narrative = `Solid week. ${days} days logged, ${avgEnergy}/5 average energy. You showed up — that is what matters.`
    } else if (streakCount >= 3) {
      narrative = `It was a mixed week, but you showed up ${days} days. That matters more than the energy numbers suggest.`
    } else {
      narrative = `You logged ${days} days last week. Here is what that looked like.`
    }

    return (
      <div className="screen">
        <div className="flex-1 overflow-y-auto space-y-5">
          <div>
            <span
              onClick={onHome}
              role="button"
              tabIndex={0}
              style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--color-muted)', cursor: 'pointer' }}
              className="text-[13px] font-light block mb-4 hover:opacity-70 transition-opacity"
            >
              daye
            </span>
            <p className="text-[11px] font-medium uppercase tracking-widest mb-2" style={{ color: 'var(--color-muted)' }}>
              Last week
            </p>
            <h1 className="text-[22px] font-bold mb-1" style={{ color: 'var(--color-ink)' }}>
              Your week in review.
            </h1>
          </div>

          <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '18px', color: 'var(--color-ink)', lineHeight: 1.6, margin: 0 }}>
            {narrative}
          </p>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ background: 'var(--color-linen)', borderRadius: '20px', padding: '5px 12px', fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--color-ink)' }}>
              {days} day{days !== 1 ? 's' : ''} logged
            </span>
            <span style={{ background: 'var(--color-linen)', borderRadius: '20px', padding: '5px 12px', fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--color-ink)' }}>
              {avgEnergy}/5 avg energy
            </span>
            {streakCount >= 2 && (
              <span style={{ background: 'var(--color-linen)', borderRadius: '20px', padding: '5px 12px', fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--color-ink)' }}>
                {streakCount} day streak
              </span>
            )}
          </div>

          {goalCompletions > 0 && (
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--color-muted)', lineHeight: 1.5 }}>
              You completed {goalCompletions} goal-aligned task{goalCompletions !== 1 ? 's' : ''} this week. That adds up.
            </p>
          )}
        </div>

        <div className="flex-shrink-0 pt-4">
          <button
            className="btn-primary"
            onClick={() => {
              localStorage.setItem('daye_weekly_shown_date', weeklyMomentumData.todayStr)
              localStorage.setItem('daye_goal_completions', '0')
              setMomentumDismissed(true)
            }}
          >
            Start today's plan →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="screen">
      {/* Dev test mode button — remove before launch */}
      <button
        onClick={handleDevTap}
        style={{ position: 'fixed', bottom: 12, left: 12, fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--color-muted)', background: 'var(--color-linen-dark)', border: '0.5px solid var(--color-border)', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', zIndex: 300 }}
      >
        Dev
      </button>

      {/* Test mode toast */}
      {testModeToast && (
        <div style={{
          position: 'fixed',
          bottom: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--color-ink)',
          color: 'var(--color-white)',
          borderRadius: '10px',
          padding: '10px 18px',
          fontFamily: 'var(--font-sans)',
          fontSize: '12px',
          fontWeight: 500,
          zIndex: 200,
          whiteSpace: 'nowrap',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          animation: 'slideUpToast 0.25s ease',
        }}>
          Test mode active — history populated
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-4">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span
              onClick={onHome}
              role="button"
              tabIndex={0}
              style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--color-muted)', cursor: 'pointer' }}
              className="text-[13px] font-light hover:opacity-70 transition-opacity"
            >
              daye
            </span>
            <div className="flex items-center gap-2" style={{ marginRight: '-8px' }}>
              {/* Current time display */}
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--color-muted)' }}>
                {currentTimeStr}
              </span>
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
              <a
                href="/blog"
                aria-label="Blog"
                className="flex items-center justify-center hover:opacity-70 transition-opacity"
                style={{ width: '40px', height: '40px', color: 'var(--color-muted)', textDecoration: 'none' }}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ color: 'var(--color-muted)' }}>
                  <rect x="3.5" y="2.5" width="11" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M6 6.5h6M6 9h6M6 11.5h3" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
                </svg>
              </a>
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

          {greeting.name ? (
            <>
              <p className="text-[24px] leading-tight font-light" style={{ color: 'var(--color-ink)' }}>
                {greeting.time},
              </p>
              <p className="text-[24px] leading-tight font-medium mb-1" style={{ color: 'var(--color-ink)' }}>
                {greeting.name}.
              </p>
            </>
          ) : (
            <h1 className="text-[24px] font-medium leading-tight" style={{ color: 'var(--color-ink)' }}>
              {greeting.time}.
            </h1>
          )}

          {eveningMode === 'plan-tomorrow' ? (
            <p className="text-sm" style={{ color: 'var(--color-muted)' }}>Planning ahead for tomorrow.</p>
          ) : eveningMode === 'late-session' ? (
            <p className="text-sm" style={{ color: 'var(--color-muted)' }}>Planning your late session from {currentTimeStr}.</p>
          ) : isAfternoon ? (
            <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
              Planning your afternoon from {currentTimeStr}
            </p>
          ) : (
            <p className="text-sm" style={{ color: 'var(--color-muted)' }}>{isFiguringItOut ? 'How are you feeling today?' : 'How\'s today looking?'}</p>
          )}
        </div>

        {/* Step dots */}
        <StepDots step={step} />

        {step === 1 && (
          <>
            {/* Feature 1: Carry-over card */}
            {carryOverTask && !carryOverDismissedLocal && (
              <div style={{
                background: 'var(--color-blush)',
                borderRadius: '12px',
                padding: '12px 14px',
              }}>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-muted)', fontWeight: 500, margin: '0 0 6px 0' }}>
                  From yesterday
                </p>
                <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '15px', color: 'var(--color-ink)', margin: '0 0 10px 0', lineHeight: 1.4 }}>
                  {carryOverTask}
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => { onCarryOverAccept?.(); setCarryOverDismissedLocal(true) }}
                    style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', fontWeight: 500, background: 'var(--color-ink)', color: 'white', border: 'none', borderRadius: '20px', padding: '5px 14px', cursor: 'pointer' }}
                  >
                    Add to today
                  </button>
                  <button
                    onClick={() => { onCarryOverDismiss?.(); setCarryOverDismissedLocal(true) }}
                    style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--color-muted)', background: 'none', border: '0.5px solid var(--color-border)', borderRadius: '20px', padding: '5px 14px', cursor: 'pointer' }}
                  >
                    Not today
                  </button>
                </div>
              </div>
            )}

            {streakCount >= 2 && (
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-full self-start"
                style={{ background: 'var(--color-linen)', border: '0.5px solid var(--color-border)', display: 'inline-flex' }}
              >
                <span className="text-sm" style={{ color: 'var(--color-ink)' }}>{streakCount} day streak</span>
              </div>
            )}

            {history.length >= 3 && insight ? (
              <div
                className="rounded-2xl px-4 py-3"
                style={{ background: 'var(--color-white)', border: '1px solid var(--color-border)', borderLeft: '3px solid var(--color-lavender)' }}
              >
                <p className="text-[11px] font-medium uppercase tracking-widest mb-1" style={{ color: 'var(--color-muted)' }}>Pattern</p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-ink)' }}>{insight}</p>
              </div>
            ) : null}

            {/* FIO empty state — reflection not yet completed */}
            {isFiguringItOut && !userProfile?.aiSummary && onRetakeReflection && (
              <button
                onClick={onRetakeReflection}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  background: 'var(--color-blush)', border: 'none',
                  borderRadius: '10px', padding: '12px 14px',
                  fontFamily: 'var(--font-sans)', fontSize: '13px',
                  color: 'var(--color-ink)', cursor: 'pointer',
                  lineHeight: 1.5,
                }}
              >
                Tell us a bit about your situation to get a more personalised plan →
              </button>
            )}

            {/* Energy */}
            <div>
              <div className="flex items-baseline justify-between mb-2">
                <SectionLabel>{isFiguringItOut ? 'Your energy today' : 'Energy'}</SectionLabel>
                <span className="text-xs -mt-2" style={{ color: 'var(--color-muted)' }}>{ENERGY_LABELS[energy]}</span>
              </div>
              <input type="range" min={1} max={5} value={energy} onChange={(e) => handleEnergyChange(Number(e.target.value))} />
              <div className="flex justify-between mt-0.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => handleEnergyChange(n)}
                    className="active:scale-110 transition-transform duration-100"
                    style={{
                      fontFamily: 'var(--font-sans)', fontSize: '13px',
                      fontWeight: energy === n ? 500 : 400,
                      color: energy === n ? 'var(--color-ink)' : 'var(--color-muted)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      padding: '4px 6px', minWidth: '28px', textAlign: 'center', lineHeight: 1,
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Mood — compact 2-col grid, 15 options */}
            <div>
              <SectionLabel>Mood</SectionLabel>
              <div className="grid grid-cols-2 gap-1.5">
                {MOOD_OPTIONS.map((m) => (
                  <MoodBtn key={m.id} label={m.label} active={mood === m.id} onClick={() => handleMoodChange(m.id)} />
                ))}
                {/* Custom mood chips */}
                {customMoods.map((chip) => (
                  <div key={chip} className="relative">
                    <MoodBtn label={chip} active={mood === chip} onClick={() => !moodEditMode && handleMoodChange(chip)} />
                    {moodEditMode && (
                      <button
                        onClick={() => deleteCustomMood(chip)}
                        style={{
                          position: 'absolute', top: '-4px', right: '-4px',
                          width: '16px', height: '16px', borderRadius: '50%',
                          background: 'var(--color-ink)', color: 'var(--color-white)',
                          border: 'none', cursor: 'pointer', fontSize: '10px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          lineHeight: 1,
                        }}
                        aria-label={`Remove ${chip}`}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {isFiguringItOut && (
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--color-muted)', fontStyle: 'italic', marginTop: '8px' }}>
                  There is no wrong answer here.
                </p>
              )}
              <CustomChipArea
                screenKey="mood"
                customChips={customMoods}
                onAddChip={addCustomMood}
                onRemoveChip={deleteCustomMood}
                editMode={moodEditMode}
                onToggleEditMode={() => setMoodEditMode(e => !e)}
              />
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
                {(isFiguringItOut ? FIO_DAY_TYPES : DAY_TYPES).map((dt) => (
                  <GridBtn
                    key={dt.id}
                    label={dt.label}
                    active={dayType === dt.id}
                    amber={dayType === dt.id && dayTypeAutoSet !== null}
                    onClick={() => handleDayTypeClick(dt.id)}
                  />
                ))}
                {/* Custom day types */}
                {customDayTypes.map((chip) => (
                  <div key={chip} className="relative">
                    <GridBtn label={chip} active={dayType === chip} onClick={() => !dayTypeEditMode && handleDayTypeClick(chip)} />
                    {dayTypeEditMode && (
                      <button
                        onClick={() => deleteCustomDayType(chip)}
                        style={{
                          position: 'absolute', top: '-4px', right: '-4px',
                          width: '16px', height: '16px', borderRadius: '50%',
                          background: 'var(--color-ink)', color: 'var(--color-white)',
                          border: 'none', cursor: 'pointer', fontSize: '10px',
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
              {dayTypeAutoSet && (
                <p className="text-xs mt-1.5" style={{ color: '#92400e' }}>
                  {dayTypeAutoSet === 'energy' ? 'Pre-selected based on your energy' : 'Pre-selected based on your mood'}
                </p>
              )}
              <CustomChipArea
                screenKey="day-type"
                customChips={customDayTypes}
                onAddChip={addCustomDayType}
                onRemoveChip={deleteCustomDayType}
                editMode={dayTypeEditMode}
                onToggleEditMode={() => setDayTypeEditMode(e => !e)}
              />
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
                {/* Custom pressure chips */}
                {customPressures.map((chip) => (
                  <div key={chip} className="relative">
                    <GridBtn
                      label={chip}
                      active={pressure.includes(chip)}
                      onClick={() => !pressureEditMode && togglePressure(chip)}
                    />
                    {pressureEditMode && (
                      <button
                        onClick={() => deleteCustomPressure(chip)}
                        style={{
                          position: 'absolute', top: '-4px', right: '-4px',
                          width: '16px', height: '16px', borderRadius: '50%',
                          background: 'var(--color-ink)', color: 'var(--color-white)',
                          border: 'none', cursor: 'pointer', fontSize: '10px',
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
              <CustomChipArea
                screenKey="pressure"
                customChips={customPressures}
                onAddChip={addCustomPressure}
                onRemoveChip={deleteCustomPressure}
                editMode={pressureEditMode}
                onToggleEditMode={() => setPressureEditMode(e => !e)}
              />
            </div>

            {/* PWA install banner */}
            {showInstallBanner && (
              <div
                className="flex items-start justify-between gap-3"
                style={{ background: 'var(--color-white)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '14px 16px' }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: 'var(--color-ink)' }}>Add Daye to your home screen</p>
                  <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: 'var(--color-muted)' }}>Open your browser menu and tap Add to Home Screen.</p>
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

        {/* Feature 5: Friday end-of-week win question */}
        {step === 3 && (
          <>
            <h1 className="text-[22px] font-bold mb-1" style={{ color: 'var(--color-ink)' }}>
              One last thing.
            </h1>
            <p className="text-sm mb-5" style={{ color: 'var(--color-muted)' }}>
              What was your biggest win this week?
            </p>
            <textarea
              value={fridayWin}
              onChange={(e) => { const v = e.target.value; setFridayWin(v.length === 1 ? v.toUpperCase() : v) }}
              placeholder="e.g. Finally shipped the feature I'd been putting off..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm text-stone-800 placeholder:text-stone-300 outline-none focus:border-stone-400 transition-colors bg-white resize-none leading-relaxed"
            />
          </>
        )}
      </div>

      <div className="flex-shrink-0 pt-4 space-y-2">
        {step === 1 && (
          <button className="btn-primary" onClick={() => setStep(2)} disabled={!canAdvance}>
            Next
          </button>
        )}
        {step === 2 && (
          <>
            <button className="btn-primary" onClick={handleSubmit} disabled={!canSubmit}>
              Build my plan
            </button>
            <button className="btn-ghost" onClick={() => setStep(1)}>Back</button>
          </>
        )}
        {step === 3 && (
          <>
            <button className="btn-primary" onClick={handleFridayWinSubmit}>
              {fridayWin.trim() ? 'Save and build my plan' : 'Skip — build my plan'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

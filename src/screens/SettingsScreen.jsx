import { useState } from 'react'

// ─── Option data (mirrored from onboarding files) ─────────────────────────────

const SITUATIONS = [
  { id: 'corporate', label: 'Corporate', sub: 'In a company or organisation' },
  { id: 'self-employed', label: 'Self-employed', sub: 'Freelance, founder, or solo' },
  { id: 'student', label: 'Student', sub: 'Full-time or part-time study' },
  { id: 'figuring-it-out', label: 'Figuring it out', sub: 'Between things or in flux' },
]

const JOB_FUNCTIONS = [
  { id: 'marketing', label: 'Marketing' }, { id: 'sales', label: 'Sales' },
  { id: 'operations', label: 'Operations' }, { id: 'finance', label: 'Finance' },
  { id: 'product', label: 'Product' }, { id: 'engineering', label: 'Engineering' },
  { id: 'design', label: 'Design' }, { id: 'hr-people', label: 'HR / People' },
  { id: 'legal', label: 'Legal' }, { id: 'executive', label: 'Executive' },
  { id: 'other', label: 'Other' },
]

const SENIORITY_OPTIONS = [
  { id: 'starting-out', label: 'Just starting out', description: 'Early in my career, still learning the ropes' },
  { id: 'mid-level', label: 'Mid-level', description: 'I know my craft and work independently' },
  { id: 'senior-lead', label: 'Senior / Lead', description: 'Expert in my field, I guide others informally' },
  { id: 'manager', label: 'Manager', description: 'I lead a team and am accountable for their output' },
  { id: 'director-plus', label: 'Director or above', description: 'I set direction and own significant outcomes' },
]

const INDUSTRIES = [
  'Tech', 'Finance', 'Healthcare', 'Retail / eCommerce', 'Agency / Consulting',
  'Education', 'Public sector', 'Media / Creative', 'Property / Construction', 'Other',
]

const CORPORATE_GOALS = [
  { id: 'get-promoted', label: 'Get promoted', description: 'I want to move up to the next level' },
  { id: 'more-responsibility', label: 'More responsibility', description: 'Own bigger things without a title change' },
  { id: 'move-teams', label: 'Move teams', description: 'Work in a different area of the business' },
  { id: 'build-visibility', label: 'Build visibility', description: 'I want the right people to know my work' },
  { id: 'reduce-stress', label: 'Reduce stress', description: 'I want to feel more in control day to day' },
  { id: 'lead-better', label: 'Lead better', description: 'Be a more effective manager or leader' },
  { id: 'earn-more', label: 'Earn more', description: 'I want to increase my income' },
  { id: 'stay-on-top', label: 'Stay on top', description: 'Keep delivering consistently well' },
]

const CORPORATE_BLOCKERS = [
  'Too many meetings', 'No clear priorities', 'Difficult manager', 'Low confidence',
  'No time to think', 'Too much admin', 'Imposter syndrome', 'Poor work-life balance',
  'Unclear on what good looks like', 'Not enough recognition',
]

const SE_WORK_TYPES = [
  { id: 'freelance-creative', label: 'Freelance creative', description: 'Design, writing, photography, video, music' },
  { id: 'consultant', label: 'Consultant', description: 'Advisory, strategy, expertise for hire' },
  { id: 'coach-trainer', label: 'Coach or trainer', description: '1:1 or group coaching, courses, workshops' },
  { id: 'agency-owner', label: 'Agency owner', description: 'Small team delivering client work' },
  { id: 'product-saas', label: 'Product or SaaS', description: 'Building a software product or app' },
  { id: 'trades-service', label: 'Trades or service', description: 'Skilled trade or local service business' },
  { id: 'content-creator', label: 'Content creator', description: 'Social, newsletter, YouTube, podcasting' },
  { id: 'other', label: 'Other', description: 'Something else' },
]

const SE_STAGES = [
  { id: 'just-launched', label: 'Just launched (under 1 year)', description: 'Finding my feet, getting first clients' },
  { id: 'early-stage', label: 'Early stage (1–2 years)', description: 'Some traction, still figuring it out' },
  { id: 'growing', label: 'Growing (2–4 years)', description: 'Consistent revenue, building systems' },
  { id: 'established', label: 'Established (4+ years)', description: 'Stable base, focused on scaling or freedom' },
]

const SE_GOALS = [
  { id: 'hit-revenue-target', label: 'Hit a revenue target', description: 'I have a number I want to reach' },
  { id: 'land-big-client', label: 'Land a big client', description: 'I want one transformative client or project' },
  { id: 'launch-something', label: 'Launch something new', description: 'A new offer, product or service' },
  { id: 'get-more-freedom', label: 'Get more freedom', description: 'Work less, earn the same or more' },
  { id: 'build-a-team', label: 'Build a team', description: 'Hire my first person or grow my team' },
  { id: 'go-full-time', label: 'Go full-time', description: 'I want this to be my only income' },
  { id: 'scale-up', label: 'Scale up', description: 'Grow revenue significantly this year' },
]

const SE_BLOCKERS = [
  'Feast and famine income', 'Scope creep from clients', 'Undercharging for work',
  'Working in isolation', 'Wearing too many hats', 'Difficult clients',
  'No systems or processes', 'Inconsistent routine', 'Procrastination', 'Underestimating admin',
]

const STUDENT_LEVELS = [
  { id: 'secondary-school', label: 'Secondary school', description: 'GCSEs, A-levels or equivalent' },
  { id: 'undergraduate', label: 'Undergraduate', description: "Bachelor's degree" },
  { id: 'postgraduate', label: 'Postgraduate', description: "Master's or PhD" },
  { id: 'professional-qualification', label: 'Professional qualification', description: 'ACCA, Bar, CIMA, CIPD etc' },
  { id: 'online-self-study', label: 'Online or self-study', description: 'Course, bootcamp or self-directed' },
  { id: 'apprenticeship', label: 'Apprenticeship', description: 'Degree or professional apprenticeship' },
]

const STUDENT_SUBJECTS = [
  'Science / Tech', 'Business / Economics', 'Arts / Humanities', 'Law',
  'Medicine / Health', 'Social Sciences', 'Engineering', 'Education', 'Other',
]

const STUDENT_TERM_POSITIONS = [
  { id: 'start-of-term', label: 'Start of term', description: 'Just getting going, setting up good habits' },
  { id: 'mid-term', label: 'Mid-term', description: 'In the thick of it, juggling everything' },
  { id: 'exam-deadline-crunch', label: 'Exam or deadline crunch', description: 'High pressure, need to focus hard' },
  { id: 'dissertation-project', label: 'Dissertation or project', description: 'Long-form deep work needed' },
  { id: 'between-terms', label: 'Between terms', description: 'Catching up, getting ahead, or resting' },
]

const STUDENT_GOALS = [
  { id: 'pass-exams', label: 'Pass my exams', description: 'I need to get through, not necessarily top grades' },
  { id: 'get-top-grade', label: 'Get a top grade', description: 'I want to perform at my best' },
  { id: 'finish-dissertation', label: 'Finish my dissertation', description: 'I need to make real progress on it' },
  { id: 'land-placement', label: 'Land a placement or job', description: 'Career move is the priority' },
  { id: 'stay-on-top-of-workload', label: 'Stay on top of workload', description: 'I just want to feel less behind' },
  { id: 'build-career-skills', label: 'Build career skills', description: 'I want to learn beyond the syllabus' },
]

const STUDENT_BLOCKERS = [
  'Procrastination', 'Hard to concentrate', 'No quiet space', 'Too many distractions',
  "Don't know where to start", 'Falling behind on work', 'Exam anxiety', 'Poor note-taking',
  'Low motivation', 'Comparing myself to others',
]

const FIGURING_DIRECTIONS = [
  { id: 'explore-career', label: 'Explore a new career direction', description: 'I want to understand my options better' },
  { id: 'start-build', label: 'Start or build something', description: 'A project, business or side hustle' },
  { id: 'develop-skill', label: 'Develop a skill', description: 'Learn something that opens new doors' },
  { id: 'get-stable', label: 'Get finances and life stable', description: 'Before I make any big moves' },
  { id: 'get-through', label: 'Just get through each day well', description: 'Small steps, one at a time' },
]

const FIGURING_BLOCKERS = [
  'Low motivation', 'Feeling stuck', 'Procrastination', 'Unclear what to do',
  'Financial pressure', 'Self-doubt', 'Overwhelmed by options', 'Difficulty focusing',
  'Comparison spiral', 'Isolation', 'Decision fatigue', 'Imposter syndrome',
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function optionLabel(options, id) {
  if (!id) return '—'
  const found = options.find((o) => (typeof o === 'string' ? o : o.id) === id)
  if (!found) return id
  return typeof found === 'string' ? found : found.label
}

function multiLabel(options, ids) {
  if (!ids || ids.length === 0) return '—'
  return ids.map((id) => optionLabel(options, id)).join(', ')
}

function getGoalOptions(userType) {
  if (userType === 'self-employed') return SE_GOALS
  if (userType === 'student') return STUDENT_GOALS
  if (userType === 'figuring-it-out') return FIGURING_DIRECTIONS
  return CORPORATE_GOALS
}

function getBlockerOptions(userType) {
  if (userType === 'self-employed') return SE_BLOCKERS
  if (userType === 'student') return STUDENT_BLOCKERS
  if (userType === 'figuring-it-out') return FIGURING_BLOCKERS
  return CORPORATE_BLOCKERS
}

function formatMemberSince(isoString) {
  if (!isoString) return '—'
  const d = new Date(isoString)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

function getModalConfig(field, userProfile) {
  const p = userProfile || {}
  switch (field) {
    case 'userType':
      return { field, title: 'Your situation', optionType: 'cards', multi: false, options: SITUATIONS, current: p.userType || null }
    case 'jobFunctions':
      return { field, title: 'Job function', optionType: 'chips', multi: true, options: JOB_FUNCTIONS, current: p.jobFunctions || [] }
    case 'seniority':
      return { field, title: 'Seniority', optionType: 'cards', multi: false, options: SENIORITY_OPTIONS, current: p.seniority || null }
    case 'industry':
      return { field, title: 'Industry', optionType: 'chips', multi: false, options: INDUSTRIES, current: p.industry || null }
    case 'workType':
      return { field, title: 'Work type', optionType: 'cards', multi: false, options: SE_WORK_TYPES, current: p.workType || null }
    case 'businessStage':
      return { field, title: 'Business stage', optionType: 'cards', multi: false, options: SE_STAGES, current: p.businessStage || null }
    case 'studyLevel':
      return { field, title: 'Study level', optionType: 'cards', multi: false, options: STUDENT_LEVELS, current: p.studyLevel || null }
    case 'subjectArea':
      return { field, title: 'Subject area', optionType: 'chips', multi: false, options: STUDENT_SUBJECTS, current: p.subjectArea || null }
    case 'termPosition':
      return { field, title: 'Term position', optionType: 'cards', multi: false, options: STUDENT_TERM_POSITIONS, current: p.termPosition || null }
    case 'goals':
      return { field, title: 'Goals', optionType: 'cards', multi: true, options: getGoalOptions(p.userType), current: p.goals || [] }
    case 'blockers':
      return { field, title: 'Blockers', optionType: 'chips', multi: true, options: getBlockerOptions(p.userType), current: p.blockers || [] }
    default:
      return null
  }
}

// ─── Section label ────────────────────────────────────────────────────────────

function SLabel({ children }) {
  return (
    <p
      className="text-[11px] font-medium uppercase tracking-widest mb-3"
      style={{ color: 'var(--color-muted)' }}
    >
      {children}
    </p>
  )
}

// ─── Settings row ─────────────────────────────────────────────────────────────

function SettingsRow({ label, value, onEdit }) {
  return (
    <div className="flex items-start justify-between gap-3 py-3" style={{ borderBottom: '1px solid var(--color-linen-dark)' }}>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-widest mb-0.5" style={{ color: 'var(--color-muted)' }}>
          {label}
        </p>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-ink)' }}>
          {value || '—'}
        </p>
      </div>
      {onEdit && (
        <button
          onClick={onEdit}
          className="flex-shrink-0 text-xs underline pt-1"
          style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-sans)', fontSize: '12px' }}
        >
          Edit
        </button>
      )}
    </div>
  )
}

// ─── Bottom sheet modal ───────────────────────────────────────────────────────

function BottomSheet({ config, onSave, onClose }) {
  const [localValue, setLocalValue] = useState(config.current)

  const handleToggle = (id) => {
    if (config.multi) {
      setLocalValue((prev) => {
        const arr = Array.isArray(prev) ? prev : []
        return arr.includes(id) ? arr.filter((v) => v !== id) : [...arr, id]
      })
    } else {
      setLocalValue(id)
    }
  }

  const handleSave = () => {
    onSave(config.field, localValue)
    onClose()
  }

  const isActive = (id) => {
    if (config.multi) return Array.isArray(localValue) && localValue.includes(id)
    return localValue === id
  }

  return (
    <>
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 40 }}
      />
      <div
        style={{
          position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
          width: '100%', maxWidth: '430px', zIndex: 50,
          display: 'flex', flexDirection: 'column',
          background: 'var(--color-white)',
          borderRadius: '20px 20px 0 0',
          maxHeight: '82vh',
        }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: 'var(--color-border-dark)' }} />
        </div>

        {/* Header */}
        <div
          className="flex items-center justify-between px-5 pb-4 pt-2"
          style={{ borderBottom: '1px solid var(--color-border)' }}
        >
          <h3 className="text-base font-medium" style={{ color: 'var(--color-ink)' }}>
            {config.title}
          </h3>
          <button
            onClick={onClose}
            className="flex items-center justify-center"
            style={{ width: '32px', height: '32px', color: 'var(--color-muted)' }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Options */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {config.optionType === 'chips' && (
            <div className="grid grid-cols-2 gap-1.5">
              {config.options.map((opt) => {
                const id = typeof opt === 'string' ? opt : opt.id
                const label = typeof opt === 'string' ? opt : opt.label
                return (
                  <button
                    key={id}
                    onClick={() => handleToggle(id)}
                    className={`grid-chip ${isActive(id) ? 'grid-chip-active' : ''}`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          )}

          {config.optionType === 'cards' && (
            <div className="space-y-1.5">
              {config.options.map((opt) => {
                const id = typeof opt === 'string' ? opt : opt.id
                const label = typeof opt === 'string' ? opt : opt.label
                const desc = opt.description || opt.sub || ''
                return (
                  <button
                    key={id}
                    onClick={() => handleToggle(id)}
                    className={`select-card w-full text-left ${isActive(id) ? 'select-card-active' : ''}`}
                  >
                    <div className="font-medium text-sm" style={{ color: 'var(--color-ink)' }}>
                      {label}
                    </div>
                    {desc && (
                      <div className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                        {desc}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Save */}
        <div className="px-5 pt-3 pb-8" style={{ borderTop: '1px solid var(--color-border)' }}>
          <button className="btn-primary" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SettingsScreen({
  user, userProfile, history, streakCount, bestStreak, onSaveUser, onSaveProfile, onClearAll, onBack,
}) {
  const profile = userProfile || {}

  // Section 1 state
  const [firstName, setFirstName] = useState(user?.firstName || '')
  const [email, setEmail] = useState(user?.email || '')

  // Modal state
  const [activeModal, setActiveModal] = useState(null)

  // Preferences state
  const [reminderTime, setReminderTime] = useState(
    () => localStorage.getItem('daye_reminder_time') || '08:00'
  )

  // Reset confirm state
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  // Stats
  const memberSince = formatMemberSince(localStorage.getItem('daye_member_since'))
  const plansCompleted = (history || []).length

  const handleSaveUser = () => {
    if (!firstName.trim()) return
    onSaveUser({ ...user, firstName: firstName.trim(), email: email.trim() })
  }

  const handleSaveReminderTime = (val) => {
    setReminderTime(val)
    localStorage.setItem('daye_reminder_time', val)
  }

  const handleSaveProfileField = (field, value) => {
    onSaveProfile({ ...profile, [field]: value })
  }

  const openModal = (field) => {
    const config = getModalConfig(field, profile)
    if (config) setActiveModal(config)
  }

  // Display values
  const situationLabel = optionLabel(SITUATIONS, profile.userType)
  const jfLabel = multiLabel(JOB_FUNCTIONS, profile.jobFunctions)
  const seniorityLabel = optionLabel(SENIORITY_OPTIONS, profile.seniority)
  const industryLabel = profile.industry || '—'
  const workTypeLabel = optionLabel(SE_WORK_TYPES, profile.workType)
  const stageLabel = optionLabel(SE_STAGES, profile.businessStage)
  const studyLevelLabel = optionLabel(STUDENT_LEVELS, profile.studyLevel)
  const subjectLabel = profile.subjectArea || '—'
  const termLabel = optionLabel(STUDENT_TERM_POSITIONS, profile.termPosition)
  const goalsLabel = multiLabel(getGoalOptions(profile.userType), profile.goals)
  const blockersLabel = (profile.blockers || []).join(', ') || '—'

  return (
    <div className="screen">
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="mb-6">
          {onBack && (
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
          )}
          <h1
            style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--color-ink)', fontSize: '28px' }}
            className="font-normal leading-tight"
          >
            Your profile.
          </h1>
        </div>

        {/* ── Section 1: YOU ── */}
        <div className="mb-6">
          <SLabel>You</SLabel>
          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-medium uppercase tracking-widest block mb-1.5" style={{ color: 'var(--color-muted)' }}>
                First name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
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
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
              />
            </div>
          </div>
          <div className="flex justify-end mt-3">
            <button
              onClick={handleSaveUser}
              disabled={!firstName.trim()}
              className="px-4 py-1.5 rounded-xl text-sm font-medium transition-all active:scale-95 disabled:opacity-30"
              style={{ background: 'var(--color-ink)', color: 'var(--color-white)', fontSize: '13px' }}
            >
              Update
            </button>
          </div>
        </div>

        {/* ── Section 2: YOUR SITUATION ── */}
        <div className="mb-6">
          <SLabel>Your situation</SLabel>
          <SettingsRow label="Situation" value={situationLabel} onEdit={() => openModal('userType')} />

          {profile.userType === 'corporate' && (
            <>
              <SettingsRow label="Job function" value={jfLabel} onEdit={() => openModal('jobFunctions')} />
              <SettingsRow label="Seniority" value={seniorityLabel} onEdit={() => openModal('seniority')} />
              <SettingsRow label="Industry" value={industryLabel} onEdit={() => openModal('industry')} />
            </>
          )}

          {profile.userType === 'self-employed' && (
            <>
              <SettingsRow label="Work type" value={workTypeLabel} onEdit={() => openModal('workType')} />
              <SettingsRow label="Business stage" value={stageLabel} onEdit={() => openModal('businessStage')} />
            </>
          )}

          {profile.userType === 'student' && (
            <>
              <SettingsRow label="Study level" value={studyLevelLabel} onEdit={() => openModal('studyLevel')} />
              <SettingsRow label="Subject area" value={subjectLabel} onEdit={() => openModal('subjectArea')} />
              <SettingsRow label="Term position" value={termLabel} onEdit={() => openModal('termPosition')} />
            </>
          )}

          <SettingsRow label="Goal" value={goalsLabel} onEdit={() => openModal('goals')} />
          <SettingsRow label="Blockers" value={blockersLabel} onEdit={() => openModal('blockers')} />
        </div>

        {/* ── Section 3: YOUR STATS ── */}
        <div className="mb-6">
          <SLabel>Your stats</SLabel>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { label: 'Member since', value: memberSince },
              { label: 'Plans completed', value: String(plansCompleted) },
              { label: 'Current streak', value: `${streakCount} day${streakCount !== 1 ? 's' : ''}` },
              { label: 'Best streak', value: `${bestStreak} day${bestStreak !== 1 ? 's' : ''}` },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="rounded-2xl p-4"
                style={{ background: 'var(--color-white)', border: '1px solid var(--color-border)' }}
              >
                <p className="text-[11px] font-medium uppercase tracking-widest mb-1.5" style={{ color: 'var(--color-muted)' }}>
                  {label}
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: label === 'Member since' ? '18px' : '24px',
                    color: 'var(--color-ink)',
                    lineHeight: 1.2,
                  }}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Section 4: PREFERENCES ── */}
        <div className="mb-6">
          <SLabel>Preferences</SLabel>

          <div className="mb-4">
            <label className="text-[11px] font-medium uppercase tracking-widest block mb-1.5" style={{ color: 'var(--color-muted)' }}>
              Morning reminder
            </label>
            <input
              type="time"
              value={reminderTime}
              onChange={(e) => handleSaveReminderTime(e.target.value)}
              className="input-field"
              style={{ maxWidth: '160px' }}
            />
            <p className="text-xs mt-1.5" style={{ color: 'var(--color-muted)' }}>
              In-app reminder only for now.
            </p>
          </div>

          <div>
            {showClearConfirm ? (
              <div
                className="rounded-2xl p-4"
                style={{ border: '1px solid var(--color-border-dark)', background: 'var(--color-white)' }}
              >
                <p className="text-sm mb-3" style={{ color: 'var(--color-ink)' }}>
                  Are you sure? This cannot be undone.
                </p>
                <div className="flex gap-2">
                  <button
                    className="btn-ghost flex-1 py-2.5"
                    style={{ fontSize: '13px' }}
                    onClick={() => setShowClearConfirm(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-95"
                    style={{ background: '#c53030', color: '#fff', border: 'none', cursor: 'pointer' }}
                    onClick={onClearAll}
                  >
                    Yes, clear everything
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="text-sm"
                style={{ color: 'var(--color-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                Clear all data and start over
              </button>
            )}
          </div>
        </div>

        {/* ── Section 5: ABOUT ── */}
        <div className="mb-8">
          <SLabel>About</SLabel>
          <div
            className="rounded-2xl px-5 py-4 text-center space-y-2"
            style={{ background: 'var(--color-white)', border: '1px solid var(--color-border)' }}
          >
            <p className="text-sm font-medium" style={{ color: 'var(--color-muted)' }}>Daye v1.0</p>
            <p
              style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '14px', color: 'var(--color-ink)' }}
            >
              Your day, decided.
            </p>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
              Made with care for people who want to do their best work.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom sheet modal */}
      {activeModal && (
        <BottomSheet
          config={activeModal}
          onSave={handleSaveProfileField}
          onClose={() => setActiveModal(null)}
        />
      )}
    </div>
  )
}

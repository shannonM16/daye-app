import { useState } from 'react'
import { ProgressBar, BackButton, SelectCard, GridChip } from '../components/OnboardingUI'

const TOTAL = 5

const STUDY_LEVELS = [
  { id: 'secondary-school', label: 'Secondary school', description: 'GCSEs, A-levels or equivalent' },
  { id: 'undergraduate', label: 'Undergraduate', description: "Bachelor's degree" },
  { id: 'masters', label: "Master's degree", description: "Taught or research master's" },
  { id: 'phd', label: 'PhD / Doctorate', description: 'Research degree or doctoral programme' },
  { id: 'professional-qualification', label: 'Professional qualification', description: 'ACCA, Bar, CIMA, CIPD etc' },
  { id: 'online-self-study', label: 'Online or self-study', description: 'Course, bootcamp or self-directed' },
  { id: 'apprenticeship', label: 'Apprenticeship', description: 'Degree or professional apprenticeship' },
]

const SUBJECTS = [
  'Science / Tech', 'Business / Economics', 'Arts / Humanities', 'Law',
  'Medicine / Health', 'Social Sciences', 'Engineering', 'Education', 'Other',
]

const TERM_POSITIONS = [
  { id: 'start-of-term', label: 'Start of term', description: 'Just getting going, setting up good habits' },
  { id: 'mid-term', label: 'Mid-term', description: 'In the thick of it, juggling everything' },
  { id: 'exam-deadline-crunch', label: 'Exam or deadline crunch', description: 'High pressure, need to focus hard' },
  { id: 'dissertation-project', label: 'Dissertation or project', description: 'Long-form deep work needed' },
  { id: 'between-terms', label: 'Between terms', description: 'Catching up, getting ahead, or resting' },
]

const GOALS_BY_LEVEL = {
  'secondary-school': [
    { id: 'get-grades', label: 'Get the grades I need', description: 'Hit my target grades or beat them' },
    { id: 'get-into-uni', label: 'Get into my chosen university', description: 'Build the application I want' },
    { id: 'improve-weakest', label: 'Improve in my weakest subject', description: 'Turn a weakness into a strength' },
    { id: 'stop-cramming', label: 'Stop leaving things to the last minute', description: 'Build better revision habits' },
    { id: 'reduce-exam-anxiety', label: 'Feel less anxious about exams', description: 'Manage the pressure better' },
    { id: 'better-study-habits', label: 'Develop better study habits', description: 'Build routines that actually work' },
  ],
  'undergraduate': [
    { id: 'graduate-strong', label: 'Graduate with a strong degree', description: 'Get the grade I am capable of' },
    { id: 'land-grad-job', label: 'Land a graduate job or placement', description: 'Career move is the priority' },
    { id: 'postgrad-entry', label: 'Get into postgraduate study', description: 'Masters or PhD is the plan' },
    { id: 'skills-beyond-degree', label: 'Develop skills beyond my degree', description: 'Stand out from my peers' },
    { id: 'build-network', label: 'Build my network', description: 'Make the connections that matter' },
    { id: 'make-most-of-uni', label: 'Make the most of university life', description: 'Academic and personal growth' },
    { id: 'manage-wellbeing', label: 'Manage my wellbeing better', description: 'Study without burning out' },
  ],
  'masters': [
    { id: 'dissertation-high', label: 'Complete my dissertation to a high standard', description: 'Do the best work I am capable of' },
    { id: 'get-distinction', label: 'Get a distinction', description: 'Top grade is the target' },
    { id: 'move-into-academia', label: 'Move into academia', description: 'PhD or research career ahead' },
    { id: 'career-change', label: 'Use this to change career', description: 'This degree opens a new door' },
    { id: 'build-expertise', label: 'Build specialist expertise', description: 'Become genuinely expert in my field' },
    { id: 'land-role', label: 'Land a role in my field', description: 'Get hired in the area I have studied' },
  ],
  'phd': [
    { id: 'submit-thesis', label: 'Submit my thesis on time', description: 'Complete without running over' },
    { id: 'publish', label: 'Publish in a good journal', description: 'Get peer-reviewed work out there' },
    { id: 'present-conference', label: 'Present at a conference', description: 'Build my presence in the field' },
    { id: 'postdoc-academic', label: 'Secure a postdoc or academic position', description: 'Stay in academia after completion' },
    { id: 'research-profile', label: 'Develop my research profile', description: 'Be known for my work' },
    { id: 'finish-well', label: 'Finish without burning out', description: 'Complete this sustainably' },
  ],
  'professional-qualification': [
    { id: 'pass-first-time', label: 'Pass my exams first time', description: 'No resits — clean through' },
    { id: 'qualify-fast', label: 'Qualify as quickly as possible', description: 'Minimum time to the letters after my name' },
    { id: 'balance-study-work', label: 'Balance study with work effectively', description: 'Manage both without dropping either' },
    { id: 'advance-career', label: 'Advance my career through qualifying', description: 'This qualification opens the next door' },
    { id: 'employer-support', label: 'Get employer support for study', description: 'Study time, funding or both' },
  ],
  'online-self-study': [
    { id: 'complete-course', label: 'Complete the course', description: 'Finish what I started' },
    { id: 'build-portfolio', label: 'Build a portfolio', description: 'Create proof of what I can do' },
    { id: 'first-job', label: 'Get my first job in the field', description: 'Break into the industry' },
    { id: 'career-change-online', label: 'Change career successfully', description: 'Move into something new' },
    { id: 'apply-immediately', label: 'Apply what I learn immediately', description: 'Make it practical and real' },
  ],
  'apprenticeship': [
    { id: 'complete-apprenticeship', label: 'Complete my apprenticeship successfully', description: 'Pass everything and qualify' },
    { id: 'permanent-role', label: 'Get a permanent role', description: 'Convert to full employment' },
    { id: 'real-skills', label: 'Develop real skills', description: 'Learn things that actually matter at work' },
    { id: 'best-grade', label: 'Get the best grade I can', description: 'Academic performance matters to me' },
    { id: 'professional-network', label: 'Build my professional network', description: 'Make connections that last' },
  ],
}

const BLOCKERS_BY_LEVEL = {
  'secondary-school': [
    'Procrastination',
    'Hard to concentrate at home',
    'Phone and social media distraction',
    'Exam anxiety',
    "Don't understand the material",
    'Falling behind feels overwhelming',
    'No quiet space to study',
  ],
  'undergraduate': [
    'Procrastination',
    'Social life vs study balance',
    'Mental health and wellbeing',
    'Financial stress affecting focus',
    'Group work frustrations',
    'Unclear on career direction',
    'Comparison to other students',
    'Lecture content not engaging',
  ],
  'masters': [
    'Isolation',
    'Imposter syndrome',
    "Writer's block",
    'Supervisor relationship',
    'Perfectionism slowing progress',
    'Work-life-study balance',
    'Financial pressure',
    'Unclear research direction',
  ],
  'phd': [
    'Isolation',
    'Imposter syndrome',
    "Writer's block",
    'Supervisor relationship',
    'Perfectionism slowing progress',
    'Work-life-study balance',
    'Financial pressure',
    'Unclear research direction',
  ],
  'professional-qualification': [
    'Finding study time around work',
    'Exam anxiety',
    'Dry or difficult material',
    'Losing motivation between sittings',
    'Work not supporting study',
    'Isolation from other students',
  ],
  'online-self-study': [
    'Self-discipline without structure',
    'Losing momentum',
    'No accountability',
    'Technical difficulties',
    'Unclear on what to build',
    'Comparison to others in the cohort',
  ],
  'apprenticeship': [
    'Study-work balance',
    'Not enough support from employer',
    'Assessment anxiety',
    'Imposter syndrome at work',
    'Hard to find study time',
    'Unclear on what is expected',
  ],
}

function getGoals(studyLevel) {
  return GOALS_BY_LEVEL[studyLevel] || GOALS_BY_LEVEL['undergraduate']
}

function getBlockers(studyLevel) {
  return BLOCKERS_BY_LEVEL[studyLevel] || BLOCKERS_BY_LEVEL['undergraduate']
}

function getBlockerIntro(studyLevel) {
  if (studyLevel === 'phd') return "PhD can be isolating and non-linear — what gets in your way?"
  if (studyLevel === 'masters') return "What's making it harder to do your best work right now?"
  if (studyLevel === 'professional-qualification') return "Studying alongside work is hard — what gets in the way?"
  if (studyLevel === 'secondary-school') return "What makes it harder to sit down and study?"
  if (studyLevel === 'online-self-study') return "Self-directed study has its own challenges — what are yours?"
  return "Select all that apply, or skip if none fit."
}

export default function OnboardingStudent({ onComplete, onBack }) {
  const [step, setStep] = useState(0)
  const [studyLevel, setStudyLevel] = useState(null)
  const [subjectArea, setSubjectArea] = useState(null)
  const [subjectOther, setSubjectOther] = useState('')
  const [termPosition, setTermPosition] = useState(null)
  const [goals, setGoals] = useState([])
  const [blockers, setBlockers] = useState([])
  const [customBlocker, setCustomBlocker] = useState('')
  const [showTransition, setShowTransition] = useState(false)

  const canAdvance = [
    studyLevel !== null,
    subjectArea !== null,
    termPosition !== null,
    goals.length > 0,
    true,
  ][step]

  const handleContinue = () => {
    if (!canAdvance) return
    if (step < TOTAL - 1) {
      setStep((s) => s + 1)
    } else {
      setShowTransition(true)
      setTimeout(() => {
        const allBlockers = customBlocker.trim() ? [...blockers, customBlocker.trim()] : blockers
        onComplete({
          studyLevel,
          subjectArea,
          subjectOther: subjectArea === 'Other' ? subjectOther : '',
          termPosition,
          goals,
          blockers: allBlockers,
        })
      }, 1500)
    }
  }

  if (showTransition) {
    return (
      <div className="screen items-center justify-center">
        <div className="text-center">
          <p className="text-[11px] tracking-widest uppercase text-stone-400 font-medium mb-8">Daily Focus</p>
          <h2 className="text-[22px] font-bold text-stone-900 mb-3">Building your profile...</h2>
          <div className="flex justify-center gap-2 mt-6">
            <span className="w-2 h-2 rounded-full bg-stone-400 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 rounded-full bg-stone-400 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 rounded-full bg-stone-400 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="screen">
      <div className="flex-1 overflow-y-auto">
        <ProgressBar step={step} total={TOTAL} />
        <BackButton onClick={step > 0 ? () => setStep((s) => s - 1) : onBack} />

        {step === 0 && (
          <>
            <h1 className="text-[22px] font-bold text-stone-900 mb-1">What level are you studying at?</h1>
            <p className="text-[13px] text-stone-400 mb-4">Choose the one that fits.</p>
            <div className="space-y-1.5">
              {STUDY_LEVELS.map((opt) => (
                <SelectCard key={opt.id} label={opt.label} description={opt.description} active={studyLevel === opt.id} onClick={() => setStudyLevel(opt.id)} />
              ))}
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h1 className="text-[22px] font-bold text-stone-900 mb-1">What subject area?</h1>
            <p className="text-[13px] text-stone-400 mb-4">Select the closest match.</p>
            <div className="grid grid-cols-2 gap-1.5">
              {SUBJECTS.map((sub) => (
                <GridChip key={sub} label={sub} active={subjectArea === sub} onClick={() => setSubjectArea(sub)} />
              ))}
            </div>
            {subjectArea === 'Other' && (
              <input
                type="text"
                value={subjectOther}
                onChange={(e) => { const v = e.target.value; setSubjectOther(v.length === 1 ? v.toUpperCase() : v) }}
                placeholder="Tell us more..."
                className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm text-stone-800 placeholder:text-stone-300 outline-none focus:border-stone-400 transition-colors bg-white mt-3"
                autoFocus
              />
            )}
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="text-[22px] font-bold text-stone-900 mb-1">Where are you in your term?</h1>
            <p className="text-[13px] text-stone-400 mb-4">This shapes your daily plan.</p>
            <div className="space-y-1.5">
              {TERM_POSITIONS.map((opt) => (
                <SelectCard key={opt.id} label={opt.label} description={opt.description} active={termPosition === opt.id} onClick={() => setTermPosition(opt.id)} />
              ))}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h1 className="text-[22px] font-bold text-stone-900 mb-1">What's your main goal right now?</h1>
            <p className="text-[13px] text-stone-400 mb-4">Select all that apply.</p>
            <div className="space-y-1.5">
              {getGoals(studyLevel).map((opt) => (
                <SelectCard
                  key={opt.id}
                  label={opt.label}
                  description={opt.description}
                  active={goals.includes(opt.id)}
                  onClick={() => setGoals((prev) => prev.includes(opt.id) ? prev.filter((g) => g !== opt.id) : [...prev, opt.id])}
                />
              ))}
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <h1 className="text-[22px] font-bold text-stone-900 mb-1">What gets in the way of your best work?</h1>
            <p className="text-[13px] text-stone-400 mb-4">{getBlockerIntro(studyLevel)}</p>
            <div className="grid grid-cols-2 gap-1.5 mb-4">
              {getBlockers(studyLevel).map((label) => (
                <GridChip
                  key={label}
                  label={label}
                  active={blockers.includes(label)}
                  onClick={() => setBlockers((prev) => prev.includes(label) ? prev.filter((b) => b !== label) : [...prev, label])}
                />
              ))}
            </div>
            <div>
              <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-widest mb-2">Anything else?</p>
              <input
                type="text"
                value={customBlocker}
                onChange={(e) => { const v = e.target.value; setCustomBlocker(v.length === 1 ? v.toUpperCase() : v) }}
                placeholder="Add your own..."
                className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm text-stone-800 placeholder:text-stone-300 outline-none focus:border-stone-400 transition-colors bg-white"
              />
            </div>
          </>
        )}
      </div>

      <div className="flex-shrink-0 pt-4">
        <button className="btn-primary" onClick={handleContinue} disabled={!canAdvance}>
          {step === TOTAL - 1 ? 'Get started' : 'Continue'}
        </button>
      </div>
    </div>
  )
}

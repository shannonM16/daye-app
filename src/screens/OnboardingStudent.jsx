import { useState } from 'react'
import { ProgressBar, BackButton, SelectCard, GridChip } from '../components/OnboardingUI'

const TOTAL = 5

const STUDY_LEVELS = [
  { id: 'secondary-school', label: 'Secondary school', description: 'GCSEs, A-levels or equivalent' },
  { id: 'undergraduate', label: 'Undergraduate', description: "Bachelor's degree" },
  { id: 'postgraduate', label: 'Postgraduate', description: "Master's or PhD" },
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

const GOALS = [
  { id: 'pass-exams', label: 'Pass my exams', description: 'I need to get through, not necessarily top grades' },
  { id: 'get-top-grade', label: 'Get a top grade', description: 'I want to perform at my best' },
  { id: 'finish-dissertation', label: 'Finish my dissertation', description: 'I need to make real progress on it' },
  { id: 'land-placement', label: 'Land a placement or job', description: 'Career move is the priority' },
  { id: 'stay-on-top-of-workload', label: 'Stay on top of my workload', description: 'I just want to feel less behind' },
  { id: 'build-career-skills', label: 'Build skills for my career', description: 'I want to learn beyond the syllabus' },
]

const STUDENT_BLOCKERS = [
  'Procrastination', 'Hard to concentrate', 'No quiet space', 'Too many distractions',
  "Don't know where to start", 'Falling behind on work', 'Exam anxiety', 'Poor note-taking',
  'Low motivation', 'Comparing myself to others',
]

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
    true, // blockers optional
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
              {GOALS.map((opt) => (
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
            <p className="text-[13px] text-stone-400 mb-4">Students often find these things hold them back:</p>
            <div className="grid grid-cols-2 gap-1.5 mb-4">
              {STUDENT_BLOCKERS.map((label) => (
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

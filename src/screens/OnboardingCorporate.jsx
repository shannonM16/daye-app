import { useState } from 'react'
import { ProgressBar, BackButton, SelectCard, GridChip } from '../components/OnboardingUI'

const TOTAL = 5

const JOB_FUNCTIONS = [
  { id: 'marketing', label: 'Marketing', sub: 'Campaigns, content, brand' },
  { id: 'sales', label: 'Sales', sub: 'Pitching, closing, CRM' },
  { id: 'operations', label: 'Operations', sub: 'Process, planning, vendors' },
  { id: 'finance', label: 'Finance', sub: 'Budgets, forecasting, compliance' },
  { id: 'product', label: 'Product', sub: 'Roadmap, specs, research' },
  { id: 'engineering', label: 'Engineering', sub: 'Coding, reviews, delivery' },
  { id: 'design', label: 'Design', sub: 'UX, visual, prototyping' },
  { id: 'hr-people', label: 'HR / People', sub: 'Recruitment, culture, L&D' },
  { id: 'legal', label: 'Legal', sub: 'Contracts, compliance, risk' },
  { id: 'executive', label: 'Executive', sub: 'Vision, stakeholders' },
  { id: 'other', label: 'Other', sub: 'Something else' },
]

const SENIORITY = [
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

const GOALS = [
  { id: 'get-promoted', label: 'Get promoted', description: 'I want to move up to the next level' },
  { id: 'more-responsibility', label: 'More responsibility', description: 'Own bigger things without a title change' },
  { id: 'move-teams', label: 'Move teams', description: 'Work in a different area of the business' },
  { id: 'build-visibility', label: 'Build visibility', description: 'I want the right people to know my work' },
  { id: 'reduce-stress', label: 'Reduce stress', description: 'I want to feel more in control day to day' },
  { id: 'lead-better', label: 'Lead better', description: 'Be a more effective manager or leader' },
  { id: 'earn-more', label: 'Earn more', description: 'I want to increase my income' },
  { id: 'stay-on-top', label: 'Stay on top', description: 'Keep delivering consistently well' },
]

const BLOCKERS = [
  'Too many meetings', 'No clear priorities', 'Difficult manager', 'Low confidence',
  'No time to think', 'Too much admin', 'Imposter syndrome', 'Poor work-life balance',
  'Unclear on what good looks like', 'Not enough recognition',
]

function getBlockerIntro(seniority, goals, jobFunctions) {
  const isManager = seniority === 'manager' || seniority === 'director-plus'
  const goal = (goals || [])[0]
  if (isManager && goal === 'lead-better') return "Great managers remove obstacles for their team — what's getting in yours?"
  if (isManager) return "What's making it harder to lead effectively right now?"
  if (goal === 'get-promoted') return "What's standing between you and the next level?"
  if (goal === 'reduce-stress') return "What's driving most of your stress right now?"
  if (goal === 'build-visibility') return "What's stopping you from being more visible?"
  if (goal === 'earn-more') return "What's getting in the way of earning what you're worth?"
  return "Select all that apply, or skip if none fit."
}

export default function OnboardingCorporate({ onComplete, onBack }) {
  const [step, setStep] = useState(0)
  const [jobFunctions, setJobFunctions] = useState([])
  const [jobFunctionOther, setJobFunctionOther] = useState('')
  const [seniority, setSeniority] = useState(null)
  const [industry, setIndustry] = useState(null)
  const [industryOther, setIndustryOther] = useState('')
  const [goals, setGoals] = useState([])
  const [blockers, setBlockers] = useState([])
  const [customBlocker, setCustomBlocker] = useState('')
  const [showTransition, setShowTransition] = useState(false)

  const canAdvance = [
    jobFunctions.length > 0,
    seniority !== null,
    industry !== null,
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
          jobFunctions,
          jobFunctionOther: jobFunctions.includes('other') ? jobFunctionOther : '',
          seniority,
          industry,
          industryOther: industry === 'Other' ? industryOther : '',
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
            <h1 className="text-[22px] font-bold text-stone-900 mb-1">What do you work in?</h1>
            <p className="text-[13px] text-stone-400 mb-4">Select all that apply.</p>
            <div className="grid grid-cols-2 gap-1.5">
              {JOB_FUNCTIONS.map((jf) => (
                <GridChip
                  key={jf.id}
                  label={jf.label}
                  active={jobFunctions.includes(jf.id)}
                  onClick={() =>
                    setJobFunctions((prev) =>
                      prev.includes(jf.id) ? prev.filter((j) => j !== jf.id) : [...prev, jf.id]
                    )
                  }
                />
              ))}
            </div>
            {jobFunctions.includes('other') && (
              <input
                type="text"
                value={jobFunctionOther}
                onChange={(e) => setJobFunctionOther(e.target.value)}
                placeholder="Tell us more..."
                className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm text-stone-800 placeholder:text-stone-300 outline-none focus:border-stone-400 transition-colors bg-white mt-3"
                autoFocus
              />
            )}
          </>
        )}

        {step === 1 && (
          <>
            <h1 className="text-[22px] font-bold text-stone-900 mb-1">What level are you at?</h1>
            <p className="text-[13px] text-stone-400 mb-4">Choose the one that fits best.</p>
            <div className="space-y-1.5">
              {SENIORITY.map((opt) => (
                <SelectCard key={opt.id} label={opt.label} description={opt.description} active={seniority === opt.id} onClick={() => setSeniority(opt.id)} />
              ))}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="text-[22px] font-bold text-stone-900 mb-1">What industry are you in?</h1>
            <p className="text-[13px] text-stone-400 mb-4">Select the closest match.</p>
            <div className="grid grid-cols-2 gap-1.5">
              {INDUSTRIES.map((ind) => (
                <GridChip key={ind} label={ind} active={industry === ind} onClick={() => setIndustry(ind)} />
              ))}
            </div>
            {industry === 'Other' && (
              <input
                type="text"
                value={industryOther}
                onChange={(e) => setIndustryOther(e.target.value)}
                placeholder="Tell us more..."
                className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm text-stone-800 placeholder:text-stone-300 outline-none focus:border-stone-400 transition-colors bg-white mt-3"
                autoFocus
              />
            )}
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
                  onClick={() =>
                    setGoals((prev) =>
                      prev.includes(opt.id) ? prev.filter((g) => g !== opt.id) : [...prev, opt.id]
                    )
                  }
                />
              ))}
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <h1 className="text-[22px] font-bold text-stone-900 mb-1">What's getting in your way?</h1>
            <p className="text-[13px] text-stone-400 mb-4">{getBlockerIntro(seniority, goals, jobFunctions)}</p>
            <div className="grid grid-cols-2 gap-1.5 mb-4">
              {BLOCKERS.map((label) => (
                <GridChip
                  key={label}
                  label={label}
                  active={blockers.includes(label)}
                  onClick={() =>
                    setBlockers((prev) =>
                      prev.includes(label) ? prev.filter((b) => b !== label) : [...prev, label]
                    )
                  }
                />
              ))}
            </div>
            <div>
              <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-widest mb-2">Anything else?</p>
              <input
                type="text"
                value={customBlocker}
                onChange={(e) => setCustomBlocker(e.target.value)}
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

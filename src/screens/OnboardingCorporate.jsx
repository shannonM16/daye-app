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

const IC_GOALS = [
  { id: 'get-promoted-mgr', label: 'Get promoted to manager', description: 'Move into a people leadership role' },
  { id: 'become-expert', label: 'Become the go-to expert', description: 'Be the person everyone turns to in my field' },
  { id: 'build-visibility', label: 'Build my visibility', description: 'Get the right people to know my work' },
  { id: 'move-teams', label: 'Move to a different team', description: 'Work in a different area or function' },
  { id: 'improve-craft', label: 'Improve my craft', description: 'Get significantly better at what I do' },
  { id: 'find-meaning', label: 'Find more meaning', description: 'Feel like my work matters' },
  { id: 'reduce-stress', label: 'Reduce stress', description: 'Feel more in control day to day' },
]

const MANAGER_GOALS = [
  { id: 'get-promoted-dir', label: 'Get promoted to director', description: 'Move into a senior leadership role' },
  { id: 'better-people-mgr', label: 'Become a better people manager', description: 'Develop the people side of leadership' },
  { id: 'high-performing-team', label: 'Build a high performing team', description: 'Create a team that delivers exceptional results' },
  { id: 'strategic-influence', label: 'Increase my strategic influence', description: 'Have more say in the direction of the business' },
  { id: 'bigger-role', label: 'Move to a bigger role', description: 'Take on more at this company or a new one' },
  { id: 'transformational-project', label: 'Deliver a transformational project', description: 'Lead something that genuinely changes things' },
  { id: 'balance-leadership', label: 'Balance leadership and delivery', description: 'Stop being in the weeds and lead more effectively' },
]

const DIRECTOR_GOALS = [
  { id: 'get-to-csuite', label: 'Get to C-suite or equivalent', description: 'Reach the top of my function or organisation' },
  { id: 'best-team', label: 'Build the team of my career', description: 'Assemble and develop truly exceptional people' },
  { id: 'lead-transformation', label: 'Lead a major transformation', description: 'Drive change at scale across the organisation' },
  { id: 'market-value', label: 'Increase my market value', description: 'Be sought after in my industry' },
  { id: 'new-industry', label: 'Move to a new industry or sector', description: 'Apply my skills in a different context' },
  { id: 'external-profile', label: 'Build my external profile', description: 'Become known beyond my current organisation' },
  { id: 'better-balance', label: 'Find a better balance at this level', description: 'Lead effectively without sacrificing everything else' },
]

function getGoals(seniority) {
  if (seniority === 'director-plus') return DIRECTOR_GOALS
  if (seniority === 'manager') return MANAGER_GOALS
  return IC_GOALS
}

const IC_BLOCKERS = [
  'Too many meetings eating my focus time',
  'Not enough visibility for my work',
  'Unclear on what good looks like',
  'Difficult manager relationship',
  'Skills gap holding me back',
  'Imposter syndrome',
  'Not being stretched enough',
  'Too much admin',
  'Poor work-life balance',
]

const MANAGER_BLOCKERS = [
  'Not enough time for strategic work',
  'Team performance issues',
  'Difficult direct report relationship',
  'Unclear priorities from above',
  'Too many stakeholders to manage',
  'Limited budget or resources',
  'Not developing my team effectively',
  'Too much in the weeds, not leading',
  'Work-life balance at leadership level',
]

const DIRECTOR_BLOCKERS = [
  'Board or exec alignment challenges',
  'Organisational politics and resistance',
  'Building the right team',
  'Strategic uncertainty or lack of clarity',
  'Managing up effectively',
  'Pace of change is too fast or slow',
  'Work-life balance at this level',
  'External pressures (market, competition)',
  'Succession or talent gaps',
]

function getBlockers(seniority) {
  if (seniority === 'director-plus') return DIRECTOR_BLOCKERS
  if (seniority === 'manager') return MANAGER_BLOCKERS
  return IC_BLOCKERS
}

function getBlockerIntro(seniority, goals) {
  const goal = (goals || [])[0]
  if (seniority === 'director-plus') return "What's making it harder to lead at this level?"
  if (seniority === 'manager') {
    if (goal === 'balance-leadership') return "What's getting in the way of leading the way you want to?"
    return "What's making it harder to lead effectively right now?"
  }
  if (goal === 'get-promoted-mgr') return "What's standing between you and the next level?"
  if (goal === 'reduce-stress') return "What's driving most of your stress right now?"
  if (goal === 'build-visibility') return "What's stopping you from being more visible?"
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
                onChange={(e) => {
                  const v = e.target.value
                  setJobFunctionOther(v.length === 1 ? v.toUpperCase() : v)
                }}
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
                onChange={(e) => {
                  const v = e.target.value
                  setIndustryOther(v.length === 1 ? v.toUpperCase() : v)
                }}
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
              {getGoals(seniority).map((opt) => (
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
            <p className="text-[13px] text-stone-400 mb-4">{getBlockerIntro(seniority, goals)}</p>
            <div className="grid grid-cols-2 gap-1.5 mb-4">
              {getBlockers(seniority).map((label) => (
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
                onChange={(e) => {
                  const v = e.target.value
                  setCustomBlocker(v.length === 1 ? v.toUpperCase() : v)
                }}
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

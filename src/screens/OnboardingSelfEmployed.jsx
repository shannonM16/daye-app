import { useState } from 'react'
import { ProgressBar, BackButton, SelectCard, GridChip } from '../components/OnboardingUI'

const TOTAL = 5

const WORK_TYPES = [
  { id: 'freelance-creative', label: 'Freelance creative', description: 'Design, writing, photography, video, music' },
  { id: 'consultant', label: 'Consultant', description: 'Advisory, strategy, expertise for hire' },
  { id: 'coach-trainer', label: 'Coach or trainer', description: '1:1 or group coaching, courses, workshops' },
  { id: 'agency-owner', label: 'Agency owner', description: 'Small team delivering client work' },
  { id: 'product-saas', label: 'Product or SaaS', description: 'Building a software product or app' },
  { id: 'trades-service', label: 'Trades or service', description: 'Skilled trade or local service business' },
  { id: 'content-creator', label: 'Content creator', description: 'Social, newsletter, YouTube, podcasting' },
  { id: 'other', label: 'Other', description: 'Something else' },
]

const STAGES = [
  { id: 'just-launched', label: 'Just launched (under 1 year)', description: 'Finding my feet, getting first clients' },
  { id: 'early-stage', label: 'Early stage (1–2 years)', description: 'Some traction, still figuring it out' },
  { id: 'growing', label: 'Growing (2–4 years)', description: 'Consistent revenue, building systems' },
  { id: 'established', label: 'Established (4+ years)', description: 'Stable base, focused on scaling or freedom' },
]

const PRESSURES = [
  'Getting new clients', 'Delivering current work', 'Managing cashflow',
  'Pricing my work', 'Standing out from competition', 'Avoiding burnout',
  'Building a team', 'Finding focus', 'Too much admin', 'Inconsistent income',
]

const GOALS = [
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

export default function OnboardingSelfEmployed({ onComplete, onBack }) {
  const [step, setStep] = useState(0)
  const [workType, setWorkType] = useState(null)
  const [workTypeOther, setWorkTypeOther] = useState('')
  const [businessStage, setBusinessStage] = useState(null)
  const [pressures, setPressures] = useState([])
  const [goals, setGoals] = useState([])
  const [blockers, setBlockers] = useState([])
  const [customBlocker, setCustomBlocker] = useState('')
  const [showTransition, setShowTransition] = useState(false)

  const canAdvance = [
    workType !== null,
    businessStage !== null,
    pressures.length > 0,
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
          workType,
          workTypeOther: workType === 'other' ? workTypeOther : '',
          businessStage,
          pressures,
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
            <h1 className="text-[22px] font-bold text-stone-900 mb-1">What type of work do you do?</h1>
            <p className="text-[13px] text-stone-400 mb-4">Choose the one that fits best.</p>
            <div className="space-y-1.5">
              {WORK_TYPES.map((opt) => (
                <SelectCard key={opt.id} label={opt.label} description={opt.description} active={workType === opt.id} onClick={() => setWorkType(opt.id)} />
              ))}
              {workType === 'other' && (
                <input
                  type="text"
                  value={workTypeOther}
                  onChange={(e) => setWorkTypeOther(e.target.value)}
                  placeholder="Tell us more..."
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm text-stone-800 placeholder:text-stone-300 outline-none focus:border-stone-400 transition-colors bg-white mt-1"
                  autoFocus
                />
              )}
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h1 className="text-[22px] font-bold text-stone-900 mb-1">Where is your business right now?</h1>
            <p className="text-[13px] text-stone-400 mb-4">Be honest — it helps us calibrate your plan.</p>
            <div className="space-y-1.5">
              {STAGES.map((opt) => (
                <SelectCard key={opt.id} label={opt.label} description={opt.description} active={businessStage === opt.id} onClick={() => setBusinessStage(opt.id)} />
              ))}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="text-[22px] font-bold text-stone-900 mb-1">What's your biggest pressure right now?</h1>
            <p className="text-[13px] text-stone-400 mb-4">Select all that apply.</p>
            <div className="grid grid-cols-2 gap-1.5">
              {PRESSURES.map((label) => (
                <GridChip
                  key={label}
                  label={label}
                  active={pressures.includes(label)}
                  onClick={() => setPressures((prev) => prev.includes(label) ? prev.filter((p) => p !== label) : [...prev, label])}
                />
              ))}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h1 className="text-[22px] font-bold text-stone-900 mb-1">What's your main goal?</h1>
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
            <h1 className="text-[22px] font-bold text-stone-900 mb-1">What makes running your business hard?</h1>
            <p className="text-[13px] text-stone-400 mb-4">Here are the challenges most people in your position face:</p>
            <div className="grid grid-cols-2 gap-1.5 mb-4">
              {SE_BLOCKERS.map((label) => (
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

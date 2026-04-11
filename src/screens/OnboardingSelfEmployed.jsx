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

// Generic onboarding pressures (unchanged — these are profile pressures, not daily check-in)
const PRESSURES = [
  'Getting new clients', 'Delivering current work', 'Managing cashflow',
  'Pricing my work', 'Standing out from competition', 'Avoiding burnout',
  'Building a team', 'Finding focus', 'Too much admin', 'Inconsistent income',
]

// Per-type goal options
const SE_GOALS_BY_TYPE = {
  'freelance-creative': [
    { id: 'raise-rates', label: 'Raise my rates', description: 'Charge what my work is actually worth' },
    { id: 'better-quality-clients', label: 'Land better quality clients', description: 'Work with people who value what I do' },
    { id: 'more-referrals', label: 'Get more referrals', description: 'Grow through word of mouth' },
    { id: 'stronger-portfolio', label: 'Build a stronger portfolio', description: 'Show the kind of work I want to attract' },
    { id: 'new-niche', label: 'Move into a new niche', description: 'Specialise in work I care more about' },
    { id: 'consistent-work', label: 'Get more consistent work', description: 'Reduce the feast and famine cycle' },
  ],
  'consultant': [
    { id: 'grow-retainer', label: 'Grow my retainer income', description: 'Build predictable recurring revenue' },
    { id: 'thought-leadership', label: 'Build my thought leadership', description: 'Become known for my expertise' },
    { id: 'raise-day-rate', label: 'Raise my day rate', description: 'Charge more for my time and knowledge' },
    { id: 'flagship-client', label: 'Land a flagship client', description: 'Win a prestigious or transformative account' },
    { id: 'launch-service', label: 'Launch a new service', description: 'Add a new offering to my portfolio' },
    { id: 'build-team-consult', label: 'Build a team', description: 'Grow beyond just me' },
  ],
  'coach-trainer': [
    { id: 'fill-programme', label: 'Fill my coaching programme', description: 'Get to full capacity with great clients' },
    { id: 'launch-course', label: 'Launch a new course', description: 'Package my knowledge for a wider audience' },
    { id: 'get-testimonials', label: 'Get more testimonials', description: 'Build social proof that converts' },
    { id: 'grow-audience-coach', label: 'Grow my audience', description: 'Reach more people who need what I offer' },
    { id: 'raise-prices-coach', label: 'Raise my prices', description: 'Reflect the transformation I deliver' },
    { id: 'passive-income', label: 'Create passive income', description: 'Earn while I\'m not actively working' },
  ],
  'content-creator': [
    { id: 'grow-audience-content', label: 'Grow my audience significantly', description: 'Reach more people with my content' },
    { id: 'first-brand-deal', label: 'Land my first or next brand deal', description: 'Monetise through partnerships' },
    { id: 'launch-product-content', label: 'Launch a product or service', description: 'Build something beyond ad revenue' },
    { id: 'be-consistent', label: 'Be more consistent', description: 'Show up regularly without burning out' },
    { id: 'monetise-content', label: 'Monetise my content better', description: 'Turn my audience into income' },
    { id: 'build-community', label: 'Build a community', description: 'Create a loyal engaged following' },
  ],
  'product-saas': [
    { id: 'first-paying-users', label: 'Get first paying users', description: 'Validate demand with real revenue' },
    { id: 'monthly-revenue', label: 'Hit a monthly revenue target', description: 'I have an MRR number to reach' },
    { id: 'ship-mvp', label: 'Ship the MVP', description: 'Get something real in front of users' },
    { id: 'raise-funding', label: 'Raise funding', description: 'Bring in investment to accelerate' },
    { id: 'grow-users', label: 'Grow to X users', description: 'Hit a user or signup milestone' },
    { id: 'improve-retention', label: 'Improve retention', description: 'Keep users coming back and staying' },
  ],
  'agency-owner': [
    { id: 'win-new-client', label: 'Win a significant new client', description: 'Land an account that changes the business' },
    { id: 'stronger-team', label: 'Build a stronger team', description: 'Hire and develop the right people' },
    { id: 'improve-margins', label: 'Improve profit margins', description: 'Keep more of what we earn' },
    { id: 'better-systems', label: 'Create better systems', description: 'Build a business that runs without me' },
    { id: 'reduce-delivery', label: 'Reduce my involvement in delivery', description: 'Stop being the bottleneck' },
    { id: 'scale-revenue', label: 'Scale revenue', description: 'Grow the top line significantly this year' },
  ],
  'trades-service': [
    { id: 'fill-diary', label: 'Fill my diary consistently', description: 'Stay fully booked without the gaps' },
    { id: 'raise-prices-trades', label: 'Raise my prices', description: 'Charge what the market will bear' },
    { id: 'get-reviews', label: 'Get more online reviews', description: 'Build a reputation that drives inbound' },
    { id: 'hire-first', label: 'Hire my first person', description: 'Grow beyond what I can do alone' },
    { id: 'expand-service-area', label: 'Expand my service area', description: 'Reach more customers in more places' },
    { id: 'professional-brand', label: 'Build a more professional brand', description: 'Look as good as the work I deliver' },
  ],
}

const GOALS_FALLBACK = [
  { id: 'hit-revenue-target', label: 'Hit a revenue target', description: 'I have a number I want to reach' },
  { id: 'land-big-client', label: 'Land a big client', description: 'I want one transformative client or project' },
  { id: 'launch-something', label: 'Launch something new', description: 'A new offer, product or service' },
  { id: 'get-more-freedom', label: 'Get more freedom', description: 'Work less, earn the same or more' },
  { id: 'build-a-team', label: 'Build a team', description: 'Hire my first person or grow my team' },
  { id: 'go-full-time', label: 'Go full-time', description: 'I want this to be my only income' },
  { id: 'scale-up', label: 'Scale up', description: 'Grow revenue significantly this year' },
]

// Per-type blocker options
const SE_BLOCKERS_BY_TYPE = {
  'freelance-creative': [
    'Undercharging for my work', 'Inconsistent client flow', 'Scope creep',
    'Difficult clients', 'Feast and famine income', 'No time for creative development',
    'Poor boundaries with clients',
  ],
  'consultant': [
    'Not enough inbound leads', 'Over-reliance on one client', 'Undercharging for expertise',
    'Difficulty saying no', 'No recurring revenue', 'Working in the business not on it',
  ],
  'coach-trainer': [
    'Struggling to fill programmes', 'Imposter syndrome', 'Undercharging',
    'No consistent marketing', 'Difficult clients', 'Burnout from giving too much',
    'No passive income',
  ],
  'content-creator': [
    'Inconsistency', 'Algorithm anxiety', 'Creative burnout',
    'Monetisation unclear', 'Comparison to others', 'No clear niche',
    'Too much time on admin not content',
  ],
  'product-saas': [
    'No clear target customer', 'Building features nobody wants', 'Struggling to get traction',
    'Running out of runway', 'Doing everything alone', 'No marketing system',
    'Technical debt',
  ],
  'agency-owner': [
    'Over-reliance on key clients', 'Team management challenges', 'Cashflow unpredictability',
    'Difficulty delegating', 'No clear positioning', 'Working too many hours',
    'Hiring the wrong people',
  ],
  'trades-service': [
    'Inconsistent bookings', 'Undercharging', 'Slow to chase payments',
    'No online presence', 'Word of mouth only', 'Admin taking too long',
    'No systems',
  ],
}

const SE_BLOCKERS_FALLBACK = [
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

  const currentGoals = SE_GOALS_BY_TYPE[workType] || GOALS_FALLBACK
  const currentBlockers = SE_BLOCKERS_BY_TYPE[workType] || SE_BLOCKERS_FALLBACK

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
      // Reset goals/blockers if work type changed and current selections are invalid
      setStep((s) => s + 1)
    } else {
      setShowTransition(true)
      setTimeout(() => {
        const allBlockers = customBlocker.trim() ? [...blockers, customBlocker.trim()] : blockers
        onComplete({
          workType,
          selfEmployedType: workType,
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
              {currentGoals.map((opt) => (
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
              {currentBlockers.map((label) => (
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

const USER_TYPES = [
  {
    id: 'corporate',
    label: 'Corporate',
    sub: 'In a company or org',
  },
  {
    id: 'self-employed',
    label: 'Self-employed',
    sub: 'Freelance, founder, or solo',
  },
  {
    id: 'student',
    label: 'Student',
    sub: 'Full-time or part-time',
  },
  {
    id: 'figuring-it-out',
    label: 'Figuring it out',
    sub: 'Between things or in flux',
  },
]

export default function Onboarding({ onComplete }) {
  return (
    <div className="screen justify-between">
      <div>
        <div className="mb-10">
          <p className="text-xs tracking-widest uppercase text-stone-400 mb-3">Daily Focus</p>
          <h1 className="text-3xl font-bold text-stone-900 leading-tight mb-2">
            What's your situation?
          </h1>
          <p className="text-stone-400 text-sm">
            This helps tailor your daily focus to what actually matters for you.
          </p>
        </div>

        <div className="space-y-3">
          {USER_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => onComplete(type.id)}
              className="w-full text-left p-5 bg-white rounded-2xl border border-stone-100 active:bg-stone-50 transition-all duration-150 active:scale-[0.99]"
            >
              <div className="font-semibold text-stone-900 text-base">{type.label}</div>
              <div className="text-stone-400 text-sm mt-0.5">{type.sub}</div>
            </button>
          ))}
        </div>
      </div>

      <p className="text-center text-xs text-stone-300 pt-8">
        You can change this any time in settings.
      </p>
    </div>
  )
}

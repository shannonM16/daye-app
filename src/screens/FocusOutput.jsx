export default function FocusOutput({ plan, onStartAction, onReset }) {
  const { priorities, avoid, timing, why } = plan

  return (
    <div className="screen justify-between">
      <div className="space-y-5">
        <div>
          <p className="text-xs tracking-widest uppercase text-stone-400 mb-1">Daily Focus</p>
          <h1 className="text-2xl font-bold text-stone-900">Your plan</h1>
        </div>

        {/* Priorities */}
        <div className="card space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400">
            Focus on
          </h2>
          <ol className="space-y-3">
            {priorities.map((p, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-stone-900 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <span className="text-stone-800 text-sm leading-relaxed">{p}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Timing */}
        <div className="card">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2">
            Timing
          </h2>
          <p className="text-stone-800 text-sm leading-relaxed">{timing}</p>
        </div>

        {/* Avoid */}
        <div className="card">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-3">
            Avoid today
          </h2>
          <ul className="space-y-2">
            {avoid.map((a, i) => (
              <li key={i} className="flex items-start gap-2 text-stone-500 text-sm">
                <span className="text-stone-300 mt-0.5 flex-shrink-0">—</span>
                <span>{a}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Why */}
        <div className="bg-stone-50 rounded-3xl p-6 border border-stone-100">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2">
            Why
          </h2>
          <p className="text-stone-600 text-sm leading-relaxed italic">{why}</p>
        </div>
      </div>

      <div className="space-y-3 pt-6">
        <button className="btn-primary" onClick={onStartAction}>
          Start focus timer
        </button>
        <button className="btn-ghost" onClick={onReset}>
          Start over
        </button>
      </div>
    </div>
  )
}

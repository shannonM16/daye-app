import { useState, useEffect, useRef } from 'react'

const TIMER_DURATION = 25 * 60 // 25 minutes in seconds

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export default function ActionMode({ priorities, onBack }) {
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION)
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)
  const [checked, setChecked] = useState([])
  const intervalRef = useRef(null)

  useEffect(() => {
    if (running && !done) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current)
            setRunning(false)
            setDone(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [running, done])

  const toggleCheck = (i) => {
    setChecked((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
    )
  }

  const reset = () => {
    setTimeLeft(TIMER_DURATION)
    setRunning(false)
    setDone(false)
  }

  const progress = 1 - timeLeft / TIMER_DURATION
  const circumference = 2 * Math.PI * 54
  const strokeDashoffset = circumference * (1 - progress)

  return (
    <div className="screen justify-between">
      <div className="space-y-8">
        <div>
          <p className="text-xs tracking-widest uppercase text-stone-400 mb-1">Daily Focus</p>
          <h1 className="text-2xl font-bold text-stone-900">Action mode</h1>
        </div>

        {/* Timer */}
        <div className="card flex flex-col items-center py-8">
          <div className="relative w-36 h-36 mb-6">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="#f5f5f4"
                strokeWidth="6"
              />
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="#1c1917"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-stone-900 tabular-nums">
                {formatTime(timeLeft)}
              </span>
              {done && (
                <span className="text-xs text-stone-400 mt-1">Done!</span>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            {done ? (
              <button
                onClick={reset}
                className="px-6 py-2.5 rounded-full bg-stone-900 text-white text-sm font-medium"
              >
                Reset
              </button>
            ) : (
              <>
                <button
                  onClick={() => setRunning((r) => !r)}
                  className="px-8 py-2.5 rounded-full bg-stone-900 text-white text-sm font-medium transition-all active:scale-95"
                >
                  {running ? 'Pause' : timeLeft === TIMER_DURATION ? 'Start' : 'Resume'}
                </button>
                {timeLeft < TIMER_DURATION && !running && (
                  <button
                    onClick={reset}
                    className="px-5 py-2.5 rounded-full border border-stone-200 text-stone-600 text-sm font-medium transition-all active:scale-95"
                  >
                    Reset
                  </button>
                )}
              </>
            )}
          </div>

          {done && (
            <p className="text-stone-400 text-xs mt-4 text-center">
              Session complete. Take a 5-minute break.
            </p>
          )}
        </div>

        {/* Checklist */}
        <div className="card space-y-1">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-4">
            Today's priorities
          </h2>
          {priorities.map((p, i) => (
            <button
              key={i}
              onClick={() => toggleCheck(i)}
              className="w-full flex items-start gap-3 py-2.5 text-left transition-all"
            >
              <div
                className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 transition-all ${
                  checked.includes(i)
                    ? 'bg-stone-900 border-stone-900'
                    : 'border-stone-200'
                }`}
              >
                {checked.includes(i) && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path
                      d="M1 4l3 3 5-6"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              <span
                className={`text-sm leading-relaxed transition-all ${
                  checked.includes(i) ? 'line-through text-stone-300' : 'text-stone-800'
                }`}
              >
                {p}
              </span>
            </button>
          ))}

          {checked.length === priorities.length && priorities.length > 0 && (
            <p className="text-center text-xs text-stone-400 pt-3 pb-1">
              All done. Seriously, great work.
            </p>
          )}
        </div>
      </div>

      <div className="pt-6">
        <button className="btn-ghost" onClick={onBack}>
          Back to plan
        </button>
      </div>
    </div>
  )
}

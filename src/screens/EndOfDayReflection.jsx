import { useState } from 'react'
import { upsertPlanPartial } from '../lib/db'
import { trackReflectionCompleted } from '../lib/loops'

const FOCUS_OPTIONS = [
  { id: 'yes', label: 'Yes' },
  { id: 'mostly', label: 'Mostly' },
  { id: 'not-really', label: 'Not really' },
]

const END_MOODS = [
  { id: 'accomplished', label: 'Accomplished' },
  { id: 'tired', label: 'Tired' },
  { id: 'energised', label: 'Energised' },
  { id: 'satisfied', label: 'Satisfied' },
  { id: 'frustrated', label: 'Frustrated' },
  { id: 'calm', label: 'Calm' },
  { id: 'drained', label: 'Drained' },
  { id: 'proud', label: 'Proud' },
]

function Chip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="py-1.5 px-3 rounded-full text-xs font-medium transition-all duration-150 active:scale-95 text-left"
      style={{
        border: '0.5px solid',
        borderColor: active ? 'var(--color-ink)' : 'var(--color-border)',
        background: active ? 'var(--color-ink)' : 'var(--color-white)',
        color: active ? 'var(--color-white)' : 'var(--color-ink)',
        fontFamily: 'var(--font-sans)',
      }}
    >
      {label}
    </button>
  )
}

export default function EndOfDayReflection({ user, onComplete, onHome }) {
  const [focusRating, setFocusRating] = useState(null)
  const [endMood, setEndMood] = useState(null)
  const [carryForward, setCarryForward] = useState('')
  const [saving, setSaving] = useState(false)

  const canSubmit = focusRating && endMood

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSaving(true)

    const reflection = {
      focusRating,
      endMood,
      carryForward: carryForward.trim() || null,
      completedAt: new Date().toISOString(),
    }

    try {
      const userId = localStorage.getItem('daye_user_id')
      if (userId) {
        const today = new Date().toISOString().split('T')[0]
        await upsertPlanPartial(userId, today, { reflection })
      }
      if (user?.email) {
        trackReflectionCompleted(user.email).catch(() => {})
      }
    } catch {
      // fail silently
    }

    setSaving(false)
    onComplete?.()
  }

  return (
    <div className="screen">
      <div className="flex-1 overflow-y-auto space-y-5">
        <div>
          <span
            onClick={onHome}
            role="button"
            tabIndex={0}
            style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--color-muted)', cursor: 'pointer' }}
            className="text-[13px] font-light block mb-3 hover:opacity-70 transition-opacity"
          >
            daye
          </span>
          <p className="text-[11px] font-medium uppercase tracking-widest mb-2" style={{ color: 'var(--color-muted)' }}>
            End of day
          </p>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '26px', fontWeight: 300, color: 'var(--color-ink)', lineHeight: 1.2, margin: '0 0 4px 0' }}>
            How did today go?
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
            A moment to close the day with intention.
          </p>
        </div>

        {/* Q1: Did you focus on what mattered? */}
        <div>
          <p className="text-[11px] font-medium uppercase tracking-widest mb-3" style={{ color: 'var(--color-muted)' }}>
            Did you focus on what mattered?
          </p>
          <div className="flex gap-2 flex-wrap">
            {FOCUS_OPTIONS.map(opt => (
              <Chip
                key={opt.id}
                label={opt.label}
                active={focusRating === opt.id}
                onClick={() => setFocusRating(opt.id)}
              />
            ))}
          </div>
        </div>

        {/* Q2: How do you feel now? */}
        <div>
          <p className="text-[11px] font-medium uppercase tracking-widest mb-3" style={{ color: 'var(--color-muted)' }}>
            How do you feel now?
          </p>
          <div className="flex flex-wrap gap-1.5">
            {END_MOODS.map(opt => (
              <Chip
                key={opt.id}
                label={opt.label}
                active={endMood === opt.id}
                onClick={() => setEndMood(opt.id)}
              />
            ))}
          </div>
        </div>

        {/* Q3: Anything to carry forward? */}
        <div>
          <p className="text-[11px] font-medium uppercase tracking-widest mb-2" style={{ color: 'var(--color-muted)' }}>
            Anything to carry forward?
          </p>
          <textarea
            value={carryForward}
            onChange={e => {
              const v = e.target.value
              setCarryForward(v.length === 1 ? v.toUpperCase() : v)
            }}
            placeholder="A task, a thought, something to remember..."
            rows={3}
            style={{
              width: '100%',
              fontFamily: 'var(--font-sans)',
              fontSize: '16px',
              padding: '12px 14px',
              borderRadius: '12px',
              border: '1px solid var(--color-border)',
              background: 'var(--color-white)',
              color: 'var(--color-ink)',
              outline: 'none',
              resize: 'none',
              lineHeight: 1.5,
              boxSizing: 'border-box',
            }}
          />
          <p className="text-[11px] mt-1" style={{ color: 'var(--color-muted)' }}>Optional</p>
        </div>
      </div>

      <div className="flex-shrink-0 pt-4 space-y-2">
        <button
          className="btn-primary"
          onClick={handleSubmit}
          disabled={!canSubmit || saving}
        >
          {saving ? 'Saving...' : 'Close the day'}
        </button>
        <button className="btn-ghost" onClick={onHome}>
          Skip for now
        </button>
      </div>
    </div>
  )
}

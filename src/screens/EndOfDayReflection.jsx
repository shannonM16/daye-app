import { useState, useEffect } from 'react'
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

const EOD_CSS = `
  .eod-screen {
    position: relative;
  }
  .eod-screen::before {
    content: ''; position: fixed; inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
    background-size: 200px 200px; pointer-events: none; z-index: 0; opacity: 0.55;
  }
  .eod-blob {
    position: fixed; border-radius: 50%; filter: blur(90px); pointer-events: none; z-index: 0;
  }
  .eod-blob-1 {
    width: 320px; height: 320px;
    background: radial-gradient(circle, rgba(184,196,177,0.12) 0%, transparent 70%);
    top: -60px; right: -60px; animation: eodB1 16s ease-in-out infinite;
  }
  .eod-blob-2 {
    width: 220px; height: 220px;
    background: radial-gradient(circle, rgba(201,184,216,0.1) 0%, transparent 70%);
    bottom: 80px; left: -40px; animation: eodB2 20s ease-in-out infinite;
  }
  @keyframes eodB1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-12px,10px)} }
  @keyframes eodB2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(10px,-12px)} }

  .eod-reveal { opacity: 0; transform: translateY(14px); transition: opacity 0.55s ease, transform 0.55s ease; }
  .eod-reveal.in { opacity: 1; transform: translateY(0); }

  .eod-chip {
    padding: 7px 16px; border-radius: 20px; font-size: 13px;
    font-family: var(--font-sans); font-weight: 400;
    border: 0.5px solid; cursor: pointer;
    transition: all 0.15s; display: inline-block;
  }
  .eod-chip:active { transform: scale(0.95); }

  .eod-question {
    font-family: var(--font-serif); font-style: italic;
    font-size: 18px; font-weight: 300; color: var(--color-ink);
    line-height: 1.4; margin: 0 0 16px 0;
  }

  .eod-section {
    background: var(--color-white);
    border: 1px solid var(--color-border);
    border-radius: 16px;
    padding: 20px;
  }
`

function Chip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="eod-chip"
      style={{
        borderColor: active ? 'var(--color-ink)' : 'var(--color-border)',
        background: active ? 'var(--color-ink)' : 'var(--color-white)',
        color: active ? 'var(--color-white)' : 'var(--color-ink)',
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
  const [revealed, setRevealed] = useState([])

  useEffect(() => {
    const id = 'eod-elevated-css'
    if (!document.getElementById(id)) {
      const tag = document.createElement('style')
      tag.id = id; tag.textContent = EOD_CSS
      document.head.appendChild(tag)
    }
    ;[0, 100, 200, 300].forEach((delay, i) => {
      setTimeout(() => setRevealed(prev => [...prev, i]), delay)
    })
  }, [])

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
    <div className="screen eod-screen">
      <div className="eod-blob eod-blob-1" />
      <div className="eod-blob eod-blob-2" />

      <div className="flex-1 overflow-y-auto space-y-5">

        {/* Header */}
        <div className={`eod-reveal ${revealed.includes(0) ? 'in' : ''}`}>
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
          <h1 style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '28px', fontWeight: 300, color: 'var(--color-ink)', lineHeight: 1.2, margin: '0 0 4px 0' }}>
            How did today go?
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
            A moment to close the day with intention.
          </p>
        </div>

        {/* Q1 */}
        <div className={`eod-section eod-reveal ${revealed.includes(1) ? 'in' : ''}`} style={{ transitionDelay: '0.1s' }}>
          <p className="eod-question">Did you focus on what mattered?</p>
          <div className="flex gap-2 flex-wrap">
            {FOCUS_OPTIONS.map(opt => (
              <Chip key={opt.id} label={opt.label} active={focusRating === opt.id} onClick={() => setFocusRating(opt.id)} />
            ))}
          </div>
        </div>

        {/* Q2 */}
        <div className={`eod-section eod-reveal ${revealed.includes(2) ? 'in' : ''}`} style={{ transitionDelay: '0.2s' }}>
          <p className="eod-question">How do you feel now?</p>
          <div className="flex flex-wrap gap-1.5">
            {END_MOODS.map(opt => (
              <Chip key={opt.id} label={opt.label} active={endMood === opt.id} onClick={() => setEndMood(opt.id)} />
            ))}
          </div>
        </div>

        {/* Q3 */}
        <div className={`eod-reveal ${revealed.includes(3) ? 'in' : ''}`} style={{ transitionDelay: '0.3s' }}>
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
              width: '100%', fontFamily: 'var(--font-sans)', fontSize: '14px',
              padding: '14px 16px', borderRadius: '12px',
              border: '1px solid var(--color-border)',
              background: 'var(--color-white)', color: 'var(--color-ink)',
              outline: 'none', resize: 'none', lineHeight: 1.6,
              boxSizing: 'border-box',
            }}
          />
          <p className="text-[11px] mt-1" style={{ color: 'var(--color-muted)', fontStyle: 'italic' }}>Optional</p>
        </div>
      </div>

      <div className="flex-shrink-0 pt-4 space-y-2">
        <button className="btn-primary" onClick={handleSubmit} disabled={!canSubmit || saving}>
          {saving ? 'Saving...' : 'Close the day'}
        </button>
        <button className="btn-ghost" onClick={onHome}>Skip for now</button>
      </div>
    </div>
  )
}

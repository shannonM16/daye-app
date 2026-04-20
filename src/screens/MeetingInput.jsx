import { useState, useRef } from 'react'

const TIME_OPTIONS = (() => {
  const opts = []
  for (let h = 6; h <= 22; h++) {
    for (let m = 0; m < 60; m += 30) {
      if (h === 22 && m > 0) break
      const ampm = h >= 12 ? 'pm' : 'am'
      const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
      const mStr = String(m).padStart(2, '0')
      opts.push(`${h12}:${mStr}${ampm}`)
    }
  }
  return opts
})()

const QUICK_CHIPS = [
  'Team standup',
  '1:1 with manager',
  'Client call',
  'Team meeting',
  'Interview',
  'Presentation',
  'Doctor or personal appointment',
  'School run or pickup',
  'Lunch break',
  'Other',
]

function toMinutes(t) {
  const match = t.match(/^(\d+):(\d+)(am|pm)$/i)
  if (!match) return 0
  let h = parseInt(match[1])
  const min = parseInt(match[2])
  const ap = match[3].toLowerCase()
  if (ap === 'pm' && h !== 12) h += 12
  if (ap === 'am' && h === 12) h = 0
  return h * 60 + min
}

function sortMeetings(meetings) {
  return [...meetings].sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime))
}

function StepDots() {
  return (
    <div className="flex items-center justify-center gap-2">
      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-border)', transition: 'background 0.2s' }} />
      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-border)', transition: 'background 0.2s' }} />
      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-ink)', transition: 'background 0.2s' }} />
    </div>
  )
}

export default function MeetingInput({ onSubmit, onBack }) {
  const [meetings, setMeetings] = useState([])
  const [name, setName] = useState('')
  const [startTime, setStartTime] = useState('9:00am')
  const [endTime, setEndTime] = useState('9:30am')
  const nameInputRef = useRef(null)

  const getAutoEndTime = (start) => {
    const match = start.match(/^(\d+):(\d+)(am|pm)$/i)
    if (!match) return start
    let h = parseInt(match[1])
    const min = parseInt(match[2])
    const ap = match[3].toLowerCase()
    if (ap === 'pm' && h !== 12) h += 12
    if (ap === 'am' && h === 12) h = 0
    let totalMins = h * 60 + min + 30
    if (totalMins >= 24 * 60) totalMins = totalMins % (24 * 60)
    const newH = Math.floor(totalMins / 60)
    const newM = totalMins % 60
    const newAmpm = newH >= 12 ? 'pm' : 'am'
    const newH12 = newH === 0 ? 12 : newH > 12 ? newH - 12 : newH
    return `${newH12}:${String(newM).padStart(2, '0')}${newAmpm}`
  }

  const handleStartTimeChange = (val) => {
    setStartTime(val)
    setEndTime(getAutoEndTime(val))
  }

  const addMeeting = (meetingName, start, end) => {
    const trimmed = meetingName.trim()
    if (!trimmed) return
    setMeetings(prev => sortMeetings([...prev, { name: trimmed, startTime: start, endTime: end }]))
  }

  const handleChipTap = (chip) => {
    if (chip === 'Other') {
      nameInputRef.current?.focus()
      return
    }
    addMeeting(chip, startTime, endTime)
  }

  const handleAdd = () => {
    if (!name.trim()) return
    addMeeting(name, startTime, endTime)
    setName('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); handleAdd() }
  }

  const removeMeeting = (idx) => {
    setMeetings(prev => prev.filter((_, i) => i !== idx))
  }

  const handleContinue = () => {
    localStorage.setItem('df_meetings', JSON.stringify(meetings))
    onSubmit(meetings)
  }

  const handleSkip = () => {
    localStorage.setItem('df_meetings', JSON.stringify([]))
    onSubmit([])
  }

  return (
    <div className="screen">
      <div className="flex-1 overflow-y-auto space-y-5">

        {/* Header */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <button
              onClick={onBack}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--color-muted)',
                display: 'flex', alignItems: 'center', gap: '4px',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 13L5 8l5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back
            </button>
            <StepDots />
          </div>

          <h1 style={{
            fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '28px',
            fontWeight: 300, color: 'var(--color-ink)', lineHeight: 1.2, marginBottom: '8px',
          }}>
            What's in your diary today?
          </h1>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--color-muted)', lineHeight: 1.5 }}>
            Add any meetings or fixed commitments. We will build your plan around them.
          </p>
        </div>

        {/* Quick-add chips */}
        <div className="flex flex-wrap gap-2">
          {QUICK_CHIPS.map(chip => (
            <button
              key={chip}
              onClick={() => handleChipTap(chip)}
              style={{
                fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--color-ink)',
                background: 'var(--color-linen)', border: '0.5px solid var(--color-border)',
                borderRadius: '20px', padding: '6px 14px', cursor: 'pointer', transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--color-linen-dark)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--color-linen)'}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Manual add form */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input
            ref={nameInputRef}
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Meeting name..."
            style={{
              fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--color-ink)',
              background: 'var(--color-linen)', border: '0.5px solid var(--color-border)',
              borderRadius: '8px', padding: '10px 12px', width: '100%', outline: 'none', boxSizing: 'border-box',
            }}
          />
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <select
              value={startTime}
              onChange={e => handleStartTimeChange(e.target.value)}
              style={{
                flex: 1, fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--color-ink)',
                background: 'var(--color-linen)', border: '0.5px solid var(--color-border)',
                borderRadius: '8px', padding: '8px 6px', outline: 'none', minWidth: 0,
              }}
            >
              {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--color-muted)', flexShrink: 0 }}>to</span>
            <select
              value={endTime}
              onChange={e => setEndTime(e.target.value)}
              style={{
                flex: 1, fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--color-ink)',
                background: 'var(--color-linen)', border: '0.5px solid var(--color-border)',
                borderRadius: '8px', padding: '8px 6px', outline: 'none', minWidth: 0,
              }}
            >
              {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <button
              onClick={handleAdd}
              style={{
                fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'white', whiteSpace: 'nowrap',
                background: name.trim() ? 'var(--color-ink)' : 'var(--color-border)',
                border: 'none', borderRadius: '8px', padding: '6px 16px',
                cursor: name.trim() ? 'pointer' : 'default', transition: 'background 0.15s', flexShrink: 0,
              }}
            >
              Add
            </button>
          </div>
        </div>

        {/* Meeting list */}
        {meetings.length > 0 && (
          <div className="card">
            {meetings.map((m, i) => (
              <div
                key={i}
                style={{
                  display: 'flex', alignItems: 'center',
                  padding: '10px 0',
                  borderBottom: i < meetings.length - 1 ? '0.5px solid var(--color-border)' : 'none',
                }}
              >
                <span style={{
                  minWidth: '120px', flexShrink: 0, paddingRight: '12px',
                  fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--color-muted)',
                  whiteSpace: 'nowrap',
                }}>
                  {m.startTime} – {m.endTime}
                </span>
                <span style={{ flex: 1, fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 500, color: 'var(--color-ink)' }}>
                  {m.name}
                </span>
                <button
                  onClick={() => removeMeeting(i)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--color-muted)', fontSize: '18px', lineHeight: 1, padding: '0 0 0 8px',
                  }}
                  aria-label="Remove"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Continue button — only when meetings added */}
        {meetings.length > 0 && (
          <button className="btn-primary" onClick={handleContinue}>
            Continue →
          </button>
        )}

      </div>

      {/* Skip link — always visible */}
      <div style={{ paddingTop: '16px', paddingBottom: '4px', textAlign: 'center' }}>
        <button
          onClick={handleSkip}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--color-muted)',
          }}
        >
          No meetings today →
        </button>
      </div>
    </div>
  )
}

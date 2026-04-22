import { useState, useRef } from 'react'
import { getAutoEndTime, getNextQuarterHour, timeStringToMinutes } from '../utils/timeOptions'
import TimePicker from '../components/TimePicker'

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

function sortMeetings(meetings) {
  return [...meetings].sort((a, b) => timeStringToMinutes(a.startTime) - timeStringToMinutes(b.startTime))
}

function timesOverlap(aStart, aEnd, bStart, bEnd) {
  return timeStringToMinutes(aStart) < timeStringToMinutes(bEnd) &&
    timeStringToMinutes(aEnd) > timeStringToMinutes(bStart)
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

export default function MeetingInput({ onSubmit, onBack, initialMeetings = [] }) {
  const [meetings, setMeetings] = useState(() => {
    if (initialMeetings && initialMeetings.length > 0) return sortMeetings(initialMeetings)
    try {
      const saved = JSON.parse(localStorage.getItem('df_meetings') || '[]')
      return Array.isArray(saved) && saved.length > 0 ? sortMeetings(saved) : []
    } catch { return [] }
  })
  const [name, setName] = useState('')
  const [startTime, setStartTime] = useState(() => getNextQuarterHour())
  const [endTime, setEndTime] = useState(() => getAutoEndTime(getNextQuarterHour()))
  const [overlapError, setOverlapError] = useState(null)
  const nameInputRef = useRef(null)

  const handleStartChange = (val) => {
    setStartTime(val)
    setEndTime(getAutoEndTime(val))
    setOverlapError(null)
  }

  const handleEndChange = (val) => {
    setEndTime(val)
    setOverlapError(null)
  }

  const checkOverlap = (start, end) => {
    for (const m of meetings) {
      if (timesOverlap(start, end, m.startTime, m.endTime)) {
        return m
      }
    }
    return null
  }

  const addMeeting = (meetingName, start, end) => {
    const trimmed = meetingName.trim()
    if (!trimmed) return false
    const conflict = checkOverlap(start, end)
    if (conflict) {
      setOverlapError(`This time overlaps with ${conflict.name} (${conflict.startTime} – ${conflict.endTime}). Please choose a different time.`)
      return false
    }
    setOverlapError(null)
    setMeetings(prev => sortMeetings([...prev, { name: trimmed, startTime: start, endTime: end }]))
    return true
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
    const added = addMeeting(name, startTime, endTime)
    if (added) setName('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); handleAdd() }
  }

  const removeMeeting = (idx) => {
    setMeetings(prev => prev.filter((_, i) => i !== idx))
    setOverlapError(null)
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

        {/* Add meeting form */}
        <div style={{
          background: 'white', border: '0.5px solid var(--color-border)',
          borderRadius: '12px', padding: '14px 16px',
          display: 'flex', flexDirection: 'column', gap: '0',
        }}>
          {/* Single-row time range */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <TimePicker value={startTime} onChange={handleStartChange} bookedMeetings={meetings} />
            <span style={{
              fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--color-muted)',
              padding: '0 8px', flexShrink: 0, userSelect: 'none',
            }}>→</span>
            <TimePicker value={endTime} onChange={handleEndChange} bookedMeetings={[]} />
          </div>

          {/* Divider */}
          <div style={{ borderTop: '0.5px solid var(--color-border)', margin: '12px 0' }} />

          {/* Name + Add in one row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <input
              ref={nameInputRef}
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Meeting name..."
              className="meeting-name-input"
              style={{
                flex: 1, fontFamily: 'var(--font-sans)', fontSize: '14px',
                color: 'var(--color-ink)', background: 'transparent',
                border: 'none', borderBottom: '1px solid var(--color-border)',
                outline: 'none', padding: '2px 0 4px',
              }}
            />
            <button
              onClick={handleAdd}
              style={{
                fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 500, color: 'white',
                background: name.trim() ? 'var(--color-ink)' : 'var(--color-border)',
                border: 'none', borderRadius: '8px', padding: '6px 16px',
                cursor: name.trim() ? 'pointer' : 'default',
                transition: 'background 0.15s', flexShrink: 0,
              }}
            >
              Add
            </button>
          </div>

          {/* Overlap error */}
          {overlapError && (
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--color-muted)', margin: '8px 0 0' }}>
              {overlapError}
            </p>
          )}
        </div>

        {/* Meeting list */}
        {meetings.length > 0 && (
          <div>
            {meetings.map((m, i) => (
              <div
                key={i}
                style={{
                  display: 'flex', alignItems: 'center',
                  padding: '10px 12px 10px 14px',
                  borderBottom: '0.5px solid var(--color-border)',
                  borderLeft: '2px solid var(--color-lavender)',
                  background: 'white',
                  borderTop: i === 0 ? '0.5px solid var(--color-border)' : 'none',
                  borderRight: '0.5px solid var(--color-border)',
                  borderRadius: i === 0 && meetings.length === 1 ? '8px' : i === 0 ? '8px 8px 0 0' : i === meetings.length - 1 ? '0 0 8px 8px' : '0',
                }}
              >
                <span style={{
                  minWidth: '140px', flexShrink: 0, paddingRight: '12px',
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
                    color: 'var(--color-muted)', fontSize: '18px', lineHeight: 1,
                    padding: '0', width: '20px', height: '20px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                  aria-label="Remove"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Continue button */}
        {meetings.length > 0 && (
          <button className="btn-primary" onClick={handleContinue}>
            Continue →
          </button>
        )}

      </div>

      {/* Skip link */}
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

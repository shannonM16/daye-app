import { timeStringToMinutes } from '../utils/timeOptions'

const HOURS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
const MINUTES = ['00', '15', '30', '45']

export function parseTime(value) {
  const match = value?.match(/^(\d+):(\d+)(am|pm)$/i)
  if (!match) return { h: 9, m: '00', ap: 'am' }
  return { h: parseInt(match[1]), m: match[2].padStart(2, '0'), ap: match[3].toLowerCase() }
}

function isHourBusy(testH, testAp, bookedMeetings) {
  let h24 = testH
  if (testAp === 'pm' && testH !== 12) h24 += 12
  if (testAp === 'am' && testH === 12) h24 = 0
  const slotStart = h24 * 60
  const slotEnd = slotStart + 60
  return bookedMeetings.some(mtg => {
    const ms = timeStringToMinutes(mtg.startTime)
    const me = timeStringToMinutes(mtg.endTime)
    return slotStart < me && slotEnd > ms
  })
}

const base = {
  fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--color-ink)',
  background: 'transparent',
  border: 'none', borderBottom: '1px solid var(--color-border)',
  borderRadius: 0, outline: 'none',
  height: '28px', padding: '0 2px',
  appearance: 'auto', cursor: 'pointer',
}

// value: "9:00am" | onChange: (timeString) => void | bookedMeetings: [{startTime, endTime}]
export default function TimePicker({ value, onChange, bookedMeetings = [] }) {
  const { h, m, ap } = parseTime(value)
  const emit = (newH, newM, newAp) => onChange(`${newH}:${newM}${newAp}`)

  return (
    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
      <select value={h} onChange={e => emit(parseInt(e.target.value), m, ap)} style={{ ...base, width: '48px' }}>
        {HOURS.map(hour => {
          const busy = isHourBusy(hour, ap, bookedMeetings)
          return <option key={hour} value={hour}>{hour}{busy ? ' ·' : ''}</option>
        })}
      </select>
      <select value={m} onChange={e => emit(h, e.target.value, ap)} style={{ ...base, width: '52px' }}>
        {MINUTES.map(min => <option key={min} value={min}>:{min}</option>)}
      </select>
      <select value={ap} onChange={e => emit(h, m, e.target.value)} style={{ ...base, width: '52px' }}>
        <option value="am">AM</option>
        <option value="pm">PM</option>
      </select>
    </div>
  )
}

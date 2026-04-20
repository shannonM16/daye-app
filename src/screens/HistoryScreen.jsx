const MOOD_LABELS = {
  focused: 'Focused', anxious: 'Anxious', flat: 'Flat', motivated: 'Motivated',
  overwhelmed: 'Overwhelmed', 'clear-headed': 'Clear-headed', tired: 'Tired', stressed: 'Stressed',
}

const SLEEP_LABELS = { great: 'Great', ok: 'OK', poor: 'Poor', terrible: 'Terrible' }

const DAY_TYPE_LABELS = {
  'deep-work': 'Deep work',
  'lots-of-meetings': 'Lots of meetings',
  'low-energy-day': 'Low energy day',
  'reactive-firefighting': 'Reactive',
}

function formatHistoryDate(isoDate) {
  const d = new Date(isoDate + 'T00:00:00')
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}

const ENERGY_DOT_COLOR = (e) => {
  if (e >= 4) return 'var(--color-ink)'
  if (e <= 2) return 'var(--color-blush)'
  return 'var(--color-lavender)'
}

export default function HistoryScreen({ history = [], onBack, onHome }) {
  const sorted = [...history].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="screen">
      <div className="flex-1 overflow-y-auto space-y-4">
        <div>
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-sm font-medium mb-4 transition-colors"
              style={{ color: 'var(--color-muted)' }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 13L5 8l5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back
            </button>
          )}

          <span
            onClick={onHome}
            role="button"
            tabIndex={0}
            style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--color-muted)', cursor: 'pointer' }}
            className="text-[13px] font-light block mb-3 hover:opacity-70 transition-opacity"
          >
            daye
          </span>

          <h1 className="text-[24px] font-medium leading-tight" style={{ color: 'var(--color-ink)' }}>
            Your history
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
            {sorted.length === 0 ? 'No check-ins yet.' : `${sorted.length} day${sorted.length === 1 ? '' : 's'} logged`}
          </p>
        </div>

        {sorted.length > 0 && (
          <div className="space-y-2">
            {sorted.map((entry) => (
              <div
                key={entry.date}
                className="rounded-2xl px-4 py-3"
                style={{ background: 'var(--color-white)', border: '1px solid var(--color-border)' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>
                    {formatHistoryDate(entry.date)}
                  </span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      background: 'var(--color-linen)',
                      color: 'var(--color-muted)',
                      border: '0.5px solid var(--color-border)',
                    }}
                  >
                    {DAY_TYPE_LABELS[entry.dayType] || entry.dayType}
                  </span>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="inline-block w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: ENERGY_DOT_COLOR(entry.energy) }}
                    />
                    <span className="text-xs" style={{ color: 'var(--color-ink)' }}>
                      Energy {entry.energy}/5
                    </span>
                  </div>

                  {entry.mood && (
                    <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
                      {MOOD_LABELS[entry.mood] || entry.mood}
                    </span>
                  )}

                  {entry.sleep && (
                    <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
                      Sleep: {SLEEP_LABELS[entry.sleep] || entry.sleep}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

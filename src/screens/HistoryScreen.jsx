import { getRevenueActivityForDate, getMondayOfWeek, getWeeklyWin, getCompletionsForDate } from '../utils/completions'
import { useAuth } from '../context/AuthContext'
import { getInsight } from '../utils/patternEngine'

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

function groupByWeek(entries) {
  const weeks = {}
  entries.forEach((entry) => {
    const monday = getMondayOfWeek(entry.date)
    if (!weeks[monday]) weeks[monday] = []
    weeks[monday].push(entry)
  })
  return Object.entries(weeks)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([monday, days]) => ({ monday, days }))
}

function formatWeekLabel(mondayStr) {
  const d = new Date(mondayStr + 'T00:00:00')
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ' week'
}

export default function HistoryScreen({ history = [], userProfile, onBack, onHome }) {
  const { isPro } = useAuth()
  const sorted = [...history].sort((a, b) => b.date.localeCompare(a.date))
  const isSelfEmployed = userProfile?.userType === 'self-employed'
  const patternInsight = sorted.length >= 7 ? getInsight(sorted) : null

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const sevenDaysCutoff = sevenDaysAgo.toISOString().split('T')[0]

  const visibleEntries = isPro ? sorted : sorted.filter(e => e.date >= sevenDaysCutoff)
  const hasHiddenHistory = !isPro && sorted.some(e => e.date < sevenDaysCutoff)

  const weeks = groupByWeek(visibleEntries)

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
            {sorted.length === 0
              ? 'No check-ins yet.'
              : isPro
                ? `${sorted.length} day${sorted.length === 1 ? '' : 's'} logged`
                : `${visibleEntries.length} day${visibleEntries.length === 1 ? '' : 's'} shown · last 7 days`}
          </p>
        </div>

        {patternInsight && (
          <div
            className="rounded-2xl px-4 py-3"
            style={{ background: 'var(--color-white)', border: '1px solid var(--color-border)', borderLeft: '3px solid var(--color-lavender)' }}
          >
            <p className="text-[11px] font-medium uppercase tracking-widest mb-1" style={{ color: 'var(--color-muted)' }}>Pattern</p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-ink)' }}>{patternInsight}</p>
          </div>
        )}

        {weeks.map(({ monday, days }) => {
          const weeklyWin = getWeeklyWin(monday)
          const revenueDays = isSelfEmployed ? days.filter((d) => getRevenueActivityForDate(d.date)).length : 0

          return (
            <div key={monday}>
              <p className="text-[10px] font-medium uppercase tracking-widest mb-2" style={{ color: 'var(--color-muted)' }}>
                {formatWeekLabel(monday)}
              </p>

              {/* Revenue narrative for SE users */}
              {isSelfEmployed && days.length >= 3 && (
                <p className="text-xs mb-2" style={{ color: 'var(--color-muted)' }}>
                  {revenueDays} of {days.length} days had revenue activity
                </p>
              )}

              <div className="space-y-2 mb-2">
                {days.map((entry) => {
                  const hasRevenue = isSelfEmployed && getRevenueActivityForDate(entry.date)
                  return (
                    <div
                      key={entry.date}
                      className="rounded-2xl px-4 py-3"
                      style={{ background: 'var(--color-white)', border: '1px solid var(--color-border)' }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>
                            {formatHistoryDate(entry.date)}
                          </span>
                          {isSelfEmployed && (
                            <span
                              className="inline-block w-2 h-2 rounded-full flex-shrink-0"
                              style={{ background: hasRevenue ? 'var(--color-sage)' : 'var(--color-border)' }}
                              title={hasRevenue ? 'Revenue activity' : 'No revenue activity'}
                            />
                          )}
                        </div>
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

                        {(() => {
                          const tasks = entry.plannedTasks || []
                          if (tasks.length === 0) return null
                          const done = getCompletionsForDate(entry.date)
                          const completedCount = tasks.filter(t => done.includes(t)).length
                          return (
                            <span className="text-xs" style={{ color: completedCount === tasks.length ? 'var(--color-sage)' : 'var(--color-muted)' }}>
                              {completedCount}/{tasks.length} tasks
                            </span>
                          )
                        })()}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Weekly win */}
              {weeklyWin && (
                <div style={{
                  background: 'var(--color-linen)',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  borderLeft: '3px solid var(--color-sage)',
                }}>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-muted)', fontWeight: 500, margin: '0 0 4px 0' }}>
                    Week's win
                  </p>
                  <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '14px', color: 'var(--color-ink)', margin: 0, lineHeight: 1.4 }}>
                    {weeklyWin}
                  </p>
                </div>
              )}
            </div>
          )
        })}

        {hasHiddenHistory && (
          <div style={{
            background: 'var(--color-white)',
            border: '1px solid var(--color-lavender)',
            borderRadius: '16px',
            padding: '28px 24px',
            marginTop: '8px',
          }}>
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--color-muted)',
              fontWeight: 500,
              margin: '0 0 10px 0',
            }}>
              Daye Pro
            </p>
            <p style={{
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              fontSize: '20px',
              fontWeight: 300,
              color: 'var(--color-ink)',
              margin: '0 0 10px 0',
              lineHeight: 1.25,
            }}>
              You've reached 7 days of history.
            </p>
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '14px',
              color: 'var(--color-muted)',
              lineHeight: 1.65,
              margin: '0 0 20px 0',
            }}>
              Pro members keep 30 days of history and get weekly pattern insights to understand how they really work.
            </p>
            <button
              onClick={() => window.location.href = '/pricing'}
              style={{
                background: 'var(--color-lavender)',
                color: 'var(--color-ink)',
                border: 'none',
                borderRadius: '10px',
                padding: '11px 24px',
                fontFamily: 'var(--font-sans)',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                letterSpacing: '0.01em',
              }}
            >
              Upgrade to Pro
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

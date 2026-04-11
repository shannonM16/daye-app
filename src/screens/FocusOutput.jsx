import { useState, useRef } from 'react'
import { getStateLevel, isOverwhelmedOrAnxious } from '../utils/stateDetection'
import { areSimilar } from '../engine/deduplicateTasks'

function formatDate() {
  const now = new Date()
  return now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
}

function formatDateFilename() {
  const now = new Date()
  return now.toISOString().split('T')[0]
}

function getPriorityAccent(index, isLow) {
  if (isLow) return index === 0 ? 'var(--color-blush)' : 'var(--color-border)'
  if (index === 0) return 'var(--color-ink)'
  if (index === 1) return 'var(--color-lavender)'
  return 'var(--color-blush)'
}

// Hex values for share card (html2canvas needs concrete values)
function getPriorityAccentHex(index, isLow) {
  if (isLow) return index === 0 ? '#e8d5c4' : '#e2ddd8'
  if (index === 0) return '#1a1a1a'
  if (index === 1) return '#c9b8d8'
  return '#e8d5c4'
}

function SectionLabel({ children }) {
  return (
    <h2 className="text-[11px] font-medium uppercase tracking-widest mb-3" style={{ color: 'var(--color-muted)' }}>
      {children}
    </h2>
  )
}

function loadHtml2Canvas() {
  return new Promise((resolve, reject) => {
    if (window.html2canvas) { resolve(window.html2canvas); return }
    const s = document.createElement('script')
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
    s.onload = () => resolve(window.html2canvas)
    s.onerror = () => reject(new Error('Failed to load html2canvas'))
    document.head.appendChild(s)
  })
}

function ShareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <rect x="5" y="7" width="6" height="7" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 1v8M5.5 3.5L8 1l2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// Hidden share card — rendered off-screen so html2canvas can capture it
function ShareCard({ firstName, dayLabel, displayPriorities, goalAlignment, isLow }) {
  const dateStr = formatDate().toUpperCase()

  return (
    <div
      id="share-card"
      style={{
        width: '390px',
        backgroundColor: '#f9f7f5',
        padding: '24px',
        fontFamily: "'DM Sans', system-ui, sans-serif",
        position: 'absolute',
        top: '-9999px',
        left: '-9999px',
        visibility: 'visible',
        boxSizing: 'border-box',
      }}
    >
      {/* Wordmark */}
      <p style={{
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontStyle: 'italic',
        fontSize: '24px',
        color: '#1a1a1a',
        margin: '0 0 6px 0',
        fontWeight: 300,
        lineHeight: 1,
      }}>
        daye
      </p>

      {/* Date */}
      <p style={{
        fontFamily: "'DM Sans', system-ui, sans-serif",
        fontSize: '11px',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: '#999490',
        margin: '0 0 14px 0',
        fontWeight: 500,
      }}>
        {dateStr}
      </p>

      {/* Divider */}
      <div style={{ height: '0.5px', backgroundColor: '#e2ddd8', margin: '0 0 16px 0' }} />

      {/* Plan title + day label */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <p style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontStyle: 'italic',
          fontSize: '28px',
          color: '#1a1a1a',
          margin: 0,
          fontWeight: 400,
          lineHeight: 1.2,
        }}>
          {firstName ? `${firstName}'s plan.` : 'Your plan.'}
        </p>
        {dayLabel && (
          <span style={{
            fontFamily: "'DM Sans', system-ui, sans-serif",
            fontSize: '11px',
            fontWeight: 500,
            backgroundColor: '#f0ede8',
            border: '0.5px solid #e2ddd8',
            borderRadius: '20px',
            padding: '4px 10px',
            color: '#999490',
            flexShrink: 0,
          }}>
            {dayLabel}
          </span>
        )}
      </div>

      {/* Section label */}
      <p style={{
        fontFamily: "'DM Sans', system-ui, sans-serif",
        fontSize: '11px',
        fontWeight: 500,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: '#999490',
        margin: '0 0 10px 0',
      }}>
        Focus on
      </p>

      {/* Priorities */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
        {displayPriorities.map((p, i) => (
          <div
            key={i}
            style={{
              padding: '10px 12px',
              borderRadius: '10px',
              borderLeft: `3px solid ${getPriorityAccentHex(i, isLow)}`,
              backgroundColor: '#f9f7f5',
              boxShadow: '0 0 0 0.5px #e2ddd8',
            }}
          >
            <span style={{
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontSize: '13px',
              fontWeight: 500,
              color: '#1a1a1a',
              lineHeight: 1.4,
            }}>
              {p}
            </span>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div style={{ height: '0.5px', backgroundColor: '#e2ddd8', margin: '0 0 14px 0' }} />

      {/* Goal alignment + watermark row */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '12px' }}>
        {goalAlignment ? (
          <p style={{
            fontFamily: "'DM Sans', system-ui, sans-serif",
            fontSize: '12px',
            fontStyle: 'italic',
            color: '#999490',
            margin: 0,
            flex: 1,
            lineHeight: 1.4,
          }}>
            {goalAlignment}
          </p>
        ) : <div style={{ flex: 1 }} />}
        <p style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontStyle: 'italic',
          fontSize: '12px',
          color: '#999490',
          margin: 0,
          flexShrink: 0,
          opacity: 0.6,
        }}>
          daye
        </p>
      </div>
    </div>
  )
}

// Desktop modal — shows the generated image with a download button
function ShareModal({ imageUrl, filename, onClose }) {
  const handleDownload = () => {
    const a = document.createElement('a')
    a.href = imageUrl
    a.download = filename
    a.click()
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '24px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          padding: '20px',
          maxWidth: '430px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        }}
      >
        <img
          src={imageUrl}
          alt="Your plan"
          style={{ width: '100%', borderRadius: '12px', display: 'block' }}
        />
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleDownload}
            style={{
              flex: 1,
              padding: '14px',
              background: '#1a1a1a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontSize: '15px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Download image
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '14px 18px',
              background: 'transparent',
              color: '#999490',
              border: '1px solid #e2ddd8',
              borderRadius: '12px',
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontSize: '15px',
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default function FocusOutput({
  plan, userTasks, user, userProfile, checkInData,
  extraTasks, onExtraTasksChange,
  onStartAction, onReset, onBack,
}) {
  const { priorities, prioritySubtitles, avoid, timing, why, timeBlocks, goalAlignment, dayLabel } = plan
  const firstName = user?.firstName || ''

  const stateLevel = checkInData
    ? getStateLevel({ energy: checkInData.energy, sleep: checkInData.sleep, mood: checkInData.mood })
    : 'neutral'
  const isLow = stateLevel === 'low'
  const overwhelmedOrAnxious = isOverwhelmedOrAnxious(checkInData?.mood)

  const displayPriorities = isLow ? priorities.slice(0, 2) : priorities
  const displayAvoid = isLow
    ? [
        ...avoid,
        'Taking on anything new today — protect your energy',
        ...(overwhelmedOrAnxious ? ['Saying yes to anything that is not already on this list'] : []),
      ]
    : avoid
  const displayWhy = isLow
    ? `${why} You are not at full capacity and that is okay. Two things done well beats five things half done.`
    : why

  // "Add a task" local state
  const [inputVal, setInputVal] = useState('')
  const [warningVisible, setWarningVisible] = useState(false)
  const warningTimerRef = { current: null }

  const showWarning = () => {
    setWarningVisible(true)
    clearTimeout(warningTimerRef.current)
    warningTimerRef.current = setTimeout(() => setWarningVisible(false), 3000)
  }

  const handleAddTask = () => {
    const trimmed = inputVal.trim()
    if (!trimmed) return
    if ((extraTasks || []).length >= 5) return

    const allExisting = [...priorities, ...(extraTasks || [])]
    const isDupe = allExisting.some((t) => areSimilar(t, trimmed))
    if (isDupe) {
      showWarning()
      return
    }

    onExtraTasksChange([...(extraTasks || []), trimmed])
    setInputVal('')
    setWarningVisible(false)
  }

  const handleInputKey = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTask()
    }
  }

  const removeExtra = (index) => {
    onExtraTasksChange((extraTasks || []).filter((_, i) => i !== index))
  }

  // Share state
  const [shareLoading, setShareLoading] = useState(false)
  const [toastVisible, setToastVisible] = useState(false)
  const [shareModal, setShareModal] = useState(null) // { url, filename }
  const toastTimerRef = useRef(null)

  const showToast = () => {
    setToastVisible(true)
    clearTimeout(toastTimerRef.current)
    toastTimerRef.current = setTimeout(() => setToastVisible(false), 3000)
  }

  const handleShare = async () => {
    setShareLoading(true)
    try {
      await loadHtml2Canvas()
      await document.fonts.ready
      await new Promise((resolve) => setTimeout(resolve, 500))

      const cardEl = document.getElementById('share-card')
      const canvas = await window.html2canvas(cardEl, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#f9f7f5',
        logging: false,
        onclone: (clonedDoc) => {
          const clonedCard = clonedDoc.querySelector('#share-card')
          if (clonedCard) {
            clonedCard.style.position = 'relative'
            clonedCard.style.top = '0'
            clonedCard.style.left = '0'
          }
        },
      })

      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
      if (!blob) throw new Error('canvas.toBlob returned null')

      const filename = `daye-plan-${formatDateFilename()}.png`
      const file = new File([blob], filename, { type: 'image/png' })

      const canShareFile = navigator.share && navigator.canShare && navigator.canShare({ files: [file] })

      if (canShareFile) {
        await navigator.share({ title: 'My plan for today — via Daye', files: [file] })
      } else {
        const url = URL.createObjectURL(blob)
        setShareModal({ url, filename })
      }
    } catch (err) {
      console.error('Share card error:', err)
      if (err?.name !== 'AbortError') showToast()
    } finally {
      setShareLoading(false)
    }
  }

  const closeModal = () => {
    if (shareModal?.url) URL.revokeObjectURL(shareModal.url)
    setShareModal(null)
  }

  const screenStyle = isLow ? { background: '#faf4ef' } : {}

  return (
    <div className="screen" style={screenStyle}>
      {/* Hidden share card — off-screen but in DOM for html2canvas */}
      <ShareCard
        firstName={firstName}
        dayLabel={dayLabel}
        displayPriorities={displayPriorities}
        goalAlignment={goalAlignment}
        isLow={isLow}
      />

      <div className="flex-1 overflow-y-auto space-y-4">
        {/* Header */}
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
          <p className="text-[11px] font-medium uppercase tracking-widest mb-1" style={{ color: 'var(--color-muted)' }}>
            {formatDate()}
          </p>
          <div className="flex items-baseline gap-3">
            <h1
              style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--color-ink)' }}
              className="text-[28px] font-normal leading-tight"
            >
              {firstName ? `${firstName}'s plan.` : 'Your plan.'}
            </h1>
            {dayLabel && (
              <span
                className="text-[11px] font-medium px-2.5 py-1 rounded-full flex-shrink-0"
                style={{
                  background: 'var(--color-linen-dark)',
                  color: 'var(--color-muted)',
                  border: '0.5px solid var(--color-border)',
                }}
              >
                {dayLabel}
              </span>
            )}
          </div>
        </div>

        {isLow && (
          <div className="rounded-2xl px-4 py-3" style={{ background: 'var(--color-blush)', border: '1px solid #e8c4c4' }}>
            <p className="text-sm font-medium" style={{ color: '#7a3a3a' }}>Keeping it light today</p>
          </div>
        )}

        {/* Priorities */}
        <div className="card">
          <SectionLabel>Focus on</SectionLabel>
          <div className="space-y-2">
            {displayPriorities.map((p, i) => {
              const subtitle = prioritySubtitles?.[i]
              return (
                <div
                  key={i}
                  className="px-3 py-2.5 rounded-xl"
                  style={{
                    borderLeft: `3px solid ${getPriorityAccent(i, isLow)}`,
                    background: 'var(--color-linen)',
                  }}
                >
                  <span className="text-sm leading-relaxed font-medium" style={{ color: 'var(--color-ink)' }}>{p}</span>
                  {subtitle && (
                    <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--color-muted)' }}>{subtitle}</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Add a task */}
        <div>
          <SectionLabel>Anything else?</SectionLabel>
          <div className="flex gap-2 items-center">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => { setInputVal(e.target.value); setWarningVisible(false) }}
              onKeyDown={handleInputKey}
              placeholder="Add a task you want to track today..."
              className="input-field flex-1"
              disabled={(extraTasks || []).length >= 5}
            />
            <button
              onClick={handleAddTask}
              disabled={!inputVal.trim() || (extraTasks || []).length >= 5}
              className="flex-shrink-0 flex items-center justify-center transition-all active:scale-90 disabled:opacity-30"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'var(--color-ink)',
                color: 'var(--color-white)',
                fontSize: '20px',
                lineHeight: 1,
                border: 'none',
                cursor: 'pointer',
              }}
              aria-label="Add task"
            >
              +
            </button>
          </div>

          {warningVisible && (
            <p className="text-[11px] mt-1.5" style={{ color: 'var(--color-muted)' }}>
              This looks similar to a task already in your plan.
            </p>
          )}

          {(extraTasks || []).length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {(extraTasks || []).map((task, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full"
                  style={{
                    background: 'var(--color-linen-dark)',
                    border: '0.5px solid var(--color-border)',
                    color: 'var(--color-ink)',
                  }}
                >
                  {task}
                  <button
                    onClick={() => removeExtra(i)}
                    className="ml-0.5 leading-none opacity-50 hover:opacity-100"
                    style={{ fontSize: '14px', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0 }}
                    aria-label={`Remove ${task}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          {(extraTasks || []).length >= 5 && (
            <p className="text-[11px] mt-1.5" style={{ color: 'var(--color-muted)' }}>
              Maximum 5 tasks added.
            </p>
          )}
        </div>

        {/* Time split */}
        {timeBlocks && timeBlocks.length > 0 && (
          <div className="card">
            <SectionLabel>Time split</SectionLabel>
            <div>
              {timeBlocks.map((block, i) => (
                <div
                  key={i}
                  className="flex items-stretch py-3"
                  style={{ borderBottom: i < timeBlocks.length - 1 ? '1px solid var(--color-linen-dark)' : 'none' }}
                >
                  <div className="w-16 flex-shrink-0 pr-3 pt-0.5">
                    <span className="text-[11px] font-medium tabular-nums leading-5" style={{ color: 'var(--color-muted)' }}>
                      {block.time}
                    </span>
                  </div>
                  <div className="w-px flex-shrink-0 mr-4" style={{ background: 'var(--color-border)' }} />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm leading-relaxed" style={{ color: 'var(--color-ink)' }}>{block.activity}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* User tasks */}
        {userTasks && userTasks.length > 0 && (
          <div className="card">
            <SectionLabel>Your tasks</SectionLabel>
            <ul className="space-y-2">
              {userTasks.map((task, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="flex-shrink-0 mt-0.5" style={{ color: 'var(--color-border-dark)' }}>·</span>
                  <span style={{ color: 'var(--color-ink)' }}>{task}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Timing */}
        {timing && (
          <div className="card">
            <SectionLabel>Timing</SectionLabel>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-ink)' }}>{timing}</p>
          </div>
        )}

        {/* Avoid — pills */}
        {displayAvoid.length > 0 && (
          <div className="card">
            <SectionLabel>Avoid today</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {displayAvoid.map((a, i) => (
                <span
                  key={i}
                  className="text-xs px-3 py-1.5 rounded-full"
                  style={{
                    border: '0.5px solid var(--color-border-dark)',
                    color: 'var(--color-muted)',
                    background: 'var(--color-linen)',
                  }}
                >
                  {a}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Why */}
        {displayWhy && (
          <div
            className="rounded-2xl p-5"
            style={{
              background: 'var(--color-white)',
              border: '1px solid var(--color-border)',
              borderLeft: '3px solid var(--color-lavender)',
            }}
          >
            <h2 className="text-[11px] font-medium uppercase tracking-widest mb-2" style={{ color: 'var(--color-muted)' }}>
              Why
            </h2>
            <p className="text-sm leading-relaxed italic" style={{ color: 'var(--color-muted)' }}>{displayWhy}</p>
          </div>
        )}

        {goalAlignment && (
          <p className="text-center text-xs pb-2" style={{ color: 'var(--color-muted)', opacity: 0.7 }}>{goalAlignment}</p>
        )}

        {/* Share button */}
        <button
          onClick={handleShare}
          disabled={shareLoading}
          className="w-full flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          style={{
            padding: '14px',
            background: 'var(--color-white)',
            border: '1px solid var(--color-border)',
            borderRadius: '12px',
            color: shareLoading ? 'var(--color-muted)' : 'var(--color-ink)',
            fontFamily: 'var(--font-sans)',
            fontSize: '14px',
            fontWeight: 500,
            cursor: shareLoading ? 'default' : 'pointer',
            opacity: shareLoading ? 0.6 : 1,
          }}
        >
          {!shareLoading && <ShareIcon />}
          {shareLoading ? 'Preparing...' : 'Share today\'s plan'}
        </button>
      </div>

      <div className="flex-shrink-0 space-y-2.5 pt-4">
        <button className="btn-primary" onClick={onStartAction}>Start focus timer</button>
        <button className="btn-ghost" onClick={onReset}>Start over</button>
      </div>

      {/* Toast */}
      {toastVisible && (
        <div
          style={{
            position: 'fixed',
            bottom: '96px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--color-white)',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
            padding: '10px 14px',
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            color: 'var(--color-ink)',
            whiteSpace: 'nowrap',
            zIndex: 999,
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          }}
        >
          Could not generate card — try again
        </div>
      )}

      {/* Desktop share modal */}
      {shareModal && (
        <ShareModal
          imageUrl={shareModal.url}
          filename={shareModal.filename}
          onClose={closeModal}
        />
      )}
    </div>
  )
}

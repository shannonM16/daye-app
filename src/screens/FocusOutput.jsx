import { useState, useRef } from 'react'
import { getStateLevel, isOverwhelmedOrAnxious } from '../utils/stateDetection'
import { areSimilar } from '../engine/deduplicateTasks'
import { getPlanInsight } from '../utils/patternEngine'

function formatDate() {
  const now = new Date()
  return now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
}

function formatDateFilename() {
  return new Date().toISOString().split('T')[0]
}

function getPriorityAccent(index, isLow) {
  if (isLow) return index === 0 ? 'var(--color-blush)' : 'var(--color-border)'
  if (index === 0) return 'var(--color-ink)'
  if (index === 1) return 'var(--color-lavender)'
  return 'var(--color-blush)'
}

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

// ── Simplified share card — compact, elegant, max 2 priorities ─────
function ShareCard({ firstName, dayLabel, dayName, displayPriorities, goalAlignment, isLow }) {
  const dateStr = formatDate().toUpperCase()

  return (
    <div
      id="share-card"
      style={{
        width: '360px',
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
        fontSize: '18px',
        color: '#1a1a1a',
        margin: '0 0 4px 0',
        fontWeight: 300,
        lineHeight: 1,
      }}>
        daye
      </p>

      {/* Date */}
      <p style={{
        fontFamily: "'DM Sans', system-ui, sans-serif",
        fontSize: '10px',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: '#8a8480',
        margin: '0 0 12px 0',
        fontWeight: 500,
      }}>
        {dateStr}
      </p>

      {/* Divider */}
      <div style={{ height: '0.5px', backgroundColor: '#e2ddd8', margin: '0 0 12px 0' }} />

      {/* Day name */}
      {dayName && (
        <p style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontStyle: 'italic',
          fontSize: '13px',
          color: '#8a8480',
          margin: '0 0 10px 0',
          paddingLeft: '8px',
          borderLeft: '1px solid #c9b8d8',
          lineHeight: 1.4,
        }}>
          {dayName}
        </p>
      )}

      {/* Plan title + day badge */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
        <p style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontStyle: 'italic',
          fontSize: '26px',
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
            fontSize: '10px',
            fontWeight: 500,
            backgroundColor: '#f0ede8',
            border: '0.5px solid #e2ddd8',
            borderRadius: '20px',
            padding: '3px 9px',
            color: '#8a8480',
            flexShrink: 0,
          }}>
            {dayLabel}
          </span>
        )}
      </div>

      {/* FOCUS ON label */}
      <p style={{
        fontFamily: "'DM Sans', system-ui, sans-serif",
        fontSize: '10px',
        fontWeight: 500,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: '#8a8480',
        margin: '0 0 8px 0',
      }}>
        Focus on
      </p>

      {/* Max 2 priorities — accent bar + task name only */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
        {displayPriorities.slice(0, 2).map((p, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '3px',
              height: '32px',
              borderRadius: '2px',
              backgroundColor: getPriorityAccentHex(i, isLow),
              flexShrink: 0,
            }} />
            <span style={{
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontSize: '13px',
              fontWeight: 500,
              color: '#1a1a1a',
              lineHeight: 1.35,
            }}>
              {p}
            </span>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div style={{ height: '0.5px', backgroundColor: '#e2ddd8', margin: '0 0 12px 0' }} />

      {/* Goal alignment + watermark */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '12px' }}>
        {goalAlignment ? (
          <p style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontStyle: 'italic',
            fontSize: '13px',
            color: '#8a8480',
            margin: 0,
            flex: 1,
            lineHeight: 1.4,
          }}>
            {goalAlignment}
          </p>
        ) : <div style={{ flex: 1 }} />}
        <p style={{
          fontFamily: "'DM Sans', system-ui, sans-serif",
          fontSize: '11px',
          color: '#8a8480',
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

// ── Share sheet icons ──────────────────────────────────────────────
function IconDownload() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M12 15V4M7 10.5l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 17v2a2 2 0 002 2h14a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
function IconLink() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function IconWhatsApp() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function IconX() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}
function IconInstagram() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
    </svg>
  )
}
function IconEmail() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ── Share bottom sheet ─────────────────────────────────────────────
function ShareSheet({ open, onClose, cardBlobUrl, cardFilename, cardGenerating }) {
  const [copyFeedback, setCopyFeedback] = useState(false)
  const [instagramTip, setInstagramTip] = useState(false)

  const handleSaveImage = () => {
    if (!cardBlobUrl || !cardFilename) return
    const a = document.createElement('a')
    a.href = cardBlobUrl
    a.download = cardFilename
    a.click()
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText('withdaye.com').then(() => {
      setCopyFeedback(true)
      setTimeout(() => setCopyFeedback(false), 2000)
    }).catch(() => {
      setCopyFeedback(true)
      setTimeout(() => setCopyFeedback(false), 2000)
    })
  }

  const handleWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent('Check out my focus plan for today — withdaye.com')}`, '_blank')
  }

  const handleTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent('My focus plan for today, built with Daye — withdaye.com')}`, '_blank')
  }

  const handleInstagram = () => {
    setInstagramTip(true)
    handleSaveImage()
  }

  const handleEmail = () => {
    window.location.href = `mailto:?subject=${encodeURIComponent('My focus plan for today')}&body=${encodeURIComponent('Here is my plan for today, built with Daye — withdaye.com')}`
  }

  if (!open) return null

  const optionBtn = (icon, label, onClick, highlighted) => (
    <button
      key={label}
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        background: highlighted ? 'var(--color-linen-dark)' : 'white',
        border: `1px solid ${highlighted ? 'var(--color-border-dark)' : 'var(--color-border)'}`,
        borderRadius: '12px',
        padding: '16px 12px',
        cursor: 'pointer',
        transition: 'background 0.15s, border-color 0.15s',
        fontFamily: 'var(--font-sans)',
        color: 'var(--color-muted)',
      }}
    >
      <span style={{ color: 'var(--color-ink)', lineHeight: 1, display: 'flex' }}>{icon}</span>
      <span style={{ fontSize: '11px', lineHeight: 1.2, textAlign: 'center' }}>{label}</span>
    </button>
  )

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.3)',
          zIndex: 999,
        }}
      />

      {/* Sheet */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'white',
          borderRadius: '20px 20px 0 0',
          padding: '16px 20px 32px',
          zIndex: 1000,
          maxWidth: '540px',
          margin: '0 auto',
          animation: 'slideUpSheet 280ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <div style={{ width: '32px', height: '4px', background: 'var(--color-border)', borderRadius: '2px' }} />
        </div>

        {/* Title */}
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 500, color: 'var(--color-ink)', margin: '0 0 16px 0', textAlign: 'center' }}>
          Share your plan
        </p>

        {/* Card preview */}
        <div style={{ marginBottom: '20px' }}>
          {cardGenerating ? (
            <div style={{
              width: '100%',
              height: '120px',
              background: 'var(--color-linen)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--color-muted)' }}>
                Generating…
              </span>
            </div>
          ) : cardBlobUrl ? (
            <img
              src={cardBlobUrl}
              alt="Your plan"
              style={{
                width: '100%',
                borderRadius: '10px',
                display: 'block',
                boxShadow: '0 2px 16px rgba(0,0,0,0.1)',
              }}
            />
          ) : null}
        </div>

        {/* Instagram tip */}
        {instagramTip && (
          <div style={{
            background: 'var(--color-linen)',
            borderRadius: '10px',
            padding: '10px 14px',
            marginBottom: '16px',
            fontFamily: 'var(--font-sans)',
            fontSize: '12px',
            color: 'var(--color-muted)',
            textAlign: 'center',
            lineHeight: 1.5,
          }}>
            Image saved. Open Instagram, swipe right, and tap the image icon to share to your story.
          </div>
        )}

        {/* 3-column options grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
          {optionBtn(<IconDownload />, cardGenerating ? 'Preparing…' : 'Save image', handleSaveImage, instagramTip)}
          {optionBtn(<IconLink />, copyFeedback ? 'Copied!' : 'Copy link', handleCopyLink, false)}
          {optionBtn(<IconWhatsApp />, 'WhatsApp', handleWhatsApp, false)}
          {optionBtn(<IconX />, 'X / Twitter', handleTwitter, false)}
          {optionBtn(<IconInstagram />, 'Instagram', handleInstagram, false)}
          {optionBtn(<IconEmail />, 'Email', handleEmail, false)}
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          style={{
            width: '100%',
            background: 'none',
            border: 'none',
            fontFamily: 'var(--font-sans)',
            fontSize: '14px',
            color: 'var(--color-muted)',
            cursor: 'pointer',
            padding: '8px 0',
          }}
        >
          Close
        </button>
      </div>
    </>
  )
}

export default function FocusOutput({
  plan, userTasks, user, userProfile, checkInData,
  meetings,
  history, streakCount,
  extraTasks, onExtraTasksChange,
  onStartAction, onReset, onBack, onHome,
}) {
  const { priorities, prioritySubtitles, avoid, timing, why, timeBlocks, goalAlignment, dayLabel, dayName } = plan
  const rawName = user?.firstName || ''
  const firstName = rawName ? rawName.charAt(0).toUpperCase() + rawName.slice(1) : ''

  const stateLevel = checkInData
    ? getStateLevel({ energy: checkInData.energy, sleep: checkInData.sleep, mood: checkInData.mood })
    : 'neutral'
  const isLow = stateLevel === 'low'
  const overwhelmedOrAnxious = isOverwhelmedOrAnxious(checkInData?.mood)

  const displayPriorities = isLow ? priorities.slice(0, 2) : priorities

  // FIX 6: cap avoid at 2 items
  const rawAvoid = isLow
    ? [
        ...avoid,
        'Taking on anything new today — protect your energy',
        ...(overwhelmedOrAnxious ? ['Saying yes to anything that is not already on this list'] : []),
      ]
    : avoid
  const displayAvoid = rawAvoid.slice(0, 2)

  const displayWhy = isLow
    ? `${why} You are not at full capacity and that is okay. Two things done well beats five things half done.`
    : why

  // Add task state
  const [inputVal, setInputVal] = useState('')
  const [warningVisible, setWarningVisible] = useState(false)
  const warningTimerRef = useRef(null)

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
    if (allExisting.some((t) => areSimilar(t, trimmed))) { showWarning(); return }
    onExtraTasksChange([...(extraTasks || []), trimmed])
    setInputVal('')
    setWarningVisible(false)
  }

  const handleInputKey = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); handleAddTask() }
  }

  const removeExtra = (index) => {
    onExtraTasksChange((extraTasks || []).filter((_, i) => i !== index))
  }

  // Share sheet state (FIX 5)
  const [shareSheetOpen, setShareSheetOpen] = useState(false)
  const [cardBlobUrl, setCardBlobUrl] = useState(null)
  const [cardFilename, setCardFilename] = useState(null)
  const [cardGenerating, setCardGenerating] = useState(false)

  const generateCard = async () => {
    setCardGenerating(true)
    setCardBlobUrl(null)
    try {
      await loadHtml2Canvas()
      await document.fonts.ready
      await new Promise((r) => setTimeout(r, 300))
      const cardEl = document.getElementById('share-card')
      const canvas = await window.html2canvas(cardEl, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#f9f7f5',
        logging: false,
        onclone: (clonedDoc) => {
          const c = clonedDoc.querySelector('#share-card')
          if (c) { c.style.position = 'relative'; c.style.top = '0'; c.style.left = '0' }
        },
      })
      const blob = await new Promise((r) => canvas.toBlob(r, 'image/png'))
      if (!blob) throw new Error('toBlob returned null')
      const filename = `daye-plan-${formatDateFilename()}.png`
      setCardFilename(filename)
      setCardBlobUrl(URL.createObjectURL(blob))
    } catch (err) {
      console.error('Card generation failed:', err)
    } finally {
      setCardGenerating(false)
    }
  }

  const openShareSheet = () => {
    setShareSheetOpen(true)
    generateCard()
  }

  const closeShareSheet = () => {
    setShareSheetOpen(false)
  }

  const screenStyle = isLow ? { background: '#faf4ef' } : {}

  return (
    <div className="screen output-screen" style={screenStyle}>
      {/* Hidden share card */}
      <ShareCard
        firstName={firstName}
        dayLabel={dayLabel}
        dayName={dayName}
        displayPriorities={displayPriorities}
        goalAlignment={goalAlignment}
        isLow={isLow}
      />

      <div className="flex-1 overflow-y-auto">
        {/* ── Header ─────────────────────────────────────────── */}
        <div style={{ marginBottom: '16px' }}>
          <span
            onClick={onHome}
            role="button"
            tabIndex={0}
            style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--color-muted)', cursor: 'pointer' }}
            className="text-[13px] font-light block mb-3 hover:opacity-70 transition-opacity"
          >
            daye
          </span>
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
          <p className="text-[11px] font-medium uppercase tracking-widest mb-2" style={{ color: 'var(--color-muted)' }}>
            {formatDate()}
          </p>
          {(() => {
            const insight = getPlanInsight(history || [], streakCount || 0)
            return insight ? (
              <p style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '12px',
                fontStyle: 'italic',
                color: 'var(--color-muted)',
                margin: '0 0 8px 0',
                lineHeight: 1.5,
              }}>
                {insight}
              </p>
            ) : null
          })()}
          {dayName && (
            <p style={{
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              fontSize: '15px',
              color: 'var(--color-muted)',
              borderLeft: '1px solid var(--color-lavender)',
              paddingLeft: '10px',
              margin: '0 0 6px 0',
              lineHeight: 1.4,
            }}>
              {dayName}
            </p>
          )}
          <div className="flex items-baseline gap-3">
            <h1 style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--color-ink)' }} className="text-[28px] font-normal leading-tight">
              {firstName ? `${firstName}'s plan.` : 'Your plan.'}
            </h1>
            {dayLabel && (
              <span
                className="text-[11px] font-medium px-2.5 py-1 rounded-full flex-shrink-0"
                style={{ background: 'var(--color-linen-dark)', color: 'var(--color-muted)', border: '0.5px solid var(--color-border)' }}
              >
                {dayLabel}
              </span>
            )}
          </div>
        </div>

        {isLow && (
          <div className="rounded-2xl px-4 py-3 mb-4" style={{ background: 'var(--color-blush)', border: '1px solid #e8c4c4' }}>
            <p className="text-sm font-medium" style={{ color: '#7a3a3a' }}>Keeping it light today</p>
          </div>
        )}

        {/* ── Two-column grid ─────────────────────────────────── */}
        <div className="output-grid">

          {/* Left: priorities + add task + why */}
          <div className="output-col-left">

            <div className="card">
              <SectionLabel>Focus on</SectionLabel>
              <div className="space-y-2">
                {displayPriorities.map((p, i) => {
                  const subtitle = prioritySubtitles?.[i]
                  return (
                    <div key={i} className="px-3 py-2.5 rounded-xl" style={{ borderLeft: `3px solid ${getPriorityAccent(i, isLow)}`, background: 'var(--color-linen)' }}>
                      <span className="text-sm leading-relaxed font-medium" style={{ color: 'var(--color-ink)' }}>{p}</span>
                      {subtitle && <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--color-muted)' }}>{subtitle}</p>}
                    </div>
                  )
                })}
              </div>
            </div>

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
                  style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-ink)', color: 'var(--color-white)', fontSize: '20px', lineHeight: 1, border: 'none', cursor: 'pointer' }}
                  aria-label="Add task"
                >
                  +
                </button>
              </div>
              {warningVisible && <p className="text-[11px] mt-1.5" style={{ color: 'var(--color-muted)' }}>This looks similar to a task already in your plan.</p>}
              {(extraTasks || []).length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {(extraTasks || []).map((task, i) => (
                    <span key={i} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full" style={{ background: 'var(--color-linen-dark)', border: '0.5px solid var(--color-border)', color: 'var(--color-ink)' }}>
                      {task}
                      <button onClick={() => removeExtra(i)} className="ml-0.5 leading-none opacity-50 hover:opacity-100" style={{ fontSize: '14px', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0 }} aria-label={`Remove ${task}`}>×</button>
                    </span>
                  ))}
                </div>
              )}
              {(extraTasks || []).length >= 5 && <p className="text-[11px] mt-1.5" style={{ color: 'var(--color-muted)' }}>Maximum 5 tasks added.</p>}
            </div>

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

            {timing && (
              <div className="card">
                <SectionLabel>Timing</SectionLabel>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-ink)' }}>{timing}</p>
              </div>
            )}

            {displayWhy && (
              <div className="rounded-2xl p-5" style={{ background: 'var(--color-white)', border: '1px solid var(--color-border)', borderLeft: '3px solid var(--color-lavender)' }}>
                <h2 className="text-[11px] font-medium uppercase tracking-widest mb-2" style={{ color: 'var(--color-muted)' }}>Why</h2>
                <p className="text-sm leading-relaxed italic" style={{ color: 'var(--color-muted)' }}>{displayWhy}</p>
              </div>
            )}
          </div>

          {/* Right: time split + avoid + goal */}
          <div className="output-col-right">

            {/* FIX 1: Time split — cleaner typography */}
            {timeBlocks && timeBlocks.length > 0 && (
              <div className="card">
                <SectionLabel>Time split</SectionLabel>
                <div>
                  {timeBlocks.map((block, i) => {
                    const isMeeting = block.activity.startsWith('[MEETING] ')
                    const activityLabel = isMeeting ? block.activity.slice('[MEETING] '.length) : block.activity
                    return (
                      <div
                        key={i}
                        className="flex items-center"
                        style={{
                          padding: '10px 0',
                          borderBottom: i < timeBlocks.length - 1 ? '1px solid var(--color-linen-dark)' : 'none',
                          ...(isMeeting ? { background: 'var(--color-linen-dark)', margin: '0 -20px', padding: '10px 20px' } : {}),
                        }}
                      >
                        {isMeeting && (
                          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-muted)', flexShrink: 0, marginRight: '10px' }} />
                        )}
                        <div style={{ minWidth: isMeeting ? '62px' : '72px', flexShrink: 0, paddingRight: '12px' }}>
                          <span style={{
                            fontFamily: 'var(--font-sans)',
                            fontSize: '12px',
                            fontWeight: 500,
                            color: isMeeting ? 'var(--color-muted)' : 'var(--color-ink)',
                            whiteSpace: 'nowrap',
                          }}>
                            {block.time}
                          </span>
                        </div>
                        <div style={{ width: '1px', height: '18px', background: 'var(--color-border)', flexShrink: 0, marginRight: '12px' }} />
                        <div className="flex-1 min-w-0">
                          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: isMeeting ? 'var(--color-muted)' : 'var(--color-ink)' }}>
                            {activityLabel}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Avoid — capped at 2 (FIX 6) */}
            {displayAvoid.length > 0 && (
              <div className="card">
                <SectionLabel>Avoid today</SectionLabel>
                <div className="flex flex-wrap gap-2">
                  {displayAvoid.map((a, i) => (
                    <span key={i} className="text-xs px-3 py-1.5 rounded-full" style={{ border: '0.5px solid var(--color-border-dark)', color: 'var(--color-muted)', background: 'var(--color-linen)' }}>
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {goalAlignment && (
              <p className="text-xs pb-2" style={{ color: 'var(--color-muted)', opacity: 0.7 }}>
                {goalAlignment}
              </p>
            )}
          </div>
        </div>

        {/* Share button (FIX 5) */}
        <div style={{ marginTop: '16px' }}>
          <button
            onClick={openShareSheet}
            className="w-full flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            style={{
              padding: '14px',
              background: 'var(--color-white)',
              border: '1px solid var(--color-border)',
              borderRadius: '12px',
              color: 'var(--color-ink)',
              fontFamily: 'var(--font-sans)',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
              <rect x="5" y="7" width="6" height="7" rx="1" stroke="currentColor" strokeWidth="1.4" />
              <path d="M8 1v8M5.5 3.5L8 1l2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Share today's plan
          </button>
        </div>
      </div>

      <div className="flex-shrink-0 space-y-2.5 pt-4">
        <button className="btn-primary" onClick={onStartAction}>Start focus timer</button>
        <button className="btn-ghost" onClick={onReset}>Start over</button>
      </div>

      {/* Share bottom sheet (FIX 5) */}
      <ShareSheet
        open={shareSheetOpen}
        onClose={closeShareSheet}
        cardBlobUrl={cardBlobUrl}
        cardFilename={cardFilename}
        cardGenerating={cardGenerating}
      />
    </div>
  )
}

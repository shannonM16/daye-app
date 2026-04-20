import { useState, useEffect, useRef } from 'react'
import { deduplicateTasks } from '../engine/deduplicateTasks'
import { saveCompletionsForDate, taskMatchesGoal, incrementGoalCompletionCount, getGoalToastContent } from '../utils/completions'

const TIMER_SAVE_KEY = 'df_timerState'
const REST_DURATION = 5 * 60

function getTimerOptions(checkInData, userProfile, taskCount) {
  const energy = checkInData?.energy || 3
  const dayType = checkInData?.dayType || ''
  const mood = (checkInData?.mood || '').toLowerCase()
  const sleep = (checkInData?.sleep || '').toLowerCase()
  const pressure = checkInData?.pressure || []
  const userType = userProfile?.userType || ''

  const isLowState =
    energy <= 2 ||
    ['poor', 'terrible'].includes(sleep) ||
    ['overwhelmed', 'anxious'].includes(mood)

  const hasCashflowPressure = pressure.some((p) => {
    const s = p.toLowerCase()
    return s.includes('cash') || s.includes('invoice') || s.includes('pipeline') || s.includes('money')
  })

  const hasExamPressure = pressure.some((p) => {
    const s = p.toLowerCase()
    return s.includes('exam') || s.includes('assignment') || s.includes('dissertation')
  })

  let recommended

  if (isLowState) {
    recommended = { duration: 25 * 60, reason: 'Short blocks keep things moving without burning you out.' }
  } else if (userType === 'figuring-it-out') {
    recommended = { duration: 30 * 60, reason: 'Gentle 30-minute blocks — enough to make progress without pressure.' }
  } else if (userType === 'student' && hasExamPressure) {
    recommended = { duration: 50 * 60, reason: '50-minute blocks with breaks are proven to help with retention.' }
  } else if (userType === 'self-employed' && hasCashflowPressure) {
    recommended = { duration: 90 * 60, reason: '90 minutes of deep focus on your top revenue task.' }
  } else if (energy >= 4 && dayType === 'deep-work' && taskCount <= 2) {
    recommended = { duration: 90 * 60, reason: 'High energy and one main task — a long block is your best move.' }
  } else if (energy >= 4 && (taskCount >= 3 || dayType === 'lots-of-meetings')) {
    recommended = { duration: 45 * 60, reason: '45-minute blocks let you move through multiple tasks with focus.' }
  } else if (energy === 3) {
    recommended = { duration: 50 * 60, reason: 'A good balance for a normal energy day.' }
  } else {
    recommended = { duration: 25 * 60, reason: '25 minutes — easy to start and builds momentum.' }
  }

  let alternative
  if (recommended.duration === 90 * 60) {
    alternative = { duration: 25 * 60, reason: 'Shorter if you prefer regular breaks or your focus drifts.' }
  } else if (recommended.duration === 50 * 60) {
    alternative = { duration: 25 * 60, reason: 'Shorter option if today feels harder than expected.' }
  } else if (recommended.duration === 45 * 60) {
    alternative = { duration: 90 * 60, reason: 'Longer option if you want to go deeper on one thing.' }
  } else if (recommended.duration === 30 * 60) {
    alternative = { duration: 25 * 60, reason: 'Slightly shorter if 30 minutes still feels like too much.' }
  } else {
    alternative = { duration: 50 * 60, reason: 'Longer if your focus holds better than expected.' }
  }

  return { recommended, alternative }
}

function getTimerStroke(mood, energy) {
  const m = (mood || '').toLowerCase()
  if (['anxious', 'overwhelmed'].includes(m)) return 'var(--color-blush)'
  if (['motivated', 'clear-headed'].includes(m)) return 'var(--color-sage)'
  if (energy <= 2 || ['tired', 'flat'].includes(m)) return 'var(--color-lavender)'
  if (energy >= 4 && ['focused', 'motivated'].includes(m)) return 'var(--color-ink)'
  return 'var(--color-ink)'
}

function getMicroCopy(mood, energy) {
  const m = (mood || '').toLowerCase()
  if (['anxious', 'overwhelmed'].includes(m)) {
    return ['One thing at a time.', 'Breathe. Then begin.', 'You do not need to do everything.', 'Start small. Stay small.']
  }
  if (['motivated', 'clear-headed'].includes(m)) {
    return ['Build on this energy.', 'Great days start like this.', 'Stay with it.', 'You have got this.']
  }
  if (energy <= 2 || ['tired', 'flat'].includes(m)) {
    return ['Slow and steady.', 'Just start, that is enough.', 'Small steps count.', 'Be gentle with yourself today.']
  }
  if (energy >= 4 && ['focused'].includes(m)) {
    return ['You are in the zone.', 'Make it count.', 'Full focus.', 'This is your time.']
  }
  return ['One thing at a time.', 'Progress over perfect.', 'Just start.', 'Stay with it.']
}

function reorderForMood(items, mood, energy) {
  const m = (mood || '').toLowerCase()
  if (['anxious', 'overwhelmed'].includes(m)) {
    return [...items].sort((a, b) => a.length - b.length)
  }
  if (energy <= 2) {
    const adminKw = ['admin', 'email', 'reply', 'clear', 'message', 'comms', 'invoice', 'quick']
    const isAdmin = (t) => adminKw.some((kw) => t.toLowerCase().includes(kw))
    return [...items.filter(isAdmin), ...items.filter((t) => !isAdmin(t))]
  }
  return items
}

function getChecklistLabel(mood, energy) {
  const m = (mood || '').toLowerCase()
  if (['anxious', 'overwhelmed'].includes(m)) return 'Start here — it is the smallest task'
  if (energy <= 2) return 'Easiest first today'
  return null
}

function getBreakContent(sessionNumber, mood, energy) {
  const m = (mood || '').toLowerCase()
  if (['anxious', 'overwhelmed'].includes(m)) {
    return { message: 'Pause. Notice you just did something. Ready for the next block?', primaryLabel: 'Continue', showLongerBreak: true }
  }
  if (energy <= 2) {
    return { message: 'Good. That counts. Rest for a moment before the next one.', primaryLabel: 'Start next block', showLongerBreak: false }
  }
  if (energy >= 4) {
    return { message: 'Strong start. Keep the momentum.', primaryLabel: 'Start next block', showLongerBreak: false }
  }
  if (sessionNumber === 1) {
    return { message: 'First block done. Take a moment.', primaryLabel: 'Start next block', showLongerBreak: false }
  }
  return { message: 'Good work. Ready for the next block?', primaryLabel: 'Start next block', showLongerBreak: false }
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

function formatDuration(seconds) {
  return `${Math.floor(seconds / 60)} min`
}

function CheckItem({ label, checked, onToggle }) {
  return (
    <button onClick={onToggle} className="w-full flex items-start gap-3 py-2.5 text-left transition-all">
      <div
        className="flex-shrink-0 w-5 h-5 rounded flex items-center justify-center mt-0.5 transition-all"
        style={{
          border: `2px solid ${checked ? 'var(--color-ink)' : 'var(--color-border-dark)'}`,
          background: checked ? 'var(--color-ink)' : 'transparent',
        }}
      >
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span
        className="text-sm leading-relaxed"
        style={{
          color: checked ? 'var(--color-border-dark)' : 'var(--color-ink)',
          textDecoration: checked ? 'line-through' : 'none',
        }}
      >
        {label}
      </span>
    </button>
  )
}

export default function ActionMode({ priorities, prioritySubtitles, userTasks, extraTasks, checkInData, userProfile, dayName, onBack, onHome }) {
  const mood = checkInData?.mood || ''
  const energy = checkInData?.energy || 3

  const { recommended, alternative } = getTimerOptions(
    checkInData, userProfile, (userTasks || []).length
  )

  const allItems = deduplicateTasks(priorities || [], userTasks || [])
  const orderedItems = reorderForMood(allItems, mood, energy)
  const checklistLabel = getChecklistLabel(mood, energy)

  const totalSessions = Math.min(4, Math.max(2, allItems.length))

  const [selectedKey, setSelectedKey] = useState('recommended')
  const selectedDuration = selectedKey === 'recommended' ? recommended.duration : alternative.duration

  const [timeLeft, setTimeLeft] = useState(selectedDuration)
  const [running, setRunning] = useState(false)
  const [sessionDone, setSessionDone] = useState(false)
  const [sessionNumber, setSessionNumber] = useState(1)

  const [showBreakCard, setShowBreakCard] = useState(false)
  const [restLeft, setRestLeft] = useState(null)

  const [checked, setChecked] = useState([])
  const [extraChecked, setExtraChecked] = useState([])
  const [goalToast, setGoalToast] = useState(null) // { line1, line2 }
  const [goalToastVisible, setGoalToastVisible] = useState(false)
  const goalToastRef = useRef(null)
  const completionsSinceLastToastRef = useRef(2) // start at 2 so first match can fire
  const toastsThisSessionRef = useRef(0)

  const microCopyArr = getMicroCopy(mood, energy)
  const [microIdx, setMicroIdx] = useState(0)

  const [resumeData, setResumeData] = useState(null)

  const timerRef = useRef(null)
  const microRef = useRef(null)
  const restRef = useRef(null)
  const stateRef = useRef({})

  stateRef.current = { selectedKey, selectedDuration, timeLeft, running, sessionNumber, checked, extraChecked }

  useEffect(() => {
    try {
      const raw = localStorage.getItem(TIMER_SAVE_KEY)
      if (!raw) return
      const saved = JSON.parse(raw)
      const ageMs = Date.now() - (saved.lastSavedAt || 0)
      if (ageMs > 24 * 60 * 60 * 1000) { localStorage.removeItem(TIMER_SAVE_KEY); return }
      let adjusted = saved.timeLeft || 0
      if (saved.wasRunning) adjusted = Math.max(0, saved.timeLeft - Math.floor(ageMs / 1000))
      if (adjusted > 0 && saved.sessionNumber) setResumeData({ ...saved, timeLeft: adjusted })
    } catch {
      localStorage.removeItem(TIMER_SAVE_KEY)
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      const s = stateRef.current
      const hasProgress = s.timeLeft < s.selectedDuration || s.running || s.sessionNumber > 1 || s.checked.length > 0
      if (!hasProgress) return
      localStorage.setItem(TIMER_SAVE_KEY, JSON.stringify({
        selectedKey: s.selectedKey,
        selectedDuration: s.selectedDuration,
        timeLeft: s.timeLeft,
        wasRunning: s.running,
        sessionNumber: s.sessionNumber,
        checkedTasks: s.checked,
        extraCheckedTasks: s.extraChecked,
        lastSavedAt: Date.now(),
      }))
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (running && !sessionDone) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current)
            setRunning(false)
            setSessionDone(true)
            setShowBreakCard(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [running, sessionDone])

  useEffect(() => {
    if (running) {
      microRef.current = setInterval(() => {
        setMicroIdx((i) => (i + 1) % microCopyArr.length)
      }, 30000)
    } else {
      clearInterval(microRef.current)
    }
    return () => clearInterval(microRef.current)
  }, [running, microCopyArr.length])

  useEffect(() => {
    if (restLeft === null) { clearInterval(restRef.current); return }
    if (restLeft <= 0) { clearInterval(restRef.current); return }
    restRef.current = setInterval(() => {
      setRestLeft((prev) => {
        if (prev <= 1) { clearInterval(restRef.current); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(restRef.current)
  }, [restLeft !== null]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelectOption = (key) => {
    if (running || sessionDone) return
    setSelectedKey(key)
    setTimeLeft(key === 'recommended' ? recommended.duration : alternative.duration)
  }

  const toggleChecked = (task) => {
    setChecked((prev) => {
      const isNowChecked = !prev.includes(task)
      const next = isNowChecked ? [...prev, task] : prev.filter((t) => t !== task)
      const today = new Date().toISOString().split('T')[0]
      saveCompletionsForDate(today, [...next, ...extraChecked])
      if (isNowChecked) {
        const goals = userProfile?.goals?.length ? userProfile.goals : (userProfile?.goal ? [userProfile.goal] : [])
        const primaryGoal = goals[0]
        completionsSinceLastToastRef.current += 1
        if (
          primaryGoal &&
          taskMatchesGoal(task, primaryGoal) &&
          completionsSinceLastToastRef.current >= 2 &&
          toastsThisSessionRef.current < 2
        ) {
          incrementGoalCompletionCount()
          completionsSinceLastToastRef.current = 0
          toastsThisSessionRef.current += 1
          const content = getGoalToastContent(primaryGoal)
          clearTimeout(goalToastRef.current)
          setGoalToast(content)
          setGoalToastVisible(true)
          goalToastRef.current = setTimeout(() => {
            setGoalToastVisible(false)
            setTimeout(() => setGoalToast(null), 200)
          }, 3000)
        }
      }
      return next
    })
  }

  const toggleExtraChecked = (task) => {
    setExtraChecked((prev) => {
      const next = prev.includes(task) ? prev.filter((t) => t !== task) : [...prev, task]
      const today = new Date().toISOString().split('T')[0]
      saveCompletionsForDate(today, [...checked, ...next])
      return next
    })
  }

  const startNextBlock = () => {
    setSessionNumber((n) => n + 1)
    setSessionDone(false)
    setShowBreakCard(false)
    setRestLeft(null)
    setTimeLeft(selectedDuration)
  }

  const startLongerBreak = () => { setRestLeft(REST_DURATION) }

  const reset = () => {
    setTimeLeft(selectedDuration)
    setRunning(false)
    setSessionDone(false)
    setShowBreakCard(false)
    setRestLeft(null)
    localStorage.removeItem(TIMER_SAVE_KEY)
  }

  const acceptResume = () => {
    if (!resumeData) return
    setSelectedKey(resumeData.selectedKey || 'recommended')
    setTimeLeft(resumeData.timeLeft)
    setSessionNumber(resumeData.sessionNumber || 1)
    setChecked(resumeData.checkedTasks || [])
    setExtraChecked(resumeData.extraCheckedTasks || [])
    setResumeData(null)
  }

  const dismissResume = () => {
    localStorage.removeItem(TIMER_SAVE_KEY)
    setResumeData(null)
  }

  const allSessionsDone = sessionNumber > totalSessions
  const progress = 1 - timeLeft / selectedDuration
  const circumference = 2 * Math.PI * 54
  const strokeDashoffset = circumference * (1 - progress)
  const timerStroke = getTimerStroke(mood, energy)
  const breakContent = getBreakContent(sessionNumber, mood, energy)

  const allMainDone = checked.length === orderedItems.length && orderedItems.length > 0
  const allExtraDone = (extraTasks || []).length === 0 || extraChecked.length === (extraTasks || []).length

  const totalDone = checked.length + extraChecked.length
  const totalTaskCount = orderedItems.length + (extraTasks || []).length

  // Start/Pause label for both in-card and desktop button
  const startPauseLabel = running ? 'Pause' : timeLeft === selectedDuration ? 'Start' : 'Resume'
  const showReset = timeLeft < selectedDuration && !running

  return (
    <div className="screen action-screen-wide">
      {/* Feature 3: Goal progress toast */}
      {goalToast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 64px)',
          maxWidth: '480px',
          background: 'var(--color-linen)',
          border: '0.5px solid var(--color-border)',
          borderLeft: '3px solid var(--color-lavender)',
          borderRadius: '0 12px 12px 0',
          padding: '14px 20px',
          zIndex: 500,
          boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
          animation: goalToastVisible
            ? 'goalToastIn 300ms cubic-bezier(0.4, 0, 0.2, 1) forwards'
            : 'goalToastOut 200ms cubic-bezier(0.4, 0, 0.2, 1) forwards',
        }}>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 500, color: 'var(--color-ink)', margin: goalToast.line2 ? '0 0 2px 0' : 0, lineHeight: 1.4 }}>
            {goalToast.line1}
          </p>
          {goalToast.line2 && (
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--color-muted)', margin: 0 }}>
              {goalToast.line2}
            </p>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto">

        {/* Resume prompt */}
        {resumeData && (
          <div className="rounded-2xl px-4 py-3 mb-4" style={{ background: 'var(--color-linen-dark)', border: '1px solid var(--color-border)' }}>
            <p className="text-sm font-medium mb-2" style={{ color: 'var(--color-ink)' }}>
              Resume your session? {formatTime(resumeData.timeLeft)} remaining.
            </p>
            <div className="flex gap-2">
              <button
                onClick={acceptResume}
                className="px-4 py-1.5 rounded-full text-xs font-medium"
                style={{ background: 'var(--color-ink)', color: 'var(--color-white)' }}
              >
                Resume
              </button>
              <button
                onClick={dismissResume}
                className="px-4 py-1.5 rounded-full text-xs font-medium"
                style={{ border: '1px solid var(--color-border)', color: 'var(--color-muted)' }}
              >
                Start fresh
              </button>
            </div>
          </div>
        )}

        {/* Header */}
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
              className="flex items-center gap-1.5 text-sm font-medium mb-3 transition-colors"
              style={{ color: 'var(--color-muted)' }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 13L5 8l5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back
            </button>
          )}
          <p className="text-[11px] font-medium uppercase tracking-widest mb-3 text-center" style={{ color: 'var(--color-muted)' }}>
            Today's focus
          </p>
          {dayName && (
            <h1 style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--color-ink)', textAlign: 'center' }} className="text-[22px] font-normal leading-tight">
              {dayName}
            </h1>
          )}
        </div>

        {/* ── Two-column body ─────────────────────────────────── */}
        <div className="action-body-grid">

          {/* LEFT column: timer + options + start button */}
          <div className="action-left-col">

            {/* Timer options — mobile: order 1 (before ring); desktop: order 2 (after ring) */}
            {!resumeData && !sessionDone && !allSessionsDone && (
              <div className="action-options-group">
                <p className="text-[10px] uppercase tracking-widest font-medium mb-2" style={{ color: 'var(--color-muted)' }}>
                  Recommended for you
                </p>
                <div className="action-options-cards">
                  {[
                    { key: 'recommended', data: recommended },
                    { key: 'alternative', data: alternative },
                  ].map(({ key, data }) => (
                    <button
                      key={key}
                      onClick={() => handleSelectOption(key)}
                      disabled={running}
                      className="text-left px-4 py-3 rounded-2xl transition-all duration-150 active:scale-[0.99] disabled:cursor-default"
                      style={{
                        border: `2px solid ${selectedKey === key ? 'var(--color-ink)' : 'var(--color-border)'}`,
                        background: selectedKey === key ? 'var(--color-ink)' : 'var(--color-white)',
                      }}
                    >
                      <div
                        className="text-lg font-semibold leading-tight"
                        style={{ color: selectedKey === key ? 'var(--color-white)' : 'var(--color-ink)' }}
                      >
                        {formatDuration(data.duration)}
                      </div>
                      <div
                        className="text-xs leading-relaxed mt-0.5"
                        style={{ color: selectedKey === key ? 'rgba(255,255,255,0.65)' : 'var(--color-muted)' }}
                      >
                        {data.reason}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Timer ring / break card / completion — mobile: order 2; desktop: order 1 */}
            <div className="action-timer-or-break">
              {allSessionsDone ? (
                <div className="card flex flex-col items-center py-8">
                  <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--color-sage)', fontSize: '22px' }}>
                    All blocks complete.
                  </p>
                  <p className="text-xs mt-2" style={{ color: 'var(--color-muted)' }}>Seriously great work today.</p>
                </div>
              ) : showBreakCard ? (
                <div className="card flex flex-col items-center py-6 text-center">
                  {restLeft !== null ? (
                    <>
                      <p className="text-sm mb-1" style={{ color: 'var(--color-muted)' }}>Taking a 5-minute break.</p>
                      <p className="text-3xl font-semibold tabular-nums mb-4" style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-ink)' }}>
                        {formatTime(restLeft)}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm mb-4 leading-relaxed px-2" style={{ color: 'var(--color-ink)' }}>
                      {restLeft === 0 ? 'Break over. Ready to go?' : breakContent.message}
                    </p>
                  )}
                  <div className="flex flex-col gap-2 w-full">
                    <button
                      onClick={startNextBlock}
                      className="px-6 py-2.5 rounded-full text-sm font-medium"
                      style={{ background: 'var(--color-ink)', color: 'var(--color-white)' }}
                    >
                      {breakContent.primaryLabel}
                    </button>
                    {breakContent.showLongerBreak && restLeft === null && (
                      <button
                        onClick={startLongerBreak}
                        className="px-6 py-2.5 rounded-full text-sm font-medium"
                        style={{ border: '1px solid var(--color-border)', color: 'var(--color-muted)' }}
                      >
                        I need a longer break
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="card flex flex-col items-center py-5">
                  <p className="text-[11px] mb-3" style={{ color: 'var(--color-muted)' }}>
                    Block {sessionNumber} of {totalSessions}
                  </p>

                  {/* Timer ring — scales via CSS class */}
                  <div className="action-ring-wrap mb-4">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="54" fill="none" stroke="var(--color-linen-dark)" strokeWidth="5" />
                      <circle
                        cx="60" cy="60" r="54" fill="none"
                        stroke={timerStroke}
                        strokeWidth="5"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        style={{ transition: 'stroke-dashoffset 1s linear' }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="timer-display tabular-nums">{formatTime(timeLeft)}</span>
                    </div>
                  </div>

                  {/* Micro-copy — between ring and controls/options */}
                  {running && (
                    <p className="text-xs mb-3 text-center italic" style={{ color: 'var(--color-muted)', opacity: 0.7, minHeight: '16px' }}>
                      {microCopyArr[microIdx]}
                    </p>
                  )}

                  {/* Controls — visible on mobile, hidden on desktop (replaced by external button) */}
                  <div className="action-controls-in-card">
                    <button
                      onClick={() => setRunning((r) => !r)}
                      className="px-8 py-2.5 rounded-full text-sm font-medium transition-all active:scale-95"
                      style={{ background: 'var(--color-ink)', color: 'var(--color-white)' }}
                    >
                      {startPauseLabel}
                    </button>
                    {showReset && (
                      <button
                        onClick={reset}
                        className="px-5 py-2.5 rounded-full text-sm font-medium transition-all active:scale-95"
                        style={{ border: '1px solid var(--color-border)', color: 'var(--color-muted)' }}
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Start/Pause button — desktop only, full width of left column */}
            {!allSessionsDone && !showBreakCard && !resumeData && (
              <button
                className="action-start-btn-desktop btn-primary"
                onClick={() => setRunning((r) => !r)}
              >
                {startPauseLabel}
              </button>
            )}
          </div>

          {/* RIGHT column: checklist + progress */}
          <div className="action-right-col">
            <div className="card space-y-1">
              <h2 className="text-[11px] font-medium uppercase tracking-widest mb-3" style={{ color: 'var(--color-muted)' }}>
                Today's priorities
              </h2>
              {checklistLabel && orderedItems.length > 0 && (
                <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: 'var(--color-muted)' }}>
                  {checklistLabel}
                </p>
              )}
              {orderedItems.map((item) => (
                <CheckItem key={item} label={item} checked={checked.includes(item)} onToggle={() => toggleChecked(item)} />
              ))}
              {allMainDone && allExtraDone && (
                <p className="text-center text-xs pt-2 pb-1" style={{ color: 'var(--color-muted)', opacity: 0.7 }}>
                  All done. Seriously, great work.
                </p>
              )}
            </div>

            {(extraTasks || []).length > 0 && (
              <div className="card space-y-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
                  <span className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>Added by you</span>
                  <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
                </div>
                {(extraTasks || []).map((item) => (
                  <CheckItem key={item} label={item} checked={extraChecked.includes(item)} onToggle={() => toggleExtraChecked(item)} />
                ))}
              </div>
            )}

            {/* Progress indicator */}
            {totalTaskCount > 0 && (
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-[10px] uppercase tracking-widest font-medium" style={{ color: 'var(--color-muted)' }}>Progress</span>
                  <span className="text-[11px]" style={{ color: 'var(--color-muted)' }}>{totalDone} of {totalTaskCount} done</span>
                </div>
                <div style={{ height: '3px', background: 'var(--color-border)', borderRadius: '2px' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${totalTaskCount > 0 ? (totalDone / totalTaskCount) * 100 : 0}%`,
                      background: 'var(--color-ink)',
                      borderRadius: '2px',
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-shrink-0 pt-4">
        <button className="btn-ghost" onClick={onBack}>Back to plan</button>
      </div>
    </div>
  )
}

import { useState, useCallback, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useStorage } from './hooks/useStorage'
import { buildPlan } from './engine/buildPlan'
import { calculateStreak } from './utils/patternEngine'
import { getCompletionsForDate, saveCompletionsForDate } from './utils/completions'
import Landing from './screens/Landing'
import BlogIndex from './blog/BlogIndex'
import ArticlePage from './blog/ArticlePage'
import SignUp from './screens/SignUp'
import Onboarding from './screens/Onboarding'
import OnboardingFiguringItOut from './screens/OnboardingFiguringItOut'
import CheckIn from './screens/CheckIn'
import MeetingInput from './screens/MeetingInput'
import TaskInput from './screens/TaskInput'
import FocusOutput from './screens/FocusOutput'
import ActionMode from './screens/ActionMode'
import LoadingScreen from './screens/LoadingScreen'
import HistoryScreen from './screens/HistoryScreen'
import SettingsScreen from './screens/SettingsScreen'
import './index.css'

const SCREENS = {
  LANDING: 'landing',
  SIGNUP: 'signup',
  ONBOARDING: 'onboarding',
  FIO_REFLECTION: 'fio_reflection',
  CHECKIN: 'checkin',
  MEETING_INPUT: 'meeting_input',
  TASK_INPUT: 'task_input',
  LOADING: 'loading',
  OUTPUT: 'output',
  ACTION: 'action',
  HISTORY: 'history',
  SETTINGS: 'settings',
}

function getInitialScreen() {
  if (!localStorage.getItem('df_userProfile')) return SCREENS.LANDING
  return SCREENS.CHECKIN
}

// ── Right-panel content for two-column desktop layout ──────────────

const ENERGY_LABELS = ['', 'Depleted', 'Low', 'Okay', 'Good', 'Charged']

const USER_TYPE_LABELS = {
  corporate: 'Corporate professional',
  'self-employed': 'Self-employed',
  student: 'Student',
  'figuring-it-out': 'Figuring it out',
}

function RightPanel({ screen, user, userProfile, checkInData, liveSelectedTasks }) {
  const rawName = user?.firstName || userProfile?.name || 'you'
  const name = rawName ? rawName.charAt(0).toUpperCase() + rawName.slice(1) : 'you'

  if (screen === SCREENS.CHECKIN) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 40px', textAlign: 'center' }}>
        <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '32px', color: 'var(--color-ink)', fontWeight: 300, display: 'block', marginBottom: '32px' }}>daye</span>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-muted)', marginBottom: '12px', fontWeight: 500 }}>
          Building your plan
        </p>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '28px', fontWeight: 300, color: 'var(--color-ink)', lineHeight: 1.2, marginBottom: '40px', maxWidth: '320px' }}>
          How are you starting your day, {name}?
        </h2>

        {userProfile && (
          <div style={{ background: 'var(--color-linen)', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '340px', textAlign: 'left' }}>
            <div style={{ marginBottom: '16px' }}>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-muted)', marginBottom: '4px', fontWeight: 500 }}>Profile</p>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--color-ink)', fontWeight: 500 }}>{name}</p>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--color-muted)' }}>
                {USER_TYPE_LABELS[userProfile.userType] || userProfile.userType}
              </p>
            </div>
            {userProfile.goal && (
              <div style={{ borderTop: '0.5px solid var(--color-border)', paddingTop: '14px' }}>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-muted)', marginBottom: '4px', fontWeight: 500 }}>Current goal</p>
                <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '15px', color: 'var(--color-ink)', fontWeight: 300, lineHeight: 1.4 }}>
                  "{userProfile.goal}"
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  if (screen === SCREENS.TASK_INPUT) {
    const energyLabel = checkInData?.energy ? ENERGY_LABELS[checkInData.energy] : null
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '48px 40px' }}>
        <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '20px', color: 'var(--color-ink)', fontWeight: 300, display: 'block', marginBottom: '32px' }}>daye</span>

        {checkInData && (
          <div style={{ marginBottom: '32px' }}>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-muted)', marginBottom: '12px', fontWeight: 500 }}>
              Today's check-in
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {energyLabel && (
                <span style={{ background: 'var(--color-linen)', borderRadius: '20px', padding: '5px 12px', fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--color-ink)' }}>
                  Energy: {energyLabel}
                </span>
              )}
              {checkInData.mood && (
                <span style={{ background: 'var(--color-linen)', borderRadius: '20px', padding: '5px 12px', fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--color-ink)', textTransform: 'capitalize' }}>
                  {checkInData.mood}
                </span>
              )}
              {checkInData.sleep && (
                <span style={{ background: 'var(--color-linen)', borderRadius: '20px', padding: '5px 12px', fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--color-ink)', textTransform: 'capitalize' }}>
                  Sleep: {checkInData.sleep}
                </span>
              )}
            </div>
          </div>
        )}

        <div>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-muted)', marginBottom: '12px', fontWeight: 500 }}>
            Selected tasks
          </p>
          {liveSelectedTasks.length === 0 ? (
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--color-muted)', fontStyle: 'italic' }}>
              Tap tasks on the left to add them here…
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {liveSelectedTasks.map((task, i) => (
                <div key={task} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: i === 0 ? 'var(--color-ink)' : i === 1 ? 'var(--color-lavender)' : 'var(--color-border)', flexShrink: 0 }} />
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--color-ink)' }}>{task}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {liveSelectedTasks.length > 0 && (
          <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '13px', color: 'var(--color-muted)', marginTop: '32px', lineHeight: 1.5 }}>
            Daye will rank and prioritise these based on your energy and goals.
          </p>
        )}
      </div>
    )
  }

  if (screen === SCREENS.HISTORY || screen === SCREENS.SETTINGS) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 40px' }}>
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '32px', color: 'var(--color-ink)', fontWeight: 300, display: 'block', marginBottom: '16px' }}>daye</span>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--color-muted)' }}>Your daily focus companion.</p>
        </div>
      </div>
    )
  }

  return null
}

// ── Main app ───────────────────────────────────────────────────────

export default function App() {
  const location = useLocation()
  const [user, setUser] = useStorage('df_user', null)
  const [userProfile, setUserProfile] = useStorage('df_userProfile', null)
  const [userTasks, setUserTasks] = useStorage('df_userTasks', [])
  const [extraTasks, setExtraTasks] = useStorage('df_extraTasks', [])
  const [checkInHistory, setCheckInHistory] = useStorage('df_checkInHistory', [])
  const [plan, setPlan] = useState(null)
  const [checkInData, setCheckInData] = useState(null)
  const [meetings, setMeetings] = useState([])
  const [liveSelectedTasks, setLiveSelectedTasks] = useState([])
  const [screen, setScreen] = useState(getInitialScreen)

  const handleSignUp = useCallback((userData) => {
    setUser(userData)
    if (!localStorage.getItem('daye_member_since')) {
      localStorage.setItem('daye_member_since', new Date().toISOString())
    }
    setScreen(SCREENS.ONBOARDING)
  }, [setUser])

  const handleOnboarding = useCallback((profile) => {
    setUserProfile(profile)
    if (!localStorage.getItem('daye_member_since')) {
      localStorage.setItem('daye_member_since', new Date().toISOString())
    }
    setScreen(SCREENS.CHECKIN)
  }, [setUserProfile])

  const handleCheckIn = useCallback((data) => {
    setCheckInData(data)
    setLiveSelectedTasks([])
    const today = new Date().toISOString().split('T')[0]
    setCheckInHistory((prev) => {
      const filtered = (prev || []).filter((h) => h.date !== today)
      return [...filtered, { date: today, ...data }]
    })
    setScreen(SCREENS.MEETING_INPUT)
  }, [setCheckInHistory])

  const handleMeetingInput = useCallback((meetingsList) => {
    setMeetings(meetingsList)
    setScreen(SCREENS.TASK_INPUT)
  }, [])

  const handleTaskInput = useCallback(async (tasks) => {
    setUserTasks(tasks)
    setExtraTasks([])
    setScreen(SCREENS.LOADING)
    const result = await buildPlan(
      { ...(userProfile || {}), firstName: user?.firstName },
      checkInData,
      tasks,
      meetings
    )
    setPlan(result)
    // Save plannedTasks to today's history entry so carry-over can read them tomorrow
    const today = new Date().toISOString().split('T')[0]
    setCheckInHistory((prev) =>
      (prev || []).map((h) => h.date === today ? { ...h, plannedTasks: tasks } : h)
    )
    setScreen(SCREENS.OUTPUT)
  }, [userProfile, checkInData, user, setUserTasks, setExtraTasks, setCheckInHistory])

  const handleReset = useCallback(() => {
    setPlan(null)
    setCheckInData(null)
    setUserTasks([])
    setExtraTasks([])
    setLiveSelectedTasks([])
    setScreen(SCREENS.CHECKIN)
  }, [setUserTasks, setExtraTasks])

  const handleClearAll = useCallback(() => {
    setUser(null)
    setUserProfile(null)
    setUserTasks([])
    setExtraTasks([])
    setCheckInHistory([])
    setPlan(null)
    setCheckInData(null)
    setLiveSelectedTasks([])
    ;['daye_member_since', 'daye_best_streak', 'daye_reminder_time', 'daye_install_dismissed', 'daye_custom_chips'].forEach(
      (k) => localStorage.removeItem(k)
    )
    setScreen(SCREENS.LANDING)
  }, [setUser, setUserProfile, setUserTasks, setExtraTasks, setCheckInHistory])

  const streakCount = calculateStreak(checkInHistory)
  const currentBest = parseInt(localStorage.getItem('daye_best_streak') || '0')
  if (streakCount > currentBest) {
    localStorage.setItem('daye_best_streak', String(streakCount))
  }

  const carryOverTask = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    const dismissed = localStorage.getItem('daye_carryover_dismissed')
    if (dismissed === today) return null
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yStr = yesterday.toISOString().split('T')[0]
    const entry = (checkInHistory || []).find((h) => h.date === yStr)
    if (!entry || !entry.plannedTasks?.length) return null
    const done = getCompletionsForDate(yStr)
    const uncompleted = entry.plannedTasks.filter((t) => !done.includes(t))
    return uncompleted[0] || null
  }, [checkInHistory])

  const handleCarryOverAccept = useCallback(() => {
    if (!carryOverTask) return
    setUserTasks((prev) => prev.includes(carryOverTask) ? prev : [carryOverTask, ...prev])
    localStorage.setItem('daye_carryover_dismissed', new Date().toISOString().split('T')[0])
  }, [carryOverTask, setUserTasks])

  const handleCarryOverDismiss = useCallback(() => {
    localStorage.setItem('daye_carryover_dismissed', new Date().toISOString().split('T')[0])
  }, [])

  const handleActivateTestMode = useCallback(() => {
    const getDate = (daysAgo) => {
      const d = new Date()
      d.setDate(d.getDate() - daysAgo)
      return d.toISOString().split('T')[0]
    }

    const fakeHistory = [
      { date: getDate(0), energy: 3, mood: 'focused', sleep: 'ok', dayType: 'deep-work', pressure: ['none'], planningStartTime: '09:00', plannedTasks: [] },
      { date: getDate(1), energy: 3, mood: 'anxious', sleep: 'ok', dayType: 'lots-of-meetings', pressure: ['brand-deal-deadline'], plannedTasks: ['Write the campaign brief', 'Schedule posts for the week'] },
      { date: getDate(2), energy: 2, mood: 'flat', sleep: 'poor', dayType: 'low-energy-day', pressure: ['consistency-pressure'], plannedTasks: ['Film short-form video', 'Reply to comments'] },
      { date: getDate(3), energy: 2, mood: 'tired', sleep: 'poor', dayType: 'low-energy-day', pressure: ['none'], plannedTasks: ['Edit podcast episode', 'Community engagement'] },
      // Gap at day -4 keeps streak at 4
      { date: getDate(5), energy: 2, mood: 'overwhelmed', sleep: 'terrible', dayType: 'reactive-firefighting', pressure: ['engagement-dropping'], plannedTasks: ['Respond to sponsor outreach', 'Script next video'] },
      { date: getDate(6), energy: 2, mood: 'flat', sleep: 'poor', dayType: 'low-energy-day', pressure: ['none'], plannedTasks: ['Upload scheduled post', 'Check analytics'] },
      { date: getDate(7), energy: 2, mood: 'flat', sleep: 'ok', dayType: 'low-energy-day', pressure: ['none'], plannedTasks: ['Review brand deal proposal', 'Draft content calendar'] },
    ]

    setCheckInHistory(fakeHistory)

    // Save per-day completions — yesterday's 'Write the campaign brief' left uncompleted for carry-over
    saveCompletionsForDate(getDate(1), ['Schedule posts for the week'])
    saveCompletionsForDate(getDate(2), ['Reply to comments'])
    saveCompletionsForDate(getDate(3), ['Edit podcast episode', 'Community engagement'])
    saveCompletionsForDate(getDate(5), ['Respond to sponsor outreach'])
    saveCompletionsForDate(getDate(6), ['Upload scheduled post', 'Check analytics'])
    saveCompletionsForDate(getDate(7), ['Review brand deal proposal', 'Draft content calendar'])

    localStorage.setItem('daye_goal_completions', '6')
    localStorage.removeItem('daye_carryover_dismissed')
    localStorage.removeItem('daye_weekly_shown_date')

    setUserProfile((prev) => ({
      ...(prev || {}),
      userType: 'self-employed',
      selfEmployedType: 'content-creator',
      workType: 'content-creator',
      goals: ['Grow my audience'],
      goal: 'Grow my audience',
      blockers: ['Consistency pressure', 'Algorithm changes'],
    }))
  }, [setCheckInHistory, setUserProfile])

  // ── Blog routes ─────────────────────────────────────────────────
  if (location.pathname === '/blog') return <BlogIndex />
  if (location.pathname.startsWith('/blog/')) {
    const slug = location.pathname.slice(6)
    return <ArticlePage slug={slug} />
  }

  // ── Landing (pre-signup) ─────────────────────────────────────────
  if (screen === SCREENS.LANDING) {
    return (
      <Landing
        onStartDay={() => setScreen(SCREENS.SIGNUP)}
        onSignIn={() => setScreen(SCREENS.SIGNUP)}
      />
    )
  }

  // ── Auth / onboarding (no two-column) ────────────────────────────
  if (screen === SCREENS.SIGNUP) {
    return <SignUp onComplete={handleSignUp} />
  }

  if (screen === SCREENS.ONBOARDING) {
    return (
      <Onboarding
        onComplete={handleOnboarding}
        onBack={() => setScreen(SCREENS.SIGNUP)}
      />
    )
  }

  if (screen === SCREENS.FIO_REFLECTION) {
    return (
      <OnboardingFiguringItOut
        onComplete={(data) => {
          setUserProfile((prev) => ({ ...(prev || {}), ...data }))
          setScreen(SCREENS.CHECKIN)
        }}
        onBack={() => setScreen(SCREENS.CHECKIN)}
      />
    )
  }

  // ── Focus output & action: full width ────────────────────────────
  if (screen === SCREENS.LOADING) {
    return <LoadingScreen />
  }

  if (screen === SCREENS.OUTPUT && plan) {
    return (
      <FocusOutput
        plan={plan}
        userTasks={userTasks}
        user={user}
        userProfile={userProfile}
        checkInData={checkInData}
        meetings={meetings}
        history={checkInHistory || []}
        streakCount={streakCount}
        extraTasks={extraTasks}
        onExtraTasksChange={setExtraTasks}
        onStartAction={() => setScreen(SCREENS.ACTION)}
        onReset={handleReset}
        onBack={() => setScreen(SCREENS.TASK_INPUT)}
        onHome={() => setScreen(SCREENS.CHECKIN)}
      />
    )
  }

  if (screen === SCREENS.ACTION && plan) {
    return (
      <ActionMode
        priorities={plan.priorities}
        prioritySubtitles={plan.prioritySubtitles}
        userTasks={userTasks}
        extraTasks={extraTasks}
        checkInData={checkInData}
        userProfile={userProfile}
        dayName={plan.dayName}
        onBack={() => setScreen(SCREENS.OUTPUT)}
        onHome={() => setScreen(SCREENS.CHECKIN)}
      />
    )
  }

  // ── Signed-in screens: optionally two-column on desktop ──────────
  function renderSignedInContent() {
    if (screen === SCREENS.CHECKIN) {
      return (
        <CheckIn
          user={user}
          userProfile={userProfile}
          initialValues={checkInData}
          history={checkInHistory || []}
          streakCount={streakCount}
          carryOverTask={carryOverTask}
          onCarryOverAccept={handleCarryOverAccept}
          onCarryOverDismiss={handleCarryOverDismiss}
          onActivateTestMode={handleActivateTestMode}
          onSubmit={handleCheckIn}
          onViewHistory={() => setScreen(SCREENS.HISTORY)}
          onViewSettings={() => setScreen(SCREENS.SETTINGS)}
          onHome={() => setScreen(SCREENS.CHECKIN)}
          onRetakeReflection={() => setScreen(SCREENS.FIO_REFLECTION)}
        />
      )
    }

    if (screen === SCREENS.MEETING_INPUT) {
      return (
        <MeetingInput
          onSubmit={handleMeetingInput}
          onBack={() => setScreen(SCREENS.CHECKIN)}
        />
      )
    }

    if (screen === SCREENS.TASK_INPUT) {
      return (
        <TaskInput
          user={user}
          userProfile={userProfile}
          checkInData={checkInData}
          initialTasks={userTasks}
          onSubmit={handleTaskInput}
          onBack={() => setScreen(SCREENS.MEETING_INPUT)}
          onTasksChange={setLiveSelectedTasks}
          onHome={() => setScreen(SCREENS.CHECKIN)}
        />
      )
    }

    if (screen === SCREENS.HISTORY) {
      return (
        <HistoryScreen
          history={checkInHistory || []}
          userProfile={userProfile}
          onBack={() => setScreen(SCREENS.CHECKIN)}
          onHome={() => setScreen(SCREENS.CHECKIN)}
        />
      )
    }

    if (screen === SCREENS.SETTINGS) {
      const bestStreak = parseInt(localStorage.getItem('daye_best_streak') || '0')
      return (
        <SettingsScreen
          user={user}
          userProfile={userProfile}
          history={checkInHistory || []}
          streakCount={streakCount}
          bestStreak={bestStreak}
          onSaveUser={setUser}
          onSaveProfile={setUserProfile}
          onClearAll={handleClearAll}
          onBack={() => setScreen(SCREENS.CHECKIN)}
          onHome={() => setScreen(SCREENS.CHECKIN)}
        />
      )
    }

    // Fallback
    return (
      <CheckIn
        user={user}
        userProfile={userProfile}
        initialValues={checkInData}
        history={checkInHistory || []}
        streakCount={streakCount}
        carryOverTask={carryOverTask}
        onCarryOverAccept={handleCarryOverAccept}
        onCarryOverDismiss={handleCarryOverDismiss}
        onSubmit={handleCheckIn}
        onViewHistory={() => setScreen(SCREENS.HISTORY)}
        onViewSettings={() => setScreen(SCREENS.SETTINGS)}
        onHome={() => setScreen(SCREENS.CHECKIN)}
        onRetakeReflection={() => setScreen(SCREENS.FIO_REFLECTION)}
      />
    )
  }

  const rightPanelScreens = [SCREENS.CHECKIN, SCREENS.TASK_INPUT, SCREENS.HISTORY, SCREENS.SETTINGS]
  const showRightPanel = rightPanelScreens.includes(screen)

  return (
    <div className="desktop-app-wrapper">
      <div className="desktop-app-left">
        {renderSignedInContent()}
      </div>
      {showRightPanel && (
        <div className="desktop-app-right">
          <RightPanel
            screen={screen}
            user={user}
            userProfile={userProfile}
            checkInData={checkInData}
            liveSelectedTasks={liveSelectedTasks}
          />
        </div>
      )}
    </div>
  )
}

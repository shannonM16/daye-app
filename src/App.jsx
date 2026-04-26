import { useState, useCallback, useMemo, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useStorage } from './hooks/useStorage'
import { buildPlan } from './engine/buildPlan'
import { calculateStreak } from './utils/patternEngine'
import { getCompletionsForDate, saveCompletionsForDate } from './utils/completions'
import { upsertUser, fetchUserByEmail, savePlan, fetchPlans, fetchWeeklyWins, upsertPlanPartial, updateUserLastSeen } from './lib/db'
import { addLoopsContact, updateLoopsContact, sendLoopsWelcomeEmail, sendLoopsPlanCreatedEvent } from './lib/loops'
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
  const [pendingTaskSelection, setPendingTaskSelection] = useState([])
  const [taskFreeText, setTaskFreeText] = useState('')
  const [screen, setScreen] = useState(getInitialScreen)

  // ── Supabase init: load from DB on mount, run migration if needed ──
  useEffect(() => {
    async function initFromSupabase() {
      let email = null
      try {
        const raw = localStorage.getItem('df_user')
        email = raw ? JSON.parse(raw)?.email : null
      } catch { /* no user stored */ }
      if (!email) return

      try {
        const supaUser = await fetchUserByEmail(email)

        if (supaUser) {
          localStorage.setItem('daye_user_id', supaUser.id)
          // SYNC 8: session tracking
          updateUserLastSeen(supaUser.id).catch(() => {})
          setUser({ firstName: supaUser.first_name, email: supaUser.email })
          if (supaUser.profile && Object.keys(supaUser.profile).length > 0) {
            setUserProfile(supaUser.profile)
          }
          const plans = await fetchPlans(supaUser.id)
          if (plans.length > 0) setCheckInHistory(plans)
          const wins = await fetchWeeklyWins(supaUser.id)
          wins.forEach(w => {
            localStorage.setItem('daye_weekly_win_' + w.week_start, w.win_text)
          })
        } else {
          // Migration: localStorage data exists but no Supabase record yet
          let localProfile = null
          let localUser = null
          let localHistory = []
          try { localProfile = JSON.parse(localStorage.getItem('df_userProfile') || 'null') } catch { /* skip */ }
          try { localUser = JSON.parse(localStorage.getItem('df_user') || 'null') } catch { /* skip */ }
          try { localHistory = JSON.parse(localStorage.getItem('df_checkInHistory') || '[]') } catch { /* skip */ }

          if (localUser?.email) {
            const supaUser = await upsertUser({
              firstName: localUser.firstName || '',
              email: localUser.email,
              profile: localProfile || {},
            })
            localStorage.setItem('daye_user_id', supaUser.id)
            for (const entry of (localHistory || [])) {
              if (entry.date) await savePlan(supaUser.id, entry.date, entry)
            }
            const keys = []
            for (let i = 0; i < localStorage.length; i++) {
              const k = localStorage.key(i)
              if (k?.startsWith('daye_weekly_win_')) keys.push(k)
            }
            const { saveWeeklyWinDB } = await import('./lib/db')
            for (const k of keys) {
              const mondayDate = k.slice('daye_weekly_win_'.length)
              const winText = localStorage.getItem(k)
              if (winText) await saveWeeklyWinDB(supaUser.id, mondayDate, winText)
            }
          }
        }
      } catch {
        // Supabase unavailable — fall back to localStorage silently
      }
    }
    initFromSupabase()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Supabase user sync helper ──────────────────────────────────────

  function syncUserToSupabase(userData, profile) {
    if (!userData?.email) return
    upsertUser({ firstName: userData.firstName || '', email: userData.email, profile: profile || {} })
      .then(d => localStorage.setItem('daye_user_id', d.id))
      .catch(() => {})
  }

  const handleSignUp = useCallback((userData) => {
    setUser(userData)
    if (!localStorage.getItem('daye_member_since')) {
      localStorage.setItem('daye_member_since', new Date().toISOString())
    }
    syncUserToSupabase(userData, userProfile)
    addLoopsContact(userData.email, userData.firstName)
    sendLoopsWelcomeEmail(userData.email, userData.firstName)
    setScreen(SCREENS.ONBOARDING)
  }, [setUser, userProfile])

  const handleOnboarding = useCallback((profile) => {
    setUserProfile(profile)
    if (!localStorage.getItem('daye_member_since')) {
      localStorage.setItem('daye_member_since', new Date().toISOString())
    }
    syncUserToSupabase(user, profile)
    if (user?.email) updateLoopsContact(user.email, profile)
    setScreen(SCREENS.CHECKIN)
  }, [setUserProfile, user])

  const handleUpdateUser = useCallback((userData) => {
    setUser(userData)
    syncUserToSupabase(userData, userProfile)
  }, [setUser, userProfile])

  const handleUpdateProfile = useCallback((profile) => {
    setUserProfile(profile)
    syncUserToSupabase(user, profile)
  }, [setUserProfile, user])

  const handleCheckIn = useCallback((data) => {
    setCheckInData(data)
    setLiveSelectedTasks([])
    setPendingTaskSelection([])
    setTaskFreeText('')
    const today = new Date().toISOString().split('T')[0]
    setCheckInHistory((prev) => {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const cutoff = thirtyDaysAgo.toISOString().split('T')[0]
      const filtered = (prev || []).filter((h) => h.date !== today && h.date >= cutoff)
      return [...filtered, { date: today, ...data }]
    })
    const userId = localStorage.getItem('daye_user_id')
    if (userId) {
      upsertPlanPartial(userId, today, { check_in: data }).catch(() => {})
    }
    syncUserToSupabase(user, userProfile)
    setScreen(SCREENS.MEETING_INPUT)
  }, [setCheckInHistory, user, userProfile])

  const handleMeetingInput = useCallback((meetingsList) => {
    setMeetings(meetingsList)
    setScreen(SCREENS.TASK_INPUT)
  }, [])

  const handleTaskInput = useCallback(async (tasks) => {
    setUserTasks(tasks)
    setExtraTasks([])
    setScreen(SCREENS.LOADING)
    let freshMeetings = meetings
    try {
      const saved = JSON.parse(localStorage.getItem('df_meetings') || '[]')
      if (Array.isArray(saved) && saved.length > 0) freshMeetings = saved
    } catch { /* use meetings from state */ }
    const result = await buildPlan(
      { ...(userProfile || {}), firstName: user?.firstName },
      checkInData,
      tasks,
      freshMeetings
    )
    setPlan(result)
    const today = new Date().toISOString().split('T')[0]
    const planEntry = { date: today, ...checkInData, plannedTasks: tasks }
    setCheckInHistory((prev) =>
      (prev || []).map((h) => h.date === today ? { ...h, plannedTasks: tasks } : h)
    )
    const userId = localStorage.getItem('daye_user_id')
    if (userId) {
      savePlan(userId, today, planEntry).catch(() => {})
    }
    if (user?.email && !localStorage.getItem('daye_plan_created_sent')) {
      sendLoopsPlanCreatedEvent(user.email)
      localStorage.setItem('daye_plan_created_sent', 'true')
    }
    setScreen(SCREENS.OUTPUT)
  }, [userProfile, checkInData, user, meetings, setUserTasks, setExtraTasks, setCheckInHistory])

  const handleAddMeetingFromTimer = useCallback(async (meeting) => {
    const updatedMeetings = [...meetings, meeting]
    setMeetings(updatedMeetings)
    localStorage.setItem('df_meetings', JSON.stringify(updatedMeetings))
    const userId = localStorage.getItem('daye_user_id')
    if (userId) {
      const today = new Date().toISOString().split('T')[0]
      upsertPlanPartial(userId, today, { meetings: updatedMeetings }).catch(() => {})
    }
    try {
      const result = await buildPlan(
        { ...(userProfile || {}), firstName: user?.firstName },
        checkInData,
        userTasks,
        updatedMeetings
      )
      setPlan(result)
    } catch (e) {
      console.error('Plan regeneration failed:', e)
    }
  }, [meetings, userProfile, user, checkInData, userTasks])

  const handleReset = useCallback(() => {
    setPlan(null)
    setCheckInData(null)
    setMeetings([])
    setUserTasks([])
    setExtraTasks([])
    setLiveSelectedTasks([])
    setPendingTaskSelection([])
    setTaskFreeText('')
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
    ;['daye_member_since', 'daye_best_streak', 'daye_reminder_time', 'daye_install_dismissed', 'daye_custom_chips', 'daye_user_id'].forEach(
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
          const updated = { ...(userProfile || {}), ...data }
          setUserProfile(updated)
          syncUserToSupabase(user, updated)
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
        meetings={meetings}
        dayName={plan.dayName}
        onBack={() => setScreen(SCREENS.OUTPUT)}
        onHome={() => setScreen(SCREENS.CHECKIN)}
        onAddMeeting={handleAddMeetingFromTimer}
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
          initialMeetings={meetings}
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
          initialTasks={pendingTaskSelection}
          initialFreeText={taskFreeText}
          onSubmit={handleTaskInput}
          onBack={() => setScreen(SCREENS.MEETING_INPUT)}
          onTasksChange={(tasks) => { setLiveSelectedTasks(tasks); setPendingTaskSelection(tasks) }}
          onFreeTextChange={setTaskFreeText}
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
          onSaveUser={handleUpdateUser}
          onSaveProfile={handleUpdateProfile}
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

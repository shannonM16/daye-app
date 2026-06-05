import { useState, useCallback, useMemo, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import * as Sentry from '@sentry/react'
import { useStorage } from './hooks/useStorage'
import { useAuth } from './context/AuthContext'
import { buildPlan } from './engine/buildPlan'
import { calculateStreak } from './utils/patternEngine'
import { getCompletionsForDate, saveCompletionsForDate } from './utils/completions'
import { getMeetingsForToday, saveMeetingsForToday } from './utils/timeOptions'
import { supabase } from './lib/supabase'
import { upsertUser, fetchUserByEmail, savePlan, fetchPlans, fetchWeeklyWins, upsertPlanPartial, updateUserLastSeen } from './lib/db'
import { addLoopsContact, updateLoopsContact, sendLoopsWelcomeEmail, sendLoopsPlanCreatedEvent, trackPlanGenerated } from './lib/loops'
import { identifyUser, trackEvent } from './lib/posthog'
import HoverNav from './components/HoverNav'
import Landing from './screens/Landing'
import PrivacyPolicy from './screens/PrivacyPolicy'
import TermsOfService from './screens/TermsOfService'
import TheLetter from './screens/TheLetter'
import BlogIndex from './blog/BlogIndex'
import ArticlePage from './blog/ArticlePage'
import PricingPage from './screens/PricingPage'
import ProSuccess from './screens/ProSuccess'
import AuthModal from './components/AuthModal'
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
import EndOfDayReflection from './screens/EndOfDayReflection'
import ResetPassword from './screens/ResetPassword'
import './index.css'

const SCREENS = {
  LANDING: 'landing',
  SIGNUP: 'signup',
  CHECKOUT_LOADING: 'checkout_loading',
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
  EOD_REFLECTION: 'eod_reflection',
}

function getInitialScreen() {
  if (!localStorage.getItem('df_userProfile')) {
    return SCREENS.LANDING
  }
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






function getDailyPlanCount() {
  try {
    const raw = localStorage.getItem('daye_daily_plan_count')
    if (!raw) return { count: 0, date: '' }
    return JSON.parse(raw)
  } catch { return { count: 0, date: '' } }
}

function incrementDailyPlanCount() {
  const today = new Date().toISOString().split('T')[0]
  const current = getDailyPlanCount()
  const count = current.date === today ? current.count + 1 : 1
  localStorage.setItem('daye_daily_plan_count', JSON.stringify({ count, date: today }))
  return count
}

function checkDailyPlanLimit(isPro) {
  if (isPro) return true
  const today = new Date().toISOString().split('T')[0]
  const { count, date } = getDailyPlanCount()
  if (date !== today) return true
  return count < 3
}

export default function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const { showAuthModal, updateNavUser, updateIsPro, isPro } = useAuth()
  const [user, setUser] = useStorage('df_user', null)
  const [userProfile, setUserProfile] = useStorage('df_userProfile', null)
  const [userTasks, setUserTasks] = useStorage('df_userTasks', [])
  const [extraTasks, setExtraTasks] = useStorage('df_extraTasks', [])
  const [checkInHistory, setCheckInHistory] = useStorage('df_checkInHistory', [])
  const [plan, setPlan] = useState(() => {
    try {
      const raw = localStorage.getItem('daye_last_plan')
      if (!raw) return null
      const { plan: cached, date } = JSON.parse(raw)
      const today = new Date().toISOString().split('T')[0]
      return date === today ? cached : null
    } catch { return null }
  })
  const [checkInData, setCheckInData] = useState(null)
  const [meetings, setMeetings] = useState([])
  const [liveSelectedTasks, setLiveSelectedTasks] = useState([])
  const [pendingTaskSelection, setPendingTaskSelection] = useState([])
  const [taskFreeText, setTaskFreeText] = useState('')
  const [screen, setScreen] = useState(getInitialScreen)
  const [isOffline, setIsOffline] = useState(!navigator.onLine)

  // Offline detection
  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Open forgot-password modal when redirected from the old /reset-password route
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('resetPassword') === '1') {
      const clean = new URL(window.location.href)
      clean.searchParams.delete('resetPassword')
      window.history.replaceState({}, '', clean.toString())
      showAuthModal('forgot')
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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
          updateUserLastSeen(supaUser.id).catch(() => {})
          updateIsPro(supaUser.is_pro === true)
          Sentry.setUser({ id: supaUser.id, email: supaUser.email })
          identifyUser(supaUser.id, supaUser.email)
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

  // ── Google OAuth callback handler ──────────────────────────────────
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event !== 'SIGNED_IN') return
      // In incognito, localStorage may be cleared across the OAuth redirect.
      // Fall back to the ?pendingProPlan= URL param embedded in the redirectTo URL,
      // or sessionStorage which survives same-tab redirects better than localStorage in some browsers.
      const urlPendingPlan = new URLSearchParams(window.location.search).get('pendingProPlan')
      const sessionPendingPlan = sessionStorage.getItem('pendingProPlan')
      if (!localStorage.getItem('oauth_redirect_pending') && !urlPendingPlan && !sessionPendingPlan) return
      localStorage.removeItem('oauth_redirect_pending')

      // Wait for Supabase session to fully establish
      await new Promise(r => setTimeout(r, 500))

      const authUser = session?.user
      if (!authUser?.email) return

      const email = authUser.email
      const fullName = authUser.user_metadata?.full_name || authUser.user_metadata?.name || ''
      const firstName = fullName.split(' ')[0] || ''

      try {
        let dbUser = await fetchUserByEmail(email)
        const isNew = !dbUser

        if (isNew) {
          dbUser = await upsertUser({ firstName, email, profile: {} })
          addLoopsContact(email, firstName)
          setTimeout(() => sendLoopsWelcomeEmail(email, firstName), 3000)
          if (!localStorage.getItem('daye_member_since')) {
            localStorage.setItem('daye_member_since', new Date().toISOString())
          }
        }

        localStorage.setItem('daye_user_id', dbUser.id)
        const resolvedName = dbUser.first_name || firstName
        setUser({ firstName: resolvedName, email })
        updateNavUser({ firstName: resolvedName, email })
        updateIsPro(dbUser.is_pro === true)
        if (dbUser.profile && Object.keys(dbUser.profile).length > 0) {
          setUserProfile(dbUser.profile)
        }

        const pendingPlan = localStorage.getItem('pendingProPlan') || sessionStorage.getItem('pendingProPlan') || urlPendingPlan
        if (pendingPlan) {
          localStorage.removeItem('pendingProPlan')
          sessionStorage.removeItem('pendingProPlan')
          const cleanUrl = new URL(window.location.href)
          cleanUrl.searchParams.delete('pendingProPlan')
          window.history.replaceState({}, '', cleanUrl.toString())
          setScreen(SCREENS.CHECKOUT_LOADING)
          const priceId = pendingPlan === 'annual'
            ? 'price_1TTRga2LFIh1Zwra08LHcdn9'
            : 'price_1TTRgF2LFIh1ZwramSLMYfSK'
          const res = await fetch('/api/create-checkout-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ priceId, userId: dbUser.id }),
          })
          const data = await res.json()
          if (data.url) { window.location.href = data.url; return }
        }

        const hasProfile = dbUser.profile && Object.keys(dbUser.profile).length > 0
        setScreen(hasProfile ? SCREENS.CHECKIN : SCREENS.ONBOARDING)
      } catch {
        // Fall back gracefully — localStorage flow will handle on next load
      }
    })
    return () => subscription.unsubscribe()
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
    new Promise(resolve => setTimeout(resolve, 3000))
      .then(() => sendLoopsWelcomeEmail(userData.email, userData.firstName))
    setScreen(SCREENS.ONBOARDING)
  }, [setUser, userProfile])

  const handleEmailNewUser = useCallback(({ firstName, email }) => {
    setUser({ firstName, email })
    if (!localStorage.getItem('daye_member_since')) {
      localStorage.setItem('daye_member_since', new Date().toISOString())
    }
    setScreen(SCREENS.ONBOARDING)
  }, [setUser])

  const handleEmailExistingUser = useCallback(async ({ firstName, email, hasProfile, profile, userId, isPro: userIsPro }) => {
    setUser({ firstName, email })
    if (hasProfile) setUserProfile(profile)
    updateIsPro(userIsPro === true)
    updateUserLastSeen(userId).catch(() => {})
    try {
      const plans = await fetchPlans(userId)
      if (plans.length > 0) setCheckInHistory(plans)
      const wins = await fetchWeeklyWins(userId)
      wins.forEach(w => {
        localStorage.setItem('daye_weekly_win_' + w.week_start, w.win_text)
      })
    } catch { /* silently fail */ }
    setScreen(hasProfile ? SCREENS.CHECKIN : SCREENS.ONBOARDING)
  }, [setUser, setUserProfile, setCheckInHistory]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleOnboarding = useCallback(async (profile) => {
    setUserProfile(profile)
    if (!localStorage.getItem('daye_member_since')) {
      localStorage.setItem('daye_member_since', new Date().toISOString())
    }
    syncUserToSupabase(user, profile)
    if (user?.email) updateLoopsContact(user.email, profile)

    const pendingPlan = localStorage.getItem('pendingProPlan')
    if (pendingPlan) {
      localStorage.removeItem('pendingProPlan')
      try {
        let userId = localStorage.getItem('daye_user_id')
        if (!userId && user?.email) {
          const supaUser = await upsertUser({ firstName: user.firstName || '', email: user.email, profile: profile || {} })
          userId = supaUser.id
          localStorage.setItem('daye_user_id', userId)
        }
        if (userId) {
          const priceId = pendingPlan === 'annual'
            ? 'price_1TTRga2LFIh1Zwra08LHcdn9'
            : 'price_1TTRgF2LFIh1ZwramSLMYfSK'
          const res = await fetch('/api/create-checkout-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ priceId, userId }),
          })
          const data = await res.json()
          if (data.url) {
            window.location.href = data.url
            return
          }
        }
      } catch {
        // Fall through to normal flow if checkout fails
      }
    }

    trackEvent('onboarding_completed', { userType: profile.userType })
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
    trackEvent('checkin_completed', { energy: data.energy, mood: data.mood, dayType: data.dayType })
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


  const handleAddMeetingFromTimer = useCallback(async (meeting) => {
    const updatedMeetings = [...meetings, meeting]
    setMeetings(updatedMeetings)
    saveMeetingsForToday(updatedMeetings)
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
    ;['daye_member_since', 'daye_best_streak', 'daye_reminder_time', 'daye_install_dismissed', 'daye_custom_chips', 'daye_user_id', 'daye_last_plan'].forEach(
      (k) => localStorage.removeItem(k)
    )
    setScreen(SCREENS.LANDING)
  }, [setUser, setUserProfile, setUserTasks, setExtraTasks, setCheckInHistory])

  const handleTaskInput = useCallback(async (tasks) => {
  if (!checkDailyPlanLimit(isPro)) {
    setShowPlanLimitModal(true)
    return
  }

  setUserTasks(tasks)
  setExtraTasks([])
  setScreen(SCREENS.LOADING)
  const storedMeetings = getMeetingsForToday()
  const freshMeetings = storedMeetings.length > 0 ? storedMeetings : meetings
  const result = await buildPlan(
    { ...(userProfile || {}), firstName: user?.firstName },
    checkInData,
    tasks,
    freshMeetings
  )
  setPlan(result)

  incrementDailyPlanCount()

  const today = new Date().toISOString().split('T')[0]
  try { localStorage.setItem('daye_last_plan', JSON.stringify({ plan: result, date: today })) } catch { /* ignore */ }
  const planEntry = { date: today, ...checkInData, plannedTasks: tasks }
  setCheckInHistory((prev) =>
    (prev || []).map((h) => h.date === today ? { ...h, plannedTasks: tasks } : h)
  )
  const userId = localStorage.getItem('daye_user_id')
  if (userId) {
    savePlan(userId, today, planEntry).catch(() => {})
  }
  if (user?.email) {
    trackEvent('plan_generated')
    trackPlanGenerated(user.email).catch(() => {})
    if (!localStorage.getItem('daye_plan_created_sent')) {
      sendLoopsPlanCreatedEvent(user.email)
      localStorage.setItem('daye_plan_created_sent', 'true')
    }
  }
  setScreen(SCREENS.OUTPUT)
}, [userProfile, checkInData, user, meetings, isPro, setUserTasks, setExtraTasks, setCheckInHistory])

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

  // ── Public routes ────────────────────────────────────────────────
  if (location.pathname === '/settings') {
    if (user) {
      navigate('/', { replace: true })
      setScreen(SCREENS.SETTINGS)
      return null
    }
    navigate('/', { replace: true })
    return null
  }
  if (location.pathname === '/reset-password') return <ResetPassword />
  if (location.pathname === '/privacy-policy') return <PrivacyPolicy />
  if (location.pathname === '/terms') return <TermsOfService />
  if (location.pathname === '/letter') return <TheLetter user={user} />
  if (location.pathname === '/blog') return <BlogIndex />
  if (location.pathname.startsWith('/blog/')) {
    const slug = location.pathname.slice(6)
    return <ArticlePage slug={slug} />
  }
  if (location.pathname === '/pricing') {
    return (
      <>
        <PricingPage
          onStartDay={() => showAuthModal('signup')}
          onSignIn={() => showAuthModal('signin')}
        />
        <AuthModal onNewUser={handleEmailNewUser} onExistingUser={handleEmailExistingUser} />
      </>
    )
  }

  if (location.pathname === '/pro-success') {
    return <ProSuccess onStartDay={() => { window.location.href = '/' }} />
  }
{showPlanLimitModal && (
  <div style={{
    position: 'fixed', inset: 0, background: 'rgba(26,26,26,0.6)',
    zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '24px', backdropFilter: 'blur(4px)',
  }} onClick={() => setShowPlanLimitModal(false)}>
    <div style={{
      background: 'var(--color-linen)', borderRadius: '20px',
      padding: '40px 36px', maxWidth: '420px', width: '100%',
      boxShadow: '0 24px 64px rgba(26,26,26,0.2)',
    }} onClick={e => e.stopPropagation()}>
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--color-muted)', marginBottom: '16px', fontWeight: 500 }}>
        Free plan
      </p>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 300, fontSize: '28px', color: 'var(--color-ink)', lineHeight: 1.2, marginBottom: '16px' }}>
        You've used your 3 plans for today.
      </h2>
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--color-muted)', lineHeight: 1.65, marginBottom: '32px' }}>
        Free Daye includes 3 focus plans per day. Upgrade to Pro for unlimited plans, plus The Letter, The Year in Focus, and weekly insights.
      </p>
      <a href="/pricing" style={{ display: 'block', width: '100%', background: 'var(--color-ink)', color: 'white', border: 'none', borderRadius: '10px', padding: '14px 24px', fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 500, cursor: 'pointer', textAlign: 'center', textDecoration: 'none', marginBottom: '12px' }}>
        Upgrade to Pro
      </a>
      <button onClick={() => setShowPlanLimitModal(false)} style={{ width: '100%', background: 'none', border: 'none', fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--color-muted)', cursor: 'pointer', padding: '8px' }}>
        Come back tomorrow
      </button>
    </div>
  </div>
)}
  // ── Landing (pre-signup) ─────────────────────────────────────────
  if (screen === SCREENS.LANDING) {
    return (
      <>
        <Landing
          onStartDay={() => showAuthModal('signup')}
          onSignIn={() => showAuthModal('signin')}
          onViewSettings={() => setScreen(SCREENS.SETTINGS)}
          onOpenApp={() => setScreen(SCREENS.CHECKIN)}
        />
        <AuthModal onNewUser={handleEmailNewUser} onExistingUser={handleEmailExistingUser} />
      </>
    )
  }

  if (screen === SCREENS.CHECKOUT_LOADING) {
    return (
      <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--color-linen)' }}>
        <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '32px', color: 'var(--color-ink)', fontWeight: 300, marginBottom: '32px' }}>daye</span>
        <div className="animate-pulse" style={{ width: '48px', height: '3px', borderRadius: '2px', background: 'var(--color-lavender)', marginBottom: '20px' }} />
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--color-muted)' }}>Setting up your trial...</p>
      </div>
    )
  }

  // ── Onboarding (post-auth) ────────────────────────────────────────
  if (screen === SCREENS.ONBOARDING) {
    return (
      <>
        <HoverNav onViewSettings={() => setScreen(SCREENS.SETTINGS)} />
        <Onboarding
          onComplete={handleOnboarding}
          onBack={() => setScreen(SCREENS.LANDING)}
        />
      </>
    )
  }

  if (screen === SCREENS.FIO_REFLECTION) {
    return (
      <>
        <HoverNav onViewSettings={() => setScreen(SCREENS.SETTINGS)} />
        <OnboardingFiguringItOut
          onComplete={(data) => {
            const updated = { ...(userProfile || {}), ...data }
            setUserProfile(updated)
            syncUserToSupabase(user, updated)
            setScreen(SCREENS.CHECKIN)
          }}
          onBack={() => setScreen(SCREENS.CHECKIN)}
        />
      </>
    )
  }

  // ── Focus output & action: full width ────────────────────────────
  if (screen === SCREENS.LOADING) {
    return (
      <>
        <HoverNav onViewSettings={() => setScreen(SCREENS.SETTINGS)} />
        <LoadingScreen />
      </>
    )
  }

  if (screen === SCREENS.OUTPUT && plan) {
    return (
      <>
        <HoverNav onViewSettings={() => setScreen(SCREENS.SETTINGS)} />
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
      </>
    )
  }

  if (screen === SCREENS.ACTION && plan) {
    return (
      <>
        <HoverNav onViewSettings={() => setScreen(SCREENS.SETTINGS)} />
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
          onEndOfDayReflection={() => setScreen(SCREENS.EOD_REFLECTION)}
        />
      </>
    )
  }

  if (screen === SCREENS.EOD_REFLECTION) {
    return (
      <>
        <HoverNav onViewSettings={() => setScreen(SCREENS.SETTINGS)} />
        <EndOfDayReflection
          user={user}
          onComplete={() => setScreen(SCREENS.CHECKIN)}
          onHome={() => setScreen(SCREENS.CHECKIN)}
        />
      </>
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
          onRetakeReflection={() => setScreen(userProfile?.userType ? SCREENS.FIO_REFLECTION : SCREENS.ONBOARDING)}
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
    <>
      <HoverNav onViewSettings={() => setScreen(SCREENS.SETTINGS)} />
      {isOffline && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          background: '#1a1a1a',
          color: 'white',
          fontFamily: 'var(--font-sans)',
          fontSize: '13px',
          textAlign: 'center',
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
        }}>
          <span>You&apos;re offline — your last plan is still available</span>
          {plan && (
            <button
              onClick={() => setScreen(SCREENS.OUTPUT)}
              style={{ color: 'white', background: 'none', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '6px', padding: '2px 10px', fontSize: '12px', cursor: 'pointer', flexShrink: 0 }}
            >
              View plan
            </button>
          )}
        </div>
      )}
      <div className="desktop-app-wrapper" style={isOffline ? { paddingTop: '36px' } : {}}>
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
    </>
  )
}

import { useState, useCallback } from 'react'
import { useStorage } from './hooks/useStorage'
import { buildPlan } from './engine/buildPlan'
import { calculateStreak } from './utils/patternEngine'
import SignUp from './screens/SignUp'
import Onboarding from './screens/Onboarding'
import CheckIn from './screens/CheckIn'
import TaskInput from './screens/TaskInput'
import FocusOutput from './screens/FocusOutput'
import ActionMode from './screens/ActionMode'
import LoadingScreen from './screens/LoadingScreen'
import HistoryScreen from './screens/HistoryScreen'
import SettingsScreen from './screens/SettingsScreen'
import './index.css'

const SCREENS = {
  SIGNUP: 'signup',
  ONBOARDING: 'onboarding',
  CHECKIN: 'checkin',
  TASK_INPUT: 'task_input',
  LOADING: 'loading',
  OUTPUT: 'output',
  ACTION: 'action',
  HISTORY: 'history',
  SETTINGS: 'settings',
}

function getInitialScreen() {
  if (!localStorage.getItem('df_user')) return SCREENS.SIGNUP
  if (!localStorage.getItem('df_userProfile')) return SCREENS.ONBOARDING
  return SCREENS.CHECKIN
}

export default function App() {
  const [user, setUser] = useStorage('df_user', null)
  const [userProfile, setUserProfile] = useStorage('df_userProfile', null)
  const [userTasks, setUserTasks] = useStorage('df_userTasks', [])
  const [extraTasks, setExtraTasks] = useStorage('df_extraTasks', [])
  const [checkInHistory, setCheckInHistory] = useStorage('df_checkInHistory', [])
  const [plan, setPlan] = useState(null)
  const [checkInData, setCheckInData] = useState(null)
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
    const today = new Date().toISOString().split('T')[0]
    setCheckInHistory((prev) => {
      const filtered = (prev || []).filter((h) => h.date !== today)
      return [...filtered, { date: today, ...data }]
    })
    setScreen(SCREENS.TASK_INPUT)
  }, [setCheckInHistory])

  const handleTaskInput = useCallback(async (tasks) => {
    setUserTasks(tasks)
    setExtraTasks([])
    setScreen(SCREENS.LOADING)
    const result = await buildPlan(
      { ...(userProfile || {}), firstName: user?.firstName },
      checkInData,
      tasks
    )
    setPlan(result)
    setScreen(SCREENS.OUTPUT)
  }, [userProfile, checkInData, user, setUserTasks, setExtraTasks])

  const handleReset = useCallback(() => {
    setPlan(null)
    setCheckInData(null)
    setUserTasks([])
    setExtraTasks([])
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
    // Clear daye_ prefixed keys not managed by useStorage
    ;['daye_member_since', 'daye_best_streak', 'daye_reminder_time', 'daye_install_dismissed'].forEach(
      (k) => localStorage.removeItem(k)
    )
    setScreen(SCREENS.SIGNUP)
  }, [setUser, setUserProfile, setUserTasks, setExtraTasks, setCheckInHistory])

  // Track best streak whenever we're on checkin-related screens
  const streakCount = calculateStreak(checkInHistory)
  const currentBest = parseInt(localStorage.getItem('daye_best_streak') || '0')
  if (streakCount > currentBest) {
    localStorage.setItem('daye_best_streak', String(streakCount))
  }

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

  if (screen === SCREENS.CHECKIN) {
    return (
      <CheckIn
        user={user}
        userProfile={userProfile}
        initialValues={checkInData}
        history={checkInHistory || []}
        streakCount={streakCount}
        onSubmit={handleCheckIn}
        onViewHistory={() => setScreen(SCREENS.HISTORY)}
        onViewSettings={() => setScreen(SCREENS.SETTINGS)}
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
        onBack={() => setScreen(SCREENS.CHECKIN)}
      />
    )
  }

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
        extraTasks={extraTasks}
        onExtraTasksChange={setExtraTasks}
        onStartAction={() => setScreen(SCREENS.ACTION)}
        onReset={handleReset}
        onBack={() => setScreen(SCREENS.TASK_INPUT)}
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
        onBack={() => setScreen(SCREENS.OUTPUT)}
      />
    )
  }

  if (screen === SCREENS.HISTORY) {
    return (
      <HistoryScreen
        history={checkInHistory || []}
        onBack={() => setScreen(SCREENS.CHECKIN)}
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
      />
    )
  }

  return (
    <CheckIn
      user={user}
      userProfile={userProfile}
      initialValues={checkInData}
      history={checkInHistory || []}
      streakCount={streakCount}
      onSubmit={handleCheckIn}
      onViewHistory={() => setScreen(SCREENS.HISTORY)}
      onViewSettings={() => setScreen(SCREENS.SETTINGS)}
    />
  )
}

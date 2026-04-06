import { useState, useCallback } from 'react'
import { useStorage } from './hooks/useStorage'
import { decisionEngine } from './engine/decisionEngine'
import Onboarding from './screens/Onboarding'
import CheckIn from './screens/CheckIn'
import FocusOutput from './screens/FocusOutput'
import ActionMode from './screens/ActionMode'
import './index.css'

const SCREENS = {
  ONBOARDING: 'onboarding',
  CHECKIN: 'checkin',
  OUTPUT: 'output',
  ACTION: 'action',
}

export default function App() {
  const [userType, setUserType] = useStorage('df_userType', null)
  const [plan, setPlan] = useState(null)
  const [screen, setScreen] = useState(
    () => (localStorage.getItem('df_userType') ? SCREENS.CHECKIN : SCREENS.ONBOARDING)
  )

  const handleOnboarding = useCallback((type) => {
    setUserType(type)
    setScreen(SCREENS.CHECKIN)
  }, [setUserType])

  const handleCheckIn = useCallback(({ energy, dayType, pressure }) => {
    const result = decisionEngine({ userType, energy, dayType, pressure })
    setPlan(result)
    setScreen(SCREENS.OUTPUT)
  }, [userType])

  const handleReset = useCallback(() => {
    setPlan(null)
    setScreen(SCREENS.CHECKIN)
  }, [])

  if (screen === SCREENS.ONBOARDING) {
    return <Onboarding onComplete={handleOnboarding} />
  }

  if (screen === SCREENS.CHECKIN) {
    return (
      <CheckIn
        userType={userType}
        onSubmit={handleCheckIn}
      />
    )
  }

  if (screen === SCREENS.OUTPUT && plan) {
    return (
      <FocusOutput
        plan={plan}
        onStartAction={() => setScreen(SCREENS.ACTION)}
        onReset={handleReset}
      />
    )
  }

  if (screen === SCREENS.ACTION && plan) {
    return (
      <ActionMode
        priorities={plan.priorities}
        onBack={() => setScreen(SCREENS.OUTPUT)}
      />
    )
  }

  // Fallback — shouldn't happen
  return <Onboarding onComplete={handleOnboarding} />
}

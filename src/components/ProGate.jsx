import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import UpgradePrompt from './UpgradePrompt'

export default function ProGate({ children, description = 'Upgrade to Daye Pro to access this feature.' }) {
  const { isPro } = useAuth()
  const [dismissed, setDismissed] = useState(false)

  if (isPro || dismissed) return children

  return <UpgradePrompt description={description} onDismiss={() => setDismissed(true)} />
}

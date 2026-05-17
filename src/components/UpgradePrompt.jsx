import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const PRICE_MONTHLY = 'price_1TTRgF2LFIh1ZwramSLMYfSK'

export default function UpgradePrompt({ description = 'Upgrade to Daye Pro to unlock this feature.', onDismiss }) {
  const { navUser, showAuthModal } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleUpgrade = async () => {
    localStorage.setItem('pendingProPlan', 'monthly')
    sessionStorage.setItem('pendingProPlan', 'monthly')

    if (navUser) {
      setLoading(true)
      try {
        const userId = localStorage.getItem('daye_user_id')
        if (userId) {
          const res = await fetch('/api/create-checkout-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ priceId: PRICE_MONTHLY, userId }),
          })
          const data = await res.json()
          if (data.url) { window.location.href = data.url; return }
        }
      } catch { /* fall through */ }
      setLoading(false)
    } else {
      showAuthModal('signup')
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 500,
      background: 'var(--color-linen)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '48px 24px', textAlign: 'center',
    }}>
      <h2 style={{
        fontFamily: 'var(--font-serif)', fontStyle: 'italic',
        fontWeight: 300, fontSize: 'clamp(28px, 6vw, 40px)',
        color: 'var(--color-ink)', margin: '0 0 16px 0', lineHeight: 1.2,
      }}>
        This is a Daye Pro feature.
      </h2>
      <p style={{
        fontFamily: 'var(--font-sans)', fontSize: '15px',
        color: 'var(--color-muted)', maxWidth: '340px',
        lineHeight: 1.65, margin: '0 0 40px 0',
      }}>
        {description}
      </p>
      <button
        onClick={handleUpgrade}
        disabled={loading}
        style={{
          background: '#c9b8d8', color: 'var(--color-ink)',
          border: 'none', borderRadius: '10px',
          padding: '14px 32px',
          fontFamily: 'var(--font-sans)', fontSize: '14px',
          fontWeight: 500, cursor: loading ? 'default' : 'pointer',
          opacity: loading ? 0.7 : 1, letterSpacing: '0.01em',
          marginBottom: '16px',
        }}
      >
        {loading ? 'Setting up your trial…' : 'Upgrade to Pro'}
      </button>
      {onDismiss && (
        <button
          onClick={onDismiss}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-sans)', fontSize: '13px',
            color: 'var(--color-muted)', padding: 0,
          }}
        >
          Maybe later
        </button>
      )}
    </div>
  )
}

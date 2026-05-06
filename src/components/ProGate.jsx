import { useAuth } from '../context/AuthContext'

export default function ProGate({ children, title = 'Unlock Daye Pro', description = 'Upgrade to access this feature.' }) {
  const { isPro } = useAuth()
  if (isPro) return children

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
        {title}
      </h2>
      <p style={{
        fontFamily: 'var(--font-sans)', fontSize: '15px',
        color: 'var(--color-muted)', maxWidth: '340px',
        lineHeight: 1.65, margin: '0 0 40px 0',
      }}>
        {description}
      </p>
      <button
        onClick={() => window.location.href = '/pricing'}
        style={{
          background: 'var(--color-ink)', color: 'white', border: 'none',
          borderRadius: '10px', padding: '14px 32px',
          fontFamily: 'var(--font-sans)', fontSize: '14px',
          fontWeight: 500, cursor: 'pointer', letterSpacing: '0.01em',
        }}
      >
        See Pro plans
      </button>
    </div>
  )
}

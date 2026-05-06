import { useAuth } from '../context/AuthContext'

export default function ProGate({ children, description = 'Unlock deeper insights and beautiful long-term tracking.' }) {
  const { isPro } = useAuth()

  if (isPro) return children

  return (
    <div style={{
      background: 'var(--color-linen)',
      border: '0.5px solid var(--color-border)',
      borderRadius: '16px',
      padding: '32px 28px',
      textAlign: 'center',
      maxWidth: '420px',
      margin: '0 auto',
    }}>
      <div style={{
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        background: 'var(--color-lavender)',
        margin: '0 auto 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.85,
      }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 1l1.8 3.6L14 5.5l-3 2.9.7 4.1L8 10.4l-3.7 2.1.7-4.1-3-2.9 4.2-.9L8 1z" fill="#1a1a1a" />
        </svg>
      </div>

      <p style={{
        fontFamily: 'var(--font-serif)',
        fontStyle: 'italic',
        fontSize: '20px',
        fontWeight: 300,
        color: 'var(--color-ink)',
        margin: '0 0 10px 0',
        lineHeight: 1.2,
      }}>
        This is a Pro feature.
      </p>

      <p style={{
        fontFamily: 'var(--font-sans)',
        fontSize: '13px',
        color: 'var(--color-muted)',
        lineHeight: 1.6,
        margin: '0 0 24px 0',
      }}>
        {description}
      </p>

      <button
        onClick={() => window.location.href = '/pricing'}
        style={{
          background: 'var(--color-lavender)',
          color: 'var(--color-ink)',
          border: 'none',
          borderRadius: '10px',
          padding: '12px 28px',
          fontFamily: 'var(--font-sans)',
          fontSize: '14px',
          fontWeight: 500,
          cursor: 'pointer',
          letterSpacing: '0.01em',
        }}
      >
        Upgrade to Pro
      </button>
    </div>
  )
}

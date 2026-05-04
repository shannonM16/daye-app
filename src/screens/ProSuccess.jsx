const INK = '#1a1a1a'
const LINEN = '#f9f7f5'
const MUTED = '#8a8480'
const LAVENDER = '#c9b8d8'
const BORDER = '#e2ddd8'

export default function ProSuccess({ onStartDay }) {
  return (
    <div style={{
      minHeight: '100dvh',
      background: LINEN,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px',
      textAlign: 'center',
    }}>
      <div style={{
        background: LAVENDER,
        borderRadius: '50%',
        width: '48px',
        height: '48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '32px',
      }}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M4 10L8.5 14.5L16 7" stroke={INK} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <h1 style={{
        fontFamily: 'var(--font-serif)',
        fontStyle: 'italic',
        fontWeight: 300,
        fontSize: 'clamp(36px, 6vw, 56px)',
        color: INK,
        lineHeight: 1.1,
        margin: '0 0 20px 0',
      }}>
        Welcome to Daye Pro.
      </h1>

      <p style={{
        fontFamily: 'var(--font-sans)',
        fontSize: '16px',
        color: MUTED,
        maxWidth: '380px',
        lineHeight: 1.65,
        margin: '0 0 48px 0',
      }}>
        Your 7-day free trial has started. Everything is unlocked.
      </p>

      <button
        onClick={onStartDay}
        style={{
          background: INK,
          color: 'white',
          border: 'none',
          borderRadius: '10px',
          padding: '14px 32px',
          fontFamily: 'var(--font-sans)',
          fontSize: '14px',
          fontWeight: 500,
          cursor: 'pointer',
          letterSpacing: '0.01em',
        }}
      >
        Start today's plan
      </button>

      <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: `0.5px solid ${BORDER}`, width: '100%', maxWidth: '320px' }}>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: MUTED, margin: 0 }}>
          Cancel anytime from your settings. No charge until your trial ends.
        </p>
      </div>
    </div>
  )
}

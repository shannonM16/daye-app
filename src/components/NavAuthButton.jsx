import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

export default function NavAuthButton({ onSignIn, textColor = '#1a1a1a' }) {
  const { navUser, signOut, showAuthModal } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  if (!navUser) {
    return (
      <button
        onClick={onSignIn || (() => showAuthModal('signin'))}
        style={{ background: 'none', border: 'none', fontFamily: 'var(--font-sans)', fontSize: '13px', color: textColor, cursor: 'pointer', padding: 0 }}
      >
        Sign in
      </button>
    )
  }

  const initial = (navUser.firstName || navUser.email || '?').charAt(0).toUpperCase()

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Account menu"
        style={{
          width: '32px', height: '32px', borderRadius: '50%',
          background: 'var(--color-lavender)', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 600,
          color: 'var(--color-ink)', flexShrink: 0,
        }}
      >
        {initial}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
          background: 'white', border: '0.5px solid var(--color-border)',
          borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          minWidth: '160px', overflow: 'hidden', zIndex: 500,
        }}>
          <button
            onClick={() => { setOpen(false); window.location.href = '/' }}
            style={{
              display: 'block', width: '100%', textAlign: 'left',
              background: 'none', border: 'none', padding: '12px 16px',
              fontFamily: 'var(--font-sans)', fontSize: '13px',
              color: 'var(--color-ink)', cursor: 'pointer',
            }}
          >
            My account
          </button>
          <div style={{ height: '0.5px', background: 'var(--color-border)' }} />
          <button
            onClick={() => { setOpen(false); signOut() }}
            style={{
              display: 'block', width: '100%', textAlign: 'left',
              background: 'none', border: 'none', padding: '12px 16px',
              fontFamily: 'var(--font-sans)', fontSize: '13px',
              color: 'var(--color-muted)', cursor: 'pointer',
            }}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}

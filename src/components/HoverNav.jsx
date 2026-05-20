import { useState, useEffect } from 'react'
import NavAuthButton from './NavAuthButton'

export default function HoverNav({ onViewSettings }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function handleMouseMove(e) {
      setVisible(e.clientY <= 60)
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <nav
      className="hover-nav"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '56px',
        zIndex: 50,
        background: '#f9f7f5',
        borderBottom: '0.5px solid #e8e4e0',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        alignItems: 'center',
        padding: '0 24px',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'opacity 200ms ease, transform 200ms ease',
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      <a
        href="/"
        style={{
          fontFamily: 'var(--font-serif)',
          fontStyle: 'italic',
          fontSize: '20px',
          color: '#1a1a1a',
          fontWeight: 300,
          textDecoration: 'none',
          marginRight: 'auto',
        }}
      >
        daye
      </a>
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <a
          href="/blog"
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            color: '#8a8480',
            textDecoration: 'none',
          }}
        >
          Blog
        </a>
        <a
          href="/pricing"
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            color: '#c9b8d8',
            textDecoration: 'none',
            fontWeight: 600,
          }}
        >
          Pro
        </a>
        <NavAuthButton onViewSettings={onViewSettings} />
      </div>
    </nav>
  )
}

import { useState, useEffect } from 'react'

const PHRASES = [
  'Reading your day...',
  'Building your plan...',
  'Personalising for you...',
]

export default function LoadingScreen() {
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [fadeIn, setFadeIn] = useState(true)

  useEffect(() => {
    const cycle = setInterval(() => {
      // Fade out
      setFadeIn(false)
      setTimeout(() => {
        setPhraseIndex((i) => (i + 1) % PHRASES.length)
        setFadeIn(true)
      }, 350)
    }, 1850) // 1.5s visible + 0.35s transition

    return () => clearInterval(cycle)
  }, [])

  return (
    <div
      className="screen items-center justify-center"
      style={{ background: 'var(--color-white)' }}
    >
      <div className="flex flex-col items-center" style={{ gap: '24px' }}>
        {/* Wordmark */}
        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            fontWeight: 300,
            fontSize: '40px',
            color: 'var(--color-ink)',
            lineHeight: 1,
            letterSpacing: '-0.01em',
          }}
        >
          daye
        </h1>

        {/* Animated lavender line */}
        <div
          style={{
            width: '72px',
            height: '2px',
            background: 'var(--color-linen-dark)',
            borderRadius: '2px',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '45%',
              height: '100%',
              background: 'var(--color-lavender)',
              borderRadius: '2px',
              animation: 'loadingPulse 1.6s cubic-bezier(0.4, 0, 0.2, 1) infinite',
            }}
          />
        </div>

        {/* Rotating phrase */}
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '12px',
            color: 'var(--color-muted)',
            opacity: fadeIn ? 1 : 0,
            transition: 'opacity 0.35s ease',
            minWidth: '180px',
            textAlign: 'center',
          }}
        >
          {PHRASES[phraseIndex]}
        </p>
      </div>
    </div>
  )
}

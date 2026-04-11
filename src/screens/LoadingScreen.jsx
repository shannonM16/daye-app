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
      setFadeIn(false)
      setTimeout(() => {
        setPhraseIndex((i) => (i + 1) % PHRASES.length)
        setFadeIn(true)
      }, 350)
    }, 1850)

    return () => clearInterval(cycle)
  }, [])

  return (
    <div className="loading-screen-wrap">
      <div className="loading-screen-inner">
        <h1 className="loading-wordmark">daye</h1>

        <div className="loading-bar">
          <div className="loading-bar-fill" />
        </div>

        <p
          className="loading-text"
          style={{ opacity: fadeIn ? 1 : 0, transition: 'opacity 0.35s ease' }}
        >
          {PHRASES[phraseIndex]}
        </p>
      </div>
    </div>
  )
}

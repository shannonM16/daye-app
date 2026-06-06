import { useState, useEffect } from 'react'

const PHRASES = [
  'Reading your day...',
  'Building your plan...',
  'Personalising for you...',
]

const css = `
  .loading-screen-wrap {
    height: 100dvh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-linen);
    position: relative;
    overflow: hidden;
  }
  .loading-screen-wrap::before {
    content: '';
    position: fixed; inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
    background-size: 200px 200px;
    pointer-events: none; z-index: 10; opacity: 0.65;
  }
  .loading-blob {
    position: absolute; border-radius: 50%; filter: blur(80px);
    pointer-events: none; animation: loadBlobDrift ease-in-out infinite;
  }
  .loading-blob-1 {
    width: 320px; height: 320px;
    background: radial-gradient(circle, rgba(201,184,216,0.2) 0%, transparent 70%);
    top: -80px; right: -80px; animation-duration: 12s;
  }
  .loading-blob-2 {
    width: 220px; height: 220px;
    background: radial-gradient(circle, rgba(232,213,204,0.18) 0%, transparent 70%);
    bottom: 60px; left: -40px; animation-duration: 15s; animation-delay: -4s;
  }
  @keyframes loadBlobDrift {
    0%,100% { transform: translate(0,0) scale(1); }
    50% { transform: translate(12px,-16px) scale(1.05); }
  }
  .loading-screen-inner {
    position: relative; z-index: 1;
    display: flex; flex-direction: column; align-items: center;
  }
  .loading-wordmark {
    font-family: var(--font-serif); font-style: italic; font-weight: 300;
    font-size: 36px; color: var(--color-ink); margin: 0 0 32px 0;
  }
  .loading-dots {
    display: flex; gap: 6px; align-items: center; margin-bottom: 28px;
  }
  .loading-dot {
    width: 5px; height: 5px; border-radius: 50%;
    background: var(--color-lavender);
    animation: loadDotPulse 1.4s ease-in-out infinite;
  }
  .loading-dot:nth-child(1) { animation-delay: 0s; }
  .loading-dot:nth-child(2) { animation-delay: 0.18s; }
  .loading-dot:nth-child(3) { animation-delay: 0.36s; }
  @keyframes loadDotPulse {
    0%,100% { opacity: 0.25; transform: scale(0.8); }
    50% { opacity: 1; transform: scale(1.2); }
  }
  .loading-text {
    font-family: var(--font-sans); font-size: 13px; font-weight: 300;
    color: var(--color-muted); letter-spacing: 0.02em;
    transition: opacity 0.35s ease; margin: 0;
  }
  .loading-progress {
    width: 120px; height: 1px;
    background: rgba(28,28,26,0.08); border-radius: 1px;
    margin-top: 32px; overflow: hidden;
  }
  .loading-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--color-lavender), var(--color-blush));
    border-radius: 1px; animation: loadProgress 5.5s ease-in-out infinite;
  }
  @keyframes loadProgress {
    0% { width: 0%; } 60% { width: 85%; } 100% { width: 95%; }
  }
`

export default function LoadingScreen() {
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [fadeIn, setFadeIn] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setTimeout(() => setMounted(true), 50) }, [])

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
    <>
      <style>{css}</style>
      <div className="loading-screen-wrap">
        <div className="loading-blob loading-blob-1" />
        <div className="loading-blob loading-blob-2" />
        <div
          className="loading-screen-inner"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(12px)',
            transition: 'opacity 0.6s ease, transform 0.6s ease',
          }}
        >
          <h1 className="loading-wordmark">daye</h1>
          <div className="loading-dots">
            <div className="loading-dot" />
            <div className="loading-dot" />
            <div className="loading-dot" />
          </div>
          <p className="loading-text" style={{ opacity: fadeIn ? 1 : 0 }}>
            {PHRASES[phraseIndex]}
          </p>
          <div className="loading-progress">
            <div className="loading-progress-fill" />
          </div>
        </div>
      </div>
    </>
  )
}

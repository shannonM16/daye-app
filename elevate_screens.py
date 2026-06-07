import re, os

# ── LoadingScreen — full replacement ─────────────────────────────
LOADING = '''import { useState, useEffect } from 'react'

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
'''

# Write LoadingScreen
with open('src/screens/LoadingScreen.jsx', 'w') as f:
    f.write(LOADING)
print('✓ LoadingScreen.jsx written')

# ── FocusOutput — targeted patches ───────────────────────────────
with open('src/screens/FocusOutput.jsx', 'r') as f:
    c = f.read()

# 1. Add useEffect to import
c = c.replace("import { useState, useRef } from 'react'",
              "import { useState, useRef, useEffect } from 'react'")

# 2. Add OUTPUT_CSS constant after last import
OUTPUT_CSS = """
// ── Elevated styles ───────────────────────────────────────────────
const OUTPUT_CSS = `
  .output-screen { position: relative; }
  .output-screen::before {
    content: ''; position: fixed; inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
    background-size: 200px 200px; pointer-events: none; z-index: 0; opacity: 0.5;
  }
  .out-blob {
    position: fixed; border-radius: 50%; filter: blur(90px); pointer-events: none; z-index: 0;
  }
  .out-blob-1 {
    width: 380px; height: 380px;
    background: radial-gradient(circle, rgba(201,184,216,0.11) 0%, transparent 70%);
    top: -80px; right: -80px; animation: outB1 16s ease-in-out infinite;
  }
  .out-blob-2 {
    width: 260px; height: 260px;
    background: radial-gradient(circle, rgba(232,213,204,0.09) 0%, transparent 70%);
    bottom: 60px; left: -40px; animation: outB2 20s ease-in-out infinite;
  }
  @keyframes outB1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-14px,12px)} }
  @keyframes outB2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(12px,-14px)} }
  .out-reveal { opacity: 0; transform: translateY(16px); transition: opacity 0.55s ease, transform 0.55s ease; }
  .out-reveal.in { opacity: 1; transform: translateY(0); }
  .avoid-elevated {
    background: var(--color-ink) !important; border: none !important;
    border-radius: 16px; padding: 20px !important;
  }
  .avoid-elevated .avoid-lbl {
    color: rgba(249,247,245,0.45); font-size: 10px; font-weight: 500;
    letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 12px; display: block;
  }
  .avoid-tag-dark {
    background: rgba(249,247,245,0.08) !important;
    border: 0.5px solid rgba(249,247,245,0.12) !important;
    color: rgba(249,247,245,0.82) !important;
    border-radius: 20px; padding: 6px 14px;
    font-size: 12px; font-family: var(--font-sans);
    display: inline-block;
  }
  .why-elevated {
    background: var(--color-linen) !important; border: none !important;
    border-left: 3px solid var(--color-lavender) !important;
    border-radius: 0 16px 16px 0 !important; padding: 20px 20px 20px 18px !important;
  }
  .why-elevated p {
    font-family: var(--font-serif) !important; font-style: italic;
    font-size: 14px !important; line-height: 1.75 !important; color: var(--color-ink) !important;
  }
  .goal-line {
    display: flex; align-items: center; gap: 8px; padding: 10px 0;
  }
  .goal-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--color-lavender); flex-shrink: 0; }
  .goal-text { font-family: var(--font-sans); font-size: 12px; color: var(--color-muted); font-style: italic; }
`

"""

# Insert after last import line
lines = c.split('\n')
last_import_idx = 0
for i, line in enumerate(lines):
    if line.startswith('import '):
        last_import_idx = i
insert_pos = sum(len(l) + 1 for l in lines[:last_import_idx + 1])
c = c[:insert_pos] + OUTPUT_CSS + c[insert_pos:]

# 3. Add reveal state + CSS injection inside component, after cardGenerating state
reveal_code = """
  // Staggered reveal on mount + CSS injection
  const [revealed, setRevealed] = useState([])
  useEffect(() => {
    const id = 'output-elevated-css'
    if (!document.getElementById(id)) {
      const tag = document.createElement('style')
      tag.id = id; tag.textContent = OUTPUT_CSS
      document.head.appendChild(tag)
    }
    ;[0,120,240,360,480].forEach((delay, i) => {
      setTimeout(() => setRevealed(prev => [...prev, i]), delay)
    })
  }, [])

"""
c = c.replace(
    "  const [cardGenerating, setCardGenerating] = useState(false)\n",
    "  const [cardGenerating, setCardGenerating] = useState(false)\n" + reveal_code
)

# 4. Add blobs to screen div
c = c.replace(
    '    <div className="screen output-screen" style={screenStyle}>',
    '    <div className="screen output-screen" style={screenStyle}>\n      <div className="out-blob out-blob-1" />\n      <div className="out-blob out-blob-2" />'
)

# 5. Add reveal to header
c = c.replace(
    '        {/* ── Header ─────────────────────────────────────────── */}\n        <div style={{ marginBottom: \'16px\' }}>',
    '        {/* ── Header ─────────────────────────────────────────── */}\n        <div className={`out-reveal ${revealed.includes(0) ? \'in\' : \'\'}`} style={{ marginBottom: \'16px\' }}>'
)

# 6. Add reveal to focus card
c = c.replace(
    '            <div className="card">\n              <SectionLabel>Focus on</SectionLabel>',
    '            <div className={`card out-reveal ${revealed.includes(1) ? \'in\' : \'\'}`}>\n              <SectionLabel>Focus on</SectionLabel>'
)

# 7. Add reveal to time split
c = c.replace(
    '            {timeBlocks && timeBlocks.length > 0 && (\n              <div className="card">',
    '            {timeBlocks && timeBlocks.length > 0 && (\n              <div className={`card out-reveal ${revealed.includes(2) ? \'in\' : \'\'}`}>'
)

# 8. Elevate avoid section
c = c.replace(
    """            {displayAvoid.length > 0 && (
              <div className="card">
                <SectionLabel>Avoid today</SectionLabel>
                <div className="flex flex-wrap gap-2">
                  {displayAvoid.map((a, i) => (
                    <span key={i} className="text-xs px-3 py-1.5 rounded-full" style={{ border: '0.5px solid var(--color-border-dark)', color: 'var(--color-muted)', background: 'var(--color-linen)' }}>
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}""",
    """            {displayAvoid.length > 0 && (
              <div className={`avoid-elevated out-reveal ${revealed.includes(3) ? 'in' : ''}`}>
                <span className="avoid-lbl">Avoid today</span>
                <div className="flex flex-wrap gap-2">
                  {displayAvoid.map((a, i) => (
                    <span key={i} className="avoid-tag-dark">{a}</span>
                  ))}
                </div>
              </div>
            )}"""
)

# 9. Elevate why section
c = c.replace(
    """            {displayWhy && (
              <div className="rounded-2xl p-5" style={{ background: 'var(--color-white)', border: '1px solid var(--color-border)', borderLeft: '3px solid var(--color-lavender)' }}>
                <h2 className="text-[11px] font-medium uppercase tracking-widest mb-2" style={{ color: 'var(--color-muted)' }}>Why</h2>
                <p className="text-sm leading-relaxed italic" style={{ color: 'var(--color-muted)' }}>{displayWhy}</p>
              </div>
            )}""",
    """            {displayWhy && (
              <div className={`why-elevated out-reveal ${revealed.includes(4) ? 'in' : ''}`}>
                <h2 className="text-[11px] font-medium uppercase tracking-widest mb-2" style={{ color: 'var(--color-muted)' }}>Why</h2>
                <p>{displayWhy}</p>
              </div>
            )}"""
)

# 10. Elevate goal alignment
c = c.replace(
    """            {goalAlignment && (
              <p className="text-xs pb-2" style={{ color: 'var(--color-muted)', opacity: 0.7 }}>
                {goalAlignment}
              </p>
            )}""",
    """            {goalAlignment && (
              <div className={`goal-line out-reveal ${revealed.includes(3) ? 'in' : ''}`}>
                <div className="goal-dot" />
                <p className="goal-text">{goalAlignment}</p>
              </div>
            )}"""
)

with open('src/screens/FocusOutput.jsx', 'w') as f:
    f.write(c)

# Verify
checks = [
    ('useEffect', 'useEffect } from' in c),
    ('OUTPUT_CSS', 'OUTPUT_CSS' in c),
    ('blobs', 'out-blob' in c),
    ('reveals', 'out-reveal' in c),
    ('avoid elevated', 'avoid-elevated' in c),
    ('why elevated', 'why-elevated' in c),
    ('goal elevated', 'goal-line' in c),
]
print('FocusOutput patches:')
for label, ok in checks:
    print(f"  {'OK' if ok else 'MISSING'} {label}")

import { useState, useEffect, useRef } from 'react'
import NavAuthButton from '../components/NavAuthButton'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'

// ── Inject elevated styles once ───────────────────────────────────
const LANDING_CSS = `
  .landing-grain::before {
    content: '';
    position: fixed; inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
    background-size: 200px 200px;
    pointer-events: none; z-index: 900; opacity: 0.65;
  }
  .lp-blob {
    position: fixed; border-radius: 50%; filter: blur(90px);
    pointer-events: none; z-index: 0;
  }
  .lp-blob-1 {
    width: 560px; height: 560px;
    background: radial-gradient(circle, rgba(201,184,216,0.14) 0%, transparent 70%);
    top: -120px; right: -120px;
    animation: lpb1 16s ease-in-out infinite;
  }
  .lp-blob-2 {
    width: 380px; height: 380px;
    background: radial-gradient(circle, rgba(232,213,204,0.11) 0%, transparent 70%);
    bottom: 80px; left: -60px;
    animation: lpb2 20s ease-in-out infinite;
  }
  .lp-blob-3 {
    width: 280px; height: 280px;
    background: radial-gradient(circle, rgba(184,196,177,0.1) 0%, transparent 70%);
    top: 45%; left: 42%;
    animation: lpb3 24s ease-in-out infinite;
  }
  @keyframes lpb1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-24px,20px)} }
  @keyframes lpb2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(20px,-24px)} }
  @keyframes lpb3 { 0%,100%{transform:translate(0,0)} 40%{transform:translate(-16px,16px)} 70%{transform:translate(12px,-10px)} }

  .lp-reveal {
    opacity: 0; transform: translateY(28px);
    transition: opacity 0.85s ease, transform 0.85s ease;
  }
  .lp-reveal.visible { opacity: 1; transform: translateY(0); }
  .lp-reveal-left {
    opacity: 0; transform: translateX(-32px);
    transition: opacity 0.85s ease, transform 0.85s ease;
  }
  .lp-reveal-left.visible { opacity: 1; transform: translateX(0); }
  .lp-reveal-right {
    opacity: 0; transform: translateX(32px);
    transition: opacity 0.85s ease, transform 0.85s ease;
  }
  .lp-reveal-right.visible { opacity: 1; transform: translateX(0); }
  .lp-d1{transition-delay:.1s} .lp-d2{transition-delay:.2s}
  .lp-d3{transition-delay:.3s} .lp-d4{transition-delay:.4s}
  .lp-d5{transition-delay:.5s} .lp-d6{transition-delay:.6s}

  /* Who cards hover */
  .lp-who-card {
    background: white; border: 0.5px solid var(--color-border);
    border-radius: 16px; padding: 24px;
    transition: transform 0.3s, box-shadow 0.3s, border-color 0.3s;
    position: relative; overflow: hidden;
  }
  .lp-who-card::before {
    content: '';
    position: absolute; width: 120px; height: 120px; border-radius: 50%;
    filter: blur(40px); top: -30px; left: -30px;
    opacity: 0; transition: opacity 0.3s;
  }
  .lp-who-card:hover { transform: translateY(-3px); box-shadow: 0 12px 36px rgba(26,26,26,0.08); border-color: rgba(26,26,26,0.12); }
  .lp-who-card:hover::before { opacity: 1; }

  /* How-it-works step hover */
  .lp-step {
    flex: 1;
    transition: transform 0.3s;
    cursor: default;
  }
  .lp-step:hover { transform: translateY(-3px); }

  /* Plan card elevation */
  .lp-plan-card {
    transition: transform 0.4s ease, box-shadow 0.4s ease;
  }
  .lp-plan-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 56px rgba(26,26,26,0.1) !important;
  }

  /* CTA section ambient */
  .lp-cta-section {
    position: relative; overflow: hidden;
  }
  .lp-cta-section::before {
    content: '';
    position: absolute;
    width: 400px; height: 400px; border-radius: 50%;
    background: radial-gradient(circle, rgba(201,184,216,0.08) 0%, transparent 70%);
    filter: blur(60px);
    top: -100px; right: -100px;
    pointer-events: none;
  }

  /* Nav frosted */
  .landing-nav-frosted {
    background: rgba(249,247,245,0.85) !important;
    backdrop-filter: blur(16px) !important;
    -webkit-backdrop-filter: blur(16px) !important;
  }

  @media(max-width:640px){
    .lp-blob-1, .lp-blob-2, .lp-blob-3 { display: none; }
  }
`

// ── Reveal hook ───────────────────────────────────────────────────
function useReveal(threshold = 0.12) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, visible]
}

// ── MobileNav (unchanged) ─────────────────────────────────────────
function MobileNav({ onStartDay, onSignIn, onOpenApp, navUser }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <div className="mobile-nav-wrapper">
        <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '18px', color: 'var(--color-ink)', fontWeight: 300 }}>daye</span>
        <button onClick={() => setOpen(true)} aria-label="Open menu" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}>
          <svg width="22" height="16" viewBox="0 0 22 16" fill="none">
            <path d="M0 1h22M0 8h22M0 15h22" stroke="var(--color-ink)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      {open && (
        <div style={{ position: 'fixed', inset: 0, background: 'white', zIndex: 200, display: 'flex', flexDirection: 'column', padding: '28px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px' }}>
            <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '18px', color: 'var(--color-ink)', fontWeight: 300 }}>daye</span>
            <button onClick={() => setOpen(false)} aria-label="Close menu" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M3 3l12 12M15 3L3 15" stroke="var(--color-ink)" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column' }}>
            <a href="/blog" onClick={() => setOpen(false)} style={{ fontFamily: 'var(--font-sans)', fontSize: '18px', color: 'var(--color-ink)', textDecoration: 'none', padding: '16px 0', borderBottom: '0.5px solid var(--color-border)' }}>Blog</a>
            <a href="/pricing" onClick={() => setOpen(false)} style={{ fontFamily: 'var(--font-sans)', fontSize: '18px', color: '#c9b8d8', textDecoration: 'none', padding: '16px 0', borderBottom: '0.5px solid var(--color-border)', fontWeight: 600 }}>Pro</a>
            {!navUser && (
              <button onClick={() => { setOpen(false); onSignIn() }} style={{ fontFamily: 'var(--font-sans)', fontSize: '18px', color: 'var(--color-ink)', background: 'none', border: 'none', borderBottom: '0.5px solid var(--color-border)', cursor: 'pointer', textAlign: 'left', padding: '16px 0' }}>Sign in</button>
            )}
          </nav>
          <div style={{ marginTop: 'auto', paddingTop: '32px' }}>
            <button onClick={() => { setOpen(false); navUser ? onOpenApp() : onStartDay() }} style={{ width: '100%', background: 'var(--color-ink)', color: 'white', border: 'none', borderRadius: '10px', padding: '14px 28px', fontFamily: 'var(--font-sans)', fontSize: '15px', fontWeight: 500, cursor: 'pointer' }}>
              {navUser ? 'Open Daye' : 'Start free'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}

// ── Demo animation constants (unchanged) ─────────────────────────
const DEMO_TEXT = 'Also need to finish the Q2 report by 3pm'
const CHAR_MS = 38

function DStageLabel({ children }) {
  return <p style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-muted)', margin: '0 0 6px 0', fontWeight: 500 }}>{children}</p>
}

function DChip({ label, selected, animating }) {
  return (
    <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: '20px', border: '0.5px solid', borderColor: selected ? 'var(--color-ink)' : 'var(--color-border)', background: selected ? 'var(--color-ink)' : 'white', color: selected ? 'white' : 'var(--color-ink)', fontFamily: 'var(--font-sans)', fontSize: '11px', transition: 'all 150ms ease', transform: animating ? 'scale(0.93)' : 'scale(1)', cursor: 'default' }}>{label}</span>
  )
}

function DemoPhone({ started, replayKey }) {
  const [stage, setStage] = useState(0)
  const [fadeIn, setFadeIn] = useState(false)
  const [slider, setSlider] = useState(1)
  const [chipsOn, setChipsOn] = useState([])
  const [chipsAnim, setChipsAnim] = useState([])
  const [tasksOn, setTasksOn] = useState([])
  const [tasksAnim, setTasksAnim] = useState([])
  const [typedText, setTypedText] = useState('')
  const idsRef = useRef([])

  useEffect(() => {
    idsRef.current.forEach(clearTimeout)
    idsRef.current = []
    setStage(0); setFadeIn(false); setSlider(1)
    setChipsOn([]); setChipsAnim([]); setTasksOn([]); setTasksAnim([]); setTypedText('')
    if (!started) return

    const go = (ms, fn) => { const id = setTimeout(fn, ms); idsRef.current.push(id) }

    const runLoop = () => {
      idsRef.current.forEach(clearTimeout); idsRef.current = []
      setStage(0); setFadeIn(false); setSlider(1)
      setChipsOn([]); setChipsAnim([]); setTasksOn([]); setTasksAnim([]); setTypedText('')
      go(80,   () => setFadeIn(true))
      go(250,  () => setSlider(2))
      go(550,  () => setSlider(3))
      go(850,  () => setSlider(4))
      go(2000, () => setFadeIn(false))
      go(2300, () => { setStage(1); setSlider(1) })
      go(2350, () => setFadeIn(true))
      go(2750, () => { setChipsAnim(['focused']); setChipsOn(['focused']) })
      go(2950, () => setChipsAnim([]))
      go(3150, () => { setChipsAnim(['deep-work']); setChipsOn(['focused', 'deep-work']) })
      go(3350, () => setChipsAnim([]))
      go(3550, () => { setChipsAnim(['deadline']); setChipsOn(['focused', 'deep-work', 'deadline']) })
      go(3750, () => setChipsAnim([]))
      go(4850, () => setFadeIn(false))
      go(5150, () => { setStage(2); setChipsOn([]); setTasksOn([]); setTypedText('') })
      go(5200, () => setFadeIn(true))
      go(5500, () => { setTasksAnim(['brief']); setTasksOn(['brief']) })
      go(5700, () => setTasksAnim([]))
      go(5800, () => { setTasksAnim(['stakeholder']); setTasksOn(['brief', 'stakeholder']) })
      go(6000, () => setTasksAnim([]))
      for (let i = 0; i < DEMO_TEXT.length; i++) {
        const ch = DEMO_TEXT[i]
        go(5900 + i * CHAR_MS, () => setTypedText(t => t + ch))
      }
      go(7920,  () => setFadeIn(false))
      go(8220,  () => { setStage(3); setTasksOn([]); setTypedText('') })
      go(8270,  () => setFadeIn(true))
      go(9770,  () => setFadeIn(false))
      go(10070, () => setStage(4))
      go(10120, () => setFadeIn(true))
      go(14120, () => setFadeIn(false))
      go(14450, () => runLoop())
    }
    runLoop()
    return () => { idsRef.current.forEach(clearTimeout) }
  }, [started, replayKey])

  const sliderPct = ((slider - 1) / 4) * 100

  return (
    <>
      <style>{`
        @keyframes demoPulse { 0%,100%{opacity:0.35} 50%{opacity:1} }
        @keyframes demoBlink { 0%,100%{opacity:1} 50%{opacity:0} }
        .demo-phone-frame { width: 320px; height: 580px; }
        @media(max-width:480px) { .demo-phone-frame { width: 280px; height: 520px; } }
      `}</style>
      <div className="demo-phone-frame" style={{ background: 'white', border: '0.5px solid var(--color-border)', borderRadius: '32px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', position: 'relative', flexShrink: 0 }}>
        <div style={{ position: 'absolute', inset: 0, padding: '28px 22px 22px', opacity: fadeIn ? 1 : 0, transition: 'opacity 280ms ease', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {stage === 0 && (
            <div>
              <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '16px', color: 'var(--color-ink)', fontWeight: 300 }}>daye</span>
              <div style={{ marginTop: '18px', marginBottom: '24px' }}>
                <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '26px', fontWeight: 300, color: 'var(--color-ink)', margin: 0, lineHeight: 1.15 }}>Good morning,</p>
                <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '26px', fontWeight: 500, color: 'var(--color-ink)', margin: '0 0 6px 0', lineHeight: 1.15 }}>Alex.</p>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--color-muted)', margin: 0 }}>How's today looking?</p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                <DStageLabel>Energy</DStageLabel>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--color-muted)' }}>{slider >= 4 ? 'Good' : ''}</span>
              </div>
              <div style={{ position: 'relative', height: '4px', background: 'var(--color-border)', borderRadius: '2px', marginBottom: '8px' }}>
                <div style={{ position: 'absolute', left: 0, width: sliderPct + '%', height: '100%', background: 'var(--color-ink)', borderRadius: '2px', transition: 'width 280ms ease' }} />
                <div style={{ position: 'absolute', left: `calc(${sliderPct}% - 8px)`, top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', borderRadius: '50%', background: 'var(--color-ink)', transition: 'left 280ms ease', boxShadow: '0 1px 4px rgba(0,0,0,0.18)' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                {[1,2,3,4,5].map(n => (<span key={n} style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: slider === n ? 'var(--color-ink)' : 'var(--color-muted)', fontWeight: slider === n ? 500 : 400 }}>{n}</span>))}
              </div>
            </div>
          )}
          {stage === 1 && (
            <div>
              <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '16px', color: 'var(--color-ink)', fontWeight: 300 }}>daye</span>
              <div style={{ marginTop: '16px' }}>
                <DStageLabel>Mood</DStageLabel>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '14px' }}>
                  {['Focused','Anxious','Motivated','Flat','Stressed'].map(m => (<DChip key={m} label={m} selected={m === 'Focused' && chipsOn.includes('focused')} animating={m === 'Focused' && chipsAnim.includes('focused')} />))}
                </div>
                <DStageLabel>Day type</DStageLabel>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '14px' }}>
                  {['Deep work','Lots of meetings','Low energy','Reactive'].map(m => (<DChip key={m} label={m} selected={m === 'Deep work' && chipsOn.includes('deep-work')} animating={m === 'Deep work' && chipsAnim.includes('deep-work')} />))}
                </div>
                <DStageLabel>Pressure today</DStageLabel>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {['Deadline','Big presentation','None'].map(m => (<DChip key={m} label={m} selected={m === 'Deadline' && chipsOn.includes('deadline')} animating={m === 'Deadline' && chipsAnim.includes('deadline')} />))}
                </div>
              </div>
            </div>
          )}
          {stage === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '14px', color: 'var(--color-muted)', fontWeight: 300, display: 'block', marginBottom: '6px' }}>daye</span>
              <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '20px', fontWeight: 300, color: 'var(--color-ink)', margin: '0 0 3px 0', lineHeight: 1.2 }}>What's on your plate, Alex?</p>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--color-muted)', margin: '0 0 14px 0' }}>Select your tasks for today.</p>
              <DStageLabel>Quick select</DStageLabel>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', marginBottom: '14px' }}>
                {[{ label: 'Write a brief', key: 'brief' },{ label: 'Draft copy', key: null },{ label: 'Stakeholder update', key: 'stakeholder' },{ label: 'Campaign review', key: null },{ label: 'Competitor research', key: null },{ label: 'Admin', key: null }].map(({ label, key }) => (
                  <div key={label} style={{ padding: '7px 10px', borderRadius: '10px', border: '0.5px solid', borderColor: key && tasksOn.includes(key) ? 'var(--color-ink)' : 'var(--color-border)', background: key && tasksOn.includes(key) ? 'var(--color-ink)' : 'white', color: key && tasksOn.includes(key) ? 'white' : 'var(--color-ink)', fontFamily: 'var(--font-sans)', fontSize: '11px', transition: 'all 150ms ease', transform: key && tasksAnim.includes(key) ? 'scale(0.95)' : 'scale(1)' }}>{label}</div>
                ))}
              </div>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-muted)', margin: '0 0 5px 0', fontWeight: 500 }}>Or describe your day</p>
              <div style={{ flex: 1, minHeight: '52px', border: '0.5px solid var(--color-border)', borderRadius: '10px', padding: '8px 10px', fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--color-ink)', lineHeight: 1.5 }}>
                {typedText}<span style={{ animation: 'demoBlink 900ms infinite', opacity: 1 }}>|</span>
              </div>
            </div>
          )}
          {stage === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '30px', color: 'var(--color-ink)', fontWeight: 300, display: 'block', marginBottom: '20px' }}>daye</span>
              <div style={{ width: '48px', height: '3px', borderRadius: '2px', background: 'var(--color-lavender)', animation: 'demoPulse 1.2s ease infinite', marginBottom: '20px' }} />
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--color-muted)', margin: 0 }}>Building your plan...</p>
            </div>
          )}
          {stage === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '10px' }}>
              <div style={{ borderLeft: '3px solid var(--color-lavender)', paddingLeft: '10px' }}>
                <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '12px', color: 'var(--color-muted)', margin: 0 }}>The Deadline Push</p>
              </div>
              <div>
                <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '14px', color: 'var(--color-ink)', fontWeight: 300, display: 'block', marginBottom: '2px' }}>daye</span>
                <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '22px', fontWeight: 300, color: 'var(--color-ink)', margin: '0 0 7px 0', lineHeight: 1.2 }}>Alex's plan.</p>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', color: 'var(--color-ink)', background: 'var(--color-linen)', borderRadius: '20px', padding: '3px 10px' }}>Focus day</span>
              </div>
              <div>
                <DStageLabel>Focus on</DStageLabel>
                {[{ bar: 'var(--color-ink)', title: 'Finish the Q2 report', sub: 'Deadline today · Do this first' },{ bar: 'var(--color-lavender)', title: 'Write the campaign brief', sub: 'High value · Morning block' }].map((p, i) => (
                  <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '8px', alignItems: 'stretch' }}>
                    <div style={{ width: '3px', borderRadius: '2px', background: p.bar, flexShrink: 0, minHeight: '32px' }} />
                    <div>
                      <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--color-ink)', fontWeight: 500, margin: '0 0 2px 0' }}>{p.title}</p>
                      <p style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', color: 'var(--color-muted)', margin: 0 }}>{p.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <DStageLabel>Time split</DStageLabel>
                {['9–11am · Q2 report — deep work block','11–11:30am · Campaign brief','2:30pm · Stakeholder update'].map(b => (
                  <div key={b} style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', color: 'var(--color-muted)', padding: '4px 0', borderBottom: '0.5px solid var(--color-border)' }}>{b}</div>
                ))}
              </div>
              <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '11px', color: 'var(--color-muted)', margin: 'auto 0 0 0' }}>
                Today moves you toward: <span style={{ color: 'var(--color-ink)' }}>building visibility</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function DemoSection() {
  const [started, setStarted] = useState(false)
  const [replayKey, setReplayKey] = useState(0)
  const phoneRef = useRef(null)
  const [ref, v] = useReveal(0.1)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true) },
      { threshold: 0.25 }
    )
    if (phoneRef.current) observer.observe(phoneRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section style={{ background: 'var(--color-linen)', padding: 'clamp(48px,8vw,80px) 0' }} ref={ref}>
      <div className="landing-container">
        <p className={`lp-reveal ${v ? 'visible' : ''}`} style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-muted)', textAlign: 'center', margin: '0 0 16px 0', fontWeight: 500 }}>See it in action</p>
        <h2 className={`lp-reveal lp-d1 ${v ? 'visible' : ''}`} style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '36px', fontWeight: 300, color: 'var(--color-ink)', textAlign: 'center', margin: '0 0 12px 0', lineHeight: 1.2 }}>Sixty seconds to clarity.</h2>
        <p className={`lp-reveal lp-d2 ${v ? 'visible' : ''}`} style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', color: 'var(--color-muted)', textAlign: 'center', maxWidth: '480px', margin: '0 auto 48px', lineHeight: 1.6 }}>This is what a typical morning with Daye looks like.</p>
        <div ref={phoneRef} className={`lp-reveal lp-d2 ${v ? 'visible' : ''}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <DemoPhone started={started} replayKey={replayKey} />
          <button onClick={() => { setReplayKey(k => k + 1); setStarted(true) }} style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--color-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '16px 0 6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ fontSize: '14px' }}>↺</span> Replay demo
          </button>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--color-muted)', textAlign: 'center', maxWidth: '360px', margin: '4px 0 0', lineHeight: 1.6 }}>
            Real plans are generated by AI based on your profile, energy and goals. No two plans are the same.
          </p>
        </div>
      </div>
    </section>
  )
}

const FAQ_ITEMS = [
  { q: 'Is Daye free?', a: 'Yes, the core app is free forever. Daye Pro (£4.99/month) unlocks advanced features like full history, pattern insights, and priority support.' },
  { q: 'Does it work on iPhone?', a: 'Yes, add it to your home screen from Safari for the full app experience. Open Safari, tap the share icon, and select "Add to Home Screen". A dedicated App Store app is coming soon.' },
  { q: 'Is my data private?', a: 'Yes, your data is stored securely and never sold or shared. The only external service your information touches is the AI model that generates your plan — and only the details relevant to planning are sent.' },
  { q: 'How is this different from a to-do list or Notion?', a: 'Notion and to-do lists store everything you might do. Daye decides what you should do today based on who you are, how you feel, and what actually matters. It is a decision, not a list. You open it in the morning and close it with a clear mandate — not more things to organise.' },
  { q: 'How does the AI part work?', a: 'When you build your plan, Daye sends your profile, energy level, mood, and tasks to Claude — a leading AI model — which generates a personalised plan written specifically for you. It reads your role, your goal, and your current state to decide what matters most today. Each plan is unique.' },
  { q: 'How long does it take each morning?', a: 'Under 60 seconds for most people. Three taps for your energy and mood, select your tasks or type a sentence, and your plan is ready. The goal is to make the decision faster than thinking about it yourself.' },
  { q: 'Can I change my profile later?', a: 'Yes — tap the profile icon on your home screen to update your role, goals, blockers or any other details at any time. Your plan gets smarter the more accurately your profile reflects your real situation.' },
  { q: 'What if the plan does not feel right?', a: 'You can go back and adjust your inputs at any time. The plan is a starting point — you know your day better than any AI. Use it as a guide, not a rule. We are always improving the AI based on feedback.' },
]

function FAQItem({ item, open, onToggle }) {
  return (
    <div style={{ borderBottom: '0.5px solid var(--color-border)' }}>
      <button onClick={onToggle} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 500, color: 'var(--color-ink)', paddingRight: '16px' }}>{item.q}</span>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: '18px', color: 'var(--color-muted)', flexShrink: 0, lineHeight: 1, display: 'inline-block', transform: open ? 'rotate(45deg)' : 'rotate(0deg)', transition: 'transform 200ms ease' }}>+</span>
      </button>
      <div style={{ overflow: 'hidden', maxHeight: open ? '400px' : '0', transition: 'max-height 300ms ease' }}>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--color-muted)', lineHeight: 1.7, margin: '0 0 20px 0', paddingRight: '32px' }}>{item.a}</p>
      </div>
    </div>
  )
}

function FAQSection() {
  const [openIdx, setOpenIdx] = useState(null)
  const [ref, v] = useReveal(0.08)
  return (
    <section style={{ background: 'white', padding: 'clamp(48px,8vw,80px) 0' }} ref={ref}>
      <div className="landing-container">
        <p className={`lp-reveal ${v ? 'visible' : ''}`} style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-muted)', textAlign: 'center', margin: '0 0 12px 0', fontWeight: 500 }}>Questions</p>
        <h2 className={`lp-reveal lp-d1 ${v ? 'visible' : ''}`} style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '36px', fontWeight: 300, color: 'var(--color-ink)', textAlign: 'center', margin: '0 0 48px 0', lineHeight: 1.2 }}>Everything you need to know.</h2>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          {FAQ_ITEMS.map((item, idx) => (
            <FAQItem key={idx} item={item} open={openIdx === idx} onToggle={() => setOpenIdx(openIdx === idx ? null : idx)} />
          ))}
        </div>
      </div>
    </section>
  )
}

function MockPlanCard() {
  return (
    <div className="lp-plan-card" style={{ background: 'white', border: '0.5px solid var(--color-border)', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 24px rgba(26,26,26,0.06)' }}>
      <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '16px', color: 'var(--color-ink)', fontWeight: 300, display: 'block', marginBottom: '4px' }}>daye</span>
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-muted)', margin: '0 0 8px 0' }}>Monday · Focus day</p>
      <h3 style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '28px', fontWeight: 300, color: 'var(--color-ink)', margin: '0 0 24px 0', lineHeight: 1.2 }}>Shannon's plan.</h3>
      <div style={{ marginBottom: '20px' }}>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-muted)', margin: '0 0 10px 0', fontWeight: 500 }}>Focus on</p>
        {[{ color: 'var(--color-ink)', title: 'Finish the Q2 campaign brief', sub: 'Most important · Do this first' },{ color: 'var(--color-lavender)', title: 'Prep for manager 1:1', sub: 'Career move · High value' }].map((p, i) => (
          <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '10px', alignItems: 'stretch' }}>
            <div style={{ width: '3px', borderRadius: '2px', background: p.color, flexShrink: 0 }} />
            <div>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--color-ink)', fontWeight: 500, margin: '0 0 2px 0' }}>{p.title}</p>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--color-muted)', margin: 0 }}>{p.sub}</p>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginBottom: '20px' }}>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-muted)', margin: '0 0 10px 0', fontWeight: 500 }}>Time split</p>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[{ label: '9–11am', task: 'Campaign brief' },{ label: '11–12pm', task: '1:1 prep' },{ label: 'Afternoon', task: 'Clear comms' }].map((block) => (
            <div key={block.label} style={{ flex: 1, background: 'var(--color-linen)', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', color: 'var(--color-muted)', margin: '0 0 2px 0' }}>{block.label}</p>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--color-ink)', fontWeight: 500, margin: 0 }}>{block.task}</p>
            </div>
          ))}
        </div>
      </div>
      <div style={{ marginBottom: '20px' }}>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-muted)', margin: '0 0 10px 0', fontWeight: 500 }}>Avoid today</p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['Non-urgent Slack', 'Unplanned calls'].map((item) => (
            <span key={item} style={{ background: 'var(--color-linen)', borderRadius: '20px', padding: '5px 12px', fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--color-muted)' }}>{item}</span>
          ))}
        </div>
      </div>
      <div style={{ borderTop: '0.5px solid var(--color-border)', paddingTop: '16px' }}>
        <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '14px', color: 'var(--color-muted)', lineHeight: 1.5, margin: '0 0 8px 0' }}>"Your energy is high and you have a deadline — use the morning hard."</p>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--color-muted)', margin: 0 }}>Today moves you toward:{' '}<span style={{ fontWeight: 500, color: 'var(--color-ink)' }}>getting promoted</span></p>
      </div>
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────
export default function Landing({ onStartDay, onSignIn, onViewSettings, onOpenApp }) {
  const { navUser, isPro } = useAuth()

  // Inject CSS once
  useEffect(() => {
    const id = 'landing-elevated-css'
    if (!document.getElementById(id)) {
      const tag = document.createElement('style')
      tag.id = id
      tag.textContent = LANDING_CSS
      document.head.appendChild(tag)
    }
  }, [])

  const scrollToHowItWorks = () => {
    document.getElementById('landing-how-it-works')?.scrollIntoView({ behavior: 'smooth' })
  }

  // Reveal refs for each section
  const [problemRef, problemV] = useReveal(0.1)
  const [howRef, howV] = useReveal(0.1)
  const [whoRef, whoV] = useReveal(0.08)
  const [outputRef, outputV] = useReveal(0.1)
  const [ctaRef, ctaV] = useReveal(0.15)

  const WHO_CARDS = [
    { dot: 'var(--color-ink)', bg: 'rgba(26,26,26,0.06)', type: 'Corporate', desc: 'For professionals navigating deadlines, politics, and the push for the next level.', priorities: ['Finish the stakeholder presentation', 'Clear the urgent inbox'] },
    { dot: 'var(--color-lavender)', bg: 'rgba(201,184,216,0.3)', type: 'Self-employed', desc: 'For founders and freelancers juggling client work, cashflow, and growth.', priorities: ['Chase the overdue invoice', 'Send two new proposals'] },
    { dot: 'var(--color-blush)', bg: 'rgba(232,213,204,0.4)', type: 'Student', desc: 'For students managing assignments, exams, and the pressure to perform.', priorities: ['Two hours of focused revision', "Review yesterday's notes"] },
    { dot: 'var(--color-sage)', bg: 'rgba(184,196,177,0.4)', type: 'Figuring it out', desc: 'For anyone between chapters, exploring what comes next.', priorities: ['Research one new direction', 'Reach out to one person'] },
  ]

  return (
    <div className="landing-grain" style={{ height: '100dvh', overflowY: 'auto', background: 'var(--color-linen)', position: 'relative' }}>
      <div className="lp-blob lp-blob-1" />
      <div className="lp-blob lp-blob-2" />
      <div className="lp-blob lp-blob-3" />

      {/* ── Nav ── */}
      <nav className="landing-nav landing-nav-frosted">
        <div className="landing-container" style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '20px', color: 'var(--color-ink)', fontWeight: 300, marginRight: 'auto', paddingRight: '80px' }}>daye</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <a href="/blog" style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--color-muted)', textDecoration: 'none' }}>Blog</a>
            <a href="/pricing" style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: '#c9b8d8', textDecoration: 'none', fontWeight: 600, borderBottom: '1.5px solid rgba(201,184,216,0.5)', paddingBottom: '1px' }}>Pro</a>
            <NavAuthButton onSignIn={onSignIn} onViewSettings={onViewSettings} />
            <div style={{ width: '1px', height: '20px', background: 'var(--color-border)', flexShrink: 0 }} />
            <button
              onClick={navUser ? onOpenApp : onStartDay}
              style={{ background: 'var(--color-ink)', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 20px', fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 500, cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(26,26,26,0.18)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
            >
              {navUser ? 'Open Daye' : 'Start free'}
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
        <div className="landing-container" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <MobileNav onStartDay={onStartDay} onSignIn={onSignIn} onOpenApp={onOpenApp} navUser={navUser} />
          <div className="landing-desktop-only" style={{ height: '80px' }} />
          <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            <div>
              <p className="hero-anim hero-anim-delay-0" style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-muted)', margin: '0 0 20px 0', fontWeight: 500 }}>
                Your daily focus companion
              </p>
              <h1 style={{ margin: '0 0 24px 0', padding: 0, lineHeight: 1 }}>
                <span className="hero-anim hero-anim-delay-1 hero-headline-text" style={{ display: 'block', fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 300, color: 'var(--color-ink)', lineHeight: 1.1 }}>Not a list.</span>
                <span className="hero-anim hero-anim-delay-2 hero-headline-text" style={{ display: 'block', fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 300, color: 'var(--color-ink)', lineHeight: 1.1 }}>A decision.</span>
              </h1>
              <p className="hero-anim hero-anim-delay-3" style={{ fontFamily: 'var(--font-sans)', fontSize: '16px', fontWeight: 300, color: 'var(--color-muted)', maxWidth: '480px', lineHeight: 1.6, margin: '0 0 32px 0' }}>
                Every morning, Daye reads your energy, your goals, and your day — then tells you exactly what to focus on.
              </p>
              <div className="hero-anim hero-anim-delay-4">
                {navUser ? (
                  <div style={{ marginBottom: '16px' }}>
                    <button onClick={onOpenApp} style={{ background: 'var(--color-ink)', color: 'white', border: 'none', borderRadius: '10px', padding: '14px 28px', fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 500, cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(26,26,26,0.2)' }} onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}>
                      Open Daye
                    </button>
                    {!isPro && <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--color-muted)', margin: '12px 0 0' }}><a href="/pricing" style={{ color: 'var(--color-lavender)', textDecoration: 'none', fontWeight: 500 }}>Upgrade to Pro</a> · Unlock all features</p>}
                  </div>
                ) : (
                  <div className="hero-buttons" style={{ marginBottom: '16px' }}>
                    <button onClick={onStartDay} style={{ background: 'var(--color-ink)', color: 'white', border: 'none', borderRadius: '10px', padding: '14px 28px', fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 500, cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(26,26,26,0.2)' }} onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}>
                      Start free
                    </button>
                    <button onClick={scrollToHowItWorks} style={{ background: 'white', color: 'var(--color-ink)', border: '1px solid var(--color-border)', borderRadius: '10px', padding: '14px 28px', fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 400, cursor: 'pointer', transition: 'border-color 0.15s' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-border-dark)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border)'}>
                      See how it works
                    </button>
                  </div>
                )}
                {!navUser && <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--color-muted)', margin: 0 }}>Free to start · No credit card needed</p>}
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: '36px' }}>
          <div className="bounce-caret">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M5 9l6 6 6-6" stroke="var(--color-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </section>

      {/* ── PROBLEM ── */}
      <section style={{ background: 'white', position: 'relative', zIndex: 1 }} ref={problemRef}>
        <div className="landing-container landing-section" style={{ textAlign: 'center' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 className={`landing-h-section lp-reveal ${problemV ? 'visible' : ''}`} style={{ marginBottom: '24px' }}>
              You already know what needs doing. You just can't decide where to start.
            </h2>
            <p className={`lp-reveal lp-d1 ${problemV ? 'visible' : ''}`} style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', color: 'var(--color-muted)', lineHeight: 1.7, margin: 0 }}>
              Every morning you open your notes, your task list, your calendar — and still feel stuck. Not because you're lazy. Because deciding is hard, especially before your first coffee.
            </p>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="landing-how-it-works" style={{ background: 'var(--color-linen)', position: 'relative', zIndex: 1 }} ref={howRef}>
        <div className="landing-container landing-section">
          <p className={`lp-reveal ${howV ? 'visible' : ''}`} style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-muted)', textAlign: 'center', margin: '0 0 48px 0', fontWeight: 500 }}>How it works</p>
          <div className="landing-steps">
            {[
              { num: '01', title: 'Tell Daye how you feel', desc: "Your energy, your mood, your sleep. Three taps and Daye understands what kind of day you're actually having.", delay: 'lp-d1' },
              { num: '02', title: "Tell Daye what's on your plate", desc: 'Type a sentence or tap from your role-specific task list. Daye reads it and turns it into a structured plan.', delay: 'lp-d2' },
              { num: '03', title: 'Daye decides what matters', desc: 'Your personalised focus plan lands in seconds. Priorities ranked, time blocked, distractions named. Start your day with total clarity.', delay: 'lp-d3' },
            ].map((step) => (
              <div key={step.num} className={`lp-step lp-reveal ${step.delay} ${howV ? 'visible' : ''}`}>
                <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '64px', color: 'var(--color-border)', lineHeight: 1, marginBottom: '12px' }}>{step.num}</div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '22px', color: 'var(--color-ink)', fontWeight: 400, margin: '0 0 10px 0' }}>{step.title}</h3>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--color-muted)', lineHeight: 1.6, margin: 0 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHO IT'S FOR ── */}
      <section style={{ background: 'white', position: 'relative', zIndex: 1 }} ref={whoRef}>
        <div className="landing-container landing-section">
          <p className={`lp-reveal ${whoV ? 'visible' : ''}`} style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-muted)', textAlign: 'center', margin: '0 0 16px 0', fontWeight: 500 }}>Who it's for</p>
          <h2 className={`landing-h-section lp-reveal lp-d1 ${whoV ? 'visible' : ''}`} style={{ textAlign: 'center', margin: '0 0 48px 0' }}>Built for the way you actually work.</h2>
          <div className="landing-cards">
            {WHO_CARDS.map((card, i) => (
              <div key={card.type} className={`lp-who-card lp-reveal ${whoV ? 'visible' : ''}`} style={{ transitionDelay: `${0.1 + i * 0.08}s` }}>
                <style>{`.lp-who-card:nth-child(${i+1})::before { background: ${card.bg}; }`}</style>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: card.dot, flexShrink: 0 }} />
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 500, color: 'var(--color-ink)' }}>{card.type}</span>
                </div>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--color-muted)', lineHeight: 1.6, margin: '0 0 16px 0' }}>{card.desc}</p>
                <div style={{ borderTop: '0.5px solid var(--color-border)', paddingTop: '14px' }}>
                  {card.priorities.map((p) => (<p key={p} style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--color-muted)', margin: '0 0 4px 0' }}>· {p}</p>))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DEMO ── */}
      <DemoSection />

      {/* ── OUTPUT ── */}
      <section style={{ background: 'var(--color-linen)', position: 'relative', zIndex: 1 }} ref={outputRef}>
        <div className="landing-container landing-section">
          <p className={`lp-reveal ${outputV ? 'visible' : ''}`} style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-muted)', textAlign: 'center', margin: '0 0 16px 0', fontWeight: 500 }}>Your plan</p>
          <h2 className={`landing-h-section lp-reveal lp-d1 ${outputV ? 'visible' : ''}`} style={{ textAlign: 'center', margin: '0 0 48px 0' }}>This is what clarity looks like.</h2>
          <div className={`lp-reveal lp-d2 ${outputV ? 'visible' : ''}`} style={{ maxWidth: '480px', margin: '0 auto' }}>
            <MockPlanCard />
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <FAQSection />

      {/* ── CTA ── */}
      <section className="lp-cta-section" style={{ background: 'var(--color-ink)', padding: '100px 0', position: 'relative', zIndex: 1 }} ref={ctaRef}>
        <div className="landing-container" style={{ textAlign: 'center' }}>
          <h2 className={`lp-reveal ${ctaV ? 'visible' : ''}`} style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 300, color: 'white', lineHeight: 1.2, margin: '0 0 16px 0' }} className="landing-cta-headline">
            {navUser ? 'Your day is waiting.' : 'Ready to start your day with intention?'}
          </h2>
          <p className={`lp-reveal lp-d1 ${ctaV ? 'visible' : ''}`} style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', color: 'white', opacity: 0.6, margin: '0 0 40px 0' }}>
            {navUser ? (isPro ? "You're on Daye Pro. Open the app to build your plan." : 'Open the app and build your focus plan for today.') : "Join Daye. It takes 2 minutes and it's free."}
          </p>
          <button
            className={`lp-reveal lp-d2 ${ctaV ? 'visible' : ''}`}
            onClick={navUser ? onOpenApp : onStartDay}
            style={{ background: 'white', color: 'var(--color-ink)', border: 'none', borderRadius: '10px', padding: '16px 36px', fontFamily: 'var(--font-sans)', fontSize: '15px', fontWeight: 500, cursor: 'pointer', display: 'block', margin: '0 auto 24px', transition: 'transform 0.2s, box-shadow 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 32px rgba(0,0,0,0.2)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
          >
            {navUser ? 'Open Daye' : 'Start your day'}
          </button>
          <p className={`lp-reveal lp-d3 ${ctaV ? 'visible' : ''}`} style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'white', opacity: 0.4, margin: 0 }}>
            {navUser ? (isPro ? 'Daye Pro · All features unlocked' : 'withdaye.com · Free plan') : 'withdaye.com · Free forever · No credit card'}
          </p>
        </div>
      </section>

      <Footer />
    </div>
  )
}

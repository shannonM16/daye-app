import { useState, useEffect, useRef } from 'react'

// ── Demo animation constants ──────────────────────────────────────
const DEMO_TEXT = 'Also need to finish the Q2 report by 3pm'
const CHAR_MS = 38

function DStageLabel({ children }) {
  return (
    <p style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-muted)', margin: '0 0 6px 0', fontWeight: 500 }}>
      {children}
    </p>
  )
}

function DChip({ label, selected, animating }) {
  return (
    <span style={{
      display: 'inline-block', padding: '4px 10px', borderRadius: '20px',
      border: '0.5px solid',
      borderColor: selected ? 'var(--color-ink)' : 'var(--color-border)',
      background: selected ? 'var(--color-ink)' : 'white',
      color: selected ? 'white' : 'var(--color-ink)',
      fontFamily: 'var(--font-sans)', fontSize: '11px',
      transition: 'all 150ms ease',
      transform: animating ? 'scale(0.93)' : 'scale(1)',
      cursor: 'default',
    }}>{label}</span>
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

    const go = (ms, fn) => {
      const id = setTimeout(fn, ms)
      idsRef.current.push(id)
    }

    const runLoop = () => {
      idsRef.current.forEach(clearTimeout)
      idsRef.current = []
      setStage(0); setFadeIn(false); setSlider(1)
      setChipsOn([]); setChipsAnim([]); setTasksOn([]); setTasksAnim([]); setTypedText('')

      // Stage 0: greeting
      go(80,   () => setFadeIn(true))
      go(250,  () => setSlider(2))
      go(550,  () => setSlider(3))
      go(850,  () => setSlider(4))

      // → Stage 1
      go(2000, () => setFadeIn(false))
      go(2300, () => { setStage(1); setSlider(1) })
      go(2350, () => setFadeIn(true))

      // Stage 1 chips
      go(2750, () => { setChipsAnim(['focused']); setChipsOn(['focused']) })
      go(2950, () => setChipsAnim([]))
      go(3150, () => { setChipsAnim(['deep-work']); setChipsOn(['focused', 'deep-work']) })
      go(3350, () => setChipsAnim([]))
      go(3550, () => { setChipsAnim(['deadline']); setChipsOn(['focused', 'deep-work', 'deadline']) })
      go(3750, () => setChipsAnim([]))

      // → Stage 2
      go(4850, () => setFadeIn(false))
      go(5150, () => { setStage(2); setChipsOn([]); setTasksOn([]); setTypedText('') })
      go(5200, () => setFadeIn(true))

      // Stage 2 tasks
      go(5500, () => { setTasksAnim(['brief']); setTasksOn(['brief']) })
      go(5700, () => setTasksAnim([]))
      go(5800, () => { setTasksAnim(['stakeholder']); setTasksOn(['brief', 'stakeholder']) })
      go(6000, () => setTasksAnim([]))

      // Stage 2 typing — 40 chars × 38ms = 1520ms, ends at t≈7382ms
      for (let i = 0; i < DEMO_TEXT.length; i++) {
        const ch = DEMO_TEXT[i]
        go(5900 + i * CHAR_MS, () => setTypedText(t => t + ch))
      }

      // → Stage 3
      go(7920,  () => setFadeIn(false))
      go(8220,  () => { setStage(3); setTasksOn([]); setTypedText('') })
      go(8270,  () => setFadeIn(true))

      // → Stage 4
      go(9770,  () => setFadeIn(false))
      go(10070, () => setStage(4))
      go(10120, () => setFadeIn(true))

      // → Loop
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
      <div className="demo-phone-frame" style={{
        background: 'white', border: '0.5px solid var(--color-border)',
        borderRadius: '32px', overflow: 'hidden',
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)', position: 'relative', flexShrink: 0,
      }}>
        <div style={{
          position: 'absolute', inset: 0, padding: '28px 22px 22px',
          opacity: fadeIn ? 1 : 0, transition: 'opacity 280ms ease',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>

          {/* ── Stage 0: Greeting ── */}
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
                {[1,2,3,4,5].map(n => (
                  <span key={n} style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: slider === n ? 'var(--color-ink)' : 'var(--color-muted)', fontWeight: slider === n ? 500 : 400 }}>{n}</span>
                ))}
              </div>
            </div>
          )}

          {/* ── Stage 1: Check-in selections ── */}
          {stage === 1 && (
            <div>
              <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '16px', color: 'var(--color-ink)', fontWeight: 300 }}>daye</span>
              <div style={{ marginTop: '16px' }}>
                <DStageLabel>Mood</DStageLabel>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '14px' }}>
                  {['Focused','Anxious','Motivated','Flat','Stressed'].map(m => (
                    <DChip key={m} label={m} selected={m === 'Focused' && chipsOn.includes('focused')} animating={m === 'Focused' && chipsAnim.includes('focused')} />
                  ))}
                </div>
                <DStageLabel>Day type</DStageLabel>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '14px' }}>
                  {['Deep work','Lots of meetings','Low energy','Reactive'].map(m => (
                    <DChip key={m} label={m} selected={m === 'Deep work' && chipsOn.includes('deep-work')} animating={m === 'Deep work' && chipsAnim.includes('deep-work')} />
                  ))}
                </div>
                <DStageLabel>Pressure today</DStageLabel>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {['Deadline','Big presentation','None'].map(m => (
                    <DChip key={m} label={m} selected={m === 'Deadline' && chipsOn.includes('deadline')} animating={m === 'Deadline' && chipsAnim.includes('deadline')} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Stage 2: Task input ── */}
          {stage === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '14px', color: 'var(--color-muted)', fontWeight: 300, display: 'block', marginBottom: '6px' }}>daye</span>
              <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '20px', fontWeight: 300, color: 'var(--color-ink)', margin: '0 0 3px 0', lineHeight: 1.2 }}>What's on your plate, Alex?</p>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--color-muted)', margin: '0 0 14px 0' }}>Select your tasks for today.</p>
              <DStageLabel>Quick select</DStageLabel>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', marginBottom: '14px' }}>
                {[
                  { label: 'Write a brief', key: 'brief' },
                  { label: 'Draft copy', key: null },
                  { label: 'Stakeholder update', key: 'stakeholder' },
                  { label: 'Campaign review', key: null },
                  { label: 'Competitor research', key: null },
                  { label: 'Admin', key: null },
                ].map(({ label, key }) => (
                  <div key={label} style={{
                    padding: '7px 10px', borderRadius: '10px', border: '0.5px solid',
                    borderColor: key && tasksOn.includes(key) ? 'var(--color-ink)' : 'var(--color-border)',
                    background: key && tasksOn.includes(key) ? 'var(--color-ink)' : 'white',
                    color: key && tasksOn.includes(key) ? 'white' : 'var(--color-ink)',
                    fontFamily: 'var(--font-sans)', fontSize: '11px',
                    transition: 'all 150ms ease',
                    transform: key && tasksAnim.includes(key) ? 'scale(0.95)' : 'scale(1)',
                  }}>{label}</div>
                ))}
              </div>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-muted)', margin: '0 0 5px 0', fontWeight: 500 }}>Or describe your day</p>
              <div style={{
                flex: 1, minHeight: '52px',
                border: '0.5px solid var(--color-border)', borderRadius: '10px',
                padding: '8px 10px', fontFamily: 'var(--font-sans)', fontSize: '12px',
                color: 'var(--color-ink)', lineHeight: 1.5,
              }}>
                {typedText}<span style={{ animation: 'demoBlink 900ms infinite', opacity: 1 }}>|</span>
              </div>
            </div>
          )}

          {/* ── Stage 3: Loading ── */}
          {stage === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '0' }}>
              <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '30px', color: 'var(--color-ink)', fontWeight: 300, display: 'block', marginBottom: '20px' }}>daye</span>
              <div style={{ width: '48px', height: '3px', borderRadius: '2px', background: 'var(--color-lavender)', animation: 'demoPulse 1.2s ease infinite', marginBottom: '20px' }} />
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--color-muted)', margin: 0 }}>Building your plan...</p>
            </div>
          )}

          {/* ── Stage 4: Plan output ── */}
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
                {[
                  { bar: 'var(--color-ink)', title: 'Finish the Q2 report', sub: 'Deadline today · Do this first' },
                  { bar: 'var(--color-lavender)', title: 'Write the campaign brief', sub: 'High value · Morning block' },
                ].map((p, i) => (
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

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true) },
      { threshold: 0.25 }
    )
    if (phoneRef.current) observer.observe(phoneRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section style={{ background: 'var(--color-linen)', padding: 'clamp(48px,8vw,80px) 0' }}>
      <div className="landing-container">
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-muted)', textAlign: 'center', margin: '0 0 16px 0', fontWeight: 500 }}>See it in action</p>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '36px', fontWeight: 300, color: 'var(--color-ink)', textAlign: 'center', margin: '0 0 12px 0', lineHeight: 1.2 }}>Sixty seconds to clarity.</h2>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', color: 'var(--color-muted)', textAlign: 'center', maxWidth: '480px', margin: '0 auto 48px', lineHeight: 1.6 }}>This is what a typical morning with Daye looks like.</p>
        <div ref={phoneRef} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <DemoPhone started={started} replayKey={replayKey} />
          <button
            onClick={() => { setReplayKey(k => k + 1); setStarted(true) }}
            style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--color-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '16px 0 6px', display: 'flex', alignItems: 'center', gap: '5px' }}
          >
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
  { q: 'Is Daye free to use?', a: 'Yes — Daye is free to get started. You get a full daily focus plan every morning, 7-day history, and all four user journeys. We will be introducing Daye Pro in the future with advanced features like full AI personalisation, calendar sync, and weekly insights. Early users will get a special rate.' },
  { q: 'How is this different from a to-do list or Notion?', a: 'Notion and to-do lists store everything you might do. Daye decides what you should do today based on who you are, how you feel, and what actually matters. It is a decision, not a list. You open it in the morning and close it with a clear mandate — not more things to organise.' },
  { q: 'Does it work on my phone?', a: 'Yes — Daye is designed mobile-first and works beautifully on iPhone and Android in your browser. You can add it to your home screen for a native app feel. A dedicated App Store app is coming soon.' },
  { q: 'How does the AI part work?', a: 'When you build your plan, Daye sends your profile, energy level, mood, and tasks to Claude — a leading AI model — which generates a personalised plan written specifically for you. It reads your role, your goal, and your current state to decide what matters most today. Each plan is unique.' },
  { q: 'Is my data private?', a: 'Your data is stored locally on your device and used only to generate your daily plan. We do not sell your data or show you ads. The only external service your information touches is the AI model that generates your plan, and only the details relevant to planning are sent.' },
  { q: 'How long does it take each morning?', a: 'Under 60 seconds for most people. Three taps for your energy and mood, select your tasks or type a sentence, and your plan is ready. The goal is to make the decision faster than thinking about it yourself.' },
  { q: 'Can I change my profile later?', a: 'Yes — tap the profile icon on your home screen to update your role, goals, blockers or any other details at any time. Your plan gets smarter the more accurately your profile reflects your real situation.' },
  { q: 'What if the plan does not feel right?', a: 'You can go back and adjust your inputs at any time. The plan is a starting point — you know your day better than any AI. Use it as a guide, not a rule. We are always improving the AI based on feedback.' },
]

function FAQItem({ item, open, onToggle }) {
  return (
    <div style={{ borderBottom: '0.5px solid var(--color-border)' }}>
      <button
        onClick={onToggle}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
      >
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
  return (
    <section style={{ background: 'white', padding: 'clamp(48px,8vw,80px) 0' }}>
      <div className="landing-container">
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-muted)', textAlign: 'center', margin: '0 0 12px 0', fontWeight: 500 }}>Questions</p>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '36px', fontWeight: 300, color: 'var(--color-ink)', textAlign: 'center', margin: '0 0 48px 0', lineHeight: 1.2 }}>Everything you need to know.</h2>
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
    <div style={{
      background: 'white',
      border: '0.5px solid var(--color-border)',
      borderRadius: '16px',
      padding: '32px',
    }}>
      {/* Wordmark + date */}
      <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '16px', color: 'var(--color-ink)', fontWeight: 300, display: 'block', marginBottom: '4px' }}>daye</span>
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-muted)', margin: '0 0 8px 0' }}>
        Monday · Focus day
      </p>
      <h3 style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '28px', fontWeight: 300, color: 'var(--color-ink)', margin: '0 0 24px 0', lineHeight: 1.2 }}>
        Shannon's plan.
      </h3>

      {/* Focus On */}
      <div style={{ marginBottom: '20px' }}>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-muted)', margin: '0 0 10px 0', fontWeight: 500 }}>
          Focus on
        </p>
        {[
          { color: 'var(--color-ink)', title: 'Finish the Q2 campaign brief', sub: 'Most important · Do this first' },
          { color: 'var(--color-lavender)', title: 'Prep for manager 1:1', sub: 'Career move · High value' },
        ].map((p, i) => (
          <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '10px', alignItems: 'stretch' }}>
            <div style={{ width: '3px', borderRadius: '2px', background: p.color, flexShrink: 0 }} />
            <div>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--color-ink)', fontWeight: 500, margin: '0 0 2px 0' }}>{p.title}</p>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--color-muted)', margin: 0 }}>{p.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Time Split */}
      <div style={{ marginBottom: '20px' }}>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-muted)', margin: '0 0 10px 0', fontWeight: 500 }}>
          Time split
        </p>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { label: '9–11am', task: 'Campaign brief' },
            { label: '11–12pm', task: '1:1 prep' },
            { label: 'Afternoon', task: 'Clear comms' },
          ].map((block) => (
            <div key={block.label} style={{ flex: 1, background: 'var(--color-linen)', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', color: 'var(--color-muted)', margin: '0 0 2px 0' }}>{block.label}</p>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--color-ink)', fontWeight: 500, margin: 0 }}>{block.task}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Avoid Today */}
      <div style={{ marginBottom: '20px' }}>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-muted)', margin: '0 0 10px 0', fontWeight: 500 }}>
          Avoid today
        </p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['Non-urgent Slack', 'Unplanned calls'].map((item) => (
            <span key={item} style={{ background: 'var(--color-linen)', borderRadius: '20px', padding: '5px 12px', fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--color-muted)' }}>
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Why + Goal */}
      <div style={{ borderTop: '0.5px solid var(--color-border)', paddingTop: '16px' }}>
        <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '14px', color: 'var(--color-muted)', lineHeight: 1.5, margin: '0 0 8px 0' }}>
          "Your energy is high and you have a deadline — use the morning hard."
        </p>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--color-muted)', margin: 0 }}>
          Today moves you toward:{' '}
          <span style={{ fontWeight: 500, color: 'var(--color-ink)' }}>getting promoted</span>
        </p>
      </div>
    </div>
  )
}

export default function Landing({ onStartDay, onSignIn }) {
  const scrollToHowItWorks = () => {
    document.getElementById('landing-how-it-works')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div style={{ height: '100dvh', overflowY: 'auto', background: 'var(--color-linen)' }}>

      {/* ── Fixed nav (desktop only) ─────────────────────────── */}
      <nav className="landing-nav">
        <div className="landing-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%' }}>
          <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '20px', color: 'var(--color-ink)', fontWeight: 300 }}>daye</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={onSignIn}
              style={{ background: 'none', border: 'none', fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--color-muted)', cursor: 'pointer', padding: 0 }}
            >
              Sign in
            </button>
            <div style={{ width: '1px', height: '20px', background: 'var(--color-border)', flexShrink: 0 }} />
            <button
              onClick={onStartDay}
              style={{ background: 'var(--color-ink)', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 20px', fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}
            >
              Start free
            </button>
          </div>
        </div>
      </nav>

      {/* ── SECTION 1: HERO ──────────────────────────────────── */}
      <section style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <div className="landing-container" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

          {/* Mobile wordmark */}
          <div className="landing-mobile-only" style={{ paddingTop: '28px' }}>
            <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '18px', color: 'var(--color-ink)', fontWeight: 300 }}>daye</span>
          </div>

          {/* Desktop nav spacer */}
          <div className="landing-desktop-only" style={{ height: '80px' }} />

          {/* Centre content */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            <div>
              <p className="hero-anim hero-anim-delay-0" style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-muted)', margin: '0 0 20px 0', fontWeight: 500 }}>
                Your daily focus companion
              </p>

              <h1 style={{ margin: '0 0 24px 0', padding: 0, lineHeight: 1 }}>
                <span className="hero-anim hero-anim-delay-1 hero-headline-text" style={{ display: 'block', fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 300, color: 'var(--color-ink)', lineHeight: 1.1 }}>
                  Not a list.
                </span>
                <span className="hero-anim hero-anim-delay-2 hero-headline-text" style={{ display: 'block', fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 300, color: 'var(--color-ink)', lineHeight: 1.1 }}>
                  A decision.
                </span>
              </h1>

              <p className="hero-anim hero-anim-delay-3" style={{ fontFamily: 'var(--font-sans)', fontSize: '16px', fontWeight: 300, color: 'var(--color-muted)', maxWidth: '480px', lineHeight: 1.6, margin: '0 0 32px 0' }}>
                Every morning, Daye reads your energy, your goals, and your day — then tells you exactly what to focus on.
              </p>

              <div className="hero-anim hero-anim-delay-4">
                <div className="hero-buttons" style={{ marginBottom: '16px' }}>
                  <button
                    onClick={onStartDay}
                    style={{ background: 'var(--color-ink)', color: 'white', border: 'none', borderRadius: '10px', padding: '14px 28px', fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 500, cursor: 'pointer', transition: 'opacity 0.15s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85' }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
                  >
                    Start your day
                  </button>
                  <button
                    onClick={scrollToHowItWorks}
                    style={{ background: 'white', color: 'var(--color-ink)', border: '1px solid var(--color-border)', borderRadius: '10px', padding: '14px 28px', fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 400, cursor: 'pointer', transition: 'border-color 0.15s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-border-dark)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)' }}
                  >
                    See how it works
                  </button>
                </div>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--color-muted)', margin: 0 }}>
                  Free to start · No credit card needed
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: '36px' }}>
          <div className="bounce-caret">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M5 9l6 6 6-6" stroke="var(--color-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: THE PROBLEM ───────────────────────────── */}
      <section style={{ background: 'white' }}>
        <div className="landing-container landing-section" style={{ textAlign: 'center' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 className="landing-h-section" style={{ marginBottom: '24px' }}>
              You already know what needs doing. You just can't decide where to start.
            </h2>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', color: 'var(--color-muted)', lineHeight: 1.7, margin: 0 }}>
              Every morning you open your notes, your task list, your calendar — and still feel stuck. Not because you're lazy. Because deciding is hard, especially before your first coffee.
            </p>
          </div>
        </div>
      </section>

      {/* ── SECTION 3: HOW IT WORKS ──────────────────────────── */}
      <section id="landing-how-it-works" style={{ background: 'var(--color-linen)' }}>
        <div className="landing-container landing-section">
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-muted)', textAlign: 'center', margin: '0 0 48px 0', fontWeight: 500 }}>
            How it works
          </p>
          <div className="landing-steps">
            {[
              {
                num: '01',
                title: 'Tell Daye how you feel',
                desc: "Your energy, your mood, your sleep. Three taps and Daye understands what kind of day you're actually having.",
              },
              {
                num: '02',
                title: "Tell Daye what's on your plate",
                desc: 'Type a sentence or tap from your role-specific task list. Daye reads it and turns it into a structured plan.',
              },
              {
                num: '03',
                title: 'Daye decides what matters',
                desc: 'Your personalised focus plan lands in seconds. Priorities ranked, time blocked, distractions named. Start your day with total clarity.',
              },
            ].map((step) => (
              <div key={step.num} style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '64px', color: 'var(--color-border)', lineHeight: 1, marginBottom: '12px' }}>
                  {step.num}
                </div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '22px', color: 'var(--color-ink)', fontWeight: 400, margin: '0 0 10px 0' }}>
                  {step.title}
                </h3>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--color-muted)', lineHeight: 1.6, margin: 0 }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 4: WHO IT'S FOR ───────────────────────────── */}
      <section style={{ background: 'white' }}>
        <div className="landing-container landing-section">
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-muted)', textAlign: 'center', margin: '0 0 16px 0', fontWeight: 500 }}>
            Who it's for
          </p>
          <h2 className="landing-h-section" style={{ textAlign: 'center', margin: '0 0 48px 0' }}>
            Built for the way you actually work.
          </h2>
          <div className="landing-cards">
            {[
              {
                dot: 'var(--color-ink)',
                type: 'Corporate',
                desc: 'For professionals navigating deadlines, politics, and the push for the next level.',
                priorities: ['Finish the stakeholder presentation', 'Clear the urgent inbox'],
              },
              {
                dot: 'var(--color-lavender)',
                type: 'Self-employed',
                desc: 'For founders and freelancers juggling client work, cashflow, and growth.',
                priorities: ['Chase the overdue invoice', 'Send two new proposals'],
              },
              {
                dot: 'var(--color-blush)',
                type: 'Student',
                desc: 'For students managing assignments, exams, and the pressure to perform.',
                priorities: ['Two hours of focused revision', "Review yesterday's notes"],
              },
              {
                dot: 'var(--color-sage)',
                type: 'Figuring it out',
                desc: 'For anyone between chapters, exploring what comes next.',
                priorities: ['Research one new direction', 'Reach out to one person'],
              },
            ].map((card) => (
              <div key={card.type} style={{ background: 'white', border: '0.5px solid var(--color-border)', borderRadius: '16px', padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: card.dot, flexShrink: 0 }} />
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 500, color: 'var(--color-ink)' }}>{card.type}</span>
                </div>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--color-muted)', lineHeight: 1.6, margin: '0 0 16px 0' }}>
                  {card.desc}
                </p>
                <div style={{ borderTop: '0.5px solid var(--color-border)', paddingTop: '14px' }}>
                  {card.priorities.map((p) => (
                    <p key={p} style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--color-muted)', margin: '0 0 4px 0' }}>
                      · {p}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 5: INTERACTIVE DEMO ─────────────────────── */}
      <DemoSection />

      {/* ── SECTION 6: THE OUTPUT ────────────────────────────── */}
      <section style={{ background: 'var(--color-linen)' }}>
        <div className="landing-container landing-section">
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-muted)', textAlign: 'center', margin: '0 0 16px 0', fontWeight: 500 }}>
            Your plan
          </p>
          <h2 className="landing-h-section" style={{ textAlign: 'center', margin: '0 0 48px 0' }}>
            This is what clarity looks like.
          </h2>
          <div style={{ maxWidth: '480px', margin: '0 auto' }}>
            <MockPlanCard />
          </div>
        </div>
      </section>

      {/* ── SECTION 7: FAQ ───────────────────────────────────── */}
      <FAQSection />

      {/* ── SECTION 8: CTA ───────────────────────────────────── */}
      <section style={{ background: 'var(--color-ink)', padding: '100px 0' }}>
        <div className="landing-container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 300, color: 'white', lineHeight: 1.2, margin: '0 0 16px 0' }} className="landing-cta-headline">
            Ready to start your day with intention?
          </h2>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', color: 'white', opacity: 0.6, margin: '0 0 40px 0' }}>
            Join Daye. It takes 2 minutes and it's free.
          </p>
          <button
            onClick={onStartDay}
            style={{ background: 'white', color: 'var(--color-ink)', border: 'none', borderRadius: '10px', padding: '16px 36px', fontFamily: 'var(--font-sans)', fontSize: '15px', fontWeight: 500, cursor: 'pointer', display: 'block', margin: '0 auto 24px', transition: 'opacity 0.15s' }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9' }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
          >
            Start your day
          </button>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'white', opacity: 0.4, margin: 0 }}>
            withdaye.com · Free forever · No credit card
          </p>
        </div>
      </section>

    </div>
  )
}

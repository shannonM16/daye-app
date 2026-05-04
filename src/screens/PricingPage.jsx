import { useState } from 'react'

const LAVENDER = '#c9b8d8'
const BLUSH = '#e8d5c4'
const SAGE = '#b8c9c4'
const INK = '#1a1a1a'
const LINEN = '#f9f7f5'
const LINEN_DARK = '#f0ede8'
const MUTED = '#8a8480'
const BORDER = '#e2ddd8'

const PRICE_MONTHLY = 'price_1TTRgF2LFIh1ZwramSLMYfSK'
const PRICE_ANNUAL = 'price_1TTRga2LFIh1Zwra08LHcdn9'

function Check({ color = INK }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: '2px' }}>
      <path d="M2.5 7L5.5 10L11.5 4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function FeatureItem({ children, accent = false }) {
  return (
    <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontFamily: 'var(--font-sans)', fontSize: '14px', color: INK, lineHeight: 1.5, listStyle: 'none', padding: 0 }}>
      <Check color={accent ? LAVENDER : MUTED} />
      <span>{children}</span>
    </li>
  )
}

function MockLetter() {
  return (
    <div style={{
      background: LINEN,
      borderRadius: '16px',
      padding: '40px 44px',
      maxWidth: '560px',
      margin: '0 auto',
      border: `0.5px solid ${BORDER}`,
      boxShadow: '0 8px 40px rgba(26,26,26,0.06)',
    }}>
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.12em', color: MUTED, margin: '0 0 28px 0', fontWeight: 500 }}>
        Q1 · January – March
      </p>
      <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '22px', fontWeight: 300, color: INK, lineHeight: 1.5, margin: '0 0 20px 0' }}>
        Dear Shannon,
      </p>
      <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '18px', fontWeight: 300, color: INK, lineHeight: 1.7, margin: '0 0 16px 0' }}>
        this quarter you did something worth noting. You showed up — not perfectly, but consistently. On your low-energy mornings you still opened Daye. You finished the project you'd been circling for weeks.
      </p>
      <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '18px', fontWeight: 300, color: INK, lineHeight: 1.7, margin: '0 0 16px 0' }}>
        Your most focused days were Tuesdays and Wednesday mornings. Your energy peaked mid-month. You logged 47 tasks completed, and your most frequent word in reflections was <em>"finally."</em>
      </p>
      <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '18px', fontWeight: 300, color: INK, lineHeight: 1.7, margin: '0 0 32px 0' }}>
        That's not nothing. That's a quarter well spent.
      </p>
      <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '16px', fontWeight: 300, color: MUTED, margin: 0 }}>
        — Daye
      </p>
      <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: `0.5px solid ${BORDER}`, display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        {[['47', 'tasks completed'], ['12', 'high-energy days'], ['11', 'week streak']].map(([num, label]) => (
          <div key={label}>
            <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '28px', fontWeight: 300, color: INK, margin: '0 0 2px 0', lineHeight: 1 }}>{num}</p>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: MUTED, margin: 0, letterSpacing: '0.05em' }}>{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function MockYearCard() {
  const days = [
    { fill: 0.9 }, { fill: 1 }, { fill: 0.7 },
    { fill: 0.5 }, { fill: 0.85 }, { fill: 0.3 }, { fill: 0.2 },
  ]

  return (
    <div style={{
      background: '#1a1a1a',
      borderRadius: '20px',
      padding: '40px 44px',
      maxWidth: '560px',
      margin: '0 auto',
      boxShadow: '0 0 0 1px rgba(201,184,216,0.18), 0 20px 80px rgba(26,26,26,0.3), 0 0 100px rgba(201,184,216,0.06)',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Lavender radial glow top-right */}
      <div style={{
        position: 'absolute', top: '-100px', right: '-80px',
        width: '320px', height: '320px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(201,184,216,0.14) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
        <div>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.35)', margin: '0 0 10px 0', fontWeight: 500 }}>
            Q1 2025 · Year in Focus
          </p>
          <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '28px', fontWeight: 300, color: 'white', margin: 0, lineHeight: 1 }}>Shannon</p>
        </div>
        <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '20px', color: 'rgba(201,184,216,0.55)', fontWeight: 300 }}>daye</span>
      </div>

      {/* Decorative lavender accent line */}
      <div style={{ width: '52px', height: '1.5px', background: `linear-gradient(90deg, ${LAVENDER}, transparent)`, marginTop: '20px', marginBottom: '28px' }} />

      {/* Focus heatmap bars */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '28px', alignItems: 'flex-end', height: '56px' }}>
        {Array.from({ length: 13 }, (_, w) =>
          days.map((d, di) => {
            const fill = d.fill * (0.6 + Math.sin(w * 0.8 + di) * 0.4)
            const height = Math.max(6, fill * 50)
            return (
              <div
                key={`${w}-${di}`}
                style={{
                  flex: 1,
                  height: `${height}px`,
                  borderRadius: '3px',
                  background: fill > 0.75 ? LAVENDER : fill > 0.45 ? `rgba(201,184,216,0.42)` : `rgba(255,255,255,0.08)`,
                  alignSelf: 'flex-end',
                }}
              />
            )
          })
        )}
      </div>

      {/* Primary stats — 4 columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px', marginBottom: '10px' }}>
        {[
          ['83', 'days used'],
          ['47', 'tasks done'],
          ['11', 'day streak'],
          ['Tue', 'best focus day'],
        ].map(([val, label]) => (
          <div key={label} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '14px 12px' }}>
            <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '24px', fontWeight: 300, color: 'white', margin: '0 0 5px 0', lineHeight: 1 }}>{val}</p>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', color: 'rgba(255,255,255,0.38)', margin: 0, letterSpacing: '0.06em', textTransform: 'uppercase', lineHeight: 1.3 }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Secondary stats — lavender tinted, 3 columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '28px' }}>
        {[
          ['Deep work', 'most used day type'],
          ['Focused', 'top energy level'],
          ['Build something', 'top goal worked on'],
        ].map(([val, label]) => (
          <div key={label} style={{ background: 'rgba(201,184,216,0.07)', border: '0.5px solid rgba(201,184,216,0.18)', borderRadius: '10px', padding: '13px 12px' }}>
            <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '13px', fontWeight: 300, color: 'rgba(255,255,255,0.82)', margin: '0 0 5px 0', lineHeight: 1.25 }}>{val}</p>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', color: 'rgba(201,184,216,0.5)', margin: 0, letterSpacing: '0.06em', textTransform: 'uppercase', lineHeight: 1.3 }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Gradient divider */}
      <div style={{ height: '0.5px', background: `linear-gradient(90deg, rgba(201,184,216,0.45) 0%, transparent 80%)`, marginBottom: '22px' }} />

      {/* Quote */}
      <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '14px', fontWeight: 300, color: 'rgba(255,255,255,0.42)', margin: 0, lineHeight: 1.65 }}>
        "Your most common reflection word was <em style={{ color: LAVENDER, fontStyle: 'normal' }}>finally</em>. That says everything."
      </p>
    </div>
  )
}

export default function PricingPage({ onStartDay, onSignIn }) {
  const [billing, setBilling] = useState('monthly')
  const [loading, setLoading] = useState(false)

  async function handleCheckout() {
    setLoading(true)
    try {
      const priceId = billing === 'annual' ? PRICE_ANNUAL : PRICE_MONTHLY
      const userId = localStorage.getItem('daye_user_id')
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, userId }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setLoading(false)
      }
    } catch {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100dvh', background: LINEN, overflowX: 'hidden' }}>

      {/* ── Nav ────────────────────────────────────────────────── */}
      <nav className="landing-nav" style={{ background: LINEN, borderBottom: `0.5px solid ${BORDER}` }}>
        <div className="landing-container" style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <a href="/" style={{ textDecoration: 'none', marginRight: 'auto', paddingRight: '48px' }}>
            <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '20px', color: INK, fontWeight: 300 }}>daye</span>
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <a href="/blog" style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: MUTED, textDecoration: 'none' }}>Blog</a>
            <a href="/pricing" style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: LAVENDER, textDecoration: 'none', fontWeight: 600, borderBottom: `1.5px solid rgba(201,184,216,0.5)`, paddingBottom: '1px' }}>Pro</a>
            <button
              onClick={onSignIn}
              style={{ background: 'none', border: 'none', fontFamily: 'var(--font-sans)', fontSize: '13px', color: INK, cursor: 'pointer', padding: 0 }}
            >
              Sign in
            </button>
            <div style={{ width: '1px', height: '20px', background: BORDER, flexShrink: 0 }} />
            <button
              onClick={onStartDay}
              style={{ background: INK, color: 'white', border: 'none', borderRadius: '8px', padding: '8px 20px', fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}
            >
              Start free
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile nav spacer */}
      <div className="landing-mobile-only" style={{ height: '0px' }} />
      <div className="landing-desktop-only" style={{ height: '56px' }} />

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section style={{ padding: '80px 0 64px', textAlign: 'center' }}>
        <div className="landing-container">
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: MUTED, margin: '0 0 24px 0', fontWeight: 500 }}>
            Pricing
          </p>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 300, fontSize: 'clamp(40px, 7vw, 72px)', color: INK, lineHeight: 1.1, margin: '0 0 24px 0' }}>
            The app that knows you.
          </h1>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '17px', color: MUTED, maxWidth: '480px', margin: '0 auto', lineHeight: 1.65 }}>
            Daye learns how you work, reflects it back to you, and grows with you over time.
          </p>
        </div>
      </section>

      {/* ── Pricing cards ──────────────────────────────────────── */}
      <section style={{ padding: '0 0 80px' }}>
        <div className="landing-container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px',
            maxWidth: '780px',
            margin: '0 auto',
          }}>

            {/* FREE CARD */}
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '36px 32px',
              border: `0.5px solid ${BORDER}`,
              display: 'flex',
              flexDirection: 'column',
            }}>
              <div style={{ marginBottom: '28px' }}>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: MUTED, margin: '0 0 16px 0', fontWeight: 600 }}>
                  Daye
                </p>
                <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '32px', fontWeight: 300, color: INK, margin: '0 0 8px 0', lineHeight: 1 }}>
                  Free, always
                </p>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: MUTED, margin: 0, lineHeight: 1.5 }}>
                  Everything you need to focus every day
                </p>
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                <FeatureItem>Daily AI focus plan</FeatureItem>
                <FeatureItem>Four personalised user paths</FeatureItem>
                <FeatureItem>Daily check-in — energy, mood, sleep</FeatureItem>
                <FeatureItem>Smart timer mapped to your meetings</FeatureItem>
                <FeatureItem>7-day history</FeatureItem>
                <FeatureItem>End of day reflection</FeatureItem>
                <FeatureItem>Carry-over from yesterday</FeatureItem>
              </ul>

              <button
                style={{
                  width: '100%',
                  background: INK,
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '14px 24px',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  letterSpacing: '0.01em',
                }}
              >
                Start free
              </button>
            </div>

            {/* PRO CARD */}
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '36px 32px',
              border: `1.5px solid ${LAVENDER}`,
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              boxShadow: `0 8px 40px rgba(201,184,216,0.2)`,
            }}>
              {/* Most popular badge */}
              <div style={{
                position: 'absolute',
                top: '-13px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: LAVENDER,
                color: INK,
                fontFamily: 'var(--font-sans)',
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                padding: '4px 14px',
                borderRadius: '20px',
                whiteSpace: 'nowrap',
              }}>
                Most popular
              </div>

              <div style={{ marginBottom: '28px' }}>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: LAVENDER, margin: '0 0 16px 0', fontWeight: 600 }}>
                  Daye Pro
                </p>

                {/* Billing toggle */}
                <div style={{ display: 'flex', background: LINEN_DARK, borderRadius: '8px', padding: '3px', marginBottom: '16px', width: 'fit-content', gap: '2px' }}>
                  {[['monthly', 'Monthly'], ['annual', 'Annual']].map(([value, label]) => (
                    <button
                      key={value}
                      onClick={() => setBilling(value)}
                      style={{
                        background: billing === value ? 'white' : 'transparent',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '5px 14px',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '12px',
                        fontWeight: billing === value ? 600 : 400,
                        color: billing === value ? INK : MUTED,
                        cursor: 'pointer',
                        boxShadow: billing === value ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {label}
                      {value === 'annual' && billing !== 'annual' && (
                        <span style={{ background: SAGE, borderRadius: '4px', padding: '1px 5px', fontSize: '9px', fontWeight: 600, color: INK, letterSpacing: '0.04em' }}>
                          –35%
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '32px', fontWeight: 300, color: INK, margin: '0 0 4px 0', lineHeight: 1 }}>
                  {billing === 'annual' ? '£39/year' : '£4.99/month'}
                </p>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: MUTED, margin: '0 0 12px 0' }}>
                  {billing === 'annual' ? 'Save 35% vs monthly' : 'or £39/year — save 35%'}
                </p>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: MUTED, margin: 0, lineHeight: 1.5 }}>
                  For people who want Daye to truly know them
                </p>
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                <FeatureItem accent>Everything in free</FeatureItem>
                <FeatureItem accent>The Letter — a personal AI letter every quarter written from your actual data</FeatureItem>
                <FeatureItem accent>The Year in Focus — your quarterly shareable card, like Spotify Wrapped for your working life</FeatureItem>
                <FeatureItem accent>The Focus Film — your year as a scrollable visual story, one card per day</FeatureItem>
                <FeatureItem accent>Morning insight — one personalised sentence every morning based on yesterday</FeatureItem>
                <FeatureItem accent>Pattern nudges — "You always focus better on Tuesdays. Today's Tuesday."</FeatureItem>
                <FeatureItem accent>The Achievement Shelf — poetic objects collected for meaningful milestones</FeatureItem>
                <FeatureItem accent>Day streak with meaning — milestone messages that feel human not gamey</FeatureItem>
                <FeatureItem accent>30-day history</FeatureItem>
                <FeatureItem accent>Weekly insight email every Sunday</FeatureItem>
                <FeatureItem accent>Priority support</FeatureItem>
              </ul>

              <button
                onClick={handleCheckout}
                disabled={loading}
                style={{
                  width: '100%',
                  background: LAVENDER,
                  color: INK,
                  border: 'none',
                  borderRadius: '10px',
                  padding: '14px 24px',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: loading ? 'default' : 'pointer',
                  letterSpacing: '0.01em',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? 'Redirecting…' : 'Start Pro free for 7 days'}
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* ── The Letter ─────────────────────────────────────────── */}
      <section style={{ padding: '80px 0', background: 'white', borderTop: `0.5px solid ${BORDER}`, borderBottom: `0.5px solid ${BORDER}` }}>
        <div className="landing-container">
          <div style={{ maxWidth: '680px', margin: '0 auto 48px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: MUTED, margin: '0 0 20px 0', fontWeight: 500 }}>
              Pro feature
            </p>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 300, fontSize: 'clamp(36px, 5vw, 56px)', color: INK, lineHeight: 1.1, margin: '0 0 24px 0' }}>
              The Letter.
            </h2>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '16px', color: MUTED, lineHeight: 1.7, margin: 0 }}>
              Every quarter, Daye reads your data — your tasks, your energy, your goals, your reflections — and writes you a personal letter. Not a report. A letter. Addressed to you. About your actual life.
            </p>
          </div>
          <MockLetter />
        </div>
      </section>

      {/* ── The Year in Focus ──────────────────────────────────── */}
      <section style={{ padding: '80px 0' }}>
        <div className="landing-container">
          <div style={{ maxWidth: '680px', margin: '0 auto 48px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: MUTED, margin: '0 0 20px 0', fontWeight: 500 }}>
              Pro feature
            </p>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 300, fontSize: 'clamp(36px, 5vw, 56px)', color: INK, lineHeight: 1.1, margin: '0 0 24px 0' }}>
              The Year in Focus.
            </h2>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '16px', color: MUTED, lineHeight: 1.7, margin: 0 }}>
              At the end of each quarter, Daye generates a beautiful summary card. Your most focused days. Your biggest wins. The tasks that mattered. A story of how you showed up — shareable, beautiful, yours.
            </p>
          </div>
          <MockYearCard />
        </div>
      </section>

      {/* ── Footer line ────────────────────────────────────────── */}
      <div style={{ borderTop: `0.5px solid ${BORDER}`, padding: '32px 0', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: MUTED, margin: 0 }}>
          No credit card needed to start. Cancel anytime.
        </p>
      </div>

    </div>
  )
}

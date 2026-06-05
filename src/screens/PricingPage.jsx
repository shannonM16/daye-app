import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import NavAuthButton from '../components/NavAuthButton'
import { trackProUpgradeClicked } from '../lib/loops'
import Footer from '../components/Footer'

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

// ── Global styles injected once ───────────────────────────────────
const GLOBAL_CSS = `
  .pricing-grain::before {
    content: '';
    position: fixed; inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
    background-size: 200px 200px;
    pointer-events: none; z-index: 900; opacity: 0.65;
  }
  .pp-blob {
    position: fixed; border-radius: 50%; filter: blur(90px);
    pointer-events: none; z-index: 0;
  }
  .pp-blob-1 {
    width: 520px; height: 520px;
    background: radial-gradient(circle, rgba(201,184,216,0.13) 0%, transparent 70%);
    top: -120px; right: -120px;
    animation: ppb1 16s ease-in-out infinite;
  }
  .pp-blob-2 {
    width: 360px; height: 360px;
    background: radial-gradient(circle, rgba(232,213,204,0.11) 0%, transparent 70%);
    bottom: 80px; left: -60px;
    animation: ppb2 20s ease-in-out infinite;
  }
  @keyframes ppb1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-24px,20px)} }
  @keyframes ppb2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(20px,-24px)} }

  .pp-reveal {
    opacity: 0; transform: translateY(28px);
    transition: opacity 0.8s ease, transform 0.8s ease;
  }
  .pp-reveal.visible { opacity: 1; transform: translateY(0); }
  .pp-reveal.d1 { transition-delay: 0.1s; }
  .pp-reveal.d2 { transition-delay: 0.2s; }
  .pp-reveal.d3 { transition-delay: 0.3s; }

  .plan-card-hover {
    transition: transform 0.32s ease, box-shadow 0.32s ease;
  }
  .plan-card-hover:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 48px rgba(26,26,26,0.1) !important;
  }
  .plan-card-pro-hover {
    transition: transform 0.32s ease, box-shadow 0.32s ease;
  }
  .plan-card-pro-hover:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 56px rgba(201,184,216,0.32) !important;
  }

  .pp-toggle-btn {
    background: transparent; border: none; border-radius: 6px;
    padding: 5px 14px;
    font-family: var(--font-sans); font-size: 12px;
    cursor: pointer;
    display: flex; align-items: center; gap: 6px;
    white-space: nowrap;
    transition: background 0.2s, color 0.2s;
  }

  .mock-letter-wrap {
    transition: transform 0.4s ease, box-shadow 0.4s ease;
  }
  .mock-letter-wrap:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 64px rgba(26,26,26,0.1) !important;
  }
  .mock-year-wrap {
    transition: transform 0.4s ease;
  }
  .mock-year-wrap:hover {
    transform: translateY(-5px);
  }

  @media(max-width:640px){
    .pp-blob-1, .pp-blob-2 { display: none; }
  }
`

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
  const [ref, v] = useReveal(0.1)
  return (
    <div ref={ref} className={`mock-letter-wrap pp-reveal ${v ? 'visible' : ''}`} style={{
      background: LINEN,
      borderRadius: '20px',
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
  const [ref, v] = useReveal(0.1)
  const days = [
    { fill: 0.9 }, { fill: 1 }, { fill: 0.7 },
    { fill: 0.5 }, { fill: 0.85 }, { fill: 0.3 }, { fill: 0.2 },
  ]

  return (
    <div ref={ref} className={`mock-year-wrap pp-reveal ${v ? 'visible' : ''}`} style={{
      background: '#1a1a1a',
      borderRadius: '20px',
      padding: '40px 44px',
      maxWidth: '560px',
      margin: '0 auto',
      boxShadow: '0 0 0 1px rgba(201,184,216,0.18), 0 20px 80px rgba(26,26,26,0.3), 0 0 100px rgba(201,184,216,0.06)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: '-100px', right: '-80px',
        width: '320px', height: '320px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(201,184,216,0.14) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
        <div>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.35)', margin: '0 0 10px 0', fontWeight: 500 }}>
            Q1 2025 · Year in Focus
          </p>
          <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '28px', fontWeight: 300, color: 'white', margin: 0, lineHeight: 1 }}>Shannon</p>
        </div>
        <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '20px', color: 'rgba(201,184,216,0.55)', fontWeight: 300 }}>daye</span>
      </div>
      <div style={{ width: '52px', height: '1.5px', background: `linear-gradient(90deg, ${LAVENDER}, transparent)`, marginTop: '20px', marginBottom: '28px' }} />
      <div style={{ display: 'flex', gap: '4px', marginBottom: '28px', alignItems: 'flex-end', height: '56px' }}>
        {Array.from({ length: 13 }, (_, w) =>
          days.map((d, di) => {
            const fill = d.fill * (0.6 + Math.sin(w * 0.8 + di) * 0.4)
            const height = Math.max(6, fill * 50)
            return (
              <div key={`${w}-${di}`} style={{
                flex: 1, height: `${height}px`, borderRadius: '3px',
                background: fill > 0.75 ? LAVENDER : fill > 0.45 ? `rgba(201,184,216,0.42)` : `rgba(255,255,255,0.08)`,
                alignSelf: 'flex-end',
              }} />
            )
          })
        )}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px', marginBottom: '10px' }}>
        {[['83', 'days used'], ['47', 'tasks done'], ['11', 'day streak'], ['Tue', 'best focus day']].map(([val, label]) => (
          <div key={label} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '14px 12px' }}>
            <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '24px', fontWeight: 300, color: 'white', margin: '0 0 5px 0', lineHeight: 1 }}>{val}</p>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', color: 'rgba(255,255,255,0.38)', margin: 0, letterSpacing: '0.06em', textTransform: 'uppercase', lineHeight: 1.3 }}>{label}</p>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '28px' }}>
        {[['Deep work', 'most used day type'], ['Focused', 'top energy level'], ['Build something', 'top goal worked on']].map(([val, label]) => (
          <div key={label} style={{ background: 'rgba(201,184,216,0.07)', border: '0.5px solid rgba(201,184,216,0.18)', borderRadius: '10px', padding: '13px 12px' }}>
            <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '13px', fontWeight: 300, color: 'rgba(255,255,255,0.82)', margin: '0 0 5px 0', lineHeight: 1.25 }}>{val}</p>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', color: 'rgba(201,184,216,0.5)', margin: 0, letterSpacing: '0.06em', textTransform: 'uppercase', lineHeight: 1.3 }}>{label}</p>
          </div>
        ))}
      </div>
      <div style={{ height: '0.5px', background: `linear-gradient(90deg, rgba(201,184,216,0.45) 0%, transparent 80%)`, marginBottom: '22px' }} />
      <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '14px', fontWeight: 300, color: 'rgba(255,255,255,0.42)', margin: 0, lineHeight: 1.65 }}>
        "Your most common reflection word was <em style={{ color: LAVENDER, fontStyle: 'normal' }}>finally</em>. That says everything."
      </p>
    </div>
  )
}

export default function PricingPage({ onStartDay, onSignIn }) {
  const { showAuthModal } = useAuth()
  const [billing, setBilling] = useState('monthly')
  const [loading, setLoading] = useState(false)
  const [heroRef, heroV] = useReveal(0.05)
  const [cardsRef, cardsV] = useReveal(0.1)
  const [letterRef, letterV] = useReveal(0.1)
  const [yearRef, yearV] = useReveal(0.1)

  // Inject global CSS once
  useEffect(() => {
    const id = 'pricing-page-css'
    if (!document.getElementById(id)) {
      const tag = document.createElement('style')
      tag.id = id
      tag.textContent = GLOBAL_CSS
      document.head.appendChild(tag)
    }
  }, [])

  async function handleCheckout() {
    setLoading(true)
    try {
      const { data: { session: trackSession } } = await supabase.auth.getSession()
      if (trackSession?.user?.email) {
        trackProUpgradeClicked(trackSession.user.email).catch(() => {})
      }
    } catch { /* ignore */ }

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user?.id) {
        const priceId = billing === 'annual' ? PRICE_ANNUAL : PRICE_MONTHLY
        const res = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ priceId, userId: session.user.id }),
        })
        const data = await res.json()
        if (data.url) { window.location.href = data.url } else { setLoading(false) }
      } else {
        localStorage.setItem('pendingProPlan', billing)
        setLoading(false)
        showAuthModal('signup')
      }
    } catch {
      setLoading(false)
    }
  }

  return (
    <div className="pricing-grain" style={{ minHeight: '100dvh', background: LINEN, overflowX: 'hidden', position: 'relative' }}>
      <div className="pp-blob pp-blob-1" />
      <div className="pp-blob pp-blob-2" />

      {/* ── Nav ── */}
      <nav className="landing-nav" style={{ background: 'rgba(249,247,245,0.85)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderBottom: `0.5px solid ${BORDER}`, position: 'sticky', top: 0, zIndex: 50 }}>
        <div className="landing-container" style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <a href="/" style={{ textDecoration: 'none', marginRight: 'auto', paddingRight: '48px' }}>
            <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '20px', color: INK, fontWeight: 300 }}>daye</span>
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <a href="/blog" style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: MUTED, textDecoration: 'none' }}>Blog</a>
            <a href="/pricing" style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: LAVENDER, textDecoration: 'none', fontWeight: 600, borderBottom: `1.5px solid rgba(201,184,216,0.5)`, paddingBottom: '1px' }}>Pro</a>
            <NavAuthButton />
            <div style={{ width: '1px', height: '20px', background: BORDER, flexShrink: 0 }} />
            <button
              onClick={() => showAuthModal('signup')}
              style={{ background: INK, color: 'white', border: 'none', borderRadius: '8px', padding: '8px 20px', fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 500, cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(26,26,26,0.18)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
            >
              Start free
            </button>
          </div>
        </div>
      </nav>

      <div className="landing-desktop-only" style={{ height: '56px' }} />

      {/* ── Hero ── */}
      <section style={{ padding: '80px 0 64px', textAlign: 'center', position: 'relative', zIndex: 1 }} ref={heroRef}>
        <div className="landing-container">
          <p className={`pp-reveal ${heroV ? 'visible' : ''}`} style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: MUTED, margin: '0 0 24px 0', fontWeight: 500 }}>
            Pricing
          </p>
          <h1 className={`pp-reveal d1 ${heroV ? 'visible' : ''}`} style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 300, fontSize: 'clamp(40px, 7vw, 72px)', color: INK, lineHeight: 1.1, margin: '0 0 24px 0' }}>
            The app that knows you.
          </h1>
          <p className={`pp-reveal d2 ${heroV ? 'visible' : ''}`} style={{ fontFamily: 'var(--font-sans)', fontSize: '17px', color: MUTED, maxWidth: '480px', margin: '0 auto', lineHeight: 1.65 }}>
            Daye learns how you work, reflects it back to you, and grows with you over time.
          </p>
        </div>
      </section>

      {/* ── Pricing cards ── */}
      <section style={{ padding: '0 0 80px', position: 'relative', zIndex: 1 }} ref={cardsRef}>
        <div className="landing-container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', maxWidth: '780px', margin: '0 auto' }}>

            {/* FREE */}
            <div className={`plan-card-hover pp-reveal ${cardsV ? 'visible' : ''}`} style={{
              background: 'white', borderRadius: '20px', padding: '36px 32px',
              border: `0.5px solid ${BORDER}`, display: 'flex', flexDirection: 'column',
              boxShadow: '0 2px 12px rgba(26,26,26,0.05)',
            }}>
              <div style={{ marginBottom: '28px' }}>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: MUTED, margin: '0 0 16px 0', fontWeight: 600 }}>Daye</p>
                <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '32px', fontWeight: 300, color: INK, margin: '0 0 8px 0', lineHeight: 1 }}>Free, always</p>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: MUTED, margin: '0 0 12px 0', lineHeight: 1.5 }}>
                  A complete daily focus tool — no credit card, no trial, no catch.
                </p>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: LINEN_DARK, borderRadius: '20px', padding: '4px 12px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: SAGE, flexShrink: 0 }} />
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: MUTED, fontWeight: 500 }}>Free forever — no credit card required</span>
                </div>
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                <FeatureItem>3 focus plans per day</FeatureItem>
                <FeatureItem>Four personalised user paths</FeatureItem>
                <FeatureItem>Daily check-in — energy, mood, sleep</FeatureItem>
                <FeatureItem>Smart timer mapped to your meetings</FeatureItem>
                <FeatureItem>7-day history</FeatureItem>
                <FeatureItem>End of day reflection</FeatureItem>
                <FeatureItem>Carry-over from yesterday</FeatureItem>
                <FeatureItem>Day streak</FeatureItem>
              </ul>

              <button
                onClick={() => showAuthModal('signup')}
                style={{ width: '100%', background: INK, color: 'white', border: 'none', borderRadius: '10px', padding: '14px 24px', fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 500, cursor: 'pointer', letterSpacing: '0.01em', transition: 'transform 0.2s, box-shadow 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(26,26,26,0.16)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
              >
                Start free
              </button>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: MUTED, textAlign: 'center', margin: '10px 0 0 0' }}>
                No credit card. No time limit. Free forever.
              </p>
            </div>

            {/* PRO */}
            <div className={`plan-card-pro-hover pp-reveal d1 ${cardsV ? 'visible' : ''}`} style={{
              background: 'white', borderRadius: '20px', padding: '36px 32px',
              border: `1.5px solid ${LAVENDER}`, display: 'flex', flexDirection: 'column',
              position: 'relative', boxShadow: `0 8px 40px rgba(201,184,216,0.2)`,
            }}>
              <div style={{ position: 'absolute', top: '-13px', left: '50%', transform: 'translateX(-50%)', background: LAVENDER, color: INK, fontFamily: 'var(--font-sans)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '4px 14px', borderRadius: '20px', whiteSpace: 'nowrap' }}>
                Most popular
              </div>

              <div style={{ marginBottom: '28px' }}>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: LAVENDER, margin: '0 0 16px 0', fontWeight: 600 }}>Daye Pro</p>

                {/* Billing toggle */}
                <div style={{ display: 'flex', background: LINEN_DARK, borderRadius: '8px', padding: '3px', marginBottom: '16px', width: 'fit-content', gap: '2px' }}>
                  {[['monthly', 'Monthly'], ['annual', 'Annual']].map(([value, label]) => (
                    <button key={value} onClick={() => setBilling(value)} className="pp-toggle-btn" style={{
                      background: billing === value ? 'white' : 'transparent',
                      fontWeight: billing === value ? 600 : 400,
                      color: billing === value ? INK : MUTED,
                      boxShadow: billing === value ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    }}>
                      {label}
                      {value === 'annual' && billing !== 'annual' && (
                        <span style={{ background: SAGE, borderRadius: '4px', padding: '1px 5px', fontSize: '9px', fontWeight: 600, color: INK, letterSpacing: '0.04em' }}>–35%</span>
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
                <FeatureItem accent>Everything in free — unlimited focus plans</FeatureItem>
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
                style={{ width: '100%', background: LAVENDER, color: INK, border: 'none', borderRadius: '10px', padding: '14px 24px', fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 500, cursor: loading ? 'default' : 'pointer', letterSpacing: '0.01em', opacity: loading ? 0.7 : 1, transition: 'transform 0.2s, box-shadow 0.2s' }}
                onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(201,184,216,0.4)' } }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
              >
                {loading ? 'Redirecting…' : 'Start Pro free for 7 days'}
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* ── The Letter ── */}
      <section style={{ padding: '80px 0', background: 'white', borderTop: `0.5px solid ${BORDER}`, borderBottom: `0.5px solid ${BORDER}`, position: 'relative', zIndex: 1 }} ref={letterRef}>
        <div className="landing-container">
          <div className={`pp-reveal ${letterV ? 'visible' : ''}`} style={{ maxWidth: '680px', margin: '0 auto 48px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: MUTED, margin: '0 0 20px 0', fontWeight: 500 }}>Pro feature</p>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 300, fontSize: 'clamp(36px, 5vw, 56px)', color: INK, lineHeight: 1.1, margin: '0 0 24px 0' }}>The Letter.</h2>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '16px', color: MUTED, lineHeight: 1.7, margin: 0 }}>
              Every quarter, Daye reads your data — your tasks, your energy, your goals, your reflections — and writes you a personal letter. Not a report. A letter. Addressed to you. About your actual life.
            </p>
          </div>
          <MockLetter />
        </div>
      </section>

      {/* ── The Year in Focus ── */}
      <section style={{ padding: '80px 0', position: 'relative', zIndex: 1 }} ref={yearRef}>
        <div className="landing-container">
          <div className={`pp-reveal ${yearV ? 'visible' : ''}`} style={{ maxWidth: '680px', margin: '0 auto 48px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: MUTED, margin: '0 0 20px 0', fontWeight: 500 }}>Pro feature</p>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 300, fontSize: 'clamp(36px, 5vw, 56px)', color: INK, lineHeight: 1.1, margin: '0 0 24px 0' }}>The Year in Focus.</h2>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '16px', color: MUTED, lineHeight: 1.7, margin: 0 }}>
              At the end of each quarter, Daye generates a beautiful summary card. Your most focused days. Your biggest wins. The tasks that mattered. A story of how you showed up — shareable, beautiful, yours.
            </p>
          </div>
          <MockYearCard />
        </div>
      </section>

      <Footer />
    </div>
  )
}

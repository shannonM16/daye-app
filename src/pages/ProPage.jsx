import { useState, useEffect, useRef } from "react";

function useReveal(threshold = 0.1) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,300;1,400;1,500;1,600&family=DM+Sans:wght@300;400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --ink: #1C1C1A;
  --linen: #F5F2EC;
  --lavender: #C5BFD4;
  --blush: #E8D5CC;
  --sage: #B8C4B1;
  --ink-muted: #6B6B66;
}

body { background: var(--linen); }

.pro-page {
  font-family: 'DM Sans', sans-serif;
  background: var(--linen);
  color: var(--ink);
  min-height: 100vh;
  overflow-x: hidden;
  position: relative;
}

.pro-page::before {
  content: '';
  position: fixed; inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
  background-size: 200px 200px;
  pointer-events: none; z-index: 999; opacity: 0.7;
}

/* Ambient */
.pro-blob {
  position: fixed; border-radius: 50%; filter: blur(90px);
  pointer-events: none; z-index: 0;
}
.pro-blob-1 {
  width: 500px; height: 500px;
  background: radial-gradient(circle, rgba(197,191,212,0.18) 0%, transparent 70%);
  top: -100px; right: -100px;
  animation: pb1 14s ease-in-out infinite;
}
.pro-blob-2 {
  width: 350px; height: 350px;
  background: radial-gradient(circle, rgba(232,213,204,0.15) 0%, transparent 70%);
  bottom: 100px; left: -50px;
  animation: pb2 18s ease-in-out infinite;
}
@keyframes pb1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-20px,20px)} }
@keyframes pb2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(20px,-20px)} }

/* Nav */
.nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 50;
  padding: 0 48px; height: 72px;
  display: flex; align-items: center; justify-content: space-between;
  background: rgba(245,242,236,0.82);
  backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(28,28,26,0.07);
}
.nav-logo {
  font-family: 'Cormorant Garamond', serif;
  font-style: italic; font-weight: 400; font-size: 22px;
  color: var(--ink); text-decoration: none;
}
.nav-links { display: flex; align-items: center; gap: 28px; list-style: none; }
.nav-links a { font-size: 14px; color: var(--ink-muted); text-decoration: none; transition: color 0.2s; }
.nav-links a:hover { color: var(--ink); }
.nav-links .active { color: var(--lavender); font-weight: 500; }
.nav-divider { width: 1px; height: 20px; background: rgba(28,28,26,0.15); }
.btn-nav {
  background: var(--ink); color: var(--linen);
  border: none; border-radius: 8px;
  font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500;
  padding: 10px 22px; cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}
.btn-nav:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(28,28,26,0.18); }

/* Hero */
.pro-hero {
  padding: 160px 48px 80px;
  max-width: 1200px; margin: 0 auto;
  text-align: center; position: relative; z-index: 1;
}

.pro-eyebrow {
  font-size: 11px; font-weight: 500; letter-spacing: 0.14em;
  text-transform: uppercase; color: var(--ink-muted);
  margin-bottom: 20px; display: block;
}

.pro-heading {
  font-family: 'Cormorant Garamond', serif;
  font-style: italic; font-weight: 400;
  font-size: clamp(48px, 5.5vw, 76px);
  line-height: 1.05; letter-spacing: -0.02em; color: var(--ink);
  margin-bottom: 20px;
}

.pro-subhead {
  font-size: 16px; font-weight: 300; line-height: 1.7;
  color: var(--ink-muted); max-width: 460px; margin: 0 auto 60px;
}

/* Toggle */
.billing-toggle {
  display: inline-flex; align-items: center; gap: 0;
  background: rgba(28,28,26,0.06); border-radius: 12px; padding: 4px;
  margin-bottom: 64px;
}
.toggle-btn {
  padding: 8px 20px; border-radius: 9px; border: none;
  font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 400;
  cursor: pointer; transition: all 0.25s; background: transparent; color: var(--ink-muted);
}
.toggle-btn.active {
  background: white; color: var(--ink); font-weight: 500;
  box-shadow: 0 1px 6px rgba(28,28,26,0.1);
}
.toggle-save {
  font-size: 11px; font-weight: 500; color: var(--sage);
  background: rgba(184,196,177,0.18); border-radius: 6px;
  padding: 2px 7px; margin-left: 4px;
}

/* Pricing cards */
.pricing-row {
  display: grid; grid-template-columns: 1fr 1fr; gap: 20px;
  max-width: 880px; margin: 0 auto;
  position: relative; z-index: 1;
  padding: 0 48px 80px;
}

.plan-card {
  border-radius: 24px; padding: 44px 40px;
  position: relative; overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
}
.plan-card:hover { transform: translateY(-4px); }

.plan-card.free {
  background: white;
  border: 1px solid rgba(28,28,26,0.08);
  box-shadow: 0 2px 12px rgba(28,28,26,0.06);
}
.plan-card.free:hover { box-shadow: 0 12px 40px rgba(28,28,26,0.1); }

.plan-card.pro {
  background: var(--ink);
  box-shadow: 0 8px 40px rgba(28,28,26,0.25);
}
.plan-card.pro:hover { box-shadow: 0 20px 60px rgba(28,28,26,0.3); }

/* Pro glow */
.plan-card.pro::before {
  content: '';
  position: absolute;
  width: 300px; height: 300px; border-radius: 50%;
  background: radial-gradient(circle, rgba(197,191,212,0.15) 0%, transparent 70%);
  filter: blur(40px);
  top: -80px; right: -80px; pointer-events: none;
}

.plan-badge {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 11px; font-weight: 500; letter-spacing: 0.1em;
  text-transform: uppercase; margin-bottom: 28px;
  padding: 5px 12px; border-radius: 20px;
}
.plan-card.free .plan-badge { color: var(--ink-muted); background: rgba(28,28,26,0.05); }
.plan-card.pro .plan-badge { color: var(--lavender); background: rgba(197,191,212,0.12); }
.plan-badge-dot { width: 5px; height: 5px; border-radius: 50%; }
.plan-card.free .plan-badge-dot { background: var(--ink-muted); }
.plan-card.pro .plan-badge-dot { background: var(--lavender); }

.plan-price {
  margin-bottom: 8px; display: flex; align-items: baseline; gap: 4px;
}
.plan-amount {
  font-family: 'Cormorant Garamond', serif;
  font-style: italic; font-weight: 400; font-size: 56px; line-height: 1;
}
.plan-card.free .plan-amount { color: var(--ink); }
.plan-card.pro .plan-amount { color: var(--linen); }
.plan-period { font-size: 14px; color: var(--ink-muted); font-weight: 300; }
.plan-card.pro .plan-period { color: rgba(245,242,236,0.4); }

.plan-desc {
  font-size: 14px; font-weight: 300; line-height: 1.6;
  margin-bottom: 32px;
}
.plan-card.free .plan-desc { color: var(--ink-muted); }
.plan-card.pro .plan-desc { color: rgba(245,242,236,0.55); }

.plan-divider {
  height: 1px; margin-bottom: 28px;
}
.plan-card.free .plan-divider { background: rgba(28,28,26,0.07); }
.plan-card.pro .plan-divider { background: rgba(245,242,236,0.08); }

.plan-features { display: flex; flex-direction: column; gap: 14px; margin-bottom: 36px; }

.feature-row { display: flex; gap: 12px; align-items: flex-start; }
.feature-check {
  width: 18px; height: 18px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; margin-top: 1px; font-size: 10px;
}
.plan-card.free .feature-check { background: rgba(28,28,26,0.07); color: var(--ink-muted); }
.plan-card.pro .feature-check { background: rgba(245,242,236,0.1); color: var(--lavender); }
.feature-check.pro-only { background: rgba(197,191,212,0.15); }

.feature-text { font-size: 14px; line-height: 1.5; }
.plan-card.free .feature-text { color: var(--ink-muted); }
.plan-card.pro .feature-text { color: rgba(245,242,236,0.75); }
.plan-card.pro .feature-text strong { color: var(--linen); font-weight: 500; }

.plan-cta {
  width: 100%; padding: 14px; border-radius: 12px; border: none;
  font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 500;
  cursor: pointer; transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
  letter-spacing: 0.01em;
}
.plan-card.free .plan-cta {
  background: var(--ink); color: var(--linen);
}
.plan-card.free .plan-cta:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(28,28,26,0.18); }
.plan-card.pro .plan-cta {
  background: var(--linen); color: var(--ink);
}
.plan-card.pro .plan-cta:hover { transform: translateY(-1px); opacity: 0.92; }

.plan-note {
  text-align: center; font-size: 12px; margin-top: 12px;
}
.plan-card.free .plan-note { color: var(--ink-muted); }
.plan-card.pro .plan-note { color: rgba(245,242,236,0.35); }

/* FAQ */
.faq-section {
  max-width: 680px; margin: 0 auto; padding: 0 48px 120px;
  position: relative; z-index: 1;
}
.faq-heading {
  font-family: 'Cormorant Garamond', serif;
  font-style: italic; font-weight: 400; font-size: 36px;
  color: var(--ink); text-align: center; margin-bottom: 48px;
}
.faq-item {
  border-bottom: 1px solid rgba(28,28,26,0.08); padding: 20px 0;
  cursor: pointer;
}
.faq-q {
  display: flex; justify-content: space-between; align-items: center; gap: 16px;
}
.faq-q-text { font-size: 15px; font-weight: 400; color: var(--ink); }
.faq-icon {
  width: 24px; height: 24px; border-radius: 50%;
  background: rgba(28,28,26,0.06);
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; color: var(--ink-muted); flex-shrink: 0;
  transition: transform 0.3s, background 0.3s;
}
.faq-item.open .faq-icon { transform: rotate(45deg); background: var(--ink); color: var(--linen); }
.faq-a {
  font-size: 14px; font-weight: 300; line-height: 1.7; color: var(--ink-muted);
  max-height: 0; overflow: hidden; transition: max-height 0.4s ease, opacity 0.3s, margin 0.3s;
  opacity: 0;
}
.faq-item.open .faq-a { max-height: 200px; opacity: 1; margin-top: 14px; }

/* Reveal */
.reveal { opacity: 0; transform: translateY(28px); transition: opacity 0.8s ease, transform 0.8s ease; }
.reveal.visible { opacity: 1; transform: translateY(0); }
.d1{transition-delay:.1s} .d2{transition-delay:.2s} .d3{transition-delay:.3s}

@media(max-width:860px){
  .pricing-row{grid-template-columns:1fr;padding:0 24px 80px;}
  .pro-hero{padding:140px 24px 60px;}
  .faq-section{padding:0 24px 80px;}
  .nav{padding:0 24px;}
}
`;

const faqData = [
  {
    q: "Can I try Pro before committing?",
    a: "Yes — start on the free plan and upgrade at any time. There's no trial period needed; the free plan gives you a genuine sense of how Daye works.",
  },
  {
    q: "What's included in The Letter?",
    a: "Every quarter, Daye generates a personalised reflection on how your focus has shifted, what patterns it's noticed, and what that might mean for the period ahead. It's written in Daye's voice — calm, direct, and honest.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel from your account settings at any time and you'll keep access until the end of your billing period. No awkward retention flows.",
  },
  {
    q: "Is my data private?",
    a: "Your plans, tasks, and check-ins are yours. Daye does not sell or share your personal data. You can delete your account and all associated data at any time.",
  },
];

function FAQ() {
  const [open, setOpen] = useState(null);
  const [ref, v] = useReveal(0.1);
  return (
    <div className="faq-section" ref={ref}>
      <h2 className={`faq-heading reveal ${v ? "visible" : ""}`}>Common questions.</h2>
      {faqData.map((f, i) => (
        <div
          key={i}
          className={`faq-item reveal ${v ? "visible" : ""} ${open === i ? "open" : ""}`}
          style={{ transitionDelay: `${0.1 + i * 0.08}s` }}
          onClick={() => setOpen(open === i ? null : i)}
        >
          <div className="faq-q">
            <span className="faq-q-text">{f.q}</span>
            <div className="faq-icon">+</div>
          </div>
          <div className="faq-a">{f.a}</div>
        </div>
      ))}
    </div>
  );
}

export default function ProPage() {
  const [annual, setAnnual] = useState(true);
  const [heroRef, heroV] = useReveal(0.05);
  const [cardsRef, cardsV] = useReveal(0.1);

  const proPrice = annual ? "4" : "5";

  const freeFeatures = [
    "3 focus plans per day",
    "Energy and mood check-in",
    "Task input — free text",
    "Time split suggestion",
    "Avoid today list",
  ];

  const proFeatures = [
    { text: "Unlimited focus plans", pro: false },
    { text: "Everything in Free", pro: false },
    { text: <><strong>Weekly insight email</strong> — patterns from your week</>, pro: true },
    { text: <><strong>The Letter</strong> — quarterly AI reflection</>, pro: true },
    { text: <><strong>Role-specific task library</strong></>, pro: true },
    { text: <><strong>Streak tracking</strong> and focus history</>, pro: true },
    { text: "Priority support", pro: true },
  ];

  return (
    <>
      <style>{css}</style>
      <div className="pro-page">
        <div className="pro-blob pro-blob-1" />
        <div className="pro-blob pro-blob-2" />

        {/* Nav */}
        <nav className="nav">
          <a href="/" className="nav-logo">daye</a>
          <ul className="nav-links">
            <li><a href="/blog">Blog</a></li>
            <li><a href="/pro" className="active">Pro</a></li>
            <li><a href="/signin">Sign in</a></li>
            <li><div className="nav-divider" /></li>
            <li><button className="btn-nav">Start free</button></li>
          </ul>
        </nav>

        {/* Hero */}
        <div className="pro-hero" ref={heroRef}>
          <span className={`pro-eyebrow reveal ${heroV ? "visible" : ""}`}>Pricing</span>
          <h1 className={`pro-heading reveal ${heroV ? "visible" : ""} d1`}>
            Simple, honest pricing.
          </h1>
          <p className={`pro-subhead reveal ${heroV ? "visible" : ""} d2`}>
            Start free, stay free as long as you like. Upgrade when Daye becomes part of your mornings.
          </p>

          <div className={`reveal ${heroV ? "visible" : ""} d2`}>
            <div className="billing-toggle">
              <button
                className={`toggle-btn ${annual ? "active" : ""}`}
                onClick={() => setAnnual(true)}
              >
                Annual <span className="toggle-save">Save 20%</span>
              </button>
              <button
                className={`toggle-btn ${!annual ? "active" : ""}`}
                onClick={() => setAnnual(false)}
              >
                Monthly
              </button>
            </div>
          </div>
        </div>

        {/* Cards */}
        <div className="pricing-row" ref={cardsRef}>
          {/* Free */}
          <div className={`plan-card free reveal ${cardsV ? "visible" : ""}`}>
            <div className="plan-badge">
              <span className="plan-badge-dot" />
              Free
            </div>
            <div className="plan-price">
              <span className="plan-amount">£0</span>
              <span className="plan-period">forever</span>
            </div>
            <p className="plan-desc">Everything you need to get started. No credit card, no time limit.</p>
            <div className="plan-divider" />
            <div className="plan-features">
              {freeFeatures.map((f, i) => (
                <div key={i} className="feature-row">
                  <div className="feature-check">✓</div>
                  <span className="feature-text">{f}</span>
                </div>
              ))}
            </div>
            <button className="plan-cta">Start free</button>
            <p className="plan-note">No credit card needed</p>
          </div>

          {/* Pro */}
          <div className={`plan-card pro reveal ${cardsV ? "visible" : ""} d1`}>
            <div className="plan-badge">
              <span className="plan-badge-dot" />
              Pro
            </div>
            <div className="plan-price">
              <span className="plan-amount">£{proPrice}</span>
              <span className="plan-period">/ month{annual ? ", billed annually" : ""}</span>
            </div>
            <p className="plan-desc">For people who want Daye to grow with them — not just plan their day.</p>
            <div className="plan-divider" />
            <div className="plan-features">
              {proFeatures.map((f, i) => (
                <div key={i} className="feature-row">
                  <div className={`feature-check ${f.pro ? "pro-only" : ""}`}>✓</div>
                  <span className="feature-text">{f.text}</span>
                </div>
              ))}
            </div>
            <button className="plan-cta">Upgrade to Pro</button>
            <p className="plan-note">Cancel anytime</p>
          </div>
        </div>

        <FAQ />
      </div>
    </>
  );
}

import { useState, useEffect, useRef } from "react";

// ─── Brand tokens ────────────────────────────────────────────────
const style = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,300;1,400;1,500;1,600&family=DM+Sans:wght@300;400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --ink: #1C1C1A;
  --linen: #F5F2EC;
  --lavender: #C5BFD4;
  --blush: #E8D5CC;
  --sage: #B8C4B1;
  --ink-muted: #6B6B66;
  --ink-faint: rgba(28,28,26,0.06);
}

html { scroll-behavior: smooth; }
body { background: var(--linen); }

.page {
  font-family: 'DM Sans', sans-serif;
  background: var(--linen);
  color: var(--ink);
  overflow-x: hidden;
}

/* Grain */
.page::before {
  content: '';
  position: fixed; inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
  background-size: 200px 200px;
  pointer-events: none; z-index: 999; opacity: 0.7;
}

/* ── Shared reveal animations ── */
.reveal { opacity: 0; transform: translateY(32px); transition: opacity 0.8s ease, transform 0.8s ease; }
.reveal.visible { opacity: 1; transform: translateY(0); }
.reveal-left { opacity: 0; transform: translateX(-40px); transition: opacity 0.8s ease, transform 0.8s ease; }
.reveal-left.visible { opacity: 1; transform: translateX(0); }
.reveal-right { opacity: 0; transform: translateX(40px); transition: opacity 0.8s ease, transform 0.8s ease; }
.reveal-right.visible { opacity: 1; transform: translateX(0); }
.reveal-scale { opacity: 0; transform: scale(0.94); transition: opacity 0.8s ease, transform 0.8s ease; }
.reveal-scale.visible { opacity: 1; transform: scale(1); }

.d1 { transition-delay: 0.1s; }
.d2 { transition-delay: 0.2s; }
.d3 { transition-delay: 0.3s; }
.d4 { transition-delay: 0.4s; }
.d5 { transition-delay: 0.5s; }
.d6 { transition-delay: 0.6s; }

/* ── Shared section styles ── */
section { position: relative; overflow: hidden; }

.section-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 48px;
}

.eyebrow {
  font-size: 11px; font-weight: 500; letter-spacing: 0.14em;
  text-transform: uppercase; color: var(--ink-muted);
  margin-bottom: 20px; display: block;
}

.section-heading {
  font-family: 'Cormorant Garamond', serif;
  font-style: italic; font-weight: 400;
  font-size: clamp(40px, 4.5vw, 64px);
  line-height: 1.08; letter-spacing: -0.02em;
  color: var(--ink);
}

.section-sub {
  font-size: 15px; font-weight: 300; line-height: 1.7;
  color: var(--ink-muted); max-width: 480px;
  margin-top: 16px;
}

/* ═══════════════════════════════════════════
   SECTION 1 — PROBLEM STATEMENT
═══════════════════════════════════════════ */
.problem-section {
  padding: 140px 0 120px;
  background: var(--linen);
}

.problem-inner {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: center;
}

.problem-copy { max-width: 520px; }

.problem-heading {
  font-family: 'Cormorant Garamond', serif;
  font-style: italic; font-weight: 400;
  font-size: clamp(38px, 4vw, 58px);
  line-height: 1.1; letter-spacing: -0.02em;
  color: var(--ink);
  margin-bottom: 28px;
}

.problem-body {
  font-size: 16px; font-weight: 300; line-height: 1.75;
  color: var(--ink-muted);
}

.problem-body em {
  font-style: italic; color: var(--ink);
  font-family: 'Cormorant Garamond', serif;
  font-size: 19px;
}

/* Visual side */
.problem-visual {
  position: relative;
  height: 380px;
  display: flex; align-items: center; justify-content: center;
}

.chaos-blob {
  position: absolute;
  border-radius: 50%; filter: blur(60px); pointer-events: none;
}
.chaos-blob-1 {
  width: 320px; height: 320px;
  background: radial-gradient(circle, rgba(232,213,204,0.5) 0%, transparent 70%);
  top: 20px; left: -20px;
  animation: blobPulse1 8s ease-in-out infinite;
}
.chaos-blob-2 {
  width: 220px; height: 220px;
  background: radial-gradient(circle, rgba(197,191,212,0.4) 0%, transparent 70%);
  bottom: 20px; right: 0;
  animation: blobPulse2 10s ease-in-out infinite;
}
@keyframes blobPulse1 {
  0%,100% { transform: scale(1) translate(0,0); }
  50% { transform: scale(1.1) translate(10px,-15px); }
}
@keyframes blobPulse2 {
  0%,100% { transform: scale(1) translate(0,0); }
  50% { transform: scale(0.9) translate(-10px,10px); }
}

.chaos-items {
  position: relative; z-index: 1;
  width: 300px;
}

.chaos-item {
  background: white;
  border-radius: 12px;
  padding: 14px 18px;
  box-shadow: 0 2px 16px rgba(28,28,26,0.07), 0 1px 3px rgba(28,28,26,0.05);
  font-size: 13px; color: var(--ink-muted);
  position: absolute;
  width: 220px;
  display: flex; align-items: center; gap: 10px;
  animation: chaosFloat linear infinite;
}
.chaos-item::before {
  content: '';
  width: 8px; height: 8px; border-radius: 50%;
  flex-shrink: 0;
}
.chaos-item:nth-child(1) { top: 0; left: 0; animation-duration: 7s; animation-delay: 0s; }
.chaos-item:nth-child(1)::before { background: var(--blush); }
.chaos-item:nth-child(2) { top: 70px; right: -20px; animation-duration: 9s; animation-delay: -3s; }
.chaos-item:nth-child(2)::before { background: var(--lavender); }
.chaos-item:nth-child(3) { top: 150px; left: 10px; animation-duration: 8s; animation-delay: -1.5s; }
.chaos-item:nth-child(3)::before { background: var(--sage); }
.chaos-item:nth-child(4) { top: 230px; right: -10px; animation-duration: 10s; animation-delay: -5s; }
.chaos-item:nth-child(4)::before { background: var(--blush); }
.chaos-item:nth-child(5) { top: 310px; left: 30px; animation-duration: 6s; animation-delay: -2s; }
.chaos-item:nth-child(5)::before { background: var(--lavender); }

@keyframes chaosFloat {
  0%,100% { transform: translateY(0px) rotate(0deg); }
  25% { transform: translateY(-6px) rotate(0.5deg); }
  75% { transform: translateY(4px) rotate(-0.3deg); }
}

/* ═══════════════════════════════════════════
   SECTION 2 — HOW IT WORKS
═══════════════════════════════════════════ */
.how-section {
  padding: 120px 0 140px;
  background: #EFECE6;
  position: relative;
}

.how-section::before {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(197,191,212,0.1) 0%, transparent 50%, rgba(232,213,204,0.1) 100%);
}

.how-header { text-align: center; margin-bottom: 80px; }
.how-header .section-heading { margin: 0 auto; }

.steps-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2px;
  position: relative;
}

/* Connecting line */
.steps-row::before {
  content: '';
  position: absolute;
  top: 48px; left: calc(16.6% + 24px); right: calc(16.6% + 24px);
  height: 1px;
  background: linear-gradient(to right, transparent, rgba(28,28,26,0.12), transparent);
}

.step {
  padding: 40px 36px 36px;
  position: relative;
  cursor: default;
  transition: transform 0.3s;
}
.step:hover { transform: translateY(-4px); }

.step-number {
  font-family: 'Cormorant Garamond', serif;
  font-style: italic; font-weight: 300;
  font-size: 72px; line-height: 1;
  color: rgba(28,28,26,0.07);
  margin-bottom: 16px;
  transition: color 0.3s;
}
.step:hover .step-number { color: rgba(28,28,26,0.13); }

.step-dot {
  width: 10px; height: 10px; border-radius: 50%;
  background: var(--ink);
  position: absolute; top: 44px; left: 50%;
  transform: translateX(-50%);
  z-index: 1;
}

.step-title {
  font-family: 'Cormorant Garamond', serif;
  font-style: italic; font-weight: 400;
  font-size: 26px; color: var(--ink);
  margin-bottom: 12px; line-height: 1.2;
}

.step-body {
  font-size: 14px; font-weight: 300; line-height: 1.7;
  color: var(--ink-muted);
}

.step-pill {
  display: inline-flex; align-items: center; gap: 6px;
  margin-top: 20px;
  font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase;
  color: var(--ink-muted);
  background: rgba(28,28,26,0.05);
  border-radius: 20px; padding: 5px 12px;
}
.step-pill-dot {
  width: 5px; height: 5px; border-radius: 50%;
}

/* ═══════════════════════════════════════════
   SECTION 3 — DEMO / SIXTY SECONDS
═══════════════════════════════════════════ */
.demo-section {
  padding: 130px 0;
  background: var(--linen);
  position: relative;
}

.demo-inner {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: center;
}

.demo-copy { }
.demo-copy .section-heading { margin-bottom: 20px; }

.demo-steps {
  margin-top: 40px;
  display: flex; flex-direction: column; gap: 0;
}

.demo-step {
  display: flex; gap: 20px; align-items: flex-start;
  padding: 20px 0;
  border-bottom: 1px solid rgba(28,28,26,0.07);
  cursor: pointer;
  transition: all 0.3s;
}
.demo-step:last-child { border-bottom: none; }
.demo-step:hover .demo-step-title { color: var(--ink); }

.demo-step-num {
  font-family: 'Cormorant Garamond', serif;
  font-style: italic; font-weight: 300;
  font-size: 28px; line-height: 1;
  color: rgba(28,28,26,0.2);
  min-width: 32px;
  transition: color 0.3s;
}
.demo-step.active .demo-step-num { color: var(--ink); }

.demo-step-content {}
.demo-step-title {
  font-size: 15px; font-weight: 500; color: var(--ink-muted);
  margin-bottom: 4px;
  transition: color 0.3s;
}
.demo-step.active .demo-step-title { color: var(--ink); }
.demo-step-desc {
  font-size: 13px; font-weight: 300; line-height: 1.6;
  color: var(--ink-muted);
  max-height: 0; overflow: hidden;
  transition: max-height 0.4s ease, opacity 0.3s;
  opacity: 0;
}
.demo-step.active .demo-step-desc { max-height: 80px; opacity: 1; }

/* Progress bar */
.demo-progress {
  height: 2px; background: rgba(28,28,26,0.07);
  margin-top: 4px; border-radius: 1px; overflow: hidden;
  max-height: 0; transition: max-height 0.3s;
}
.demo-step.active .demo-progress { max-height: 2px; }
.demo-progress-fill {
  height: 100%; background: var(--ink); border-radius: 1px;
  transform-origin: left;
}

/* Phone mockup */
.phone-wrap {
  display: flex; justify-content: center; align-items: center;
  position: relative;
}

.phone-glow {
  position: absolute;
  width: 120%; height: 120%;
  background: radial-gradient(ellipse at 50% 50%, rgba(197,191,212,0.25) 0%, transparent 65%);
  filter: blur(40px);
}

.phone {
  position: relative; z-index: 1;
  width: 300px;
  background: var(--ink);
  border-radius: 44px;
  padding: 14px;
  box-shadow:
    0 0 0 1px rgba(255,255,255,0.08),
    0 24px 64px rgba(28,28,26,0.3),
    0 8px 24px rgba(28,28,26,0.2);
  animation: phoneFloat 6s ease-in-out infinite;
}

@keyframes phoneFloat {
  0%,100% { transform: translateY(0) rotate(-1deg); }
  50% { transform: translateY(-12px) rotate(0.5deg); }
}

.phone-notch {
  width: 90px; height: 26px;
  background: var(--ink);
  border-radius: 0 0 18px 18px;
  margin: 0 auto 12px;
  position: relative; z-index: 2;
  display: flex; align-items: center; justify-content: center;
  gap: 6px;
}
.phone-notch::before {
  content: ''; width: 8px; height: 8px; border-radius: 50%;
  background: rgba(255,255,255,0.12);
}

.phone-screen {
  background: #F8F5EF;
  border-radius: 32px;
  padding: 24px 20px;
  min-height: 520px;
  overflow: hidden;
}

.phone-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 20px;
}
.phone-logo {
  font-family: 'Cormorant Garamond', serif;
  font-style: italic; font-size: 16px; color: var(--ink);
}
.phone-time {
  font-size: 11px; color: var(--ink-muted);
  background: rgba(28,28,26,0.05);
  padding: 3px 8px; border-radius: 10px;
}

.phone-greeting {
  font-family: 'Cormorant Garamond', serif;
  font-style: italic; font-size: 22px; color: var(--ink);
  margin-bottom: 4px;
}
.phone-sub { font-size: 11px; color: var(--ink-muted); margin-bottom: 20px; }

.phone-focus-label {
  font-size: 9px; font-weight: 500; letter-spacing: 0.12em;
  text-transform: uppercase; color: var(--ink-muted);
  margin-bottom: 8px;
}

.phone-focus-card {
  background: white; border-radius: 12px; padding: 14px 16px;
  margin-bottom: 8px;
  border-left: 3px solid var(--ink);
  box-shadow: 0 1px 8px rgba(28,28,26,0.06);
}
.phone-focus-card.secondary { border-left-color: rgba(28,28,26,0.15); }
.phone-focus-title { font-size: 13px; font-weight: 500; color: var(--ink); margin-bottom: 2px; }
.phone-focus-meta { font-size: 11px; color: var(--ink-muted); }

.phone-time-row {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px;
  margin-top: 14px;
}
.phone-time-block {
  background: rgba(28,28,26,0.04); border-radius: 8px; padding: 8px;
  text-align: center;
}
.phone-time-t { font-size: 9px; color: var(--ink-muted); margin-bottom: 2px; }
.phone-time-v { font-size: 11px; font-weight: 500; color: var(--ink); }

.phone-energy {
  display: flex; align-items: center; gap: 8px;
  margin-top: 14px;
  background: rgba(197,191,212,0.15); border-radius: 10px; padding: 10px 12px;
}
.phone-energy-label { font-size: 11px; color: var(--ink-muted); }
.phone-energy-dots { display: flex; gap: 4px; margin-left: auto; }
.phone-energy-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--lavender);
}
.phone-energy-dot.off { background: rgba(28,28,26,0.1); }

/* ═══════════════════════════════════════════
   SECTION 4 — WHO IT'S FOR
═══════════════════════════════════════════ */
.who-section {
  padding: 120px 0 140px;
  background: var(--ink);
  position: relative;
  overflow: hidden;
}

.who-section::before {
  content: '';
  position: absolute; inset: 0;
  background:
    radial-gradient(ellipse at 20% 50%, rgba(197,191,212,0.08) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, rgba(232,213,204,0.06) 0%, transparent 40%),
    radial-gradient(ellipse at 60% 80%, rgba(184,196,177,0.07) 0%, transparent 45%);
}

.who-header { text-align: center; margin-bottom: 72px; position: relative; z-index: 1; }
.who-header .section-heading { color: var(--linen); }
.who-header .eyebrow { color: rgba(245,242,236,0.4); }

.who-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  position: relative; z-index: 1;
}

.who-card {
  border: 1px solid rgba(245,242,236,0.08);
  border-radius: 20px;
  padding: 36px 40px;
  position: relative; overflow: hidden;
  cursor: default;
  transition: border-color 0.3s, transform 0.3s, box-shadow 0.3s;
  background: rgba(245,242,236,0.03);
}
.who-card:hover {
  border-color: rgba(245,242,236,0.16);
  transform: translateY(-3px);
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
}

/* Accent corner glow */
.who-card::before {
  content: '';
  position: absolute;
  width: 150px; height: 150px;
  border-radius: 50%;
  filter: blur(50px);
  top: -30px; left: -30px;
  opacity: 0.5;
  transition: opacity 0.3s;
}
.who-card:hover::before { opacity: 0.9; }
.who-card:nth-child(1)::before { background: var(--blush); }
.who-card:nth-child(2)::before { background: var(--lavender); }
.who-card:nth-child(3)::before { background: var(--sage); }
.who-card:nth-child(4)::before { background: var(--blush); }

.who-card-header {
  display: flex; align-items: center; gap: 10px;
  margin-bottom: 16px;
}
.who-dot {
  width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
}
.who-title {
  font-size: 16px; font-weight: 500; color: var(--linen);
}

.who-desc {
  font-size: 14px; font-weight: 300; line-height: 1.65;
  color: rgba(245,242,236,0.5);
  margin-bottom: 24px;
}

.who-examples {
  display: flex; flex-direction: column; gap: 8px;
}
.who-example {
  display: flex; align-items: center; gap: 10px;
  font-size: 13px; color: rgba(245,242,236,0.65);
}
.who-example::before {
  content: '';
  width: 18px; height: 1px;
  background: rgba(245,242,236,0.2);
  flex-shrink: 0;
}

/* ═══════════════════════════════════════════
   FULL PAGE DEMO
═══════════════════════════════════════════ */
.btn-primary {
  background: var(--ink); color: var(--linen);
  border: none; border-radius: 8px;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px; font-weight: 500;
  padding: 13px 28px; cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  letter-spacing: 0.01em;
}
.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 24px rgba(28,28,26,0.2);
}
.btn-primary-inv {
  background: var(--linen); color: var(--ink);
  border: none; border-radius: 8px;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px; font-weight: 500;
  padding: 13px 28px; cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
}
.btn-primary-inv:hover {
  transform: translateY(-1px);
  opacity: 0.9;
}

/* Responsive */
@media (max-width: 900px) {
  .section-inner { padding: 0 24px; }
  .problem-inner, .demo-inner { grid-template-columns: 1fr; gap: 48px; }
  .problem-visual { display: none; }
  .steps-row { grid-template-columns: 1fr; }
  .steps-row::before { display: none; }
  .who-grid { grid-template-columns: 1fr; }
  .phone-wrap { margin-top: 48px; }
}
`;

// ─── Intersection observer hook ──────────────────────────────────
function useReveal(threshold = 0.15) {
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

// ─── SECTION 1: Problem ──────────────────────────────────────────
function ProblemSection() {
  const [ref, v] = useReveal(0.1);
  return (
    <section className="problem-section" ref={ref}>
      <div className="section-inner">
        <div className="problem-inner">
          <div className="problem-copy">
            <span className={`eyebrow reveal ${v ? "visible" : ""}`}>The problem</span>
            <h2 className={`problem-heading reveal ${v ? "visible" : ""} d1`}>
              You already know what needs doing. You just can't decide where to start.
            </h2>
            <p className={`problem-body reveal ${v ? "visible" : ""} d2`}>
              Every morning you open your notes, your task list, your calendar — and still feel stuck.
              Not because you're lazy. <em>Because deciding is hard,</em> especially before your first coffee.
              <br /><br />
              Daye removes the decision. Every morning, in sixty seconds, you know exactly what matters today.
            </p>
          </div>

          <div className={`problem-visual reveal-right ${v ? "visible" : ""} d2`}>
            <div className="chaos-blob chaos-blob-1" />
            <div className="chaos-blob chaos-blob-2" />
            <div className="chaos-items">
              {[
                "Reply to Sarah's email",
                "Prepare Q3 deck",
                "Chase contractor invoice",
                "Review pull request",
                "Book dentist appointment",
              ].map((t, i) => (
                <div key={i} className="chaos-item" style={{ animationDelay: `${i * -1.4}s` }}>{t}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── SECTION 2: How it works ──────────────────────────────────────
function HowSection() {
  const [ref, v] = useReveal(0.1);
  const steps = [
    {
      n: "01",
      title: "Tell Daye how you feel",
      body: "Your energy, your mood, your sleep. Three taps and Daye knows what kind of day you're working with.",
      pill: "Energy check",
      color: "var(--blush)",
    },
    {
      n: "02",
      title: "Tell Daye what's on your plate",
      body: "Type a sentence or tap from your role-specific task library. Daye understands context, not just to-dos.",
      pill: "Task input",
      color: "var(--lavender)",
    },
    {
      n: "03",
      title: "Daye decides what matters",
      body: "Your personalised focus plan lands in seconds. One priority. A time split. What to avoid.",
      pill: "Your plan",
      color: "var(--sage)",
    },
  ];

  return (
    <section className="how-section" ref={ref}>
      <div className="section-inner">
        <div className={`how-header reveal ${v ? "visible" : ""}`}>
          <span className="eyebrow">How it works</span>
          <h2 className="section-heading">Sixty seconds to clarity.</h2>
          <p className="section-sub" style={{ margin: "16px auto 0", textAlign: "center" }}>
            This is what a typical morning with Daye looks like.
          </p>
        </div>

        <div className="steps-row">
          {steps.map((s, i) => (
            <div
              key={i}
              className={`step reveal ${v ? "visible" : ""}`}
              style={{ transitionDelay: `${0.15 + i * 0.15}s` }}
            >
              <div className="step-number">{s.n}</div>
              <div className="step-dot" />
              <h3 className="step-title">{s.title}</h3>
              <p className="step-body">{s.body}</p>
              <div className="step-pill">
                <span className="step-pill-dot" style={{ background: s.color }} />
                {s.pill}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── SECTION 3: Demo ──────────────────────────────────────────────
function DemoSection() {
  const [ref, v] = useReveal(0.1);
  const [active, setActive] = useState(0);
  const progressRef = useRef(null);

  const demoSteps = [
    {
      title: "Check in with your energy",
      desc: "Three taps: energy level, mood, and how you slept. Takes under ten seconds.",
    },
    {
      title: "Drop in what's on your mind",
      desc: "One sentence, voice note, or quick-tap from your role library. No formatting required.",
    },
    {
      title: "Get your focus plan",
      desc: "Your top priority, time split, and what to avoid — personalised, every single morning.",
    },
  ];

  useEffect(() => {
    if (!v) return;
    const interval = setInterval(() => {
      setActive(a => (a + 1) % demoSteps.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [v]);

  return (
    <section className="demo-section" ref={ref}>
      <div className="section-inner">
        <div className="demo-inner">
          <div className="demo-copy">
            <span className={`eyebrow reveal ${v ? "visible" : ""}`}>See it in action</span>
            <h2 className={`section-heading reveal ${v ? "visible" : ""} d1`}>
              Sixty seconds to clarity.
            </h2>
            <p className={`section-sub reveal ${v ? "visible" : ""} d2`}>
              This is what a typical morning with Daye looks like.
            </p>

            <div className={`demo-steps reveal ${v ? "visible" : ""} d3`}>
              {demoSteps.map((s, i) => (
                <div
                  key={i}
                  className={`demo-step ${active === i ? "active" : ""}`}
                  onClick={() => setActive(i)}
                >
                  <div className="demo-step-num">0{i + 1}</div>
                  <div className="demo-step-content">
                    <div className="demo-step-title">{s.title}</div>
                    <div className="demo-step-desc">{s.desc}</div>
                    <div className="demo-progress">
                      <div
                        className="demo-progress-fill"
                        ref={active === i ? progressRef : null}
                        style={active === i ? { animation: "progressFill 3.5s linear forwards" } : {}}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`phone-wrap reveal-right ${v ? "visible" : ""} d2`}>
            <div className="phone-glow" />
            <div className="phone">
              <div className="phone-notch" />
              <div className="phone-screen">
                <div className="phone-header">
                  <span className="phone-logo">daye</span>
                  <span className="phone-time">08:47</span>
                </div>
                <div className="phone-greeting">Good morning, Shannon.</div>
                <div className="phone-sub">Monday · Focus day</div>

                <div className="phone-focus-label">Focus on</div>
                <div className="phone-focus-card">
                  <div className="phone-focus-title">Finish the Q2 campaign brief</div>
                  <div className="phone-focus-meta">Most important · Do this first</div>
                </div>
                <div className="phone-focus-card secondary">
                  <div className="phone-focus-title">Prep for manager 1:1</div>
                  <div className="phone-focus-meta">Career move · High value</div>
                </div>

                <div className="phone-time-row">
                  <div className="phone-time-block">
                    <div className="phone-time-t">9–11am</div>
                    <div className="phone-time-v">Brief</div>
                  </div>
                  <div className="phone-time-block">
                    <div className="phone-time-t">11–12</div>
                    <div className="phone-time-v">1:1 prep</div>
                  </div>
                  <div className="phone-time-block">
                    <div className="phone-time-t">PM</div>
                    <div className="phone-time-v">Comms</div>
                  </div>
                </div>

                <div className="phone-energy">
                  <span className="phone-energy-label">Energy today</span>
                  <div className="phone-energy-dots">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className={`phone-energy-dot ${i > 3 ? "off" : ""}`} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes progressFill {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </section>
  );
}

// ─── SECTION 4: Who it's for ─────────────────────────────────────
function WhoSection() {
  const [ref, v] = useReveal(0.1);

  const cards = [
    {
      title: "Corporate",
      color: "var(--blush)",
      desc: "For professionals navigating deadlines, politics, and the push for the next level.",
      examples: ["Finish the stakeholder presentation", "Clear the urgent inbox"],
    },
    {
      title: "Self-employed",
      color: "var(--lavender)",
      desc: "For founders and freelancers juggling client work, cashflow, and growth.",
      examples: ["Chase the overdue invoice", "Send two new proposals"],
    },
    {
      title: "Student",
      color: "var(--sage)",
      desc: "For students managing assignments, exams, and the pressure to perform.",
      examples: ["Two hours of focused revision", "Review yesterday's notes"],
    },
    {
      title: "Figuring it out",
      color: "var(--blush)",
      desc: "For anyone between chapters, exploring what comes next.",
      examples: ["Research one new direction", "Reach out to one person"],
    },
  ];

  return (
    <section className="who-section" ref={ref}>
      <div className="section-inner">
        <div className={`who-header reveal ${v ? "visible" : ""}`}>
          <span className="eyebrow">Who it's for</span>
          <h2 className="section-heading">Built for the way you actually work.</h2>
        </div>

        <div className="who-grid">
          {cards.map((c, i) => (
            <div
              key={i}
              className={`who-card reveal ${v ? "visible" : ""}`}
              style={{ transitionDelay: `${0.1 + i * 0.1}s` }}
            >
              <div className="who-card-header">
                <div className="who-dot" style={{ background: c.color }} />
                <div className="who-title">{c.title}</div>
              </div>
              <p className="who-desc">{c.desc}</p>
              <div className="who-examples">
                {c.examples.map((ex, j) => (
                  <div key={j} className="who-example">{ex}</div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className={`reveal ${v ? "visible" : ""} d5`} style={{ textAlign: "center", marginTop: 64 }}>
          <button className="btn-primary-inv" style={{ fontSize: 15, padding: "14px 32px" }}>
            Start free — no credit card needed
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── Full page ───────────────────────────────────────────────────
export default function DayeSections() {
  return (
    <>
      <style>{style}</style>
      <div className="page">
        <ProblemSection />
        <HowSection />
        <DemoSection />
        <WhoSection />
      </div>
    </>
  );
}

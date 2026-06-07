import { useState, useEffect, useRef } from "react";

const BRAND = {
  ink: "#1C1C1A",
  linen: "#F5F2EC",
  lavender: "#C5BFD4",
  blush: "#E8D5CC",
  sage: "#B8C4B1",
  inkLight: "#3D3D3A",
  inkMuted: "#6B6B66",
};

const grainSVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`;

const style = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,300;1,400;1,500;1,600&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --ink: ${BRAND.ink};
    --linen: ${BRAND.linen};
    --lavender: ${BRAND.lavender};
    --blush: ${BRAND.blush};
    --sage: ${BRAND.sage};
    --ink-muted: ${BRAND.inkMuted};
  }

  body { background: var(--linen); }

  .hero-root {
    font-family: 'DM Sans', sans-serif;
    background: var(--linen);
    min-height: 100vh;
    position: relative;
    overflow: hidden;
    color: var(--ink);
  }

  /* Grain overlay */
  .hero-root::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image: ${grainSVG};
    background-size: 200px 200px;
    pointer-events: none;
    z-index: 100;
    opacity: 0.6;
  }

  /* Ambient glow blobs */
  .blob {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    pointer-events: none;
  }
  .blob-1 {
    width: 600px; height: 600px;
    background: radial-gradient(circle, rgba(197,191,212,0.22) 0%, transparent 70%);
    top: -100px; right: -100px;
    animation: drift1 12s ease-in-out infinite;
  }
  .blob-2 {
    width: 400px; height: 400px;
    background: radial-gradient(circle, rgba(232,213,204,0.2) 0%, transparent 70%);
    bottom: 100px; left: -50px;
    animation: drift2 15s ease-in-out infinite;
  }
  .blob-3 {
    width: 300px; height: 300px;
    background: radial-gradient(circle, rgba(184,196,177,0.15) 0%, transparent 70%);
    top: 40%; left: 40%;
    animation: drift3 18s ease-in-out infinite;
  }

  @keyframes drift1 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(-30px, 20px) scale(1.05); }
    66% { transform: translate(20px, -15px) scale(0.97); }
  }
  @keyframes drift2 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    50% { transform: translate(25px, -30px) scale(1.08); }
  }
  @keyframes drift3 {
    0%, 100% { transform: translate(0, 0); }
    40% { transform: translate(-20px, 20px); }
    70% { transform: translate(15px, -10px); }
  }

  /* Nav */
  .nav {
    position: fixed; top: 0; left: 0; right: 0;
    z-index: 50;
    padding: 0 48px;
    height: 72px;
    display: flex; align-items: center; justify-content: space-between;
    transition: background 0.4s, backdrop-filter 0.4s, border-bottom 0.4s;
  }
  .nav.scrolled {
    background: rgba(245,242,236,0.82);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-bottom: 1px solid rgba(28,28,26,0.07);
  }
  .nav-logo {
    font-family: 'Cormorant Garamond', serif;
    font-style: italic;
    font-weight: 400;
    font-size: 22px;
    letter-spacing: -0.01em;
    color: var(--ink);
    text-decoration: none;
  }
  .nav-links {
    display: flex; align-items: center; gap: 32px;
    list-style: none;
  }
  .nav-links a {
    font-size: 14px; font-weight: 400; letter-spacing: 0.01em;
    color: var(--ink-muted); text-decoration: none;
    transition: color 0.2s;
  }
  .nav-links a:hover { color: var(--ink); }
  .nav-links .pro { color: var(--lavender); font-weight: 500; }
  .nav-divider { width: 1px; height: 20px; background: rgba(28,28,26,0.15); }
  .btn-primary {
    background: var(--ink); color: var(--linen);
    border: none; border-radius: 8px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px; font-weight: 500;
    padding: 10px 22px; cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s, background 0.2s;
    letter-spacing: 0.01em;
  }
  .btn-primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(28,28,26,0.18);
  }
  .btn-secondary {
    background: transparent; color: var(--ink);
    border: 1px solid rgba(28,28,26,0.2); border-radius: 8px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px; font-weight: 400;
    padding: 10px 22px; cursor: pointer;
    transition: border-color 0.2s, background 0.2s;
  }
  .btn-secondary:hover {
    border-color: rgba(28,28,26,0.4);
    background: rgba(28,28,26,0.03);
  }

  /* Hero layout */
  .hero-body {
    min-height: 100vh;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0;
    align-items: center;
    padding: 100px 48px 60px;
    max-width: 1200px;
    margin: 0 auto;
  }

  /* Left: copy */
  .hero-copy { padding-right: 60px; }
  .eyebrow {
    font-size: 11px; font-weight: 500; letter-spacing: 0.14em;
    text-transform: uppercase; color: var(--ink-muted);
    margin-bottom: 28px;
    opacity: 0; transform: translateY(16px);
    transition: opacity 0.7s 0.1s, transform 0.7s 0.1s;
  }
  .eyebrow.in { opacity: 1; transform: translateY(0); }

  .headline-wrap { overflow: hidden; margin-bottom: 6px; }
  .headline-line {
    display: block;
    font-family: 'Cormorant Garamond', serif;
    font-style: italic;
    font-weight: 400;
    font-size: clamp(52px, 5.5vw, 78px);
    line-height: 1.05;
    letter-spacing: -0.02em;
    color: var(--ink);
    opacity: 0; transform: translateY(40px);
    transition: opacity 0.8s, transform 0.8s;
  }
  .headline-line.in { opacity: 1; transform: translateY(0); }
  .headline-line:nth-child(1) { transition-delay: 0.25s; }
  .headline-line:nth-child(2) { transition-delay: 0.4s; }

  .subheadline {
    font-size: 15px; font-weight: 300; line-height: 1.65;
    color: var(--ink-muted); max-width: 400px;
    margin-top: 24px; margin-bottom: 36px;
    opacity: 0; transform: translateY(16px);
    transition: opacity 0.7s 0.6s, transform 0.7s 0.6s;
  }
  .subheadline.in { opacity: 1; transform: translateY(0); }

  .cta-row {
    display: flex; gap: 12px; align-items: center; flex-wrap: wrap;
    opacity: 0; transform: translateY(16px);
    transition: opacity 0.7s 0.75s, transform 0.7s 0.75s;
  }
  .cta-row.in { opacity: 1; transform: translateY(0); }

  .cta-note {
    font-size: 12px; color: var(--ink-muted);
    margin-top: 16px; letter-spacing: 0.02em;
    opacity: 0;
    transition: opacity 0.7s 0.9s;
  }
  .cta-note.in { opacity: 1; }

  /* Right: floating card */
  .hero-card-wrap {
    display: flex; justify-content: center; align-items: center;
    position: relative;
    opacity: 0; transform: translateY(30px) scale(0.97);
    transition: opacity 0.9s 0.5s, transform 0.9s 0.5s;
  }
  .hero-card-wrap.in { opacity: 1; transform: translateY(0) scale(1); }

  /* Subtle float animation once in */
  .hero-card-wrap.in .card-floater {
    animation: floatCard 6s ease-in-out infinite;
  }
  @keyframes floatCard {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }

  .card-glow {
    position: absolute;
    width: 110%; height: 110%;
    background: radial-gradient(ellipse at 50% 60%, rgba(197,191,212,0.3) 0%, transparent 65%);
    filter: blur(30px);
    z-index: 0;
  }

  .card-floater {
    position: relative; z-index: 1;
    width: 100%; max-width: 420px;
  }

  .daye-card {
    background: #ffffff;
    border-radius: 20px;
    padding: 32px 36px 28px;
    box-shadow:
      0 1px 2px rgba(28,28,26,0.04),
      0 8px 32px rgba(28,28,26,0.08),
      0 32px 64px rgba(28,28,26,0.06);
  }

  .card-header {
    display: flex; justify-content: space-between; align-items: flex-start;
    margin-bottom: 20px;
  }
  .card-logo {
    font-family: 'Cormorant Garamond', serif;
    font-style: italic; font-weight: 400;
    font-size: 18px; color: var(--ink);
  }
  .card-date-badge {
    font-size: 11px; font-weight: 500; letter-spacing: 0.08em;
    text-transform: uppercase; color: var(--ink-muted);
    background: rgba(28,28,26,0.05);
    padding: 4px 10px; border-radius: 20px;
  }

  .card-name {
    font-family: 'Cormorant Garamond', serif;
    font-style: italic; font-weight: 400;
    font-size: 30px; color: var(--ink);
    margin-bottom: 20px;
    line-height: 1.1;
  }

  .card-section-label {
    font-size: 10px; font-weight: 500; letter-spacing: 0.12em;
    text-transform: uppercase; color: var(--ink-muted);
    margin-bottom: 10px;
  }

  .focus-item {
    border-left: 2px solid var(--ink);
    padding: 8px 0 8px 14px;
    margin-bottom: 8px;
    position: relative;
  }
  .focus-item.secondary { border-left-color: rgba(28,28,26,0.2); }
  .focus-title {
    font-size: 14px; font-weight: 500; color: var(--ink);
    margin-bottom: 2px;
  }
  .focus-meta {
    font-size: 12px; color: var(--ink-muted);
  }

  .card-divider {
    height: 1px; background: rgba(28,28,26,0.07);
    margin: 18px 0;
  }

  .time-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;
    margin-top: 10px;
  }
  .time-block {
    background: rgba(28,28,26,0.04);
    border-radius: 8px; padding: 8px 10px;
  }
  .time-label { font-size: 10px; color: var(--ink-muted); margin-bottom: 2px; }
  .time-task { font-size: 12px; font-weight: 500; color: var(--ink); }

  .avoid-row {
    display: flex; gap: 6px; flex-wrap: wrap; margin-top: 10px;
  }
  .avoid-tag {
    font-size: 11px; color: var(--ink-muted);
    background: rgba(28,28,26,0.04);
    border: 1px solid rgba(28,28,26,0.08);
    padding: 4px 10px; border-radius: 20px;
  }

  /* Scroll indicator */
  .scroll-hint {
    position: absolute; bottom: 36px; left: 50%; transform: translateX(-50%);
    display: flex; flex-direction: column; align-items: center; gap: 8px;
    opacity: 0; transition: opacity 0.7s 1.4s;
    cursor: pointer;
  }
  .scroll-hint.in { opacity: 1; }
  .scroll-hint span {
    font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase;
    color: var(--ink-muted);
  }
  .scroll-line {
    width: 1px; height: 40px;
    background: linear-gradient(to bottom, var(--ink-muted), transparent);
    animation: scrollPulse 2s ease-in-out infinite;
  }
  @keyframes scrollPulse {
    0%, 100% { opacity: 0.4; transform: scaleY(1); }
    50% { opacity: 1; transform: scaleY(0.7); }
  }

  /* Cursor dot */
  .cursor-dot {
    position: fixed; width: 6px; height: 6px;
    background: var(--ink); border-radius: 50%;
    pointer-events: none; z-index: 9999;
    transform: translate(-50%, -50%);
    transition: transform 0.1s, width 0.3s, height 0.3s, opacity 0.3s;
    mix-blend-mode: multiply;
  }
  .cursor-ring {
    position: fixed; width: 32px; height: 32px;
    border: 1px solid rgba(28,28,26,0.25); border-radius: 50%;
    pointer-events: none; z-index: 9998;
    transform: translate(-50%, -50%);
    transition: transform 0.15s ease-out, width 0.3s, height 0.3s, border-color 0.3s;
  }

  @media (max-width: 900px) {
    .hero-body {
      grid-template-columns: 1fr;
      padding: 80px 24px 80px;
      text-align: center;
    }
    .hero-copy { padding-right: 0; }
    .subheadline { margin-left: auto; margin-right: auto; }
    .cta-row { justify-content: center; }
    .hero-card-wrap { margin-top: 48px; }
  }
`;

export default function DayeHero() {
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [cursor, setCursor] = useState({ x: -100, y: -100 });
  const [ringPos, setRingPos] = useState({ x: -100, y: -100 });
  const ringRef = useRef({ x: -100, y: -100 });
  const rafRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 80);
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);

    const onMove = (e) => {
      setCursor({ x: e.clientX, y: e.clientY });
      ringRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", onMove);

    const animateRing = () => {
      setRingPos(prev => ({
        x: prev.x + (ringRef.current.x - prev.x) * 0.12,
        y: prev.y + (ringRef.current.y - prev.y) * 0.12,
      }));
      rafRef.current = requestAnimationFrame(animateRing);
    };
    rafRef.current = requestAnimationFrame(animateRing);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const v = visible ? "in" : "";

  return (
    <>
      <style>{style}</style>

      {/* Custom cursor */}
      <div className="cursor-dot" style={{ left: cursor.x, top: cursor.y }} />
      <div className="cursor-ring" style={{ left: ringPos.x, top: ringPos.y }} />

      <div className="hero-root">
        {/* Ambient blobs */}
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />

        {/* Nav */}
        <nav className={`nav ${scrolled ? "scrolled" : ""}`}>
          <a href="#" className="nav-logo">daye</a>
          <ul className="nav-links">
            <li><a href="#">Blog</a></li>
            <li><a href="#" className="pro">Pro</a></li>
            <li><a href="#">Sign in</a></li>
            <li><div className="nav-divider" /></li>
            <li><button className="btn-primary">Start free</button></li>
          </ul>
        </nav>

        {/* Hero */}
        <div className="hero-body">
          {/* Copy */}
          <div className="hero-copy">
            <p className={`eyebrow ${v}`}>Your daily focus companion</p>

            <div>
              <div className="headline-wrap">
                <span className={`headline-line ${v}`}>Not a list.</span>
              </div>
              <div className="headline-wrap">
                <span className={`headline-line ${v}`}>A decision.</span>
              </div>
            </div>

            <p className={`subheadline ${v}`}>
              Every morning, Daye reads your energy, your goals, and your day
              — then tells you exactly what to focus on.
            </p>

            <div className={`cta-row ${v}`}>
              <button className="btn-primary" style={{ padding: "13px 28px", fontSize: "15px" }}>
                Start free
              </button>
              <button className="btn-secondary" style={{ padding: "13px 28px", fontSize: "15px" }}>
                See how it works
              </button>
            </div>

            <p className={`cta-note ${v}`}>Free to start · No credit card needed</p>
          </div>

          {/* Card */}
          <div className={`hero-card-wrap ${v}`}>
            <div className="card-glow" />
            <div className="card-floater">
              <div className="daye-card">
                <div className="card-header">
                  <span className="card-logo">daye</span>
                  <span className="card-date-badge">Monday · Focus Day</span>
                </div>

                <div className="card-name">Shannon's plan.</div>

                <div className="card-section-label">Focus on</div>

                <div className="focus-item">
                  <div className="focus-title">Finish the Q2 campaign brief</div>
                  <div className="focus-meta">Most important · Do this first</div>
                </div>
                <div className="focus-item secondary">
                  <div className="focus-title">Prep for manager 1:1</div>
                  <div className="focus-meta">Career move · High value</div>
                </div>

                <div className="card-divider" />

                <div className="card-section-label">Time split</div>
                <div className="time-grid">
                  <div className="time-block">
                    <div className="time-label">9–11am</div>
                    <div className="time-task">Campaign brief</div>
                  </div>
                  <div className="time-block">
                    <div className="time-label">11–12pm</div>
                    <div className="time-task">1:1 prep</div>
                  </div>
                  <div className="time-block">
                    <div className="time-label">Afternoon</div>
                    <div className="time-task">Clear comms</div>
                  </div>
                </div>

                <div className="card-divider" />

                <div className="card-section-label">Avoid today</div>
                <div className="avoid-row">
                  <span className="avoid-tag">Non-urgent Slack</span>
                  <span className="avoid-tag">Unplanned calls</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div className={`scroll-hint ${v}`}>
          <div className="scroll-line" />
          <span>scroll</span>
        </div>
      </div>
    </>
  );
}

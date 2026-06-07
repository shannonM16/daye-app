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

const posts = [
  {
    tag: "Focus",
    tagColor: "var(--blush)",
    title: "How to actually decide what to work on each morning",
    excerpt: "There is a particular kind of paralysis that hits most mornings. You sit down to work, you know you have things to do, and yet somehow twenty minutes pass and you…",
    read: "5 min read",
    featured: true,
  },
  {
    tag: "Productivity",
    tagColor: "var(--lavender)",
    title: "Why your to-do list is making you less productive",
    excerpt: "If you have ever ended a day having crossed nothing off your list despite being busy the entire time, you already know something is wrong. The list was full. The day was…",
    read: "4 min read",
    featured: false,
  },
  {
    tag: "Habits",
    tagColor: "var(--sage)",
    title: "The 60-second morning routine that actually changes your day",
    excerpt: "Most morning routine advice is aspirational to the point of uselessness. Wake up at 5am. Meditate for twenty minutes. Journal three pages. By the time you have…",
    read: "3 min read",
    featured: false,
  },
];

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

.blog-page {
  font-family: 'DM Sans', sans-serif;
  background: var(--linen);
  color: var(--ink);
  min-height: 100vh;
  overflow-x: hidden;
  position: relative;
}

.blog-page::before {
  content: '';
  position: fixed; inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
  background-size: 200px 200px;
  pointer-events: none; z-index: 999; opacity: 0.7;
}

/* Nav */
.nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 50;
  padding: 0 48px; height: 72px;
  display: flex; align-items: center; justify-content: space-between;
  background: rgba(245,242,236,0.82);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(28,28,26,0.07);
}
.nav-logo {
  font-family: 'Cormorant Garamond', serif;
  font-style: italic; font-weight: 400;
  font-size: 22px; color: var(--ink); text-decoration: none;
}
.nav-links { display: flex; align-items: center; gap: 28px; list-style: none; }
.nav-links a {
  font-size: 14px; color: var(--ink-muted); text-decoration: none;
  transition: color 0.2s;
}
.nav-links a:hover { color: var(--ink); }
.nav-links .active { color: var(--ink); font-weight: 500; }
.nav-links .pro { color: var(--lavender); font-weight: 500; }
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
.blog-hero {
  padding: 160px 0 80px;
  max-width: 1200px; margin: 0 auto; padding-left: 48px; padding-right: 48px;
  position: relative;
}

.blog-hero-inner {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 80px; align-items: end;
}

.blog-eyebrow {
  font-size: 11px; font-weight: 500; letter-spacing: 0.14em;
  text-transform: uppercase; color: var(--ink-muted);
  margin-bottom: 20px; display: block;
}

.blog-heading {
  font-family: 'Cormorant Garamond', serif;
  font-style: italic; font-weight: 400;
  font-size: clamp(48px, 5.5vw, 76px);
  line-height: 1.05; letter-spacing: -0.02em; color: var(--ink);
}

.blog-subhead {
  font-size: 15px; font-weight: 300; line-height: 1.7;
  color: var(--ink-muted); margin-top: 20px; max-width: 380px;
}

/* Stats side */
.blog-stats {
  display: flex; flex-direction: column; gap: 24px;
  padding-bottom: 8px;
}
.blog-stat {
  display: flex; align-items: center; gap: 16px;
  padding: 20px 24px;
  border: 1px solid rgba(28,28,26,0.08);
  border-radius: 14px;
  background: rgba(255,255,255,0.5);
  transition: transform 0.3s, box-shadow 0.3s;
}
.blog-stat:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 20px rgba(28,28,26,0.07);
}
.blog-stat-dot {
  width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0;
}
.blog-stat-label { font-size: 13px; color: var(--ink-muted); }
.blog-stat-count {
  font-family: 'Cormorant Garamond', serif;
  font-style: italic; font-size: 28px; color: var(--ink);
  margin-left: auto;
}

.blog-divider {
  max-width: 1200px; margin: 0 auto 60px;
  padding: 0 48px;
  height: 1px; background: rgba(28,28,26,0.08);
}

/* Grid */
.blog-grid-wrap {
  max-width: 1200px; margin: 0 auto;
  padding: 0 48px 120px;
}

/* Featured */
.featured-card {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 0;
  border-radius: 20px; overflow: hidden;
  background: white;
  box-shadow: 0 2px 8px rgba(28,28,26,0.06), 0 16px 48px rgba(28,28,26,0.06);
  margin-bottom: 24px;
  cursor: pointer;
  transition: transform 0.35s, box-shadow 0.35s;
  text-decoration: none; color: inherit;
}
.featured-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(28,28,26,0.1), 0 32px 64px rgba(28,28,26,0.08);
}
.featured-visual {
  background: linear-gradient(135deg, #EDE8E0 0%, #E4DDD4 100%);
  position: relative; overflow: hidden;
  min-height: 320px;
  display: flex; align-items: center; justify-content: center;
}
.featured-visual-blob {
  position: absolute; border-radius: 50%; filter: blur(50px); pointer-events: none;
}
.featured-visual-blob-1 {
  width: 200px; height: 200px;
  background: radial-gradient(circle, rgba(232,213,204,0.8) 0%, transparent 70%);
  top: -20px; right: -20px;
  animation: blobA 9s ease-in-out infinite;
}
.featured-visual-blob-2 {
  width: 150px; height: 150px;
  background: radial-gradient(circle, rgba(197,191,212,0.6) 0%, transparent 70%);
  bottom: 20px; left: 20px;
  animation: blobB 7s ease-in-out infinite;
}
@keyframes blobA { 0%,100%{transform:scale(1) translate(0,0)} 50%{transform:scale(1.15) translate(-10px,10px)} }
@keyframes blobB { 0%,100%{transform:scale(1) translate(0,0)} 50%{transform:scale(0.9) translate(8px,-8px)} }

.featured-visual-text {
  position: relative; z-index: 1;
  font-family: 'Cormorant Garamond', serif;
  font-style: italic; font-weight: 300;
  font-size: 52px; color: rgba(28,28,26,0.12);
  text-align: center; padding: 24px;
  line-height: 1.1;
  user-select: none;
}

.featured-content {
  padding: 44px 44px;
  display: flex; flex-direction: column; justify-content: center;
}

/* Regular cards */
.cards-row {
  display: grid; grid-template-columns: 1fr 1fr; gap: 20px;
}

.post-card {
  background: white; border-radius: 16px;
  padding: 36px; cursor: pointer;
  box-shadow: 0 1px 4px rgba(28,28,26,0.05), 0 8px 24px rgba(28,28,26,0.05);
  transition: transform 0.3s, box-shadow 0.3s;
  text-decoration: none; color: inherit;
  display: flex; flex-direction: column;
  position: relative; overflow: hidden;
}
.post-card::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 3px;
  opacity: 0; transition: opacity 0.3s;
}
.post-card:nth-child(1)::before { background: var(--lavender); }
.post-card:nth-child(2)::before { background: var(--sage); }
.post-card:hover { transform: translateY(-4px); box-shadow: 0 8px 32px rgba(28,28,26,0.1); }
.post-card:hover::before { opacity: 1; }

/* Shared card elements */
.card-tag {
  font-size: 10px; font-weight: 500; letter-spacing: 0.12em;
  text-transform: uppercase;
  display: inline-flex; align-items: center; gap: 6px;
  margin-bottom: 14px;
  color: var(--ink-muted);
}
.card-tag-dot { width: 6px; height: 6px; border-radius: 50%; }

.card-title {
  font-family: 'Cormorant Garamond', serif;
  font-style: italic; font-weight: 400;
  font-size: 24px; line-height: 1.2; color: var(--ink);
  margin-bottom: 14px;
}
.featured-content .card-title { font-size: 32px; margin-bottom: 16px; }

.card-excerpt {
  font-size: 14px; font-weight: 300; line-height: 1.7;
  color: var(--ink-muted); flex: 1;
}

.card-footer {
  display: flex; align-items: center; justify-content: space-between;
  margin-top: 24px; padding-top: 20px;
  border-top: 1px solid rgba(28,28,26,0.07);
}
.card-read { font-size: 12px; color: var(--ink-muted); }
.card-arrow {
  font-size: 14px; color: var(--ink-muted);
  transition: transform 0.2s, color 0.2s;
}
.post-card:hover .card-arrow,
.featured-card:hover .card-arrow { transform: translateX(4px); color: var(--ink); }

/* Reveal */
.reveal { opacity: 0; transform: translateY(28px); transition: opacity 0.8s ease, transform 0.8s ease; }
.reveal.visible { opacity: 1; transform: translateY(0); }
.d1 { transition-delay: 0.1s; } .d2 { transition-delay: 0.2s; }
.d3 { transition-delay: 0.3s; } .d4 { transition-delay: 0.4s; }

@media (max-width: 860px) {
  .blog-hero-inner { grid-template-columns: 1fr; gap: 40px; }
  .blog-stats { flex-direction: row; flex-wrap: wrap; }
  .featured-card { grid-template-columns: 1fr; }
  .featured-visual { min-height: 200px; }
  .cards-row { grid-template-columns: 1fr; }
  .nav { padding: 0 24px; }
  .blog-hero, .blog-grid-wrap { padding-left: 24px; padding-right: 24px; }
  .blog-divider { padding: 0 24px; }
}
`;

function PostCard({ post, index }) {
  const [ref, v] = useReveal(0.1);
  return (
    <a
      href="#"
      className={`post-card reveal ${v ? "visible" : ""}`}
      ref={ref}
      style={{ transitionDelay: `${0.1 + index * 0.12}s` }}
    >
      <div className="card-tag">
        <span className="card-tag-dot" style={{ background: post.tagColor }} />
        {post.tag}
      </div>
      <h3 className="card-title">{post.title}</h3>
      <p className="card-excerpt">{post.excerpt}</p>
      <div className="card-footer">
        <span className="card-read">{post.read}</span>
        <span className="card-arrow">→</span>
      </div>
    </a>
  );
}

export default function BlogPage() {
  const [heroRef, heroV] = useReveal(0.05);
  const [statsRef, statsV] = useReveal(0.1);
  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <>
      <style>{css}</style>
      <div className="blog-page">

        {/* Nav */}
        <nav className="nav">
          <a href="/" className="nav-logo">daye</a>
          <ul className="nav-links">
            <li><a href="/blog" className="active">Blog</a></li>
            <li><a href="/pro" className="pro">Pro</a></li>
            <li><a href="/signin">Sign in</a></li>
            <li><div className="nav-divider" /></li>
            <li><button className="btn-nav">Start free</button></li>
          </ul>
        </nav>

        {/* Hero */}
        <div className="blog-hero" ref={heroRef}>
          <div className="blog-hero-inner">
            <div>
              <span className={`blog-eyebrow reveal ${heroV ? "visible" : ""}`}>The Daye blog</span>
              <h1 className={`blog-heading reveal ${heroV ? "visible" : ""} d1`}>
                Thoughts on focus, work, and getting things done.
              </h1>
              <p className={`blog-subhead reveal ${heroV ? "visible" : ""} d2`}>
                Ideas for people who want to do their best work every day.
              </p>
            </div>

            <div className={`blog-stats reveal ${heroV ? "visible" : ""} d2`} ref={statsRef}>
              {[
                { label: "Focus", color: "var(--blush)", count: "01" },
                { label: "Productivity", color: "var(--lavender)", count: "01" },
                { label: "Habits", color: "var(--sage)", count: "01" },
              ].map((s, i) => (
                <div key={i} className="blog-stat">
                  <div className="blog-stat-dot" style={{ background: s.color }} />
                  <span className="blog-stat-label">{s.label}</span>
                  <span className="blog-stat-count">{s.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="blog-divider" />

        {/* Posts */}
        <div className="blog-grid-wrap">
          {/* Featured */}
          <FeaturedCard post={featured} />

          {/* Rest */}
          <div className="cards-row">
            {rest.map((p, i) => <PostCard key={i} post={p} index={i} />)}
          </div>
        </div>

      </div>
    </>
  );
}

function FeaturedCard({ post }) {
  const [ref, v] = useReveal(0.1);
  return (
    <a href="#" className={`featured-card reveal ${v ? "visible" : ""}`} ref={ref}>
      <div className="featured-visual">
        <div className="featured-visual-blob featured-visual-blob-1" />
        <div className="featured-visual-blob featured-visual-blob-2" />
        <div className="featured-visual-text">decide.</div>
      </div>
      <div className="featured-content">
        <div className="card-tag">
          <span className="card-tag-dot" style={{ background: post.tagColor }} />
          {post.tag} · Featured
        </div>
        <h2 className="card-title">{post.title}</h2>
        <p className="card-excerpt">{post.excerpt}</p>
        <div className="card-footer">
          <span className="card-read">{post.read}</span>
          <span className="card-arrow">→</span>
        </div>
      </div>
    </a>
  );
}

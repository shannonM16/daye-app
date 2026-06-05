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
    slug: "how-to-actually-decide-what-to-work-on-each-morning",
    tag: "Focus",
    tagColor: "#E8D5CC",
    title: "How to actually decide what to work on each morning",
    excerpt: "There is a particular kind of paralysis that hits most mornings. You sit down to work, you know you have things to do, and yet somehow twenty minutes pass and you…",
    read: "5 min read",
    featured: true,
  },
  {
    slug: "why-your-to-do-list-is-making-you-less-productive",
    tag: "Productivity",
    tagColor: "#C5BFD4",
    title: "Why your to-do list is making you less productive",
    excerpt: "If you have ever ended a day having crossed nothing off your list despite being busy the entire time, you already know something is wrong. The list was full. The day was…",
    read: "4 min read",
    featured: false,
  },
  {
    slug: "the-60-second-morning-routine",
    tag: "Habits",
    tagColor: "#B8C4B1",
    title: "The 60-second morning routine that actually changes your day",
    excerpt: "Most morning routine advice is aspirational to the point of uselessness. Wake up at 5am. Meditate for twenty minutes. Journal three pages. By the time you have…",
    read: "3 min read",
    featured: false,
  },
];

const css = `
  .blog-page {
    font-family: var(--font-sans, 'DM Sans', sans-serif);
    background: var(--color-linen, #F5F2EC);
    color: var(--color-ink, #1C1C1A);
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
  .blog-hero {
    padding: 80px 48px 60px;
    max-width: 1200px; margin: 0 auto;
  }
  .blog-hero-inner {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 80px; align-items: end;
  }
  .blog-eyebrow {
    font-size: 11px; font-weight: 500; letter-spacing: 0.14em;
    text-transform: uppercase; color: var(--color-muted, #6B6B66);
    margin-bottom: 20px; display: block;
  }
  .blog-heading {
    font-family: var(--font-serif, 'Cormorant Garamond', serif);
    font-style: italic; font-weight: 400;
    font-size: clamp(42px, 5vw, 68px);
    line-height: 1.05; letter-spacing: -0.02em;
    color: var(--color-ink, #1C1C1A);
  }
  .blog-subhead {
    font-size: 15px; font-weight: 300; line-height: 1.7;
    color: var(--color-muted, #6B6B66); margin-top: 18px; max-width: 380px;
  }
  .blog-stats {
    display: flex; flex-direction: column; gap: 12px;
    padding-bottom: 8px;
  }
  .blog-stat {
    display: flex; align-items: center; gap: 14px;
    padding: 16px 20px;
    border: 1px solid rgba(28,28,26,0.08);
    border-radius: 14px;
    background: rgba(255,255,255,0.5);
    transition: transform 0.3s;
    cursor: default;
  }
  .blog-stat:hover { transform: translateX(4px); }
  .blog-stat-dot { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; }
  .blog-stat-label { font-size: 13px; color: var(--color-muted, #6B6B66); }
  .blog-stat-count {
    font-family: var(--font-serif, 'Cormorant Garamond', serif);
    font-style: italic; font-size: 26px;
    color: var(--color-ink, #1C1C1A); margin-left: auto;
  }
  .blog-divider {
    max-width: 1200px; margin: 0 auto 48px;
    padding: 0 48px;
    height: 1px; background: rgba(28,28,26,0.08);
  }
  .blog-grid-wrap {
    max-width: 1200px; margin: 0 auto;
    padding: 0 48px 100px;
  }
  .featured-card {
    display: grid; grid-template-columns: 1fr 1fr;
    border-radius: 20px; overflow: hidden;
    background: white;
    box-shadow: 0 2px 8px rgba(28,28,26,0.06), 0 16px 48px rgba(28,28,26,0.06);
    margin-bottom: 20px;
    cursor: pointer;
    transition: transform 0.35s, box-shadow 0.35s;
    text-decoration: none; color: inherit;
  }
  .featured-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 32px rgba(28,28,26,0.1), 0 32px 64px rgba(28,28,26,0.07);
  }
  .featured-visual {
    background: linear-gradient(135deg, #EDE8E0 0%, #E4DDD4 100%);
    position: relative; overflow: hidden;
    min-height: 300px;
    display: flex; align-items: center; justify-content: center;
  }
  .fv-blob {
    position: absolute; border-radius: 50%; filter: blur(50px); pointer-events: none;
  }
  .fv-blob-1 {
    width: 200px; height: 200px;
    background: radial-gradient(circle, rgba(232,213,204,0.8) 0%, transparent 70%);
    top: -20px; right: -20px;
    animation: fvb1 9s ease-in-out infinite;
  }
  .fv-blob-2 {
    width: 150px; height: 150px;
    background: radial-gradient(circle, rgba(197,191,212,0.6) 0%, transparent 70%);
    bottom: 20px; left: 20px;
    animation: fvb2 7s ease-in-out infinite;
  }
  @keyframes fvb1 { 0%,100%{transform:scale(1) translate(0,0)} 50%{transform:scale(1.15) translate(-10px,10px)} }
  @keyframes fvb2 { 0%,100%{transform:scale(1) translate(0,0)} 50%{transform:scale(0.9) translate(8px,-8px)} }
  .fv-text {
    position: relative; z-index: 1;
    font-family: var(--font-serif, 'Cormorant Garamond', serif);
    font-style: italic; font-weight: 300;
    font-size: 56px; color: rgba(28,28,26,0.1);
    user-select: none; padding: 24px; line-height: 1.1;
  }
  .featured-content { padding: 40px; display: flex; flex-direction: column; justify-content: center; }
  .cards-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .post-card {
    background: white; border-radius: 16px; padding: 32px;
    cursor: pointer;
    box-shadow: 0 1px 4px rgba(28,28,26,0.05), 0 8px 24px rgba(28,28,26,0.05);
    transition: transform 0.3s, box-shadow 0.3s;
    text-decoration: none; color: inherit;
    display: flex; flex-direction: column;
    position: relative; overflow: hidden;
  }
  .post-card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
    opacity: 0; transition: opacity 0.3s;
  }
  .post-card:nth-child(1)::before { background: #C5BFD4; }
  .post-card:nth-child(2)::before { background: #B8C4B1; }
  .post-card:hover { transform: translateY(-4px); box-shadow: 0 8px 32px rgba(28,28,26,0.1); }
  .post-card:hover::before { opacity: 1; }
  .card-tag {
    font-size: 10px; font-weight: 500; letter-spacing: 0.12em;
    text-transform: uppercase;
    display: inline-flex; align-items: center; gap: 6px;
    margin-bottom: 12px; color: var(--color-muted, #6B6B66);
  }
  .card-tag-dot { width: 6px; height: 6px; border-radius: 50%; }
  .card-title {
    font-family: var(--font-serif, 'Cormorant Garamond', serif);
    font-style: italic; font-weight: 400;
    font-size: 22px; line-height: 1.2;
    color: var(--color-ink, #1C1C1A); margin-bottom: 12px;
  }
  .featured-content .card-title { font-size: 30px; margin-bottom: 14px; }
  .card-excerpt {
    font-size: 14px; font-weight: 300; line-height: 1.7;
    color: var(--color-muted, #6B6B66); flex: 1;
  }
  .card-footer {
    display: flex; align-items: center; justify-content: space-between;
    margin-top: 20px; padding-top: 16px;
    border-top: 1px solid rgba(28,28,26,0.07);
  }
  .card-read { font-size: 12px; color: var(--color-muted, #6B6B66); }
  .card-arrow { font-size: 14px; color: var(--color-muted, #6B6B66); transition: transform 0.2s, color 0.2s; }
  .post-card:hover .card-arrow,
  .featured-card:hover .card-arrow { transform: translateX(4px); color: var(--color-ink, #1C1C1A); }
  .reveal { opacity: 0; transform: translateY(24px); transition: opacity 0.8s ease, transform 0.8s ease; }
  .reveal.visible { opacity: 1; transform: translateY(0); }
  .d1{transition-delay:.1s} .d2{transition-delay:.2s} .d3{transition-delay:.3s} .d4{transition-delay:.4s}
  @media(max-width:860px){
    .blog-hero { padding: 60px 24px 40px; }
    .blog-hero-inner { grid-template-columns: 1fr; gap: 36px; }
    .blog-stats { flex-direction: row; flex-wrap: wrap; gap: 8px; }
    .blog-stat { flex: 1 1 calc(50% - 8px); }
    .blog-divider, .blog-grid-wrap { padding-left: 24px; padding-right: 24px; }
    .featured-card { grid-template-columns: 1fr; }
    .featured-visual { min-height: 180px; }
    .featured-content { padding: 28px; }
    .cards-row { grid-template-columns: 1fr; }
  }
`;

export default function BlogIndex() {
  const [heroRef, heroV] = useReveal(0.05);
  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <>
      <style>{css}</style>
      <div className="blog-page">
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
            <div className={`blog-stats reveal ${heroV ? "visible" : ""} d2`}>
              {[
                { label: "Focus", color: "#E8D5CC", count: "01" },
                { label: "Productivity", color: "#C5BFD4", count: "01" },
                { label: "Habits", color: "#B8C4B1", count: "01" },
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

        <div className="blog-grid-wrap">
          <FeaturedCard post={featured} />
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
    <a href={`/blog/${post.slug}`} className={`featured-card reveal ${v ? "visible" : ""}`} ref={ref}>
      <div className="featured-visual">
        <div className="fv-blob fv-blob-1" />
        <div className="fv-blob fv-blob-2" />
        <div className="fv-text">decide.</div>
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

function PostCard({ post, index }) {
  const [ref, v] = useReveal(0.1);
  return (
    <a
      href={`/blog/${post.slug}`}
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

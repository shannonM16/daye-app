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

      {/* ── SECTION 5: THE OUTPUT ────────────────────────────── */}
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

      {/* ── SECTION 6: CTA ───────────────────────────────────── */}
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

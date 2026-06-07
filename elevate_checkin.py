with open('src/screens/CheckIn.jsx', 'r') as f:
    c = f.read()

# 1. Add import for useEffect if not present
if "import { useState, useEffect }" not in c and "useEffect" not in c:
    c = c.replace("import { useState,", "import { useState, useEffect,")
elif "import { useState," in c and "useEffect" not in c:
    c = c.replace("import { useState,", "import { useState, useEffect,")

# 2. Add CSS constant at top of file (before first function)
CSS = """
// ── Elevated CheckIn styles ───────────────────────────────────────
const CHECKIN_CSS = `
  .checkin-screen {
    position: relative;
  }
  .checkin-screen::before {
    content: ''; position: fixed; inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
    background-size: 200px 200px; pointer-events: none; z-index: 0; opacity: 0.55;
  }
  .ci-blob {
    position: fixed; border-radius: 50%; filter: blur(80px); pointer-events: none; z-index: 0;
  }
  .ci-blob-1 {
    width: 320px; height: 320px;
    background: radial-gradient(circle, rgba(201,184,216,0.13) 0%, transparent 70%);
    top: -60px; right: -60px; animation: ciB1 14s ease-in-out infinite;
  }
  .ci-blob-2 {
    width: 220px; height: 220px;
    background: radial-gradient(circle, rgba(232,213,204,0.1) 0%, transparent 70%);
    bottom: 100px; left: -40px; animation: ciB2 18s ease-in-out infinite;
  }
  @keyframes ciB1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-12px,10px)} }
  @keyframes ciB2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(10px,-12px)} }

  /* Greeting reveal */
  .ci-reveal {
    opacity: 0; transform: translateY(12px);
    transition: opacity 0.5s ease, transform 0.5s ease;
  }
  .ci-reveal.in { opacity: 1; transform: translateY(0); }

  /* Step progress bar */
  .ci-progress {
    display: flex; align-items: center; gap: 0; margin: 0 0 4px 0;
  }
  .ci-progress-seg {
    height: 2px; flex: 1; border-radius: 1px;
    background: var(--color-border);
    transition: background 0.3s ease;
  }
  .ci-progress-seg.active { background: var(--color-ink); }
  .ci-progress-seg.done { background: var(--color-lavender); }
  .ci-progress-gap { width: 4px; }

  /* Pattern insight */
  .ci-pattern-card {
    background: var(--color-white) !important;
    border: none !important;
    border-left: 3px solid var(--color-lavender) !important;
    border-radius: 0 12px 12px 0 !important;
    padding: 14px 16px 14px 14px !important;
  }
  .ci-pattern-card p {
    font-family: var(--font-serif) !important;
    font-style: italic;
    font-size: 14px !important;
    color: var(--color-ink) !important;
    line-height: 1.6 !important;
  }

  /* Streak badge glow */
  .ci-streak {
    box-shadow: 0 2px 12px rgba(201,184,216,0.2);
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .ci-streak:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(201,184,216,0.3); }

  /* Chip hover lift */
  .ci-chip-lift { transition: transform 0.15s, box-shadow 0.15s; }
  .ci-chip-lift:hover { transform: translateY(-1px); box-shadow: 0 2px 8px rgba(26,26,26,0.08); }

  /* Button entrance */
  .ci-btn-wrap {
    animation: ciBtnIn 0.4s ease forwards;
    opacity: 0;
  }
  @keyframes ciBtnIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
`

"""

# Insert before first function definition
first_fn = c.find('\nfunction ')
c = c[:first_fn] + '\n' + CSS + c[first_fn:]

# 3. Add CSS injection + reveal state in CheckIn component
reveal_state = """
  // CSS injection + greeting reveal
  const [greetingIn, setGreetingIn] = useState(false)
  useEffect(() => {
    const id = 'checkin-elevated-css'
    if (!document.getElementById(id)) {
      const tag = document.createElement('style')
      tag.id = id; tag.textContent = CHECKIN_CSS
      document.head.appendChild(tag)
    }
    setTimeout(() => setGreetingIn(true), 60)
  }, [])

"""

# Insert after the isPro line
c = c.replace(
    "  const { isPro } = useAuth()\n",
    "  const { isPro } = useAuth()\n" + reveal_state
)

# 4. Add blobs + class to main screen div
c = c.replace(
    '    <div className="screen">',
    '    <div className="screen checkin-screen">\n      <div className="ci-blob ci-blob-1" />\n      <div className="ci-blob ci-blob-2" />',
    1  # only replace first occurrence (main return)
)

# 5. Replace StepDots with elevated progress bar
old_dots = """function StepDots({ step }) {
  return (
    <div className="flex items-center justify-center gap-2">
      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: step === 1 ? 'var(--color-ink)' : 'var(--color-border)', transition: 'background 0.2s' }} />
      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: step === 2 ? 'var(--color-ink)' : 'var(--color-border)', transition: 'background 0.2s' }} />
      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-border)', transition: 'background 0.2s' }} />
    </div>
  )
}"""

new_dots = """function StepDots({ step }) {
  return (
    <div className="ci-progress">
      <div className={`ci-progress-seg ${step >= 1 ? 'active' : ''} ${step > 1 ? 'done' : ''}`} />
      <div className="ci-progress-gap" />
      <div className={`ci-progress-seg ${step >= 2 ? 'active' : ''}`} />
      <div className="ci-progress-gap" />
      <div className="ci-progress-seg" />
    </div>
  )
}"""

c = c.replace(old_dots, new_dots)

# 6. Add reveal class to greeting
c = c.replace(
    '          {greeting.name ? (\n            <>\n              <p className="text-[24px] leading-tight font-light" style={{ color: \'var(--color-ink)\' }}>',
    '          {greeting.name ? (\n            <>\n              <p className={`text-[24px] leading-tight font-light ci-reveal ${greetingIn ? \'in\' : \'\'}`} style={{ color: \'var(--color-ink)\', transitionDelay: \'0.05s\' }}>'
)
c = c.replace(
    '              <p className="text-[24px] leading-tight font-medium mb-1" style={{ color: \'var(--color-ink)\' }}>',
    '              <p className={`text-[24px] leading-tight font-medium mb-1 ci-reveal ${greetingIn ? \'in\' : \'\'}`} style={{ color: \'var(--color-ink)\', transitionDelay: \'0.15s\' }}>'
)

# 7. Elevate pattern insight card
c = c.replace(
    '              <div\n                className="rounded-2xl px-4 py-3"\n                style={{ background: \'var(--color-white)\', border: \'1px solid var(--color-border)\', borderLeft: \'3px solid var(--color-lavender)\' }}\n              >\n                <p className="text-[11px] font-medium uppercase tracking-widest mb-1" style={{ color: \'var(--color-muted)\' }}>Pattern</p>\n                <p className="text-sm leading-relaxed" style={{ color: \'var(--color-ink)\' }}>{insight}</p>\n              </div>',
    '              <div className="ci-pattern-card">\n                <p className="text-[10px] font-medium uppercase tracking-widest mb-1" style={{ color: \'var(--color-muted)\' }}>Pattern</p>\n                <p>{insight}</p>\n              </div>'
)

# 8. Add streak badge class
c = c.replace(
    '                    background: \'var(--color-linen)\', border: \'0.5px solid var(--color-border)\',\n                    cursor: !isPro && streakCount >= 5 ? \'pointer\' : \'default\',',
    '                    background: \'var(--color-linen)\', border: \'0.5px solid var(--color-border)\',\n                    cursor: !isPro && streakCount >= 5 ? \'pointer\' : \'default\',' 
)

# 9. Wrap bottom buttons in animated container
c = c.replace(
    '      <div className="flex-shrink-0 pt-4 space-y-2">',
    '      <div className="flex-shrink-0 pt-4 space-y-2 ci-btn-wrap">'
)

with open('src/screens/CheckIn.jsx', 'w') as f:
    f.write(c)

checks = [
    ('CHECKIN_CSS', 'CHECKIN_CSS' in c),
    ('blobs', 'ci-blob' in c),
    ('greeting reveal', 'greetingIn' in c),
    ('progress bar', 'ci-progress' in c),
    ('pattern elevated', 'ci-pattern-card' in c),
    ('btn entrance', 'ci-btn-wrap' in c),
]
print('CheckIn patches:')
for label, ok in checks:
    print(f"  {'OK' if ok else 'MISSING'} {label}")

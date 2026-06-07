import re

# ══════════════════════════════════════════════════════════════════
# 1. TASK INPUT — grain, blobs, title reveal, selected tasks elevated
# ══════════════════════════════════════════════════════════════════

with open('src/screens/TaskInput.jsx', 'r') as f:
    ti = f.read()

TASK_CSS = """
// ── Elevated TaskInput styles ─────────────────────────────────────
const TASK_CSS = `
  .task-screen { position: relative; }
  .task-screen::before {
    content: ''; position: fixed; inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
    background-size: 200px 200px; pointer-events: none; z-index: 0; opacity: 0.55;
  }
  .task-blob {
    position: fixed; border-radius: 50%; filter: blur(80px); pointer-events: none; z-index: 0;
  }
  .task-blob-1 {
    width: 300px; height: 300px;
    background: radial-gradient(circle, rgba(184,196,177,0.14) 0%, transparent 70%);
    top: -60px; right: -60px; animation: taskB1 14s ease-in-out infinite;
  }
  .task-blob-2 {
    width: 200px; height: 200px;
    background: radial-gradient(circle, rgba(201,184,216,0.1) 0%, transparent 70%);
    bottom: 80px; left: -30px; animation: taskB2 18s ease-in-out infinite;
  }
  @keyframes taskB1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-10px,10px)} }
  @keyframes taskB2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(10px,-10px)} }

  .task-reveal { opacity: 0; transform: translateY(12px); transition: opacity 0.5s ease, transform 0.5s ease; }
  .task-reveal.in { opacity: 1; transform: translateY(0); }

  /* Selected tasks section — elevated */
  .task-selected-card {
    background: var(--color-ink) !important;
    border-radius: 16px; padding: 16px !important;
  }
  .task-selected-label {
    color: rgba(249,247,245,0.45); font-size: 10px; font-weight: 500;
    letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 10px; display: block;
  }
  .task-selected-count {
    color: rgba(249,247,245,0.35); font-size: 10px;
  }
  .task-selected-item {
    background: rgba(249,247,245,0.07) !important;
    border: 0.5px solid rgba(249,247,245,0.1) !important;
    border-radius: 10px; padding: 8px 12px;
    margin-bottom: 6px;
  }
  .task-selected-item span { color: rgba(249,247,245,0.88) !important; }
  .task-selected-item button { color: rgba(249,247,245,0.4) !important; }
  .task-selected-dot { background: rgba(201,184,216,0.7) !important; }

  /* Chip hover */
  .task-chip-hover { transition: transform 0.15s, box-shadow 0.15s; }
  .task-chip-hover:hover { transform: translateY(-1px); box-shadow: 0 2px 8px rgba(26,26,26,0.08); }

  /* Divider text */
  .task-or-divider { opacity: 0.4; }
`

"""

# Insert before export default
export_pos = ti.find('\nexport default function TaskInput')
ti = ti[:export_pos] + '\n' + TASK_CSS + ti[export_pos:]

# Add useEffect if not there
if 'useEffect' not in ti:
    ti = ti.replace("import { useState, useEffect, useRef }", "import { useState, useEffect, useRef }")

# Add reveal state after loading state
reveal_code = """
  // CSS injection + title reveal
  const [titleIn, setTitleIn] = useState(false)
  useEffect(() => {
    const id = 'task-elevated-css'
    if (!document.getElementById(id)) {
      const tag = document.createElement('style')
      tag.id = id; tag.textContent = TASK_CSS
      document.head.appendChild(tag)
    }
    setTimeout(() => setTitleIn(true), 60)
  }, [])

"""
ti = ti.replace(
    "  const [loading, setLoading] = useState(false)\n",
    "  const [loading, setLoading] = useState(false)\n" + reveal_code
)

# Add blobs + class to screen div
ti = ti.replace(
    '    <div className="screen">\n      <div className="flex-1 overflow-y-auto space-y-5">',
    '    <div className="screen task-screen">\n      <div className="task-blob task-blob-1" />\n      <div className="task-blob task-blob-2" />\n      <div className="flex-1 overflow-y-auto space-y-5">'
)

# Add reveal to title
ti = ti.replace(
    '          <h1\n            style={{ fontFamily: \'var(--font-serif)\', fontStyle: \'italic\', color: \'var(--color-ink)\' }}\n            className="text-[28px] font-normal leading-tight mb-1"\n          >',
    '          <h1\n            style={{ fontFamily: \'var(--font-serif)\', fontStyle: \'italic\', color: \'var(--color-ink)\' }}\n            className={`text-[28px] font-normal leading-tight mb-1 task-reveal ${titleIn ? \'in\' : \'\'}`}\n          >'
)

# Elevate selected tasks section
old_selected = """        {selected.length > 0 && (
          <div>
            <div className="flex items-baseline justify-between mb-2">
              <label className="text-[11px] font-medium uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>
                Today's tasks
              </label>
              <span className="text-[11px]" style={{ color: 'var(--color-muted)' }}>
                {selected.length} {selected.length === 1 ? 'task' : 'tasks'}
              </span>
            </div>
            <div className="space-y-1.5">
              {selected.map((task) => (
                <div
                  key={task}
                  className="flex items-center justify-between"
                  style={{
                    padding: '8px 12px',
                    borderRadius: '10px',
                    background: 'var(--color-white)',
                    border: '0.5px solid var(--color-border)',
                  }}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      style={{
                        width: '7px', height: '7px', borderRadius: '50%',
                        background: 'var(--color-lavender)', flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontFamily: 'var(--font-sans)', fontSize: '13px',
                        color: 'var(--color-ink)', lineHeight: 1.4,
                      }}
                      className="truncate"
                    >
                      {task}
                    </span>
                  </div>
                  <button
                    onClick={() => removeTask(task)}
                    style={{
                      flexShrink: 0, marginLeft: '8px',
                      color: 'var(--color-muted)', background: 'none',
                      border: 'none', cursor: 'pointer', padding: '2px',
                      fontSize: '16px', lineHeight: 1,
                    }}
                    aria-label={`Remove ${task}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}"""

new_selected = """        {selected.length > 0 && (
          <div className="task-selected-card">
            <div className="flex items-baseline justify-between mb-2">
              <span className="task-selected-label">Today&#39;s tasks</span>
              <span className="task-selected-count">{selected.length} {selected.length === 1 ? 'task' : 'tasks'}</span>
            </div>
            <div className="space-y-1.5">
              {selected.map((task) => (
                <div key={task} className="task-selected-item flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="task-selected-dot" style={{ width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0 }} />
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', lineHeight: 1.4 }} className="truncate">{task}</span>
                  </div>
                  <button onClick={() => removeTask(task)} style={{ flexShrink: 0, marginLeft: '8px', background: 'none', border: 'none', cursor: 'pointer', padding: '2px', fontSize: '16px', lineHeight: 1 }} aria-label={`Remove ${task}`}>×</button>
                </div>
              ))}
            </div>
          </div>
        )}"""

ti = ti.replace(old_selected, new_selected)

with open('src/screens/TaskInput.jsx', 'w') as f:
    f.write(ti)

checks_ti = [
    ('TASK_CSS', 'TASK_CSS' in ti),
    ('blobs', 'task-blob' in ti),
    ('title reveal', 'titleIn' in ti),
    ('selected elevated', 'task-selected-card' in ti),
]
print('TaskInput patches:')
for label, ok in checks_ti:
    print(f"  {'OK' if ok else 'MISSING'} {label}")


# ══════════════════════════════════════════════════════════════════
# 2. STREAK VISUAL — add 7-day dot row to CheckIn
# ══════════════════════════════════════════════════════════════════

with open('src/screens/CheckIn.jsx', 'r') as f:
    ci = f.read()

STREAK_CSS = """
  /* Streak dots */
  .streak-dots { display: flex; gap: 5px; align-items: center; margin-top: 6px; }
  .streak-dot {
    width: 8px; height: 8px; border-radius: 50%;
    transition: background 0.2s, transform 0.2s;
  }
  .streak-dot.active { background: var(--color-lavender); transform: scale(1.15); }
  .streak-dot.inactive { background: rgba(28,28,26,0.1); }
  .streak-dot.today { background: var(--color-ink); transform: scale(1.2); }
"""

# Inject streak CSS into existing CHECKIN_CSS
ci = ci.replace(
    "  .ci-btn-wrap {\n    animation: ciBtnIn 0.4s ease forwards;\n    opacity: 0;\n  }\n  @keyframes ciBtnIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }\n`",
    "  .ci-btn-wrap {\n    animation: ciBtnIn 0.4s ease forwards;\n    opacity: 0;\n  }\n  @keyframes ciBtnIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }\n" + STREAK_CSS + "`"
)

# Add streak dots component before the main CheckIn export
streak_component = """
// Streak dot row — last 7 days
function StreakDots({ history, streakCount }) {
  const today = new Date().toISOString().split('T')[0]
  const dots = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const dateStr = d.toISOString().split('T')[0]
    const isToday = dateStr === today
    const hasEntry = history.some(h => h.date === dateStr)
    return { dateStr, isToday, hasEntry }
  })
  return (
    <div className="streak-dots">
      {dots.map((dot, i) => (
        <div
          key={i}
          className={`streak-dot ${dot.isToday ? 'today' : dot.hasEntry ? 'active' : 'inactive'}`}
          title={dot.dateStr}
        />
      ))}
    </div>
  )
}

"""

# Insert before export default function CheckIn
ci = ci.replace(
    '\nexport default function CheckIn(',
    '\n' + streak_component + 'export default function CheckIn('
)

# Add StreakDots below the streak badge button
old_streak_badge = """            {streakCount >= 2 && (
              <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '6px' }}>
                <button
                  onClick={() => !isPro && streakCount >= 5 && setShowStreakUpsell(true)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '6px 12px', borderRadius: '20px',
                    background: 'var(--color-linen)', border: '0.5px solid var(--color-border)',
                    cursor: !isPro && streakCount >= 5 ? 'pointer' : 'default',
                    fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--color-ink)',
                  }}
                >
                  <span>{streakCount} day streak</span>
                </button>"""

new_streak_badge = """            {streakCount >= 2 && (
              <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '6px' }}>
                <button
                  onClick={() => !isPro && streakCount >= 5 && setShowStreakUpsell(true)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '6px 12px', borderRadius: '20px',
                    background: 'var(--color-linen)', border: '0.5px solid var(--color-border)',
                    cursor: !isPro && streakCount >= 5 ? 'pointer' : 'default',
                    fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--color-ink)',
                  }}
                >
                  <span>{streakCount} day streak</span>
                </button>
                <StreakDots history={history} streakCount={streakCount} />"""

ci = ci.replace(old_streak_badge, new_streak_badge)

with open('src/screens/CheckIn.jsx', 'w') as f:
    f.write(ci)

checks_ci = [
    ('streak CSS', 'streak-dot' in ci),
    ('StreakDots component', 'function StreakDots' in ci),
    ('StreakDots used', '<StreakDots' in ci),
]
print('Streak visual patches:')
for label, ok in checks_ci:
    print(f"  {'OK' if ok else 'MISSING'} {label}")


# ══════════════════════════════════════════════════════════════════
# 3. MOBILE CSS — add to existing mobile.css or src/index.css
# ══════════════════════════════════════════════════════════════════

MOBILE_ADDITIONS = """
/* ── Mobile polish ──────────────────────────────────────────────── */
@media (max-width: 480px) {
  /* Tighten screen padding on small phones */
  .screen { padding: 16px 16px 24px !important; }

  /* Prevent blobs on very small screens */
  .ci-blob, .task-blob, .out-blob, .loading-blob { display: none; }

  /* Larger tap targets for chips */
  .task-screen .grid button,
  .checkin-screen .grid button {
    padding: 10px 12px !important;
    min-height: 40px;
  }

  /* Selected tasks — full width */
  .task-selected-card { margin-left: -4px; margin-right: -4px; }

  /* Loading screen text size */
  .loading-wordmark { font-size: 28px !important; }

  /* Focus output grid — single column */
  .output-grid { grid-template-columns: 1fr !important; }

  /* Plan limit modal */
  .plan-limit-modal { padding: 28px 20px !important; }
}

@media (max-width: 380px) {
  .screen { padding: 12px 12px 20px !important; }
  .loading-wordmark { font-size: 24px !important; }
}

/* Touch: remove hover states */
@media (hover: none) {
  .task-chip-hover:hover,
  .ci-chip-lift:hover,
  .ci-streak:hover {
    transform: none !important;
    box-shadow: none !important;
  }
}

/* Smooth scrolling in app screens */
.screen .flex-1 { -webkit-overflow-scrolling: touch; }

/* Prevent text size adjust on rotate */
html { -webkit-text-size-adjust: 100%; }
"""

# Append to index.css
with open('src/index.css', 'a') as f:
    f.write('\n' + MOBILE_ADDITIONS)

print('Mobile CSS:')
print('  OK appended to src/index.css')

print('\nAll done — run: npm run build 2>&1 | tail -5')

// Shared UI components used across all onboarding paths

export function ProgressBar({ step, total }) {
  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-3">
        <span
          style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--color-muted)' }}
          className="text-[13px] font-light"
        >
          daye
        </span>
        <span className="text-[11px]" style={{ color: 'var(--color-muted)' }}>
          {step + 1} / {total}
        </span>
      </div>
      <div className="progress-bar">
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className={`progress-segment ${i <= step ? 'progress-segment-active' : ''}`}
          />
        ))}
      </div>
    </div>
  )
}

export function BackButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 text-sm font-medium mb-5 transition-colors"
      style={{ color: 'var(--color-muted)' }}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M10 13L5 8l5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Back
    </button>
  )
}

export function SelectCard({ label, description, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`select-card ${active ? 'select-card-active' : ''}`}
    >
      <div className="font-medium text-sm" style={{ color: 'var(--color-ink)' }}>{label}</div>
      {description && (
        <div className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>{description}</div>
      )}
    </button>
  )
}

export function SubtitleChip({ label, sub, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-4 py-3 rounded-2xl border transition-all duration-150 active:scale-[0.99]"
      style={{
        background: active ? 'var(--color-ink)' : 'var(--color-white)',
        borderColor: active ? 'var(--color-ink)' : 'var(--color-border)',
      }}
    >
      <div className="text-sm font-medium" style={{ color: active ? 'var(--color-white)' : 'var(--color-ink)' }}>
        {label}
      </div>
      <div className="text-xs mt-0.5" style={{ color: active ? 'rgba(255,255,255,0.6)' : 'var(--color-muted)' }}>
        {sub}
      </div>
    </button>
  )
}

export function Chip({ label, active, onClick }) {
  return (
    <button onClick={onClick} className={`chip ${active ? 'chip-active' : ''}`}>
      {label}
    </button>
  )
}

export function GridChip({ label, active, onClick }) {
  return (
    <button onClick={onClick} className={`grid-chip ${active ? 'grid-chip-active' : ''}`}>
      {label}
    </button>
  )
}

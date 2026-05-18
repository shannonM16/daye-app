import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import UpgradePrompt from '../components/UpgradePrompt'

const INK = '#1a1a1a'
const LINEN = '#f9f7f5'
const MUTED = '#8a8480'
const BORDER = '#e2ddd8'
const LAVENDER = '#c9b8d8'

function formatDateRange(start, end) {
  if (!start || !end) return ''
  const s = new Date(start + 'T00:00:00')
  const e = new Date(end + 'T00:00:00')
  const monthFmt = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' })
  const startStr = new Intl.DateTimeFormat('en-GB', { month: 'long' }).format(s)
  const endStr = monthFmt.format(e)
  return `${startStr} – ${endStr}`
}

export default function TheLetter({ user }) {
  const { isPro } = useAuth()
  const [status, setStatus] = useState('loading') // loading | no-letter | has-letter | generating | error
  const [letter, setLetter] = useState(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (!isPro) return
    loadLetter()
  }, [isPro]) // eslint-disable-line react-hooks/exhaustive-deps

  async function loadLetter() {
    setStatus('loading')
    const userId = localStorage.getItem('daye_user_id')
    if (!userId) { setStatus('no-letter'); return }
    try {
      const res = await fetch('/api/get-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      const data = await res.json()
      if (data.letter) {
        setLetter(data.letter)
        setStatus('has-letter')
      } else {
        setStatus('no-letter')
      }
    } catch {
      setStatus('no-letter')
    }
  }

  async function handleGenerate() {
    const userId = localStorage.getItem('daye_user_id')
    if (!userId) return
    setStatus('generating')
    setShowConfirm(false)
    setErrorMsg('')
    try {
      const res = await fetch('/api/generate-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, firstName: user?.firstName }),
      })
      const data = await res.json()
      if (data.content) {
        setLetter({ content: data.content, period_start: data.period_start, period_end: data.period_end, created_at: new Date().toISOString() })
        setStatus('has-letter')
      } else {
        setErrorMsg(data.error || 'Something went wrong. Please try again.')
        setStatus('error')
      }
    } catch (err) {
      setErrorMsg(err.message)
      setStatus('error')
    }
  }

  if (!isPro) {
    return (
      <UpgradePrompt
        description="The Letter is a quarterly AI-generated letter written from your actual data — your tasks, your energy, your goals, your reflections. Not a report. A letter. Addressed to you. About your actual life."
        onDismiss={() => window.history.back()}
      />
    )
  }

  return (
    <div style={{ minHeight: '100dvh', background: LINEN }}>
      {/* Nav */}
      <nav style={{ height: '56px', borderBottom: `0.5px solid ${BORDER}`, display: 'flex', alignItems: 'center', padding: '0 24px', background: LINEN }}>
        <a href="/" style={{ textDecoration: 'none', marginRight: 'auto' }}>
          <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '20px', color: INK, fontWeight: 300 }}>daye</span>
        </a>
        <button
          onClick={() => window.history.back()}
          style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: MUTED, background: 'none', border: 'none', cursor: 'pointer' }}
        >
          ← Back
        </button>
      </nav>

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '64px 24px 80px' }}>

        {/* Loading */}
        {status === 'loading' && (
          <div style={{ textAlign: 'center', paddingTop: '80px' }}>
            <div className="animate-pulse" style={{ width: '48px', height: '3px', borderRadius: '2px', background: LAVENDER, margin: '0 auto 20px' }} />
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: MUTED }}>Loading your letter…</p>
          </div>
        )}

        {/* Generating */}
        {status === 'generating' && (
          <div style={{ textAlign: 'center', paddingTop: '80px' }}>
            <div className="animate-pulse" style={{ width: '48px', height: '3px', borderRadius: '2px', background: LAVENDER, margin: '0 auto 20px' }} />
            <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '20px', color: INK, margin: '0 0 8px 0' }}>Writing your letter…</p>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: MUTED }}>This usually takes about 10 seconds.</p>
          </div>
        )}

        {/* No letter yet */}
        {status === 'no-letter' && (
          <div style={{ textAlign: 'center', paddingTop: '40px' }}>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: MUTED, margin: '0 0 24px 0', fontWeight: 500 }}>
              Pro feature
            </p>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 300, fontSize: 'clamp(36px, 6vw, 52px)', color: INK, lineHeight: 1.1, margin: '0 0 20px 0' }}>
              The Letter.
            </h1>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '16px', color: MUTED, lineHeight: 1.65, maxWidth: '480px', margin: '0 auto 48px' }}>
              Every quarter, Daye reads your data and writes you a personal letter. Not a report. A letter. About your actual life.
            </p>
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '40px 36px',
              border: `0.5px solid ${BORDER}`,
              marginBottom: '40px',
              textAlign: 'left',
            }}>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: MUTED, margin: '0 0 20px 0', fontWeight: 500 }}>
                Your letter will be written from:
              </p>
              {[
                'Your last 90 days of check-ins — mood, energy, sleep',
                'Your focus plans and tasks completed',
                'Your end-of-day reflections',
                'Patterns in how you show up',
              ].map(item => (
                <div key={item} style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: LAVENDER, flexShrink: 0, marginTop: '8px' }} />
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: INK, margin: 0, lineHeight: 1.5 }}>{item}</p>
                </div>
              ))}
            </div>
            <button
              onClick={handleGenerate}
              style={{
                background: INK, color: 'white', border: 'none',
                borderRadius: '10px', padding: '14px 32px',
                fontFamily: 'var(--font-sans)', fontSize: '14px',
                fontWeight: 500, cursor: 'pointer', letterSpacing: '0.01em',
              }}
            >
              Generate my letter
            </button>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: MUTED, marginTop: '12px' }}>
              Takes about 10 seconds. Your data stays private.
            </p>
          </div>
        )}

        {/* Has letter */}
        {status === 'has-letter' && letter && (
          <>
            <div style={{ marginBottom: '48px' }}>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: MUTED, margin: '0 0 8px 0', fontWeight: 500 }}>
                {formatDateRange(letter.period_start, letter.period_end)}
              </p>
              <h1 style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 300, fontSize: 'clamp(32px, 5vw, 48px)', color: INK, lineHeight: 1.1, margin: '0 0 4px 0' }}>
                The Letter.
              </h1>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: MUTED, margin: 0 }}>
                Written from your last 90 days of data.
              </p>
            </div>

            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '48px 44px',
              border: `0.5px solid ${BORDER}`,
              marginBottom: '40px',
            }}>
              {letter.content.split('\n').filter(line => line.trim()).map((line, i) => (
                <p
                  key={i}
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontStyle: 'italic',
                    fontSize: '18px',
                    fontWeight: 300,
                    color: line.startsWith('—') ? MUTED : INK,
                    lineHeight: 1.75,
                    margin: i === 0 ? '0 0 20px 0' : '0 0 18px 0',
                  }}
                >
                  {line}
                </p>
              ))}
            </div>

            {!showConfirm ? (
              <button
                onClick={() => setShowConfirm(true)}
                style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: MUTED, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                Regenerate letter
              </button>
            ) : (
              <div style={{ background: 'white', borderRadius: '16px', padding: '20px 24px', border: `1px solid ${BORDER}` }}>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: INK, margin: '0 0 16px 0' }}>
                  This will replace your current letter. Are you sure?
                </p>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={handleGenerate}
                    style={{ background: INK, color: 'white', border: 'none', borderRadius: '8px', padding: '10px 20px', fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}
                  >
                    Yes, regenerate
                  </button>
                  <button
                    onClick={() => setShowConfirm(false)}
                    style={{ background: 'none', border: `0.5px solid ${BORDER}`, borderRadius: '8px', padding: '10px 20px', fontFamily: 'var(--font-sans)', fontSize: '13px', color: MUTED, cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Error */}
        {status === 'error' && (
          <div style={{ textAlign: 'center', paddingTop: '80px' }}>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', color: INK, margin: '0 0 8px 0' }}>Something went wrong.</p>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: MUTED, margin: '0 0 24px 0' }}>{errorMsg}</p>
            <button
              onClick={handleGenerate}
              style={{ background: INK, color: 'white', border: 'none', borderRadius: '10px', padding: '12px 24px', fontFamily: 'var(--font-sans)', fontSize: '14px', cursor: 'pointer' }}
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

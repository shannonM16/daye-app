import { useState } from 'react'
import { ProgressBar, BackButton } from '../components/OnboardingUI'

const TOTAL = 2

const DIRECTIONS = [
  { id: 'explore', label: 'Explore what\'s out there', description: 'You don\'t need to decide yet. Just start learning what exists, what excites you, and what doesn\'t. Clarity comes from exposure, not thinking.' },
  { id: 'build', label: 'Build or create something', description: 'A project, a side hustle, something small. Not for money necessarily — just to prove to yourself you can start and finish something you care about.' },
  { id: 'invest-skill', label: 'Invest in a skill', description: 'Pick one thing that opens doors regardless of which direction you go. Learning compounds — even a small commitment adds up fast.' },
  { id: 'get-stable', label: 'Get stable first', description: 'Sometimes the most strategic thing is to reduce financial or emotional pressure before making big decisions. Stability creates space to think clearly.' },
  { id: 'one-small-step', label: 'Take one small step today', description: 'You don\'t need a plan. You just need the next step. One conversation, one application, one thing read. Movement creates clarity.' },
]

async function callClaudeForReflection(text) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('No API key')

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      messages: [
        {
          role: 'user',
          content: `You are reading a message from someone who is figuring out their next step in life or work. They have shared their situation openly and vulnerably. Your job is to reflect it back to them in a way that makes them feel genuinely understood — not analysed, not diagnosed, just heard.

Their situation: "${text}"

Respond with a JSON object — no markdown, no code blocks, just raw JSON:
{
  "summary": "2-3 sentences in second person that reflect their situation back warmly. Start with 'It sounds like...' Do not use clinical language. Do not list their problems back at them. Find the human truth in what they wrote — the tension they are holding, the hope underneath the uncertainty. Make them feel seen not assessed.",
  "goal": "a short warm string describing what they seem to be working toward. Not a business objective — a human one. eg 'Finding work that actually feels like you' or 'Building the confidence to make a move' or 'Getting some clarity after a period of uncertainty'",
  "blockers": ["2-3 short strings describing what seems to be in their way. Written with compassion not judgement. eg 'Fear of getting it wrong', 'Financial pressure making it hard to take risks', 'Not knowing where to start'"],
  "suggested_focus": "a warm one-sentence description of what kind of daily focus would help them most. eg 'Small exploratory actions that build momentum without pressure' or 'Gentle progress on one thing at a time, without needing to have it all figured out'",
  "encouragement": "a single short sentence of genuine encouragement — not motivational poster language, something real. eg 'You do not need to have it figured out to start moving.' or 'The fact that you are asking these questions means you are already further along than you think.'"
}`,
        },
      ],
    }),
  })

  if (!response.ok) throw new Error(`API error ${response.status}`)
  const data = await response.json()
  const content = data.content?.[0]?.text || ''
  const match = content.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('No JSON in response')
  return JSON.parse(match[0])
}

function Spinner() {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-4">
      <div className="w-7 h-7 border-2 border-stone-200 border-t-stone-800 rounded-full animate-spin" />
      <p className="text-sm text-stone-400">Reading your situation…</p>
    </div>
  )
}

export default function OnboardingFiguringItOut({ onComplete, onBack }) {
  const [step, setStep] = useState(0)
  const [userText, setUserText] = useState('')
  const [loading, setLoading] = useState(false)
  const [aiProfile, setAiProfile] = useState(null)
  const [error, setError] = useState(null)
  const [directions, setDirections] = useState([])
  const [showTransition, setShowTransition] = useState(false)

  const canSubmitText = userText.trim().length >= 20

  const handleSubmitText = async () => {
    if (!canSubmitText) return
    setLoading(true)
    setError(null)
    try {
      const result = await callClaudeForReflection(userText.trim())
      setAiProfile(result)
      setStep(1)
    } catch (err) {
      console.error('Reflection failed:', err)
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    setStep(0)
    setAiProfile(null)
    setError(null)
    setDirections([])
  }

  const toggleDirection = (id) => {
    setDirections((prev) => {
      if (prev.includes(id)) return prev.filter((d) => d !== id)
      if (prev.length >= 2) return [...prev.slice(1), id]
      return [...prev, id]
    })
  }

  const handleConfirm = () => {
    setShowTransition(true)
    setTimeout(() => {
      onComplete({
        userText,
        aiSummary: aiProfile.summary,
        aiEncouragement: aiProfile.encouragement,
        goals: directions.length > 0 ? directions : [aiProfile.goal],
        goal: aiProfile.goal,
        blockers: aiProfile.blockers || [],
        suggestedFocus: aiProfile.suggested_focus,
        figuringOutDirections: directions,
      })
    }, 1500)
  }

  if (showTransition) {
    return (
      <div className="screen items-center justify-center">
        <div className="text-center">
          <p className="text-[11px] tracking-widest uppercase text-stone-400 font-medium mb-8">Daily Focus</p>
          <h2 className="text-[22px] font-bold text-stone-900 mb-3">Building your profile...</h2>
          <div className="flex justify-center gap-2 mt-6">
            <span className="w-2 h-2 rounded-full bg-stone-400 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 rounded-full bg-stone-400 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 rounded-full bg-stone-400 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="screen">
      <div className="flex-1 overflow-y-auto">
        <ProgressBar step={step} total={TOTAL} />
        <BackButton onClick={step === 0 ? onBack : handleEdit} />

        {step === 0 && (
          <>
            <h1 className="text-[22px] font-bold text-stone-900 mb-1">Tell us where you are.</h1>
            <p className="text-[13px] text-stone-400 mb-4">
              No judgement — describe your situation in your own words.
            </p>
            <textarea
              value={userText}
              onChange={(e) => { const v = e.target.value; setUserText(v.length === 1 ? v.toUpperCase() : v) }}
              placeholder="e.g. I've just left my job and I'm not sure what to do next. I'm thinking about going freelance but also considering going back to study..."
              rows={5}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm text-stone-800 placeholder:text-stone-300 outline-none focus:border-stone-400 transition-colors bg-white resize-none leading-relaxed"
            />
            {userText.trim().length > 0 && userText.trim().length < 20 && (
              <p className="text-xs text-stone-400 mt-2">Tell us a bit more…</p>
            )}
            {error && <p className="text-xs text-amber-600 mt-2">{error}</p>}
          </>
        )}

        {step === 1 && loading && <Spinner />}

        {step === 1 && !loading && aiProfile && (
          <>
            <h1 className="text-[22px] font-bold text-stone-900 mb-5">We've read your situation.</h1>

            {/* AI summary reflection */}
            <div style={{ marginBottom: '20px' }}>
              <p style={{
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                fontSize: '18px',
                color: 'var(--color-ink)',
                lineHeight: 1.7,
                margin: '0 0 10px 0',
              }}>
                {aiProfile.summary}
              </p>
              {aiProfile.encouragement && (
                <p style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '13px',
                  color: 'var(--color-muted)',
                  fontStyle: 'italic',
                  margin: 0,
                }}>
                  {aiProfile.encouragement}
                </p>
              )}
            </div>

            {/* Goal card */}
            {aiProfile.goal && (
              <div style={{
                border: '0.5px solid var(--color-border)',
                borderLeft: '3px solid var(--color-lavender)',
                borderRadius: '10px',
                padding: '14px 16px',
                marginBottom: '16px',
                background: 'var(--color-white)',
              }}>
                <p style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'var(--color-muted)',
                  fontWeight: 500,
                  margin: '0 0 6px 0',
                }}>
                  It looks like you're working toward:
                </p>
                <p style={{
                  fontFamily: 'var(--font-serif)',
                  fontStyle: 'italic',
                  fontSize: '16px',
                  color: 'var(--color-ink)',
                  margin: 0,
                  lineHeight: 1.4,
                }}>
                  {aiProfile.goal}
                </p>
              </div>
            )}

            {/* Blockers as soft blush chips */}
            {aiProfile.blockers?.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                {aiProfile.blockers.map((b, i) => (
                  <span key={i} style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '12px',
                    color: 'var(--color-ink)',
                    background: 'var(--color-blush)',
                    borderRadius: '20px',
                    padding: '5px 12px',
                  }}>
                    {b}
                  </span>
                ))}
              </div>
            )}

            {/* Suggested focus */}
            {aiProfile.suggested_focus && (
              <p style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '13px',
                color: 'var(--color-muted)',
                marginBottom: '28px',
                lineHeight: 1.5,
              }}>
                {aiProfile.suggested_focus}
              </p>
            )}

            {/* Direction cards */}
            <h2 style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--color-ink)',
              marginBottom: '4px',
            }}>
              What feels most like where you want to head?
            </h2>
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '12px',
              color: 'var(--color-muted)',
              marginBottom: '12px',
            }}>
              Pick up to 2.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {DIRECTIONS.map((d) => {
                const selected = directions.includes(d.id)
                return (
                  <button
                    key={d.id}
                    onClick={() => toggleDirection(d.id)}
                    style={{
                      textAlign: 'left',
                      background: selected ? '#f5f3f0' : 'white',
                      border: '0.5px solid var(--color-border)',
                      borderLeft: selected ? '3px solid var(--color-ink)' : '0.5px solid var(--color-border)',
                      borderRadius: '12px',
                      padding: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: 'var(--color-ink)',
                      marginBottom: '4px',
                    }}>
                      {d.label}
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '13px',
                      color: 'var(--color-muted)',
                      lineHeight: 1.5,
                    }}>
                      {d.description}
                    </div>
                  </button>
                )
              })}
            </div>
          </>
        )}
      </div>

      <div className="flex-shrink-0 space-y-2.5 pt-4">
        {step === 0 && (
          <button
            className="btn-primary"
            onClick={handleSubmitText}
            disabled={!canSubmitText || loading}
          >
            {loading ? 'Reading your situation…' : 'Continue'}
          </button>
        )}
        {step === 1 && !loading && aiProfile && (
          <>
            <button
              className="btn-primary"
              onClick={handleConfirm}
              disabled={directions.length === 0}
            >
              Confirm — let's go
            </button>
            <button className="btn-ghost" onClick={handleEdit}>
              Edit my description
            </button>
          </>
        )}
      </div>
    </div>
  )
}

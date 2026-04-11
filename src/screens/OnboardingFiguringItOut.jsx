import { useState } from 'react'
import { ProgressBar, BackButton } from '../components/OnboardingUI'

const TOTAL = 2

const DIRECTIONS = [
  { id: 'explore-career', label: 'Explore a new career direction', description: 'I want to understand my options better' },
  { id: 'start-build', label: 'Start or build something', description: 'A project, business or side hustle' },
  { id: 'develop-skill', label: 'Develop a skill', description: 'Learn something that opens new doors' },
  { id: 'get-stable', label: 'Get my finances and life stable', description: 'Before I make any big moves' },
  { id: 'get-through', label: 'Just get through each day well', description: 'Small steps, one at a time' },
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
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: `Someone is using a daily focus app and has described their situation. Generate a warm, empathetic profile to help them.

Their situation: "${text}"

Return ONLY a JSON object — no markdown, no code blocks, just raw JSON:
{
  "summary": "A 2-sentence warm empathetic reflection in second person. Must start with 'It sounds like'.",
  "goal": "a short phrase (5 words max) describing their most likely main goal",
  "blockers": ["up to 3 short phrases describing what seems to be holding them back"],
  "suggested_focus": "a short phrase describing what kind of daily focus would help them most"
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
              onChange={(e) => setUserText(e.target.value)}
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
            <h1 className="text-[22px] font-bold text-stone-900 mb-4">We've read your situation.</h1>
            <div className="bg-stone-50 rounded-2xl p-4 border border-stone-100 mb-5">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-400 mb-2">It sounds like…</p>
              <p className="text-stone-700 text-sm leading-relaxed">
                {aiProfile.summary.replace(/^It sounds like\s*/i, '')}
              </p>
            </div>

            <h2 className="text-[13px] font-semibold text-stone-700 mb-1">What feels most like where you want to head?</h2>
            <p className="text-xs text-stone-400 mb-3">Pick up to 2.</p>
            <div className="space-y-1.5">
              {DIRECTIONS.map((d) => (
                <button
                  key={d.id}
                  onClick={() => toggleDirection(d.id)}
                  style={directions.includes(d.id) ? { borderLeftWidth: '3px', borderLeftColor: '#1c1917' } : {}}
                  className={`w-full text-left px-3.5 py-3 rounded-2xl border transition-all duration-150 active:scale-[0.99] ${
                    directions.includes(d.id) ? 'bg-stone-50 border-stone-200' : 'bg-white border-stone-100'
                  }`}
                >
                  <div className="font-semibold text-sm text-stone-900">{d.label}</div>
                  <div className="text-stone-400 text-xs mt-0.5">{d.description}</div>
                </button>
              ))}
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

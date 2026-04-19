import { decisionEngine } from './decisionEngine'
import { getCustomChips } from '../utils/customChips'

function getDayNameFallback(checkInData) {
  const dayType = checkInData?.dayType || ''
  const energy = checkInData?.energy ?? 3
  const mood = (checkInData?.mood || '').toLowerCase()
  const isLow = energy <= 2 || ['overwhelmed', 'anxious', 'tired', 'flat', 'burned-out', 'scattered'].includes(mood)
  if (isLow) return 'Gentle Progress'
  if (dayType === 'deep-work') return 'Deep Focus'
  if (dayType === 'lots-of-meetings' || dayType === 'reactive-firefighting') return 'Full Throttle'
  if (dayType === 'reactive-firefighting') return 'Steady Hands'
  return "Today's Plan"
}

function formatTime12hFromHHMM(hhmm) {
  if (!hhmm) return null
  const [h, m] = hhmm.split(':').map(Number)
  const ampm = h >= 12 ? 'pm' : 'am'
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${h12}:${String(m).padStart(2, '0')}${ampm}`
}

function roundToNearest15(hhmm) {
  if (!hhmm) return null
  const [h, m] = hhmm.split(':').map(Number)
  const rounded = Math.round(m / 15) * 15
  if (rounded === 60) {
    return `${String(h + 1).padStart(2, '0')}:00`
  }
  return `${String(h).padStart(2, '0')}:${String(rounded).padStart(2, '0')}`
}

function getHoursRemaining(hhmm, endHour = 18) {
  if (!hhmm) return null
  const [h, m] = hhmm.split(':').map(Number)
  const remaining = endHour - h - m / 60
  return Math.max(0, Math.round(remaining * 10) / 10)
}

function getTimePeriodLabel(hhmm) {
  if (!hhmm) return 'morning'
  const h = parseInt(hhmm.split(':')[0], 10)
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

function buildPrompt(userProfile, checkInData, tasks) {
  const {
    firstName,
    userType,
    jobFunctions,
    seniority,
    industry,
    goals,
    goal: goalLegacy,
    blockers,
    aiSummary,
    selfEmployedType: seType,
    workType,
  } = userProfile || {}

  const selfEmployedType = seType || workType || null

  // Merge profile goals with any custom goals from storage
  const customStoredGoals = getCustomChips('goals')
  const goalsArray = goals?.length > 0 ? goals : (goalLegacy ? [goalLegacy] : [])
  const allGoals = [...goalsArray, ...customStoredGoals.filter(g => !goalsArray.includes(g))]
  const primaryGoal = allGoals[0] || 'general productivity'

  const jobFunction = Array.isArray(jobFunctions) ? jobFunctions[0] : (jobFunctions || null)

  // Merge profile blockers with custom blockers from storage
  const customStoredBlockers = getCustomChips('blockers')
  const profileBlockers = Array.isArray(blockers) ? blockers : []
  const allBlockers = [...profileBlockers, ...customStoredBlockers.filter(b => !profileBlockers.includes(b))]
  const blockersStr = allBlockers.length > 0 ? allBlockers.join(', ') : 'none mentioned'

  const { energy, mood, sleep, dayType, pressure, planningStartTime } = checkInData || {}
  const pressureStr = Array.isArray(pressure) && pressure.length > 0
    ? pressure.join(', ')
    : 'none'
  const tasksStr = Array.isArray(tasks) && tasks.length > 0
    ? tasks.join(', ')
    : 'none'

  const situationExtra = userType === 'figuring-it-out' && aiSummary
    ? `\n- Situation summary: ${aiSummary}`
    : ''

  const selfEmployedExtra = userType === 'self-employed' && selfEmployedType
    ? `\n- Self-employed type: ${selfEmployedType}`
    : ''

  // Time-aware planning context
  const roundedStartTime = planningStartTime ? roundToNearest15(planningStartTime) : null
  const startTime12h = roundedStartTime ? formatTime12hFromHHMM(roundedStartTime) : null
  const hoursRemaining = planningStartTime ? getHoursRemaining(planningStartTime) : null
  const timePeriod = getTimePeriodLabel(planningStartTime)

  const timeContext = startTime12h ? `

TIME CONTEXT:
- Current time: ${startTime12h}
- Time of day: ${timePeriod}
- Hours remaining in working day (to 6pm): approximately ${hoursRemaining} hours
- IMPORTANT: Build ALL time blocks starting from ${startTime12h}, not from 9am. Round to the nearest 15 minutes. For example, if current time is 2:15pm: "2:15–3:30pm: Deep work", "3:30–4pm: Clear emails", "4–5pm: Admin and review", "5–6pm: Close out". Never start time blocks before ${startTime12h}.` : ''

  const selfEmployedInstructions = userType === 'self-employed' ? `
SELF-EMPLOYED INSTRUCTIONS:
- This person is self-employed as a ${selfEmployedType || 'independent worker'}. Adapt your language and tone to their specific work type. For content creators: use language about audience, consistency, creativity and brand. For consultants: use language about clients, deliverables, positioning and revenue. For coaches: use language about clients, transformation, programmes and impact. For product builders: use language about users, shipping, growth and metrics. For trades: use language about jobs, bookings, quotes and reputation. Never use generic productivity language that could apply to anyone.
- Invoicing and money admin is always relevant for self-employed people. If there is any sign of cash or invoice pressure, or if it is a moderate energy day with no critical deadline, include "Chase or send an invoice" or a similar revenue admin task in the priorities. Frame the reasoning as: revenue admin is easy to defer but it directly affects cashflow — keeping on top of it weekly matters.` : ''

  return `You are Daye, a personal productivity coach. Generate a daily focus plan for this person.

THEIR PROFILE:
- Name: ${firstName || 'the user'}
- Situation: ${userType || 'unknown'}
- Job function: ${jobFunction || 'not specified'}
- Seniority: ${seniority || 'not specified'}
- Industry: ${industry || 'not specified'}
- Main goal: ${primaryGoal}
- Current blockers: ${blockersStr}${situationExtra}${selfEmployedExtra}

TODAY:
- Energy level: ${energy ?? 3} out of 5
- Mood: ${mood || 'not specified'}
- Sleep: ${sleep || 'not specified'}
- Type of day: ${dayType || 'standard'}
- Main pressure: ${pressureStr}
- Tasks they have mentioned: ${tasksStr}${timeContext}

Generate a daily focus plan. Be warm, direct and personal. Use their name. Reference their actual goal and blockers. Do not be generic.

Respond with a JSON object containing exactly these fields:
{
  "priorities": [{"task": "string", "subtitle": "string explaining why this matters today"}],
  "avoid": ["string"],
  "timeSplit": [{"time": "string like 2:15–3:30pm", "task": "string"}],
  "why": "string of 2-3 sentences explaining the reasoning behind this plan referencing their goal and current state",
  "dayLabel": "one of: Focus day, Recovery day, Busy day, Exploration day",
  "goalAlignment": "short string like Today moves you toward getting promoted",
  "dayName": "short 2-4 word evocative name for this day — like a chapter title, specific to their situation"
}

Rules:
- If energy is 1 or 2 or mood is Overwhelmed or Anxious or Burned out: only 2 priorities, shorter time blocks, warmer tone
- If energy is 4 or 5 and day type is deep work: 3 priorities, longer blocks, ambitious tone
- Always reference at least one of their actual tasks in the priorities
- The why must mention their goal specifically
- Avoid items must reference their actual blockers not generic advice
- Time split must reflect their actual energy level — low energy gets shorter blocks with breaks
- Time split MUST start from the current time if provided — never use 9am as the start if a different time was given
- dayName must feel like a chapter title — poetic, warm, and personal to their actual situation. Examples for inspiration (do not use these exactly): 'The Big Push', 'Steady Hands', 'The Long Game', 'Deep Focus Morning', 'The Comeback', 'Small Steps Forward', 'Clearing the Decks', 'The Pitch Day', 'One Thing Only', 'Gentle Progress'. If they have a big deadline it might be 'The Final Push'. If low energy it might be 'Slow and Steady'. Never generic, always specific to their day.${selfEmployedInstructions}`
}

/**
 * Calls the Claude API to generate a personalised focus plan.
 * Falls back to the rule-based decisionEngine if anything fails.
 */
export async function buildPlan(userProfile, checkInData, tasks) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY

  if (!apiKey) {
    return decisionEngine({ ...(userProfile || {}), ...(checkInData || {}), tasks })
  }

  try {
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
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: buildPrompt(userProfile, checkInData, tasks),
          },
        ],
      }),
    })

    if (!response.ok) throw new Error(`API error ${response.status}`)

    const data = await response.json()
    const raw = data.content?.[0]?.text || ''

    // Strip markdown code fences if present
    const cleaned = raw
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```\s*$/, '')
      .trim()

    let aiPlan
    try {
      aiPlan = JSON.parse(cleaned)
    } catch {
      throw new Error('JSON parse failed')
    }

    // Normalize priorities — always extract string tasks, keep subtitles separately
    const rawPriorities = Array.isArray(aiPlan.priorities) ? aiPlan.priorities : []
    const priorities = rawPriorities.map((p) =>
      typeof p === 'string' ? p : (p?.task || '')
    ).filter(Boolean)

    const subtitles = rawPriorities.map((p) =>
      typeof p === 'string' ? null : (p?.subtitle || null)
    )
    const hasSubtitles = subtitles.some(Boolean)

    // Normalize timeSplit → timeBlocks
    const timeBlocks = (Array.isArray(aiPlan.timeSplit) ? aiPlan.timeSplit : []).map((b) => ({
      time: b.time || '',
      activity: b.task || '',
    }))

    return {
      priorities,
      prioritySubtitles: hasSubtitles ? subtitles : null,
      avoid: (Array.isArray(aiPlan.avoid) ? aiPlan.avoid : []).slice(0, 2),
      timing: null,
      why: aiPlan.why || '',
      timeBlocks,
      goalAlignment: aiPlan.goalAlignment || null,
      dayLabel: aiPlan.dayLabel || null,
      dayName: (typeof aiPlan.dayName === 'string' && aiPlan.dayName.trim()) ? aiPlan.dayName.trim() : getDayNameFallback(checkInData),
    }
  } catch (err) {
    console.error('AI plan generation failed, using rule engine:', err)
    return decisionEngine({ ...(userProfile || {}), ...(checkInData || {}), tasks })
  }
}

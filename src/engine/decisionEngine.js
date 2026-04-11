import { getStateLevel } from '../utils/stateDetection'

const GOAL_LABELS = {
  // Corporate
  'get-promoted': 'getting promoted',
  'more-responsibility': 'taking on more responsibility',
  'move-teams': 'moving to a new team',
  'build-visibility': 'building your visibility',
  'reduce-stress': 'feeling more in control',
  'lead-better': 'becoming a better leader',
  'earn-more': 'increasing your income',
  'stay-on-top': 'staying on top of your work',
  // Self-employed
  'hit-revenue-target': 'hitting your revenue target',
  'land-big-client': 'landing that big client',
  'launch-something': 'launching something new',
  'get-more-freedom': 'getting more freedom in your work',
  'build-a-team': 'building your team',
  'go-full-time': 'going full-time',
  'scale-up': 'scaling up',
  // Student
  'pass-exams': 'passing your exams',
  'get-top-grade': 'getting a top grade',
  'finish-dissertation': 'finishing your dissertation',
  'land-placement': 'landing a placement or job',
  'stay-on-top-of-workload': 'staying on top of your workload',
  'build-career-skills': 'building your career skills',
  // Legacy
  'get-visible': 'becoming more visible',
  'find-direction': 'finding your direction',
  'build-something': 'building something new',
}

const BLOCKER_AVOIDS = {
  'too many meetings': 'saying yes to any new meeting requests today',
  'no clear priorities': 'switching tasks before finishing what you started',
  'difficult manager': 'unnecessary interactions that drain your energy',
  'low confidence': "second-guessing your work before it's finished",
  'lack of confidence': "second-guessing your work before it's finished",
  'no time to think': 'filling every gap with reactive work',
  'too much admin': 'letting admin take more than one hour of your day',
  'imposter syndrome': 'comparing your output to others today',
  'poor work-life balance': 'working past your intended finish time',
  'unclear on what good looks like': 'seeking excessive reassurance on work in progress',
  'not enough recognition': 'doing invisible work that nobody will see today',
  'low energy': 'scheduling demanding work in the late afternoon',
  'too-many-meetings': 'saying yes to any new meeting requests today',
  'no-clear-priorities': 'switching tasks before finishing what you started',
  'no-time-to-think': 'filling every gap with reactive work',
  'too-much-admin': 'letting admin take more than one hour of your day',
  'imposter-syndrome': 'comparing your output to others today',
  'lack-of-confidence': "second-guessing your work before it's finished",
  'unclear-next-step': 'starting new things before closing what\'s already open',
}

function goalContext(goal, userType) {
  if (userType === 'figuring-it-out' && goal) {
    return ` This supports you in ${goal}.`
  }
  const label = GOAL_LABELS[goal]
  return label ? ` This keeps you on track toward ${label}.` : ''
}

function buildGoalAlignment(goal, userType) {
  if (userType === 'figuring-it-out' && goal) {
    return `Today supports you in: ${goal}`
  }
  const label = GOAL_LABELS[goal]
  return label ? `Today moves you toward: ${label}` : null
}

function blockerAvoids(blockers = []) {
  return blockers
    .map((b) => BLOCKER_AVOIDS[b.toLowerCase().trim()] || BLOCKER_AVOIDS[b.trim()])
    .filter(Boolean)
    .slice(0, 2)
}

function generateTimeBlocks(tasks = [], energy, dayType, sleep, mood) {
  const stateLevel = getStateLevel({ energy: energy || 3, sleep, mood })
  const isHigh = stateLevel === 'high'
  const isLow = stateLevel === 'low' || dayType === 'low-energy-day'
  const work = tasks.filter(Boolean).slice(0, 3)
  const t = (i, fallback) => work[i] || fallback

  if (dayType === 'lots-of-meetings') {
    return [
      { time: '9–10am', activity: t(0, 'Pre-meeting prep') },
      { time: '10am–12pm', activity: 'Meetings block' },
      { time: '1–2:30pm', activity: t(1, 'Focus work in the gaps') },
      { time: '2:30–4pm', activity: 'Afternoon meetings & follow-ups' },
      { time: '4–4:30pm', activity: t(2, 'Close out & notes') },
    ]
  }

  if (dayType === 'reactive-firefighting') {
    return [
      { time: '9–10am', activity: t(0, 'Triage & prioritise') },
      { time: '10–11am', activity: t(1, 'Handle most urgent item') },
      { time: '12–1pm', activity: 'Comms & updates' },
      { time: '2–3pm', activity: t(2, 'One protected focus slot') },
      { time: '4pm', activity: 'End-of-day reset' },
    ]
  }

  if (isHigh) {
    return [
      { time: '9–11am', activity: t(0, 'Deep focus work') },
      { time: '11–11:30am', activity: 'Emails & quick comms' },
      { time: '2–3:30pm', activity: t(1, 'Second priority') },
      { time: '3:30–4:30pm', activity: t(2, 'Review & plan tomorrow') },
    ]
  }

  if (isLow) {
    return [
      { time: '10–11am', activity: t(0, 'One achievable task') },
      { time: '11–11:15am', activity: 'Short break — step away' },
      { time: '11:15am–12pm', activity: t(1, 'Gentle second task') },
      { time: '2–2:30pm', activity: 'Rest or a short walk' },
      { time: '2:30–3:30pm', activity: 'Review and close out the day' },
    ]
  }

  return [
    { time: '9–10:30am', activity: t(0, 'Priority work') },
    { time: '11am', activity: 'Comms check-in' },
    { time: '2–3:30pm', activity: t(1, 'Second focus block') },
    { time: '4pm', activity: t(2, 'Admin & close out') },
  ]
}

/**
 * Decision engine — takes full merged profile + check-in data and returns a personalised plan.
 */
export function decisionEngine({
  userType,
  // Corporate
  jobFunctions, seniority, industry,
  // Self-employed
  workType, businessStage, pressures: selfEmployedPressures,
  // Student
  studyLevel, termPosition,
  // Figuring it out
  aiSummary, suggestedFocus,
  // All paths — goals (array) with legacy goal (string) fallback
  goals: goalsArray = [], goal: goalLegacy = null,
  blockers = [],
  // Check-in
  mood, sleep, energy = 3, dayType, pressure = [],
  // Tasks
  tasks = [],
}) {
  // Normalize goals to array
  const goals = goalsArray.length > 0 ? goalsArray : (goalLegacy ? [goalLegacy] : [])
  const goal = goals[0] || null
  const isHighEnergy = energy >= 4
  const isMidEnergy = energy === 3
  const isLowEnergy = energy <= 2 || dayType === 'low-energy-day'
  const isBusy = dayType === 'lots-of-meetings' || dayType === 'reactive-firefighting'
  const isDeepWork = dayType === 'deep-work'

  const hasDeadline = pressure.some((p) => {
    const s = p.toLowerCase()
    return ['deadline', 'deadlines', 'deadline-deliverable', 'proposal-deadline', 'assignment-due',
      'exam-coming', 'dissertation-deadline', 'opportunity-deadline'].includes(p) ||
      s.includes('deadline') || s.includes('due soon') || s.includes('exam') || s.includes('pitch')
  })
  const hasDailyMoney = pressure.some((p) => {
    const s = p.toLowerCase()
    return ['revenue-money', 'money', 'cash-running-low', 'invoice-overdue', 'money-tight', 'pipeline-quiet'].includes(p) ||
      s.includes('cash') || s.includes('revenue') || s.includes('invoice') || s.includes('money') || s.includes('pipeline')
  })
  const hasExamPressure = pressure.some((p) => {
    const s = p.toLowerCase()
    return ['exams-study', 'exams', 'exam-coming', 'assignment-due', 'dissertation-deadline', 'resit-needed'].includes(p) ||
      s.includes('exam') || s.includes('assignment') || s.includes('dissertation')
  })

  // Corporate role helpers
  const isManager = seniority === 'manager' || seniority === 'director-plus'
  const primaryFn = (Array.isArray(jobFunctions) ? jobFunctions : [jobFunctions])
    .find((jf) => jf && jf !== 'other') || 'other'

  // Self-employed pressure helpers
  const hasCashflowPressure = (selfEmployedPressures || []).some((p) =>
    ['Managing cashflow', 'Getting new clients', 'Inconsistent income'].includes(p)
  )

  // Student helpers
  const isExamCrunch = termPosition === 'exam-deadline-crunch'
  const isDissertation = termPosition === 'dissertation-project'

  const gc = goalContext(goal, userType)
  const ba = blockerAvoids(blockers)
  const timeBlocks = generateTimeBlocks(tasks, energy, dayType, sleep, mood)
  const goalAlignment = buildGoalAlignment(goal, userType)

  let base

  // ─── CORPORATE ───────────────────────────────────────────────────────────────
  if (userType === 'corporate') {
    if (isManager) {
      // Manager priorities focus on team, strategy, oversight
      if (isDeepWork && isHighEnergy) {
        base = {
          priorities: [
            'Work on the one strategic thing only you can advance today',
            'Run a quick team check-in and make sure everyone is unblocked',
            hasDeadline ? 'Prepare the key deliverable your stakeholders are waiting on' : 'Reach out to one stakeholder proactively',
          ],
          avoid: ['Getting pulled into individual contributor work', 'Back-to-back meetings with no thinking time', 'Unplanned commitments'],
          timing: 'Protect 9–11am for strategic work. Use afternoons for people and communication.',
          why: `Managers create the most value through clarity and unblocking others.${gc}`,
        }
      } else if (isBusy) {
        base = {
          priorities: [
            'Make sure your team has what they need for the day',
            'Prepare for your most important meeting — know your position before you walk in',
            'Unblock the most stuck person on your team',
          ],
          avoid: ['Skipping your own prep time', 'Making decisions without the right context', 'Taking on tasks your team should own'],
          timing: 'Use meeting gaps to make quick decisions and send short unblocking messages.',
          why: `On busy days, managers add value by keeping their team moving.${gc}`,
        }
      } else {
        base = {
          priorities: [
            hasDailyMoney ? 'Address the revenue-related issue on your plate' : 'Do the one piece of strategic work you\'ve been putting off',
            'Check in with your direct reports briefly',
          ],
          avoid: ['Making important decisions when low energy', 'Long strategic planning sessions', 'Starting new workstreams'],
          timing: 'Keep it light. Short focused sessions of 30–45 minutes.',
          why: `Low energy days call for maintenance over momentum — keep the team stable.${gc}`,
        }
      }
    } else {
      // IC priorities focus on craft, output, individual contribution
      if (isDeepWork && isHighEnergy) {
        base = {
          priorities: [
            hasDeadline ? 'Finish your highest-stakes deliverable' : 'Make serious progress on your most complex current project',
            'Protect 2 uninterrupted hours — close Slack and notifications',
            'Write a one-line end-of-day note on what you completed',
          ],
          avoid: ['Checking email in the first hour', 'Reactive Slack responses', 'Low-value admin tasks'],
          timing: 'Do your deepest work 9–11am. Buffer admin to after lunch.',
          why: `High energy on a deep-work day is rare. Use the morning window before the day fragments.${gc}`,
        }
      } else if (isDeepWork && isMidEnergy) {
        base = {
          priorities: [
            hasDeadline ? 'Advance the most overdue deliverable by one concrete step' : 'Make meaningful progress on one project',
            'Clear your inbox before noon',
          ],
          avoid: ['Multitasking', 'Long sync meetings if avoidable', 'Perfectionism on low-stakes work'],
          timing: 'Work in 90-minute blocks with 15-minute breaks.',
          why: `Mid-energy is enough for solid output if you protect your time.${gc}`,
        }
      } else if (isBusy) {
        base = {
          priorities: [
            hasDeadline ? 'Send the one message that unblocks your most urgent work' : 'Identify the single thing that moves your project forward',
            'Prep for your most important meeting 10 minutes ahead',
            'Clear any tasks under 5 minutes from your list',
          ],
          avoid: ['New commitments', 'Deep creative work squeezed between meetings', 'Over-preparing for low-stakes calls'],
          timing: 'Work in the gaps between meetings. Batch quick tasks in 20-minute windows.',
          why: `Busy days are won in the margins. Small wins compound.${gc}`,
        }
      } else {
        base = {
          priorities: [
            hasDailyMoney ? 'Do the single most important thing, even if imperfectly' : "Handle one piece of admin you've been avoiding",
            "Respond to anything waiting more than 48 hours",
          ],
          avoid: ['Difficult conversations', 'Important decisions', 'Starting new complex work'],
          timing: 'Work in 25-minute bursts. Finish by 4pm if you can.',
          why: `Low-energy days are for maintenance, not momentum.${gc}`,
        }
      }
    }
  }

  // ─── SELF-EMPLOYED ────────────────────────────────────────────────────────────
  else if (userType === 'self-employed') {
    if (isDeepWork && isHighEnergy) {
      base = {
        priorities: [
          hasCashflowPressure ? 'Follow up on at least one outstanding revenue opportunity' : 'Work on your highest-value activity first',
          'Do one thing that moves a client relationship forward',
          "Outline tomorrow's plan before you close for the day",
        ],
        avoid: ['Checking social media before noon', 'Invoicing and admin before your peak hours', 'Scope creep on active projects'],
        timing: 'Guard 9am–1pm for deep work. Handle business admin in the afternoon.',
        why: `Your peak hours are your most valuable asset as your own boss.${gc}`,
      }
    } else if (isDeepWork && isMidEnergy) {
      base = {
        priorities: [
          hasCashflowPressure ? 'Send one outstanding invoice or follow up on a payment' : 'Make one concrete step forward on your main project',
          'Do one visible piece of client-facing work',
        ],
        avoid: ['Over-engineering or perfecting things', 'Starting a new project', 'Doom-scrolling between tasks'],
        timing: 'Two 90-minute deep-work sessions with a break between them.',
        why: `Sustainable output beats burnout. Move the needle without emptying the tank.${gc}`,
      }
    } else if (isBusy) {
      base = {
        priorities: [
          hasCashflowPressure ? 'Handle the revenue thing — invoice, proposal, or follow-up' : 'Serve your clients first today',
          'Batch all messages into one 45-minute window',
          'Protect one hour for actual work, even in a busy day',
        ],
        avoid: ['Taking on new work without checking capacity', 'Skipping breaks entirely', 'Saying yes to everything'],
        timing: 'Admin and comms in the morning. Protect 2–4pm for real work.',
        why: `One hour of intentional work keeps momentum even on the busiest days.${gc}`,
      }
    } else {
      base = {
        priorities: [
          hasCashflowPressure ? 'Send one invoice or nudge one payment' : 'Do one 30-minute task that counts as done',
          'Rest without guilt — recovery is productive',
        ],
        avoid: ['Client calls if you can reschedule', 'Creative decisions', "Comparing your output to others'"],
        timing: 'Short sessions only. Two 25-minute slots, max.',
        why: `Self-employed burnout is real. Respect the low-energy day.${gc}`,
      }
    }

    // Always override priority 1 with revenue if cashflow pressure exists
    if (hasCashflowPressure && !base.priorities[0].toLowerCase().includes('revenue') && !base.priorities[0].toLowerCase().includes('invoice') && !base.priorities[0].toLowerCase().includes('client')) {
      base.priorities = [
        'Follow up on at least one outstanding revenue opportunity',
        ...base.priorities,
      ].slice(0, 3)
    }
  }

  // ─── STUDENT ─────────────────────────────────────────────────────────────────
  else if (userType === 'student') {
    if (isExamCrunch) {
      base = {
        priorities: [
          'Active revision session — focus on your weakest topic first',
          hasExamPressure ? 'Complete one full practice question or past paper section' : 'Review your notes from yesterday for 15 minutes',
          'Plan your revision schedule for the next 3 days',
        ],
        avoid: ['Passive re-reading or highlighting', 'Starting new topics you haven\'t covered', 'Studying with your phone visible'],
        timing: '25-minute Pomodoros with strict 5-minute breaks. No more than 2 hours before a real rest.',
        why: `Exam crunch calls for active recall over passive review.${gc}`,
      }
    } else if (isDissertation) {
      base = {
        priorities: [
          isHighEnergy ? 'Write 500+ words on your most developed section' : 'Read and take notes on one key source',
          'Review what you wrote or read yesterday',
          'Plan the next concrete section or argument to develop',
        ],
        avoid: ['Editing before you have enough draft content', 'Comparing your progress to others', 'All-nighters'],
        timing: '90-minute focused sessions. Dissertation work in the morning, research and notes in the afternoon.',
        why: `Dissertations are won through daily small progress, not occasional marathons.${gc}`,
      }
    } else if (isBusy) {
      base = {
        priorities: [
          'Submit or meaningfully advance the most urgent assignment',
          "Write down every task and deadline you're aware of",
        ],
        avoid: ['Trying to study everything at once', 'Skipping meals or sleep', 'Procrastinating on the hard thing'],
        timing: 'Study in two short bursts around your commitments. Evening slot counts.',
        why: `Busy days happen. A little focused work beats none at all.${gc}`,
      }
    } else if (isLowEnergy) {
      base = {
        priorities: [
          'Do 20 minutes of light revision — flashcards or summaries only',
          'Organise your workspace and study plan for tomorrow',
        ],
        avoid: ['Starting a new topic', 'Exam practice under pressure', 'An all-nighter'],
        timing: 'One gentle 30-minute session. Go to bed on time.',
        why: `Sleep directly improves memory consolidation. Rest is studying.${gc}`,
      }
    } else {
      base = {
        priorities: [
          isHighEnergy ? 'Tackle the assignment or topic you\'ve been avoiding' : 'Make steady progress on your most pressing piece of work',
          'Review what you studied recently for 15 minutes',
        ],
        avoid: ['Passive highlighting or re-reading', 'Studying with your phone visible', 'Skipping your breaks'],
        timing: '50-minute study blocks with 10-minute breaks. Two blocks then a proper meal.',
        why: `Consistent studying beats cramming every time.${gc}`,
      }
    }
  }

  // ─── FIGURING IT OUT ─────────────────────────────────────────────────────────
  else if (userType === 'figuring-it-out') {
    const focus = suggestedFocus || 'gentle exploration and small forward steps'

    if (isHighEnergy) {
      base = {
        priorities: [
          'Spend 60 minutes on one thing you\'re genuinely curious about',
          'Reach out to one person who might give you a useful perspective',
          'Write down three small things you could try this week',
        ],
        avoid: ['Trying to figure everything out in one sitting', 'Comparing your path to others', 'Letting the day run away with you'],
        timing: 'Use the morning for exploration. Leave admin and obligations for the afternoon.',
        why: `Good energy without rigid structure is a gift — use it to move gently forward. ${focus}.${gc}`,
      }
    } else if (isBusy) {
      base = {
        priorities: [
          'Handle the one obligation you can\'t avoid today',
          'Write down what\'s on your mind so it stops taking up mental space',
        ],
        avoid: ['Over-committing to others at your own expense', 'Making big decisions under pressure'],
        timing: 'Handle obligations first, then protect 30 minutes for yourself.',
        why: `On busy days, even one small intentional moment keeps you moving.${gc}`,
      }
    } else {
      base = {
        priorities: [
          'Take one small step — even the tiniest thing counts today',
          'Do something that feels like looking after yourself',
        ],
        avoid: ['Forcing yourself to be productive', 'Making major decisions', 'Doom-scrolling as rest'],
        timing: 'No pressure on timing. Do what feels right.',
        why: `Not every day is for output. Some days are for recovering the person who does the work.${gc}`,
      }
    }
  }

  // ─── FALLBACK ────────────────────────────────────────────────────────────────
  else {
    base = {
      priorities: [
        'Do the most important thing on your list',
        'Clear your inbox once',
      ],
      avoid: ['Multitasking', 'Reactive work before 10am'],
      timing: 'Work in 25-minute focused blocks.',
      why: `A simple plan beats no plan. Start with what matters most.${gc}`,
    }
  }

  // Inject top task as priority 1 if it's not already represented
  if (tasks.length > 0) {
    const topTask = tasks[0]
    const alreadyIn = base.priorities.some((p) =>
      p.toLowerCase().includes(topTask.toLowerCase().slice(0, 15))
    )
    if (!alreadyIn && base.priorities.length < 3) {
      base.priorities = [topTask, ...base.priorities].slice(0, 3)
    }
  }

  // Append blocker-aware avoids
  base.avoid = [...base.avoid, ...ba]

  return {
    ...base,
    timeBlocks,
    goalAlignment,
  }
}

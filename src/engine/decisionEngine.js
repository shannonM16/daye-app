/**
 * Decision engine — takes user context and returns a daily focus plan.
 *
 * @param {Object} params
 * @param {'corporate'|'self-employed'|'student'|'figuring-it-out'} params.userType
 * @param {1|2|3|4|5} params.energy          — 1 = depleted, 5 = fully charged
 * @param {'deep-work'|'busy'|'low-energy'} params.dayType
 * @param {string[]} params.pressure          — subset of ['deadlines','money','exams','none']
 *
 * @returns {{
 *   priorities: string[],   — 1-3 action items
 *   avoid: string[],        — things to skip today
 *   timing: string,         — when / how to structure the day
 *   why: string             — short explanation
 * }}
 */
export function decisionEngine({ userType, energy, dayType, pressure }) {
  const isHighEnergy = energy >= 4
  const isMidEnergy = energy === 3
  const isLowEnergy = energy <= 2

  const hasDeadline = pressure.includes('deadlines')
  const hasMoney = pressure.includes('money')
  const hasExams = pressure.includes('exams')
  const hasPressure = !pressure.includes('none') && pressure.length > 0

  // CORPORATE
  if (userType === 'corporate') {
    if (dayType === 'deep-work' && isHighEnergy) {
      return {
        priorities: [
          hasDeadline ? 'Finish your highest-stakes deliverable' : 'Tackle your most complex project block',
          'Protect 2 uninterrupted hours — no Slack, no meetings',
          'Write a one-line end-of-day progress note',
        ],
        avoid: ['Checking email in the first hour', 'Reactive Slack responses', 'Low-value admin tasks'],
        timing: 'Do your deepest work 9-11 am. Buffer admin to after lunch.',
        why: 'High energy on a deep-work day is rare. Use the morning window before the day fragments you.',
      }
    }

    if (dayType === 'deep-work' && isMidEnergy) {
      return {
        priorities: [
          hasDeadline ? 'Advance the most overdue deliverable by one concrete step' : 'Make meaningful progress on one project',
          'Clear your inbox to zero before noon',
        ],
        avoid: ['Multitasking', 'Long sync meetings if avoidable', 'Perfectionism on low-stakes work'],
        timing: 'Work in 90-minute blocks with 15-minute breaks. Eat lunch away from your desk.',
        why: 'Mid-energy is enough for focused output if you protect your time carefully.',
      }
    }

    if (dayType === 'busy') {
      return {
        priorities: [
          hasPressure ? 'Send the one email that unblocks your most urgent dependency' : 'Identify the one thing that moves a project forward today',
          'Prep for your most important meeting 10 minutes beforehand',
          'Clear your task list of anything under 5 minutes',
        ],
        avoid: ['New commitments', 'Deep creative work between back-to-back meetings', 'Over-preparing for low-stakes calls'],
        timing: 'Work in the gaps between meetings. Batch quick tasks in 20-minute windows.',
        why: 'Busy days are won in the margins. Small wins compound.',
      }
    }

    if (dayType === 'low-energy' || isLowEnergy) {
      return {
        priorities: [
          hasPressure ? 'Do the single most important thing, even if imperfectly' : "Handle one piece of admin you've been avoiding",
          "Respond to anything that's been waiting more than 48 hours",
        ],
        avoid: ['Difficult conversations', 'Important decisions', 'Starting new complex work'],
        timing: 'Work in short 25-minute bursts. Finish by 4 pm if possible.',
        why: "Low-energy days are for maintenance, not momentum. Protect tomorrow by not overcommitting today.",
      }
    }
  }

  // SELF-EMPLOYED
  if (userType === 'self-employed') {
    if (dayType === 'deep-work' && isHighEnergy) {
      return {
        priorities: [
          hasMoney ? 'Work on your highest-revenue activity first' : 'Advance your most important long-term project',
          'Do one thing that moves a client relationship forward',
          "Outline tomorrow's plan before you close",
        ],
        avoid: ['Checking social media before noon', 'Admin and invoicing', 'Scope creep on active projects'],
        timing: 'Guard 9 am - 1 pm as sacred deep-work time. Handle business tasks in the afternoon.',
        why: "As your own boss, your peak hours are your most valuable asset. Don't trade them for reactive work.",
      }
    }

    if (dayType === 'deep-work' && isMidEnergy) {
      return {
        priorities: [
          hasMoney ? 'Send one outstanding invoice or follow up on payment' : 'Make one concrete step forward on your main project',
          'Do one visible piece of client-facing work',
        ],
        avoid: ['Over-engineering or perfecting', 'Starting a new project', 'Doom-scrolling between tasks'],
        timing: 'Two 90-minute deep-work sessions. Break between them. Wrap by 5 pm.',
        why: 'Sustainable output beats burnout. Move the needle without emptying the tank.',
      }
    }

    if (dayType === 'busy') {
      return {
        priorities: [
          hasMoney ? 'Handle the money thing — invoice, proposal, or follow-up' : 'Serve your clients first',
          'Batch all emails and messages into one 45-minute window',
          'Protect one hour for actual work, even in a busy day',
        ],
        avoid: ['Taking on new work without checking capacity', 'Skipping breaks entirely', 'Saying yes to everything'],
        timing: 'Admin and comms in the morning. Protect 2-4 pm for real work.',
        why: 'Busy days in solo work mean reactive mode. One hour of intentional work keeps momentum.',
      }
    }

    if (dayType === 'low-energy' || isLowEnergy) {
      return {
        priorities: [
          hasMoney ? 'Send one invoice or nudge one payment' : 'Do one 30-minute task that counts as done',
          'Rest without guilt — recovery is productive',
        ],
        avoid: ['Client calls if you can reschedule', 'Creative decisions', 'Comparing your output to others'],
        timing: 'Short sessions only. Two 25-minute slots, max. Cancel non-essential calls.',
        why: 'Self-employed burnout is real. A low-energy day respected is better than a wasted high-energy one.',
      }
    }
  }

  // STUDENT
  if (userType === 'student') {
    if (dayType === 'deep-work' && isHighEnergy) {
      return {
        priorities: [
          hasExams ? 'Do your hardest exam topic first — active recall, not re-reading' : 'Write or produce for your most demanding assignment',
          'Review what you studied yesterday for 15 minutes first',
          hasExams ? 'Do one full practice question or past paper section' : 'Outline the next section of your project',
        ],
        avoid: ['Passive highlighting or re-reading', 'Studying with your phone visible', 'Skipping your breaks'],
        timing: '25-minute Pomodoros with 5-minute breaks. Study for 2 hours max before a real break.',
        why: 'High energy is the perfect time to engage with hard material. Use active recall, not comfort studying.',
      }
    }

    if (dayType === 'deep-work' && isMidEnergy) {
      return {
        priorities: [
          hasExams ? 'Review one subject using spaced repetition' : 'Finish the one assignment closest to done',
          'Organise your notes and study plan for the next 3 days',
        ],
        avoid: ['Starting brand new topics', 'All-nighters', 'Group chats during study windows'],
        timing: 'Study in 50-minute blocks, 10-minute rest. Two blocks then a proper meal.',
        why: 'Steady, structured studying builds more than cramming. Today is for consistency.',
      }
    }

    if (dayType === 'busy') {
      return {
        priorities: [
          hasExams ? 'Do 30 minutes of targeted revision on your weakest topic' : 'Submit or advance the most urgent assignment',
          "Write down every task and deadline you're aware of",
        ],
        avoid: ['Trying to study everything at once', 'Skipping meals or sleep', 'Procrastinating on the hard thing'],
        timing: 'Study in two short bursts around your commitments. Evening slot counts.',
        why: 'Busy days happen. A little focused studying beats none at all.',
      }
    }

    if (dayType === 'low-energy' || isLowEnergy) {
      return {
        priorities: [
          hasExams ? 'Do 20 minutes of light revision — flashcards or summaries only' : 'Read or review notes passively for 30 minutes',
          'Organise your workspace and plan tomorrow',
        ],
        avoid: ['Starting a new topic', 'Exam practice under pressure', 'Pulling an all-nighter'],
        timing: 'One gentle 30-minute session. Go to bed on time.',
        why: 'Sleep and recovery directly improve memory consolidation. Rest is studying.',
      }
    }
  }

  // FIGURING IT OUT
  if (userType === 'figuring-it-out') {
    if (dayType === 'deep-work' && isHighEnergy) {
      return {
        priorities: [
          "Spend 90 minutes exploring one thing you're genuinely curious about",
          hasPressure ? 'Handle the most pressing real-world obligation first' : 'Write down three things you want to figure out this week',
          "Talk to one person about what you're working on",
        ],
        avoid: ['Comparing your path to others', 'Trying to plan too far ahead', 'Letting email drive your morning'],
        timing: 'Use your morning energy for self-directed exploration. Leave admin for afternoon.',
        why: 'High energy without a rigid structure is an opportunity. Follow curiosity with intention.',
      }
    }

    if (dayType === 'deep-work' && isMidEnergy) {
      return {
        priorities: [
          hasPressure ? 'Address the most stressful outstanding thing, even briefly' : 'Work on one skill or project for 45 minutes',
          'Reflect: what did you make progress on this week?',
        ],
        avoid: ['Binge-consuming content without creating anything', 'Paralysis by analysis', 'Skipping movement'],
        timing: 'One 45-minute focused session. Reflect for 10 minutes after.',
        why: 'Figuring things out takes patience. One forward step per day is enough.',
      }
    }

    if (dayType === 'busy') {
      return {
        priorities: [
          hasPressure ? 'Handle the most urgent external pressure first' : 'Do one small thing that feels like progress',
          "Write down what's distracting you so you can return to it later",
        ],
        avoid: ['Over-committing to others at your own expense', 'Making big decisions under pressure'],
        timing: 'Handle obligations first, then protect 30 minutes for yourself.',
        why: 'Busy days can sweep you away. Anchoring with one intentional act keeps the thread.',
      }
    }

    if (dayType === 'low-energy' || isLowEnergy) {
      return {
        priorities: [
          "Rest without shame — you're allowed to have an off day",
          hasPressure ? 'Do the one thing that will reduce your stress the most' : 'Do something kind for yourself',
        ],
        avoid: ['Forcing productivity', 'Making major life decisions', 'Doom-scrolling as rest'],
        timing: 'No pressure on timing. Gentle, unstructured day.',
        why: 'Not every day is for output. Some days are for recharging the person who does the work.',
      }
    }
  }

  // FALLBACK
  return {
    priorities: [
      'Do the most important thing on your list',
      'Clear your inbox once',
    ],
    avoid: ['Multitasking', 'Reactive work before 10 am'],
    timing: 'Work in 25-minute focused blocks.',
    why: 'A simple plan beats no plan. Start with what matters most.',
  }
}

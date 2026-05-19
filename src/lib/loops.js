function headers() {
  return {
    'Content-Type': 'application/json',
  }
}

export async function addLoopsContact(email, firstName) {
  try {
    await fetch('/api/loops', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        action: 'create-contact',
        email,
        firstName,
        source: 'withdaye.com',
        userGroup: 'beta',
        mailingLists: {},
      }),
    })
  } catch {
    // fail silently
  }
}

export async function updateLoopsContact(email, profile) {
  try {
    await fetch('/api/loops', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        action: 'update-contact',
        email,
        userType: profile.userType,
        jobFunction: profile.jobFunction,
        goal: profile.goal,
        onboardingCompleted: true,
      }),
    })
  } catch {
    // fail silently
  }
}

export async function sendLoopsWelcomeEmail(email, firstName) {
  try {
    await fetch('/api/loops', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        action: 'send-transactional',
        transactionalId: 'cmofmfsae06yl0i192a6abtul',
        email,
        dataVariables: { firstName },
      }),
    })
  } catch {
    // fail silently
  }
}

export async function sendLoopsPlanCreatedEvent(email) {
  try {
    await fetch('/api/loops', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ action: 'send-event', email, eventName: 'plan_created' }),
    })
  } catch {
    // fail silently
  }
}

async function sendLoopsEvent(email, eventName, eventProperties = {}) {
  if (!email) return
  try {
    await fetch('/api/loops', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ action: 'send-event', email, eventName, eventProperties }),
    })
  } catch {
    // fail silently
  }
}

export async function trackPlanGenerated(email) {
  return sendLoopsEvent(email, 'plan_generated')
}

export async function trackPlanCompleted(email) {
  return sendLoopsEvent(email, 'plan_completed')
}

export async function trackReflectionCompleted(email) {
  return sendLoopsEvent(email, 'reflection_completed')
}

export async function trackProUpgradeClicked(email) {
  return sendLoopsEvent(email, 'pro_upgrade_clicked')
}

export async function trackProTrialStarted(email) {
  return sendLoopsEvent(email, 'pro_trial_started')
}

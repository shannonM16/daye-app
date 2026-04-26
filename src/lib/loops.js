const BASE = 'https://app.loops.so/api/v1'

function headers() {
  return {
    'Content-Type': 'application/json',
  }
}

export async function addLoopsContact(email, firstName) {
  try {
    await fetch('/api/loops-create-contact', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
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
    await fetch(BASE + '/contacts/update', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
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
    await fetch('/api/loops-send-transactional', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
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
    await fetch(BASE + '/events/send', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ email, eventName: 'plan_created' }),
    })
  } catch {
    // fail silently
  }
}

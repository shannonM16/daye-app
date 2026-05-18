import posthog from 'posthog-js'

let _initialized = false

export function initPostHog() {
  if (_initialized || import.meta.env.MODE !== 'production') return
  const key = import.meta.env.VITE_POSTHOG_KEY
  if (!key) return
  posthog.init(key, {
    api_host: 'https://eu.posthog.com',
    capture_pageview: true,
    autocapture: false,
    persistence: 'localStorage+cookie',
  })
  _initialized = true
}

export function identifyUser(id, email) {
  if (!_initialized) return
  posthog.identify(id, { email })
}

export function trackEvent(name, props = {}) {
  if (!_initialized) return
  posthog.capture(name, props)
}

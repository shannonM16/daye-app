/**
 * Mobile e2e — Daye full morning flow
 *
 * Prerequisites:
 *   npm install -D @playwright/test dotenv
 *   npx playwright install chromium
 *   Add SUPABASE_SERVICE_ROLE_KEY to .env  (service role needed for seed/cleanup)
 *   npm run dev (dev server must be running before running tests)
 *
 * Run:
 *   npx playwright test src/tests/e2e-mobile.test.js --headed
 */

import { test, expect } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

// ── Constants ──────────────────────────────────────────────────────────────────

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:5173'
const MOBILE   = { width: 390, height: 844 }   // iPhone 14

const TEST_USER = {
  id:        '00000000-e2e0-4000-8000-000000000001',  // valid UUID v4, clearly test data
  email:     'e2e@daye.internal',
  firstName: 'Test',
  password:  'e2e-test-password-123!',
}

// Supabase storage key used by the JS client to persist sessions in localStorage.
// Derived from the project ref in VITE_SUPABASE_URL so it works across envs.
const SUPABASE_PROJECT_REF   = new URL(process.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co').hostname.split('.')[0]
const SUPABASE_STORAGE_KEY   = `sb-${SUPABASE_PROJECT_REF}-auth-token`

// ── Supabase admin client (Node context — seed & cleanup only) ─────────────────
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.VITE_SUPABASE_ANON_KEY,
)

// ── Mock objects ──────────────────────────────────────────────────────────────

const MOCK_SESSION = {
  access_token:  'e2e-mock-access-token',
  refresh_token: 'e2e-mock-refresh-token',
  expires_in:    3600,
  expires_at:    Math.floor(Date.now() / 1000) + 3600,
  token_type:    'bearer',
  user: {
    id:                 TEST_USER.id,
    aud:                'authenticated',
    role:               'authenticated',
    email:              TEST_USER.email,
    email_confirmed_at: new Date().toISOString(),
    created_at:         new Date().toISOString(),
  },
}

// Profile fields that CheckIn.jsx reads: userType, jobFunctions, seniority.
// Engineering/IC gives us predictable task chips for step 4.
const MOCK_PROFILE = {
  userType:     'corporate',
  jobFunctions: 'engineering',
  seniority:    'ic',
  name:         TEST_USER.firstName,
  goal:         'stay-on-top',
}

// Plan returned by the mocked /api/generate-plan endpoint.
const MOCK_PLAN = {
  priorities: [
    'Deep coding session',
    'Code review',
    'Write documentation',
  ],
  prioritySubtitles: [
    'Core sprint work for today',
    'Unblocks two teammates',
    'Needed before handoff',
  ],
  dayName: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
}

// ── Seed / Cleanup ─────────────────────────────────────────────────────────────
// The app has no dedicated tasks table — tasks are strings in localStorage
// (df_userTasks) persisted to the `plans` table as completed_tasks JSON.
// We seed one plan row for the test user and clean it up after.
// The seed is best-effort: plans.user_id has a FK to users which requires a real
// auth user. All browser-side Supabase calls are mocked so the test runs either way.

const SEED_DATE = new Date().toISOString().split('T')[0]
let seededPlanId = null

test.beforeAll(async () => {
  const { data, error } = await supabaseAdmin
    .from('plans')
    .insert({
      user_id:         TEST_USER.id,
      date:            SEED_DATE,
      completed_tasks: ['Deep coding session'],
    })
    .select('id')
    .single()

  if (error) {
    console.warn(`[seed] Skipped — ${error.message}`)
    return
  }
  seededPlanId = data.id
})

test.afterAll(async () => {
  if (seededPlanId) {
    await supabaseAdmin.from('plans').delete().eq('id', seededPlanId)
  }
})

// ── Full morning flow ──────────────────────────────────────────────────────────

test.describe('Daye morning flow — iPhone 14 (390×844)', () => {
  test.use({ viewport: MOBILE })

  test.beforeEach(async ({ page }) => {
    // Do NOT inject df_userProfile here — its absence causes getInitialScreen()
    // to return SCREENS.LANDING, which is what we want for steps 1 & 2.
    // Profile is injected via page.evaluate after auth (step 2) then a reload
    // causes useStorage to re-read localStorage and getInitialScreen() → CHECKIN.

    // CheckIn.getTimePeriod() uses new Date().getHours(): hour >= 17 → 'evening'
    // which renders a different screen with no range slider. Patch getHours() to
    // always return 9 so the morning form renders. addInitScript runs before every
    // page load (including page.reload()) so it survives the auth→reload cycle.
    await page.addInitScript(() => {
      // CheckIn renders evening-mode UI when getHours() >= 17; always report 9am
      Date.prototype.getHours = function() { return 9 }
    })

    // ── Supabase auth (signup + token exchange) ──────────────────────────────
    await page.route(/supabase\.co\/auth\/v1\/(signup|token)/, async route => {
      await route.fulfill({
        status:      200,
        contentType: 'application/json',
        body:        JSON.stringify(MOCK_SESSION),
      })
    })

    // ── Supabase auth session refresh ────────────────────────────────────────
    await page.route(/supabase\.co\/auth\/v1\/user/, async route => {
      await route.fulfill({
        status:      200,
        contentType: 'application/json',
        body:        JSON.stringify(MOCK_SESSION.user),
      })
    })

    // ── Supabase REST: users table ───────────────────────────────────────────
    await page.route(/supabase\.co\/rest\/v1\/users/, async route => {
      const isGet = route.request().method() === 'GET'
      await route.fulfill({
        status:      200,
        contentType: 'application/json',
        body: JSON.stringify(
          isGet
            ? [{ id: TEST_USER.id, email: TEST_USER.email, first_name: TEST_USER.firstName, is_pro: false }]
            : { id: TEST_USER.id }
        ),
      })
    })

    // ── Supabase REST: catch-all for plans, weekly_wins, and any other table ─
    // GET → [] (fetchPlans expects an array), mutations → {}
    await page.route(/supabase\.co\/rest\/v1\//, async route => {
      const method = route.request().method()
      await route.fulfill({
        status:      method === 'DELETE' ? 204 : 200,
        contentType: 'application/json',
        body:        method === 'GET' ? '[]' : '{}',
      })
    })

    // ── /api/generate-plan ───────────────────────────────────────────────────
    // buildPlan.js expects { result: '<json-string>' } — wrapping is required.
    // A bare object body causes JSON.parse(data.result) to fail, which falls
    // back to the rule-based decisionEngine and produces unpredictable tasks.
    await page.route('**/api/generate-plan', async route => {
      await route.fulfill({
        status:      200,
        contentType: 'application/json',
        body:        JSON.stringify({ result: JSON.stringify(MOCK_PLAN) }),
      })
    })
  })

  test('full morning flow', async ({ page }) => {

    // ── Step 1: Landing loads — mobile nav visible, DemoPhone animation visible ─
    // No df_userProfile in localStorage → getInitialScreen() → SCREENS.LANDING
    await page.goto(BASE_URL)

    // On mobile (390px) the desktop nav is hidden; only the hamburger renders.
    // Its presence confirms the landing page loaded (not redirected to checkin).
    await expect(page.getByRole('button', { name: 'Open menu' })).toBeVisible({ timeout: 8000 })

    // DemoPhone: phone-wrap sits ~1500px down in the landing page.
    // Scroll via JS (avoids StrictMode double-mount detach issues with locator actions)
    // then assert the frame element is in the DOM (IntersectionObserver handles the reveal).
    await page.evaluate(() => window.scrollTo({ top: 1800, behavior: 'instant' }))
    await page.waitForTimeout(600)   // allow IntersectionObserver + CSS transition to fire
    await expect(page.locator('.demo-phone-frame')).toBeAttached({ timeout: 5000 })

    // ── Step 2: Tap "Start free" → auth → inject session + reload → check-in ──
    // On mobile the "Start free" CTA lives inside the hamburger overlay.
    // Open the menu, then click the visible button.
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.getByRole('button', { name: 'Open menu' }).click()
    // Multiple "Start free" elements may exist (desktop nav + hero CTA hidden by CSS).
    // The mobile overlay makes one visible — use first() to avoid strict-mode violation.
    await expect(page.getByRole('button', { name: 'Start free' }).first()).toBeVisible({ timeout: 3000 })
    await page.getByRole('button', { name: 'Start free' }).first().click()

    // Auth modal opens (mode = 'signup') with fields: First name, Email, Password, Confirm password.
    // Fill all required fields before clicking "Create account" to avoid browser validation errors.
    // The modal also has a "Continue with Google" button — we deliberately target the exact submit label.
    const emailInput = page.locator('input[type="email"]')
    await expect(emailInput).toBeVisible({ timeout: 5000 })
    await page.getByPlaceholder('First name').fill(TEST_USER.firstName)
    await emailInput.fill(TEST_USER.email)
    await page.getByRole('textbox', { name: 'Password', exact: true }).fill(TEST_USER.password)
    await page.getByRole('textbox', { name: 'Confirm password' }).fill(TEST_USER.password)
    await page.getByRole('button', { name: 'Create account' }).click()

    // handleSignUp always navigates to ONBOARDING for new email users.
    // Verify the modal is gone (auth call completed), then take over state:
    //   1. Write df_userProfile so getInitialScreen() → CHECKIN on next mount
    //   2. Write Supabase session key so initFromSupabase() finds a live session
    //   3. Write df_user + daye_user_id for CheckIn greeting and DB writes
    await expect(emailInput).toBeHidden({ timeout: 8000 })

    await page.evaluate(({ profile, session, sessionKey, user, userId }) => {
      localStorage.setItem('df_userProfile',  JSON.stringify(profile))
      localStorage.setItem('df_user',         JSON.stringify(user))
      localStorage.setItem('daye_user_id',    userId)
      localStorage.setItem(sessionKey,        JSON.stringify(session))
    }, {
      profile:    MOCK_PROFILE,
      session:    MOCK_SESSION,
      sessionKey: SUPABASE_STORAGE_KEY,
      user:       { firstName: TEST_USER.firstName, email: TEST_USER.email },
      userId:     TEST_USER.id,
    })

    // Reload so useStorage re-reads localStorage on fresh mount.
    // getInitialScreen() now finds df_userProfile → returns SCREENS.CHECKIN.
    await page.reload()

    // Check-in step 1 renders: energy range slider + mood chips
    await expect(page.locator('input[type="range"]')).toBeVisible({ timeout: 8000 })

    // ── Step 3: Select energy, mood, sleep quality, day type → submit ─────────

    // Energy via range input (fires onChange → handleEnergyChange)
    await page.locator('input[type="range"]').fill('4')   // energy 4 = "Good"

    // Mood chip — MoodBtn buttons (step 1)
    await page.getByRole('button', { name: 'Focused' }).click()

    // Sleep quality chip — GridBtn buttons (step 1)
    await page.getByRole('button', { name: 'Great' }).click()

    // "Next" → step 2 (day type + pressure); canAdvance = mood && sleep
    await page.getByRole('button', { name: 'Next' }).click()

    // Day type chip (step 2)
    await page.getByRole('button', { name: 'Deep work' }).click()

    // Pressure chip — engineering list always includes "None right now"
    // satisfies canSubmit: dayType && pressure.length > 0
    await page.getByRole('button', { name: 'None right now' }).click()

    // Step 2 CTA → handleCheckIn → SCREENS.MEETING_INPUT
    await page.getByRole('button', { name: 'Build my plan' }).click()

    // ── MeetingInput — skip ───────────────────────────────────────────────────
    const noMeetings = page.getByText(/No meetings today/)
    if (await noMeetings.isVisible({ timeout: 3000 }).catch(() => false)) {
      await noMeetings.click()
    }

    // ── Step 4: Select a task → Build my focus plan ───────────────────────────
    // TaskInput shows chip suggestions from MOCK_PROFILE (corporate/engineering/ic).
    // "Deep coding session" is the first chip in CORPORATE_CHIPS.engineering.ic.
    const taskChip = page.getByRole('button', { name: 'Deep coding session' })
    await expect(taskChip).toBeVisible({ timeout: 5000 })
    await taskChip.click()

    // Enabled once selected.length > 0
    const buildBtn = page.getByRole('button', { name: 'Build my focus plan' })
    await expect(buildBtn).toBeEnabled()
    await buildBtn.click()

    // ── Step 5: Focus plan output renders ────────────────────────────────────
    // The mocked /api/generate-plan responds instantly so the loading screen
    // flashes too briefly to assert. Assert the output instead — MOCK_PLAN.priorities[0]
    // appears both in the task list and priority sections of FocusOutput.
    await expect(page.getByText(MOCK_PLAN.priorities[0]).first()).toBeVisible({ timeout: 10000 })

    // ── Step 6: Enter action mode — timer ring + task list render ─────────────
    // FocusOutput CTA is "Start focus timer" → SCREENS.ACTION
    await page.getByRole('button', { name: 'Start focus timer' }).click()

    // SVG progress ring inside .action-ring-wrap
    await expect(page.locator('.action-ring-wrap circle').first()).toBeVisible({ timeout: 5000 })

    // Right-column task checklist shows the first priority
    await expect(page.getByText(MOCK_PLAN.priorities[0])).toBeVisible()

    // ── Step 7: Tap play — timer counts down ──────────────────────────────────
    // startPauseLabel = "Start" when timer is at its initial value
    const timerDisplay = page.locator('.timer-display').first()
    await expect(timerDisplay).toBeVisible({ timeout: 5000 })
    const timeBefore = await timerDisplay.textContent()

    await page.getByRole('button', { name: 'Start' }).first().click()

    await page.waitForTimeout(2200)   // wait 2 s for the timer to decrement
    const timeAfter = await timerDisplay.textContent()
    expect(timeAfter).not.toBe(timeBefore)

    // ── Step 8: End of Day — complete all tasks → EOD completion overlay → EOD screen ──
    // "End of day reflection" lives inside ActionMode's all-done overlay
    // (allMainDone && allExtraDone). Check off each MOCK_PLAN priority to reach it.
    for (const task of MOCK_PLAN.priorities) {
      const taskBtn = page.getByRole('button', { name: task }).first()
      if (await taskBtn.count() > 0) {
        await taskBtn.scrollIntoViewIfNeeded()
        await taskBtn.click()
      }
    }
    // Completion overlay: "Day complete." heading + EOD button
    await expect(page.getByText('Day complete.')).toBeVisible({ timeout: 5000 })
    const eodNav = page.getByRole('button', { name: 'End of day reflection' })
    await expect(eodNav).toBeVisible({ timeout: 3000 })
    await eodNav.click()

    // EOD mood chips (END_MOODS array → .eod-mood-chip buttons)
    await expect(page.getByRole('button', { name: 'Accomplished' })).toBeVisible({ timeout: 5000 })
    await expect(page.getByRole('button', { name: 'Tired' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Energised' })).toBeVisible()

    // "Close the day" CTA (ink bg / linen text from elevated EndOfDayReflection design)
    await expect(page.getByRole('button', { name: /close the day/i })).toBeVisible()
  })
})

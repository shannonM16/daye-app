import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './src/tests',
  timeout: 30_000,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'mobile-chrome',
      use: {
        browserName: 'chromium',   // override iPhone 14's default webkit — chromium only installed
        ...devices['iPhone 14'],   // preserves 390×844 viewport, isMobile, hasTouch, UA
      },
    },
  ],
  // Dev server is started manually — run `npm run dev` before running tests
  webServer: undefined,
})

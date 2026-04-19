import { defineConfig, devices } from '@playwright/test'

const isCI = !!process.env.CI

export default defineConfig({
  testDir: './e2e',
  fullyParallel: !isCI,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,
  timeout: 45000,
  expect: { timeout: 10000 },

  reporter: isCI
    ? [['github'], ['html', { outputFolder: 'playwright-report', open: 'never' }]]
    : [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],

  webServer: {
    // In CI: use dev server with placeholder env vars already set in the job
    // reuseExistingServer=true locally so `npm run dev` doesn't need to restart
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !isCI,
    timeout: 120000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
})

import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: 'tests/e2e',
  outputDir: 'node_modules/.cache/e2e-results',
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4317',
    locale: 'nl-NL',
    timezoneId: 'Europe/Amsterdam',
  },
  projects: [
    { name: 'mobiel', use: { ...devices['Pixel 7'] } },
    { name: 'iphone', use: { ...devices['iPhone 14'] } },
  ],
  webServer: {
    command: 'node node_modules/vite/bin/vite.js preview --port 4317 --strictPort',
    url: 'http://localhost:4317',
    reuseExistingServer: false,
  },
})

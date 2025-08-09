// @ts-check
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  webServer: {
    command: 'vite',
    port: 5173,
    reuseExistingServer: !process.env.CI,
  },
  use: { headless: true }
})

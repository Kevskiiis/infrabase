import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  use: { baseURL: 'http://localhost:5173', trace: 'retain-on-failure' },
  webServer: [
    { command: 'npm run dev -- --host 0.0.0.0', port: 5173, reuseExistingServer: true },
  ],
})

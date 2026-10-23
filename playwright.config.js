import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { defineConfig, devices } from '@playwright/test'

// Testy aplikacji w prawdziwej przeglądarce, na zbudowanej wersji (tej, która
// trafia do internetu), w dwóch telefonach: iPhone (WebKit, jak Safari)
// i Android (Chromium, jak Chrome). Uruchamia je `npm run test:e2e`.
const PORT = 4799

export default defineConfig({
  testDir: 'e2e',
  // Wyniki nieudanych testów poza dyskiem exFAT – nazwy z polskimi znakami
  // (np. „każdy ekran”) potrafią się tam zablokować i nie da się ich usunąć.
  outputDir: process.env.CI ? 'test-results' : join(tmpdir(), 'psycho-test-results'),
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // Jedna powtórka także lokalnie: przy ponad 400 testach WebKit czasem zamarza na
  // pojedynczej stronie (wisi page.goto i zamykanie kontekstu), a powtórzony test przechodzi.
  retries: 1,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${PORT}/`,
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'iphone', use: { ...devices['iPhone 13'] } },
    { name: 'android', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: `npx vite build --logLevel error && npx vite preview --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}/`,
    reuseExistingServer: false,
    timeout: 120_000,
  },
})

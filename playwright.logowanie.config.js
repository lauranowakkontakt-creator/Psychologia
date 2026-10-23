import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { defineConfig, devices } from '@playwright/test'

// Testy wersji z logowaniem (`--mode firebase`) bez prawdziwego projektu Firebase:
// sprawdzają ekran logowania i to, że bez zalogowania nie widać żadnej notatki.
// Ruch do serwerów Google jest w testach blokowany (e2e-logowanie/logowanie.spec.js).
const PORT = 4798

export default defineConfig({
  testDir: 'e2e-logowanie',
  testIgnore: '**/._*',
  outputDir: process.env.CI ? 'test-results' : join(tmpdir(), 'psycho-test-results-logowanie'),
  forbidOnly: !!process.env.CI,
  retries: 1,
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL: `http://localhost:${PORT}/` },
  projects: [
    { name: 'iphone', use: { ...devices['iPhone 13'] } },
    { name: 'android', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: `npx vite build --mode firebase --outDir dist-logowanie --logLevel error && npx vite preview --outDir dist-logowanie --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}/`,
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      VITE_FIREBASE_API_KEY: 'test-klucz',
      VITE_FIREBASE_AUTH_DOMAIN: 'psycho-test.firebaseapp.com',
      VITE_FIREBASE_PROJECT_ID: 'psycho-test',
      VITE_FIREBASE_APP_ID: '1:1:web:1',
    },
  },
})

import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { parseGitAdded } from './src/lib/added.js'

// Kiedy każda notatka trafiła do zbioru („Ostatnio dodane”) — z historii gita,
// jako moduł `virtual:psycho-added`. Bez gita (np. paczka bez historii) — pusto.
function gitAddedDates() {
  const id = 'virtual:psycho-added'
  return {
    name: 'psycho-added',
    resolveId: (source) => (source === id ? '\0' + id : null),
    load(source) {
      if (source !== '\0' + id) return null
      let dates = {}
      try {
        const log = execFileSync('git', ['log', '--reverse', '--name-status', '-M', '--format=@%cI', '--', 'content'], {
          encoding: 'utf8',
          maxBuffer: 32 * 1024 * 1024,
          stdio: ['ignore', 'pipe', 'ignore'],
        })
        dates = parseGitAdded(log)
      } catch {}
      return `export default ${JSON.stringify(dates)}`
    },
  }
}

// `base: './'` — ścieżki względne, więc ta sama paczka działa pod dowolnym
// adresem (GitHub Pages w podfolderze, Firebase Hosting w korzeniu).
// Adresy w aplikacji idą po `#`, więc serwer nie musi nic o nich wiedzieć.
//
// Dwa tryby (alias `@source`):
//  - zwykły (`npm run dev`, `npm run build`, testy): notatki z content/ w paczce, bez logowania,
//  - `--mode firebase` (`npm run build:firebase`): logowanie Google, notatki z Firestore —
//    w paczce nie ma ani jednej notatki. Konfiguracja w `.env.firebase` (wzór: `.env.firebase.example`).
export default defineConfig(({ mode }) => ({
  base: './',
  resolve: {
    alias: {
      '@source': fileURLToPath(new URL(`./src/source/${mode === 'firebase' ? 'firebase' : 'local'}.js`, import.meta.url)),
    },
  },
  // Projekt leży na dysku exFAT, gdzie macOS nie zgłasza zmian w plikach —
  // bez sprawdzania co chwilę (polling) podgląd nie odświeża się po edycji notatek.
  server: { watch: { usePolling: true, interval: 300 } },
  plugins: [
    gitAddedDates(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: { enabled: false },
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      workbox: {
        // Notatki są w paczce JS, więc po pierwszym otwarciu działają też bez internetu.
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        // Z każdym przedmiotem paczka rośnie; domyślne 2 MiB wyrzuciłoby ją
        // z pamięci offline (a build by się wywalił), stąd wyższy limit.
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        // Czcionki Geist i Newsreader z Google Fonts — po pierwszym pobraniu
        // zostają w pamięci, więc bez internetu notatki wyglądają tak samo.
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts-css' },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-files',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      manifest: {
        name: 'Psycho — notatki z psychologii',
        short_name: 'Psycho',
        description: 'Notatki z psychologii: studia i kursy',
        lang: 'pl',
        theme_color: '#0D0D11',
        background_color: '#0D0D11',
        display: 'standalone',
        orientation: 'portrait',
        start_url: './',
        scope: './',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
}))

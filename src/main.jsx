import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App.jsx'
import { AuthProvider } from './auth.jsx'
import { BOOKMARKS_KEY, migratePaths, RECENT_KEY } from './lib/prefs.js'
import { legacyPath } from './lib/route.js'
import { migrateStored } from './store.js'
import '../design/theme.css'
import './styles.css'

// Nowa wersja strony instaluje się sama przy następnym otwarciu.
registerSW({ immediate: true })

// Historia i zakładki sprzed podziału Studiów na Przedmioty i Tematy.
for (const key of [RECENT_KEY, BOOKMARKS_KEY]) migrateStored(key, (list) => migratePaths(list, legacyPath))

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)

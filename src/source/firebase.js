// Źródło treści „Firebase”: logowanie Google, notatki z Firestore, synchronizacja.
//
// Wersja publiczna nie ma notatek w paczce strony — przychodzą z Firestore dopiero
// po zalogowaniu, a reguły (firestore.rules) wpuszczają tylko adresy z kolekcji
// `dozwoleni`. Notatki wysyła tam `npm run wyslij-notatki` (scripts/wyslij-notatki.mjs).
// To samo API co src/source/local.js; wybiera je alias `@source` w vite.config.js.
import { initializeApp } from 'firebase/app'
import {
  browserLocalPersistence,
  browserPopupRedirectResolver,
  GoogleAuthProvider,
  indexedDBLocalPersistence,
  initializeAuth,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut as fbSignOut,
} from 'firebase/auth'
import {
  collection,
  doc,
  getDoc,
  getDocFromCache,
  getDocFromServer,
  initializeFirestore,
  onSnapshot,
  persistentLocalCache,
  persistentMultipleTabManager,
  setDoc,
} from 'firebase/firestore'
import { unpackChunks } from '../lib/chunks.js'
import { mergeValue, sameValue, SYNCED } from '../lib/sync.js'
import { readStored, subscribeWrites, writeFromSync, writeStored } from '../store.js'

export const MODE = 'firebase'
export const initialContent = null
export const GUEST = null

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(config)
// Pamięć sesji ustawiona od razu, a nie przy kliknięciu: czekanie (`await`) przed
// `signInWithPopup` sprawia, że Safari blokuje okienko logowania.
const auth = initializeAuth(app, {
  persistence: [indexedDBLocalPersistence, browserLocalPersistence],
  popupRedirectResolver: browserPopupRedirectResolver,
})
// Pamięć podręczna na telefonie: notatki i dane działają też bez internetu.
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
})

const VERSION_KEY = 'psycho-content-version'

const toUser = (u) => u && { uid: u.uid, name: (u.displayName || '').split(' ')[0] || u.email, email: (u.email || '').toLowerCase() }

export function watchUser(callback) {
  return onAuthStateChanged(auth, (u) => callback(toUser(u) || null))
}

// Logowanie w okienku, także w aplikacji na pulpicie iPhone'a. Przekierowanie tylko
// awaryjnie: strona stoi na GitHub Pages, a logowanie na domenie Firebase, więc
// Safari (blokada pamięci cudzych domen) gubi po nim zalogowanie i wraca ekran logowania.
// `signInWithPopup` musi ruszyć od razu po kliknięciu — bez `await` przed nim.
export async function signIn() {
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })
  try {
    await signInWithPopup(auth, provider)
  } catch (e) {
    if (e?.code === 'auth/popup-blocked' || e?.code === 'auth/operation-not-supported-in-this-environment') {
      return signInWithRedirect(auth, provider)
    }
    if (e?.code === 'auth/popup-closed-by-user' || e?.code === 'auth/cancelled-popup-request') return
    throw e
  }
}

export function signOut() {
  return fbSignOut(auth)
}

// Czy adres jest na liście `dozwoleni`. Reguły pozwalają każdemu zalogowanemu
// sprawdzić tylko własny wpis, więc brak dostępu to po prostu brak dokumentu.
export async function hasAccess(user) {
  try {
    return (await getDoc(doc(db, 'dozwoleni', user.email))).exists()
  } catch (e) {
    if (e?.code === 'permission-denied') return false
    throw e
  }
}

// Spis treści (1 odczyt) mówi, czy notatki się zmieniły. Jeśli nie — paczki
// z pamięci telefonu (0 odczytów z darmowego limitu). Bez internetu — z pamięci.
export async function loadContent() {
  const spisRef = doc(db, 'tresc', '_spis')
  let spis
  let online = true
  try {
    spis = await getDocFromServer(spisRef)
  } catch {
    online = false
    spis = await getDocFromCache(spisRef)
  }
  if (!spis.exists()) throw new Error('W Firestore nie ma jeszcze notatek (npm run wyslij-notatki).')
  const { version, chunks: ids, added = {} } = spis.data()
  const fresh = online && readStored(VERSION_KEY, null) !== version
  const chunks = await Promise.all(ids.map(async (id) => {
    const ref = doc(db, 'tresc', id)
    if (fresh) return (await getDocFromServer(ref)).data()
    try {
      return (await getDocFromCache(ref)).data()
    } catch {
      return (await getDoc(ref)).data()
    }
  }))
  writeStored(VERSION_KEY, version)
  return { files: unpackChunks(chunks), added }
}

// Synchronizacja kluczy z src/lib/sync.js przez `uzytkownicy/{uid}/dane/{klucz}`.
// Wartość leży jako tekst JSON (Firestore nie musi znać jej kształtu), `at` to czas
// ostatniej zmiany na urządzeniu — potrzebny tam, gdzie wygrywa nowsza wersja.
const SYNC_AT_KEY = 'psycho-sync-at'
const PUSH_DELAY = 1500

export function startSync(user) {
  const col = collection(db, 'uzytkownicy', user.uid, 'dane')
  const timers = new Map()
  const localAt = (key) => readStored(SYNC_AT_KEY, {})[key] || 0
  const remote = new Map()

  const push = (key) => {
    clearTimeout(timers.get(key))
    timers.set(key, setTimeout(() => {
      const value = readStored(key, undefined)
      if (value === undefined) return
      const prev = remote.get(key)
      if (prev && sameValue(prev.value, value)) return
      const at = localAt(key) || Date.now()
      remote.set(key, { value, at })
      setDoc(doc(col, key), { value: JSON.stringify(value), at }).catch((e) => console.warn('Synchronizacja:', e?.code || e))
    }, PUSH_DELAY))
  }

  const stopWrites = subscribeWrites((key) => {
    if (!SYNCED[key]) return
    writeStored(SYNC_AT_KEY, { ...readStored(SYNC_AT_KEY, {}), [key]: Date.now() })
    push(key)
  })

  let first = true
  const stopSnapshot = onSnapshot(col, (snap) => {
    for (const change of snap.docChanges()) {
      const key = change.doc.id
      if (!SYNCED[key] || change.type === 'removed') continue
      const data = change.doc.data()
      let value
      try {
        value = JSON.parse(data.value)
      } catch {
        continue
      }
      remote.set(key, { value, at: data.at || 0 })
      const local = readStored(key, undefined)
      const merged = mergeValue(key, local, value, localAt(key), data.at)
      if (!sameValue(merged, local)) writeFromSync(key, merged)
      if (!sameValue(merged, value)) push(key)
    }
    // Pierwsze połączenie z nowym urządzeniem albo kontem: wyślij to, czego w chmurze nie ma.
    if (first) {
      first = false
      for (const key of Object.keys(SYNCED)) {
        if (!remote.has(key) && readStored(key, undefined) !== undefined) push(key)
      }
    }
  }, (e) => console.warn('Synchronizacja:', e?.code || e))

  return () => {
    stopWrites()
    stopSnapshot()
    for (const t of timers.values()) clearTimeout(t)
  }
}

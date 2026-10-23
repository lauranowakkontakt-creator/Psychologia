import { useAuth } from '../auth.jsx'
import { LogOutIcon } from '../components/Icon.jsx'

// Ekran przed aplikacją (tylko w trybie Firebase): wczytywanie, logowanie,
// brak dostępu albo błąd wczytania notatek.
export function GateView() {
  const { status, user, error, signIn, signOut } = useAuth()

  if (status === 'loading') {
    return (
      <div className="gate" aria-busy="true">
        <p className="logo gate-logo">psycho<span>.</span></p>
        <p className="muted" role="status">Wczytuję notatki…</p>
      </div>
    )
  }

  if (status === 'denied') {
    return (
      <div className="gate">
        <p className="logo gate-logo">psycho<span>.</span></p>
        <h1 className="title-xl">Brak <em>dostępu</em></h1>
        <p className="muted gate-text">
          Konto <strong>{user.email}</strong> nie jest na liście osób z dostępem do notatek.
          Poproś Laurę o dodanie tego adresu.
        </p>
        <button type="button" className="btn-accent gate-btn" onClick={signOut}>
          <LogOutIcon /> Zaloguj się innym kontem
        </button>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="gate" role="alert">
        <p className="logo gate-logo">psycho<span>.</span></p>
        <h1 className="title-xl">Nie udało się wczytać notatek</h1>
        <p className="muted gate-text">
          Za pierwszym razem potrzebny jest internet — potem notatki działają także bez niego.
        </p>
        {error && <p className="muted gate-detail">{error}</p>}
        <div className="error-actions">
          <button type="button" className="btn-accent gate-btn" onClick={() => window.location.reload()}>Spróbuj ponownie</button>
          <button type="button" className="text-link" onClick={signOut}>Wyloguj</button>
        </div>
      </div>
    )
  }

  return (
    <div className="gate">
      <p className="logo gate-logo">psycho<span>.</span></p>
      <h1 className="title-xl">Twoje <em>notatki</em></h1>
      <p className="muted gate-text">Notatki z psychologii są dostępne tylko dla zaproszonych osób. Zaloguj się kontem Google.</p>
      <button type="button" className="btn-accent gate-btn" onClick={signIn}>
        <GoogleMark /> Zaloguj przez Google
      </button>
      {error && <p className="gate-error" role="alert">{error}</p>}
    </div>
  )
}

// Znak Google w jednym kolorze (motyw), bez kolorowego logo.
function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3zM12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22zm-5.6-8c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3.1a10 10 0 0 0 0 9.2l3.3-2.6zM12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 3.1 7.4L6.4 10c.8-2.3 3-4.1 5.6-4.1z" />
    </svg>
  )
}

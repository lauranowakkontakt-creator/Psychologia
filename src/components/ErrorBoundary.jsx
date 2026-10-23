import { Component } from 'react'

// Gdy ekran się wysypie (np. przez błędny plik notatki), zamiast białej strony
// pokazuje komunikat i drogę wyjścia. App nadaje mu klucz = adres, więc po
// przejściu gdzie indziej błąd znika sam.
export class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('Błąd ekranu:', error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="page-head" role="alert">
        <h1 className="title-xl">Coś poszło nie tak</h1>
        <p className="muted page-sub">Tego ekranu nie udało się wyświetlić.</p>
        <div className="error-actions">
          <button type="button" className="btn-accent" onClick={() => window.location.reload()}>
            Odśwież
          </button>
          <a className="text-link" href="#/">Wróć na start</a>
        </div>
      </div>
    )
  }
}

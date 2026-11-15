import { useProblem } from '../store.js'
import { CloseIcon } from './Icon.jsx'

const TEXT = {
  storage: 'Nie udało się zapisać zmian na tym urządzeniu — pamięć przeglądarki jest pełna albo zablokowana. Pobierz kopię zapasową w „Postępie”.',
  sync: 'Synchronizacja z innymi urządzeniami nie działa — ostatnie zmiany zostały tylko tutaj. Pobierz kopię zapasową w „Postępie”.',
}

// Pasek z ostrzeżeniem, gdy zapis albo synchronizacja zawiodły (wcześniej działo się to po cichu).
export function ProblemBar() {
  const [problem, dismiss] = useProblem()
  if (!problem || !TEXT[problem]) return null
  return (
    <div className="glass problem-bar" role="alert">
      <p>{TEXT[problem]}</p>
      <button type="button" className="icon-btn" aria-label="Zamknij ostrzeżenie" onClick={dismiss}>
        <CloseIcon />
      </button>
    </div>
  )
}

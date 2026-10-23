// Przełącznik działu nauki: Studia / Kursy (jak przełącznik motywu, tylko z napisami).
export function ScopeSwitch({ sections, value, onChange }) {
  if (sections.length < 2) return null
  return (
    <div className="scope-switch" role="group" aria-label="Dział nauki">
      {sections.map((s) => (
        <button key={s.path} type="button" aria-pressed={value === s.path} onClick={() => onChange(s.path)}>
          {s.title}
        </button>
      ))}
    </div>
  )
}

import { useEffect, useRef } from 'react'
import { Topbar } from '../components/Topbar.jsx'

// Atlas mózgu to osobna, samodzielna strona (three.js) w `public/atlas/`.
// Ramka dostaje motyw z aplikacji (adres + wiadomość przy przełączeniu Dzień/Noc).
const currentTheme = () => (document.documentElement.getAttribute('data-theme') === 'day' ? 'day' : 'night')

export function AtlasView() {
  const frame = useRef(null)

  useEffect(() => {
    const send = () => frame.current?.contentWindow?.postMessage({ type: 'psycho-theme', theme: currentTheme() }, window.location.origin)
    const observer = new MutationObserver(send)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <Topbar backTo="" />
      <header className="page-head">
        <p className="eyebrow">Nauka</p>
        <h1 className="title-xl">Atlas mózgu</h1>
        <p className="muted page-sub">Model 3D i schematy 2D: obszary, sieci, szlaki neuroprzekaźników, przekroje i leki.</p>
      </header>
      <iframe
        ref={frame}
        className="atlas-frame"
        title="Atlas mózgu"
        src={`${import.meta.env.BASE_URL}atlas/index.html?theme=${currentTheme()}`}
        onLoad={() => frame.current?.contentWindow?.postMessage({ type: 'psycho-theme', theme: currentTheme() }, window.location.origin)}
      />
    </>
  )
}

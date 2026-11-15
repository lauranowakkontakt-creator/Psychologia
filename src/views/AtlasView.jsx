import { useEffect, useRef, useState } from 'react'
import { Topbar } from '../components/Topbar.jsx'

// Atlas mózgu to osobna, samodzielna strona (three.js) w `public/atlas/`.
// Ramka dostaje motyw z aplikacji (adres + wiadomość przy przełączeniu Dzień/Noc).
// Na telefonie atlas podaje swoją wysokość (`psycho-atlas-height`), a ramka rośnie razem z nim –
// przewija się jedna strona, bez przewijania w ramce. Na szerokim ekranie zostaje stała wysokość z CSS.
const currentTheme = () => (document.documentElement.getAttribute('data-theme') === 'day' ? 'day' : 'night')

export function AtlasView() {
  const frame = useRef(null)
  const [height, setHeight] = useState(null)

  useEffect(() => {
    const send = () => frame.current?.contentWindow?.postMessage({ type: 'psycho-theme', theme: currentTheme() }, window.location.origin)
    const observer = new MutationObserver(send)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    const onMessage = (e) => {
      if (e.origin !== window.location.origin || e.source !== frame.current?.contentWindow) return
      const d = e.data
      if (d?.type !== 'psycho-atlas-height') return
      setHeight(typeof d.h === 'number' && d.h > 0 ? Math.min(d.h, 40000) : null)
    }
    window.addEventListener('message', onMessage)
    return () => {
      observer.disconnect()
      window.removeEventListener('message', onMessage)
    }
  }, [])

  return (
    <>
      <Topbar backTo="" />
      <header className="page-head">
        <p className="eyebrow">Nauka</p>
        <h1 className="title-xl">Atlas mózgu</h1>
        <p className="muted page-sub">Dotknij obszaru, żeby zobaczyć, za co odpowiada. Pod modelem: zaburzenia, sieci, neuroprzekaźniki i leki.</p>
      </header>
      <iframe
        ref={frame}
        className={height ? 'atlas-frame atlas-frame--auto' : 'atlas-frame'}
        style={height ? { height } : undefined}
        title="Atlas mózgu"
        src={`${import.meta.env.BASE_URL}atlas/index.html?theme=${currentTheme()}`}
        onLoad={() => frame.current?.contentWindow?.postMessage({ type: 'psycho-theme', theme: currentTheme() }, window.location.origin)}
      />
    </>
  )
}

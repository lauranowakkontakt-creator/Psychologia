import { useEffect, useState } from 'react'
import { readStored, writeStored } from '../store.js'
import { resolveTheme, THEME_KEY } from '../lib/prefs.js'
import { MoonIcon, SunIcon } from './Icon.jsx'

// Atrybut data-theme ustawia już skrypt w <head> (index.html), zanim
// cokolwiek się narysuje — tu tylko go zmieniamy i zapamiętujemy wybór.
const lightQuery = () => window.matchMedia('(prefers-color-scheme: light)')

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme
  const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta && bg) meta.setAttribute('content', bg)
}

export function ThemeToggle() {
  const [theme, setTheme] = useState(() => resolveTheme(readStored(THEME_KEY, null), lightQuery().matches))

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  // Dopóki nikt nie wybrał ręcznie, motyw idzie za systemem (np. auto-ciemny wieczorem).
  useEffect(() => {
    const mq = lightQuery()
    const onChange = () => {
      if (!readStored(THEME_KEY, null)) setTheme(resolveTheme(null, mq.matches))
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const choose = (next) => {
    writeStored(THEME_KEY, next)
    setTheme(next)
  }

  return (
    <div className="theme-toggle" role="group" aria-label="Motyw">
      <button type="button" aria-label="Tryb dzienny" aria-pressed={theme === 'day'} onClick={() => choose('day')}>
        <SunIcon />
      </button>
      <button type="button" aria-label="Tryb nocny" aria-pressed={theme === 'night'} onClick={() => choose('night')}>
        <MoonIcon />
      </button>
    </div>
  )
}

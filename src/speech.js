import { useCallback, useEffect, useRef, useState } from 'react'
import { SPEECH_RATES, speechChunks } from './lib/speech.js'

// Czytanie na głos przez syntezator mowy przeglądarki (bez internetu i bez kosztów).
//
// Pauza to w praktyce „zatrzymaj i zapamiętaj miejsce” — speechSynthesis.pause()
// na Androidzie bywa ignorowane, a na iPhonie gubi kolejkę. Wznowienie czyta od
// przerwanego zdania. Każde uruchomienie dostaje numer, żeby `onend` starej
// wypowiedzi (po cancel) nie przeskakiwał do kolejnego kawałka.

export const speechSupported = () => typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window

function polishVoice() {
  const voices = window.speechSynthesis.getVoices()
  return voices.find((v) => v.lang === 'pl-PL' && v.localService) || voices.find((v) => v.lang?.startsWith('pl')) || null
}

export function useSpeech(getText) {
  const [state, setState] = useState('idle') // idle | playing | paused
  const [rateIndex, setRateIndex] = useState(0)
  const chunks = useRef([])
  const index = useRef(0)
  const run = useRef(0)
  const rate = useRef(SPEECH_RATES[0])

  const speakFrom = useCallback((i) => {
    const synth = window.speechSynthesis
    const token = ++run.current
    synth.cancel()
    const next = (n) => {
      if (token !== run.current) return
      if (n >= chunks.current.length) {
        index.current = 0
        setState('idle')
        return
      }
      index.current = n
      const u = new SpeechSynthesisUtterance(chunks.current[n])
      u.lang = 'pl-PL'
      const voice = polishVoice()
      if (voice) u.voice = voice
      u.rate = rate.current
      u.onend = () => next(n + 1)
      u.onerror = (e) => {
        if (e.error !== 'interrupted' && e.error !== 'canceled') next(n + 1)
      }
      synth.speak(u)
    }
    setState('playing')
    next(i)
  }, [])

  const play = useCallback(() => {
    if (state === 'paused') return speakFrom(index.current)
    chunks.current = speechChunks(getText())
    speakFrom(0)
  }, [state, speakFrom, getText])

  const pause = useCallback(() => {
    run.current++
    window.speechSynthesis.cancel()
    setState('paused')
  }, [])

  const stop = useCallback(() => {
    run.current++
    window.speechSynthesis.cancel()
    index.current = 0
    setState('idle')
  }, [])

  const cycleRate = useCallback(() => {
    const i = (rateIndex + 1) % SPEECH_RATES.length
    setRateIndex(i)
    rate.current = SPEECH_RATES[i]
    if (state === 'playing') speakFrom(index.current)
  }, [rateIndex, state, speakFrom])

  // Wyjście z notatki kończy czytanie.
  useEffect(() => () => {
    run.current++
    if (speechSupported()) window.speechSynthesis.cancel()
  }, [])

  return { state, play, pause, stop, rate: SPEECH_RATES[rateIndex], cycleRate }
}

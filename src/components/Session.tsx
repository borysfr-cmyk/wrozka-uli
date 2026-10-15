import { useEffect, useRef, useState } from 'react'
import type { Reading } from '../engine/types'
import { cardOf } from '../engine/reading'
import { SPREADS } from '../data/spreads'
import { speak, stopSpeaking } from '../engine/speech'
import Aylena from './Aylena'
import SpreadLayout from './SpreadLayout'

// Tempo seansu: przy głosie czekamy na koniec czytania, bez głosu liczymy czas lektury.
function readingTime(text: string) {
  const words = text.split(/\s+/).length
  return Math.min(13000, Math.max(6500, words * 260))
}

export default function Session({ reading, voice, onFinish }: { reading: Reading; voice: boolean; onFinish: () => void }) {
  const cards = reading.cards.map((k) => cardOf(k.cardId))
  const positions = SPREADS[reading.spread].positions
  const [revealed, setRevealed] = useState<boolean[]>(() => cards.map(() => false))
  const [active, setActive] = useState(-1)
  const [bubble, setBubble] = useState(reading.greeting)
  const [speaking, setSpeaking] = useState(false)
  const [paused, setPaused] = useState(false)

  const skipRef = useRef<() => void>(() => {})
  const pausedRef = useRef(false)
  const voiceRef = useRef(voice)
  voiceRef.current = voice
  pausedRef.current = paused

  useEffect(() => {
    let cancelled = false

    // czeka na przeczytanie / czas lektury; „Dalej” przerywa oczekiwanie
    const say = (text: string, minMs = 0) =>
      new Promise<void>((resolve) => {
        let finished = false
        const done = () => {
          if (finished) return
          finished = true
          setSpeaking(false)
          resolve()
        }
        skipRef.current = () => {
          stopSpeaking()
          done()
        }
        setSpeaking(true)
        const start = Date.now()
        const waitPause = () => {
          if (finished) return
          if (pausedRef.current) return void setTimeout(waitPause, 250)
          done()
        }
        if (voiceRef.current) {
          speak(text).then(() => setTimeout(waitPause, Math.max(600, minMs - (Date.now() - start))))
        } else {
          setTimeout(waitPause, Math.max(readingTime(text), minMs))
        }
      })

    ;(async () => {
      await say(reading.greeting, 4000)
      for (let i = 0; i < cards.length; i++) {
        if (cancelled) return
        setActive(i)
        setRevealed((r) => r.map((v, j) => (j === i ? true : v)))
        setBubble(reading.cards[i].text)
        await new Promise((r) => setTimeout(r, 900)) // animacja odwracania
        if (cancelled) return
        await say(reading.cards[i].text)
      }
      if (cancelled) return
      setActive(-1)
      setBubble('Wszystkie karty przemówiły. Zobaczmy, co razem mówią.')
      await say('Wszystkie karty przemówiły. Zobaczmy, co razem mówią.', 2500)
      if (!cancelled) onFinish()
    })()

    return () => {
      cancelled = true
      stopSpeaking()
    }
    // seans uruchamiamy raz dla danej wróżby
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reading.id])

  const current = active >= 0 ? cards[active] : null

  return (
    <section className="session">
      <div className="session-board">
        <SpreadLayout spread={reading.spread} cards={cards} revealed={revealed} active={active} />
      </div>

      <aside className="session-side">
        <div className="session-reader">
          <Aylena size={120} speaking={speaking} />
          {current && (
            <div className="session-card-head">
              <span className="pos">{active + 1}. {positions[active].name}</span>
              <strong>{current.name}</strong>
            </div>
          )}
        </div>
        <p className="bubble bubble-long" aria-live="polite">{bubble}</p>
        <div className="session-controls">
          <button className="btn" onClick={() => setPaused((p) => !p)}>{paused ? 'Wznów' : 'Pauza'}</button>
          <button className="btn" onClick={() => skipRef.current()}>Dalej</button>
          <button
            className="btn btn-ghost"
            onClick={() => {
              stopSpeaking()
              onFinish()
            }}
          >
            Pokaż podsumowanie
          </button>
        </div>
        <div className="progress" aria-hidden="true">
          <span style={{ width: `${((revealed.filter(Boolean).length) / cards.length) * 100}%` }} />
        </div>
      </aside>
    </section>
  )
}

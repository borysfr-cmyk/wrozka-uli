import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { Reading } from '../engine/types'
import { cardOf } from '../engine/reading'
import { SPREADS } from '../data/spreads'
import { speak, stopSpeaking } from '../engine/speech'
import SpreadLayout from './SpreadLayout'
import { useScene } from './Scene'

// Tempo seansu: przy głosie czekamy na koniec czytania, bez głosu liczymy czas lektury.
function readingTime(text: string) {
  const words = text.split(/\s+/).length
  return Math.min(13000, Math.max(6500, words * 260))
}

const TILT_COS = Math.cos((56 * Math.PI) / 180) // karty leżą na stole pochylonym o 56° (zob. .table-cards w CSS)
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export default function Session({ reading, voice, onFinish }: { reading: Reading; voice: boolean; onFinish: () => void }) {
  const scene = useScene()
  const cards = reading.cards.map((k) => cardOf(k.cardId))
  const positions = SPREADS[reading.spread].positions
  const [dealt, setDealt] = useState<boolean[]>(() => cards.map(() => false))
  const [revealed, setRevealed] = useState<boolean[]>(() => cards.map(() => false))
  const [active, setActive] = useState(-1)
  const [text, setText] = useState('')
  const [paused, setPaused] = useState(false)

  const skipRef = useRef<() => void>(() => {})
  const pausedRef = useRef(false)
  const voiceRef = useRef(voice)
  voiceRef.current = voice
  pausedRef.current = paused

  useEffect(() => {
    let cancelled = false

    // czeka na przeczytanie / czas lektury; „Dalej” przerywa oczekiwanie
    const say = (t: string, minMs = 0) =>
      new Promise<void>((resolve) => {
        let finished = false
        const done = () => {
          if (finished) return
          finished = true
          scene.setSpeaking(false)
          resolve()
        }
        skipRef.current = () => {
          stopSpeaking()
          done()
        }
        scene.setSpeaking(true)
        const start = Date.now()
        const waitPause = () => {
          if (finished) return
          if (pausedRef.current) return void setTimeout(waitPause, 250)
          done()
        }
        if (voiceRef.current) {
          speak(t).then(() => setTimeout(waitPause, Math.max(600, minMs - (Date.now() - start))))
        } else {
          setTimeout(waitPause, Math.max(readingTime(t), minMs))
        }
      })

    // karta wylatuje z dłoni Ayleny na swoje miejsce na stole
    const deal = async (i: number) => {
      const slot = document.querySelector<HTMLElement>(`[data-slot="${i}"]`)
      if (slot) {
        const hand = scene.handPoint()
        const r = slot.getBoundingClientRect()
        slot.style.setProperty('--fx', `${hand.x - (r.left + r.width / 2)}px`)
        slot.style.setProperty('--fy', `${(hand.y - (r.top + r.height / 2)) / TILT_COS}px`)
      }
      scene.setDealing(true)
      setDealt((d) => d.map((v, j) => (j === i ? true : v)))
      await sleep(260)
      scene.setDealing(false)
      await sleep(140)
    }

    ;(async () => {
      scene.say(reading.greeting)
      await say(reading.greeting, 3500)
      if (cancelled) return
      scene.say('Rozkładam karty…')
      for (let i = 0; i < cards.length; i++) {
        if (cancelled) return
        await deal(i)
      }
      await sleep(500)
      scene.say(null)
      for (let i = 0; i < cards.length; i++) {
        if (cancelled) return
        setActive(i)
        setRevealed((r) => r.map((v, j) => (j === i ? true : v)))
        setText(reading.cards[i].text)
        await sleep(900) // animacja odwracania
        if (cancelled) return
        await say(reading.cards[i].text)
      }
      if (cancelled) return
      setActive(-1)
      const end = 'Wszystkie karty przemówiły. Zobaczmy, co razem mówią.'
      scene.say(end)
      setText('')
      await say(end, 2500)
      if (!cancelled) onFinish()
    })()

    return () => {
      cancelled = true
      stopSpeaking()
      scene.setSpeaking(false)
      scene.setDealing(false)
      scene.say(null)
    }
    // seans uruchamiamy raz dla danej wróżby
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reading.id])

  const current = active >= 0 ? cards[active] : null

  return (
    <section className="session">
      {(() => {
        const layout = (
          <div className={`table-cards table-${reading.spread}`}>
            <SpreadLayout spread={reading.spread} cards={cards} revealed={revealed} dealt={dealt} active={active} />
          </div>
        )
        return scene.tableSlot ? createPortal(layout, scene.tableSlot) : layout
      })()}

      <aside className={`session-panel ${current ? 'has-card' : ''}`}>
        {current && (
          <div className="session-card-head">
            <img src={current.image} alt="" />
            <div>
              <span className="pos">{active + 1}. {positions[active].name}</span>
              <strong>{current.name}</strong>
            </div>
          </div>
        )}
        {text && <p className="session-text" aria-live="polite">{text}</p>}
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
            Podsumowanie
          </button>
        </div>
        <div className="progress" aria-hidden="true">
          <span style={{ width: `${(revealed.filter(Boolean).length / cards.length) * 100}%` }} />
        </div>
      </aside>
    </section>
  )
}

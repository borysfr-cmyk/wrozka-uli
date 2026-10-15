// Scena na całą stronę: zdjęcie komnaty z Ayleną, ożywione animacjami
// (oddech kadru, paralaksa za kursorem, migocząca świeca, blask dłoni przy rozdawaniu).
// Pozostałe ekrany sterują nią przez kontekst, a karty kładą na stole przez portal.

import { createContext, useContext, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { SCENE } from '../data/aylena'
import { pick } from '../engine/random'
import { speak } from '../engine/speech'

export type SceneFocus = 'welcome' | 'table' | 'away'

interface SceneApi {
  setSpeaking: (v: boolean) => void
  setDealing: (v: boolean) => void
  say: (text: string | null) => void
  /** dłoń z talią we współrzędnych okna */
  handPoint: () => { x: number; y: number }
  /** miejsce na stole, do którego ekrany wstawiają karty */
  tableSlot: HTMLElement | null
}

const Ctx = createContext<SceneApi | null>(null)
export const useScene = () => useContext(Ctx)!

const POKES = [
  'Karty lubią cierpliwość, a ja lubię Twoją ciekawość.',
  'Spokojnie. Talia sama wie, kiedy przemówić.',
  'Ten kryształ na stole pamięta wiele pytań.',
  'Prawdziwe odpowiedzi czekają w kartach, nie w moich oczach.',
  'Świeca płonie równo. To dobry znak.',
  'Słyszysz ten szept? To talia czeka na Twoje pytanie.',
  'Każda karta ma swój czas. Twoja też.',
]

const pct = (v: number) => `${v * 100}%`

export default function Scene({ focus, voice, children }: { focus: SceneFocus; voice: boolean; children: ReactNode }) {
  const [speaking, setSpeaking] = useState(false)
  const [dealing, setDealing] = useState(false)
  const [bubble, setBubble] = useState<string | null>(null)
  const [tableSlot, setTableSlot] = useState<HTMLElement | null>(null)
  const photoRef = useRef<HTMLDivElement>(null)
  const voiceRef = useRef(voice)
  voiceRef.current = voice

  // paralaksa: kadr delikatnie podąża za kursorem lub dotykiem
  useEffect(() => {
    let raf = 0
    const root = document.documentElement
    const move = (e: PointerEvent) => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        root.style.setProperty('--mx', ((e.clientX / innerWidth) * 2 - 1).toFixed(3))
        root.style.setProperty('--my', ((e.clientY / innerHeight) * 2 - 1).toFixed(3))
      })
    }
    addEventListener('pointermove', move)
    return () => removeEventListener('pointermove', move)
  }, [])

  const api = useMemo<SceneApi>(
    () => ({
      setSpeaking,
      setDealing,
      say: setBubble,
      tableSlot,
      handPoint: () => {
        const r = photoRef.current?.getBoundingClientRect()
        if (!r) return { x: innerWidth / 2, y: innerHeight / 2 }
        return { x: r.left + SCENE.hand.x * r.width, y: r.top + SCENE.hand.y * r.height }
      },
    }),
    [tableSlot],
  )

  const poke = () => {
    const line = pick(POKES)
    setBubble(line)
    setSpeaking(true)
    const end = () => {
      setSpeaking(false)
      setTimeout(() => setBubble((b) => (b === line ? null : b)), 1500)
    }
    if (voiceRef.current) speak(line).then(end)
    else setTimeout(end, 3000)
  }

  const f = SCENE.figure
  return (
    <Ctx.Provider value={api}>
      <div
        className={`scene focus-${focus} ${speaking ? 'is-speaking' : ''} ${dealing ? 'is-dealing' : ''}`}
        style={{ ['--aspect' as string]: SCENE.aspect, ['--focus-x' as string]: SCENE.focusX } as CSSProperties}
      >
        <div className="photo" ref={photoRef}>
          <picture>
            <source media="(max-width: 760px)" srcSet={SCENE.srcSmall} />
            <img className="photo-img" src={SCENE.src} alt="Aylena przy stole z kartami tarota" draggable={false} />
          </picture>
          <span className="photo-candle" style={{ left: pct(SCENE.candle.x), top: pct(SCENE.candle.y) }} />
          <span className="photo-hand-glow" style={{ left: pct(SCENE.hand.x), top: pct(SCENE.hand.y) }} />
          <span className="photo-vignette" />
          <div className="photo-dust" aria-hidden="true">
            {Array.from({ length: 16 }, (_, i) => (
              <span key={i} style={{ left: `${(i * 61) % 100}%`, animationDelay: `${i * 0.8}s`, animationDuration: `${10 + (i % 5) * 2}s` }} />
            ))}
          </div>
          <button
            type="button"
            className="photo-hit"
            style={{ left: pct(f.x), top: pct(f.y), width: pct(f.w), height: pct(f.h) }}
            onClick={poke}
            aria-label="Porozmawiaj z Ayleną"
          />
          <div className="table-slot" ref={setTableSlot} style={{ left: pct(SCENE.table.x), top: pct(SCENE.table.y) }} />
        </div>
        {bubble && (
          <p className="scene-bubble" aria-live="polite">
            <span className="scene-bubble-name">Aylena</span>
            {bubble}
          </p>
        )}
      </div>
      <div className={`stage focus-${focus}`}>{children}</div>
    </Ctx.Provider>
  )
}

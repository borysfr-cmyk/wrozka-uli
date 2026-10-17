import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { speak } from '../engine/speech'
import { useScene } from './Scene'
import { sfxShuffle } from '../engine/audio'

const LINES = [
  'Tasuję wszystkie siedemdziesiąt osiem kart…',
  'Pomyśl teraz o swoim pytaniu.',
  'Gdy poczujesz, że to ta chwila, przełóż talię.',
]

export default function Shuffle({ ready, voice, onDone }: { ready: boolean; voice: boolean; onDone: () => void }) {
  const scene = useScene()
  const [line, setLine] = useState(0)
  const [cut, setCut] = useState(false)

  useEffect(() => {
    scene.setSpeaking(true)
    if (voice) speak(LINES.join(' ')).then(() => scene.setSpeaking(false))
    else setTimeout(() => scene.setSpeaking(false), 6000)
    const t = setInterval(() => setLine((l) => Math.min(l + 1, LINES.length - 1)), 2600)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voice])

  useEffect(() => {
    scene.say(cut && !ready ? 'Wczytuję się w karty, które wybrał los…' : LINES[line])
  }, [cut, ready, line, scene])

  // szelest kart w rytm animacji tasowania
  useEffect(() => {
    if (cut) return
    sfxShuffle()
    const t = setInterval(sfxShuffle, 1600)
    return () => clearInterval(t)
  }, [cut])

  useEffect(() => {
    if (cut && ready) {
      const t = setTimeout(onDone, 900)
      return () => clearTimeout(t)
    }
  }, [cut, ready, onDone])

  return (
    <section className="shuffle">
      {(() => {
        const deck = (
          <div className={`deck ${cut ? 'is-cut' : ''}`} aria-hidden="true">
            {Array.from({ length: 7 }, (_, i) => (
              <span key={i} className="deck-card" style={{ ['--i' as string]: i }} />
            ))}
          </div>
        )
        return scene.tableSlot ? createPortal(deck, scene.tableSlot) : deck
      })()}
      <button className="btn btn-primary btn-big" disabled={cut || line < LINES.length - 1} onClick={() => setCut(true)}>
        {cut ? 'Talia przełożona' : 'Przełóż talię'}
      </button>
    </section>
  )
}

import { useEffect, useState } from 'react'
import Aylena from './Aylena'
import { speak } from '../engine/speech'

const LINES = [
  'Tasuję wszystkie siedemdziesiąt osiem kart…',
  'Pomyśl teraz o swoim pytaniu.',
  'Gdy poczujesz, że to ta chwila, przełóż talię.',
]

export default function Shuffle({ ready, voice, onDone }: { ready: boolean; voice: boolean; onDone: () => void }) {
  const [line, setLine] = useState(0)
  const [cut, setCut] = useState(false)

  useEffect(() => {
    if (voice) speak(LINES.join(' '))
    const t = setInterval(() => setLine((l) => Math.min(l + 1, LINES.length - 1)), 2600)
    return () => clearInterval(t)
  }, [voice])

  useEffect(() => {
    if (cut && ready) {
      const t = setTimeout(onDone, 900)
      return () => clearTimeout(t)
    }
  }, [cut, ready, onDone])

  return (
    <section className="shuffle">
      <Aylena size={180} speaking />
      <p className="bubble">{cut && !ready ? 'Wczytuję się w karty, które wybrał los…' : LINES[line]}</p>
      <div className={`deck ${cut ? 'is-cut' : ''}`} aria-hidden="true">
        {Array.from({ length: 7 }, (_, i) => (
          <span key={i} className="deck-card" style={{ ['--i' as string]: i }} />
        ))}
      </div>
      <button className="btn btn-primary btn-big" disabled={cut || line < LINES.length - 1} onClick={() => setCut(true)}>
        {cut ? 'Talia przełożona' : 'Przełóż talię'}
      </button>
    </section>
  )
}

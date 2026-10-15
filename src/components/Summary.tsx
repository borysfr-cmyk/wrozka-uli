import { useEffect, useRef, useState } from 'react'
import type { Reading } from '../engine/types'
import { cardOf } from '../engine/reading'
import { SPHERES, SPREADS } from '../data/spreads'
import { copyLink, downloadImage, downloadPdf, shareReading } from '../engine/share'
import { speak, stopSpeaking } from '../engine/speech'

export default function Summary({
  reading,
  voice,
  shared = false,
  onNew,
  onHistory,
}: {
  reading: Reading
  voice: boolean
  shared?: boolean
  onNew: () => void
  onHistory?: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const positions = SPREADS[reading.spread].positions
  const date = new Date(reading.createdAt).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })

  useEffect(() => {
    if (voice && !shared) speak(`${reading.summary} ${reading.advice} ${reading.message}`)
    return () => stopSpeaking()
  }, [reading.id, voice, shared, reading.summary, reading.advice, reading.message])

  async function run(label: string, fn: () => Promise<unknown>, done?: string) {
    if (!ref.current) return
    setBusy(label)
    setNote('')
    try {
      const r = await fn()
      if (r === 'copied') setNote('Link skopiowany do schowka.')
      else if (done) setNote(done)
    } catch (e) {
      setNote('Coś poszło nie tak. Spróbuj ponownie.')
      console.error(e)
    } finally {
      setBusy(null)
    }
  }

  return (
    <section className="summary">
      <div className="summary-sheet" ref={ref}>
        <header className="sheet-head">
          <div className="sheet-brand">✦ Tajemnice Magii ✦</div>
          <h2>Wróżba Ayleny</h2>
          <p className="sheet-meta">
            {SPREADS[reading.spread].name} · {SPHERES[reading.sphere].name} · {date}
            {reading.name ? ` · dla: ${reading.name}` : ''}
          </p>
          {reading.question && <p className="sheet-question">„{reading.question}”</p>}
        </header>

        <div className="sheet-block sheet-summary">
          <h3>Podsumowanie</h3>
          <p>{reading.summary}</p>
          <div className="sheet-advice">
            <h4>Rada</h4>
            <p>{reading.advice}</p>
          </div>
          <p className="sheet-message">{reading.message}</p>
          <p className="sheet-talisman">Talizman na ten czas: <strong>{reading.talisman}</strong></p>
        </div>

        <ol className="sheet-cards">
          {reading.cards.map((rc, i) => {
            const k = cardOf(rc.cardId)
            return (
              <li key={rc.cardId}>
                <img src={k.image} alt="" />
                <div>
                  <span className="pos">{i + 1}. {positions[i].name}</span>
                  <strong>{k.name}</strong>
                  <p>{rc.text}</p>
                </div>
              </li>
            )
          })}
        </ol>

        <footer className="sheet-foot">Wróżba ma charakter rozrywkowy i nie zastępuje porady specjalisty.</footer>
      </div>

      <div className="summary-actions">
        <button className="btn btn-primary" disabled={!!busy} onClick={() => run('pdf', () => downloadPdf(ref.current!, reading))}>
          {busy === 'pdf' ? 'Przygotowuję PDF…' : 'Pobierz PDF'}
        </button>
        <button className="btn" disabled={!!busy} onClick={() => run('img', () => downloadImage(ref.current!, reading))}>
          {busy === 'img' ? 'Przygotowuję obraz…' : 'Pobierz obraz'}
        </button>
        <button className="btn" disabled={!!busy} onClick={() => run('share', () => shareReading(ref.current!, reading))}>
          {busy === 'share' ? 'Otwieram…' : 'Udostępnij'}
        </button>
        <button className="btn" disabled={!!busy} onClick={() => run('link', () => copyLink(reading), 'Link skopiowany do schowka.')}>
          Kopiuj link
        </button>
      </div>
      {note && <p className="note" role="status">{note}</p>}

      <div className="summary-actions summary-actions-secondary">
        <button className="btn btn-ghost" onClick={onNew}>{shared ? 'Poproś Aylenę o własną wróżbę' : 'Wróć do stołu'}</button>
        {onHistory && <button className="btn btn-ghost" onClick={onHistory}>Księga wróżb</button>}
      </div>
    </section>
  )
}

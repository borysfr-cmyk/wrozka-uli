import { useEffect, useRef } from 'react'
import { SUIT_ELEMENT, SUIT_NAMES, type Card } from '../data/cards'
import { SPHERES, type Sphere } from '../data/spreads'

const TONE = { '1': 'karta jasna', '0': 'karta neutralna', '-1': 'karta wymagająca' } as const

/** Okno z pełnym opisem karty: z Księgi kart, z seansu i z podsumowania */
export default function CardModal({
  card,
  context,
  sphere,
  onClose,
  onPrev,
  onNext,
}: {
  card: Card
  /** pozycja i tekst z wróżby, gdy karta jest otwierana z rozkładu */
  context?: { position: string; text: string }
  /** sfera wróżby: jej znaczenie idzie na górę */
  sphere?: Sphere
  onClose: () => void
  onPrev?: () => void
  onNext?: () => void
}) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeRef.current?.focus()
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowLeft' && onPrev) onPrev()
      else if (e.key === 'ArrowRight' && onNext) onNext()
    }
    addEventListener('keydown', key)
    return () => removeEventListener('keydown', key)
  }, [onClose, onPrev, onNext])

  const spheres = (Object.keys(SPHERES) as Sphere[]).sort((a, b) => (a === sphere ? -1 : b === sphere ? 1 : 0))

  return (
    <div className="modal card-modal" role="dialog" aria-modal="true" aria-label={card.name} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="panel card-modal-box" key={card.id}>
        <button ref={closeRef} className="icon-btn modal-close" onClick={onClose} aria-label="Zamknij">✕</button>
        <figure className="card-modal-img">
          <img src={card.image} alt={card.name} />
        </figure>
        <div className="card-modal-body">
          <p className="card-modal-suit">
            {SUIT_NAMES[card.suit]} · {SUIT_ELEMENT[card.suit]} · {TONE[String(card.tone) as '1' | '0' | '-1']}
          </p>
          <h2>{card.name}</h2>
          <ul className="chips">
            {card.keywords.map((k) => (
              <li key={k}>{k}</li>
            ))}
          </ul>

          {context && (
            <div className="card-modal-context">
              <h3>{context.position}</h3>
              <p>{context.text}</p>
            </div>
          )}

          {spheres.map((s) => (
            <section key={s} className="card-modal-sphere">
              <h3><span aria-hidden="true">{SPHERES[s].icon}</span> {SPHERES[s].name}</h3>
              <p>{card[s].join(' ')}</p>
            </section>
          ))}
          <p className="card-modal-advice"><strong>Rada karty:</strong> {card.advice}</p>

          {(onPrev || onNext) && (
            <div className="row card-modal-nav">
              <button className="btn btn-ghost" onClick={onPrev} disabled={!onPrev}>← Poprzednia</button>
              <button className="btn btn-ghost" onClick={onNext} disabled={!onNext}>Następna →</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

import type { Reading } from '../engine/types'
import { cardOf } from '../engine/reading'
import { SPHERES, SPREADS } from '../data/spreads'

export default function History({ items, onOpen, onBack }: { items: Reading[]; onOpen: (r: Reading) => void; onBack: () => void }) {
  return (
    <section className="history">
      <h2>Księga wróżb</h2>
      <p className="small">Twoje wróżby zapisane w tej przeglądarce.</p>
      {items.length === 0 ? (
        <p className="panel">Księga jest jeszcze pusta.</p>
      ) : (
        <ul className="history-list">
          {items.map((r) => (
            <li key={r.id}>
              <button className="panel history-item" onClick={() => onOpen(r)}>
                <img src={cardOf(r.cards[r.cards.length - 1].cardId).image} alt="" />
                <span>
                  <strong>{SPREADS[r.spread].name} · {SPHERES[r.sphere].short}</strong>
                  <span className="small">{new Date(r.createdAt).toLocaleString('pl-PL', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                  {r.question && <em>„{r.question}”</em>}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <button className="btn btn-ghost" onClick={onBack}>Wróć do stołu</button>
    </section>
  )
}

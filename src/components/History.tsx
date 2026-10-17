import { useMemo, useState } from 'react'
import type { Reading } from '../engine/types'
import { cardOf } from '../engine/reading'
import { SPHERES, SPREADS } from '../data/spreads'
import { clearHistory, getHistory, removeFromHistory } from '../engine/storage'
import CardModal from './CardModal'

/** Księga wróżb: historia z tej przeglądarki i karty, które przychodzą najczęściej */
export default function History({ onOpen, onBack }: { onOpen: (r: Reading) => void; onBack: () => void }) {
  const [items, setItems] = useState(getHistory)
  const [zoom, setZoom] = useState<string | null>(null)
  const [confirm, setConfirm] = useState(false)

  const stats = useMemo(() => {
    const counts = new Map<string, number>()
    let majors = 0
    let total = 0
    items.forEach((r) =>
      r.cards.forEach((k) => {
        counts.set(k.cardId, (counts.get(k.cardId) ?? 0) + 1)
        total++
        if (cardOf(k.cardId)?.suit === 'major') majors++
      }),
    )
    const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3)
    return { top, total, majors }
  }, [items])

  return (
    <section className="history">
      <div className="panel history-head">
        <h2>Księga wróżb</h2>
        <p className="small">Twoje wróżby zapisane w tej przeglądarce. Nikt poza Tobą ich nie widzi.</p>
        {items.length > 0 && (
          <div className="stats">
            <div className="stat">
              <strong>{items.length}</strong>
              <span>{items.length === 1 ? 'wróżba' : items.length % 10 >= 2 && items.length % 10 <= 4 && (items.length < 12 || items.length > 14) ? 'wróżby' : 'wróżb'}</span>
            </div>
            <div className="stat">
              <strong>{stats.total}</strong>
              <span>odkrytych kart</span>
            </div>
            <div className="stat">
              <strong>{stats.total ? Math.round((stats.majors / stats.total) * 100) : 0}%</strong>
              <span>Arkanów Wielkich</span>
            </div>
          </div>
        )}
        {stats.top.length > 0 && stats.top[0][1] > 1 && (
          <div className="guide-cards">
            <h3>Karty, które do Ciebie wracają</h3>
            <ul>
              {stats.top.filter(([, n]) => n > 1).map(([id, n]) => (
                <li key={id}>
                  <button className="guide-card" onClick={() => setZoom(id)}>
                    <img src={cardOf(id).image} alt="" />
                    <span>{cardOf(id).name}<em>{n}×</em></span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <p className="panel">Księga jest jeszcze pusta. Pierwsza wróżba zapisze się tu sama.</p>
      ) : (
        <ul className="history-list">
          {items.map((r) => (
            <li key={r.id} className="history-row">
              <button className="panel history-item" onClick={() => onOpen(r)}>
                <img src={cardOf(r.cards[r.cards.length - 1].cardId).image} alt="" />
                <span>
                  <strong>{SPREADS[r.spread]?.name ?? 'Wróżba'} · {SPHERES[r.sphere]?.short}</strong>
                  <span className="small">{new Date(r.createdAt).toLocaleString('pl-PL', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                  {r.question && <em>„{r.question}”</em>}
                </span>
              </button>
              <button
                className="icon-btn history-del"
                title="Usuń z Księgi"
                aria-label="Usuń wróżbę z Księgi"
                onClick={() => {
                  removeFromHistory(r.id)
                  setItems(getHistory())
                }}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="row" style={{ justifyContent: 'center' }}>
        <button className="btn btn-ghost" onClick={onBack}>Wróć do stołu</button>
        {items.length > 0 &&
          (confirm ? (
            <button
              className="btn"
              onClick={() => {
                clearHistory()
                setItems([])
                setConfirm(false)
              }}
            >
              Na pewno wyczyścić?
            </button>
          ) : (
            <button className="btn btn-ghost" onClick={() => setConfirm(true)}>Wyczyść Księgę</button>
          ))}
      </div>

      {zoom && <CardModal card={cardOf(zoom)} onClose={() => setZoom(null)} />}
    </section>
  )
}

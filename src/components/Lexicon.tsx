import { useMemo, useState } from 'react'
import { CARDS, SUIT_NAMES, type Suit } from '../data/cards'
import CardModal from './CardModal'

const FILTERS: (Suit | 'all')[] = ['all', 'major', 'kielichy', 'bulawy', 'miecze', 'denary']

/** Księga kart: wszystkie 78 kart z opisami, z filtrem kolorów i wyszukiwarką */
export default function Lexicon({ onBack }: { onBack: () => void }) {
  const [filter, setFilter] = useState<Suit | 'all'>('all')
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState<number | null>(null)

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    return CARDS.filter((k) => (filter === 'all' || k.suit === filter) && (!q || k.name.toLowerCase().includes(q) || k.keywords.some((w) => w.includes(q))))
  }, [filter, query])

  return (
    <section className="lexicon">
      <div className="lexicon-head panel">
        <h2>Księga kart</h2>
        <p className="small">Wszystkie 78 kart talii Rider–Waite–Smith. Dotknij karty, by poznać jej znaczenie w miłości, finansach i na drodze życia.</p>
        <div className="lexicon-tools">
          <div className="tabs" role="tablist" aria-label="Kolor kart">
            {FILTERS.map((f) => (
              <button key={f} role="tab" aria-selected={filter === f} className={`tab ${filter === f ? 'is-on' : ''}`} onClick={() => setFilter(f)}>
                {f === 'all' ? 'Wszystkie' : SUIT_NAMES[f]}
              </button>
            ))}
          </div>
          <label className="field lexicon-search">
            <span className="sr-only">Szukaj karty</span>
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Szukaj: nazwa lub słowo, np. odwaga" />
          </label>
        </div>
      </div>

      {list.length === 0 ? (
        <p className="panel">Żadna karta nie pasuje do tego słowa.</p>
      ) : (
        <ul className="lexicon-grid">
          {list.map((k, i) => (
            <li key={k.id} style={{ animationDelay: `${Math.min(i, 30) * 18}ms` }}>
              <button className="lexicon-card" onClick={() => setOpen(i)}>
                <img src={k.image} alt="" loading="lazy" />
                <span>{k.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <button className="btn btn-ghost lexicon-back" onClick={onBack}>Wróć do stołu</button>

      {open !== null && list[open] && (
        <CardModal
          card={list[open]}
          onClose={() => setOpen(null)}
          onPrev={open > 0 ? () => setOpen(open - 1) : undefined}
          onNext={open < list.length - 1 ? () => setOpen(open + 1) : undefined}
        />
      )}
    </section>
  )
}

import type { CSSProperties } from 'react'
import type { Card } from '../data/cards'
import { SPREADS, type SpreadId } from '../data/spreads'
import TarotCard from './TarotCard'

export default function SpreadLayout({
  spread,
  cards,
  revealed,
  dealt,
  active,
  onSelect,
}: {
  spread: SpreadId
  cards: Card[]
  revealed: boolean[]
  dealt?: boolean[]
  active: number
  onSelect?: (i: number) => void
}) {
  const def = SPREADS[spread]
  const positions = def.positions
  const state = (i: number) => (!dealt || dealt[i] ? 'is-dealt' : 'is-waiting')

  if (!def.coords) {
    return (
      <div className="layout layout-row">
        {cards.map((k, i) => (
          <div key={k.id} className={`slot ${state(i)}`} data-slot={i}>
            <TarotCard card={k} revealed={revealed[i]} active={active === i} label={positions[i].name} onClick={onSelect && (() => onSelect(i))} />
            <span className="slot-label">{positions[i].name}</span>
          </div>
        ))}
      </div>
    )
  }

  // wymiary układu w jednostkach karty: najdalsza karta plus jej szerokość i wysokość
  const coords = def.coords
  const w = Math.max(...coords.map((c) => c.x)) + 1
  const h = Math.max(...coords.map((c) => c.y)) + 1
  const single = cards.length === 1
  return (
    <div
      className={`layout layout-abs ${single ? 'layout-single' : ''}`}
      style={{ ['--lw' as string]: w, ['--lh' as string]: h } as CSSProperties}
    >
      {cards.map((k, i) => (
        <div
          key={k.id}
          className={`slot-abs ${spread === 'celtic' && i === 1 ? 'slot-cross' : ''} ${state(i)}`}
          data-slot={i}
          style={{ left: `calc(var(--cw) * ${coords[i].x})`, top: `calc(var(--ch) * ${coords[i].y})` }}
        >
          <TarotCard
            card={k}
            revealed={revealed[i]}
            active={active === i}
            crossed={spread === 'celtic' && i === 1}
            label={positions[i].name}
            onClick={onSelect && (() => onSelect(i))}
          />
          {!single && <span className="slot-num">{i + 1}</span>}
        </div>
      ))}
    </div>
  )
}

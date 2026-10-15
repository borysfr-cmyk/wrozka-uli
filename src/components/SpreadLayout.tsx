import type { Card } from '../data/cards'
import { SPREADS, type SpreadId } from '../data/spreads'
import TarotCard from './TarotCard'

// Pozycje Krzyża Celtyckiego w jednostkach szerokości (x) i wysokości (y) karty.
// 1 środek, 2 krzyżuje 1, 3 pod spodem, 4 z lewej, 5 nad, 6 z prawej, 7–10 laska od dołu.
const CELTIC: { x: number; y: number }[] = [
  { x: 1.35, y: 1.3 },
  { x: 1.35, y: 1.3 },
  { x: 1.35, y: 2.45 },
  { x: 0, y: 1.3 },
  { x: 1.35, y: 0.15 },
  { x: 2.7, y: 1.3 },
  { x: 4.2, y: 3.15 },
  { x: 4.2, y: 2.1 },
  { x: 4.2, y: 1.05 },
  { x: 4.2, y: 0 },
]

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
  const positions = SPREADS[spread].positions
  if (spread === 'three') {
    return (
      <div className="layout layout-three">
        {cards.map((k, i) => (
          <div key={k.id} className={`slot ${!dealt || dealt[i] ? 'is-dealt' : 'is-waiting'}`} data-slot={i}>
            <TarotCard card={k} revealed={revealed[i]} active={active === i} label={positions[i].name} onClick={onSelect && (() => onSelect(i))} />
            <span className="slot-label">{positions[i].name}</span>
          </div>
        ))}
      </div>
    )
  }
  return (
    <div className="layout layout-celtic">
      {cards.map((k, i) => (
        <div
          key={k.id}
          className={`slot-abs ${i === 1 ? 'slot-cross' : ''} ${!dealt || dealt[i] ? 'is-dealt' : 'is-waiting'}`}
          data-slot={i}
          style={{ left: `calc(var(--cw) * ${CELTIC[i].x})`, top: `calc(var(--ch) * ${CELTIC[i].y})` }}
        >
          <TarotCard card={k} revealed={revealed[i]} active={active === i} crossed={i === 1} label={positions[i].name} onClick={onSelect && (() => onSelect(i))} />
          <span className="slot-num">{i + 1}</span>
        </div>
      ))}
    </div>
  )
}

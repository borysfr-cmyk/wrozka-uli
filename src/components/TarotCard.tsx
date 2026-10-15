import type { Card } from '../data/cards'

export default function TarotCard({
  card,
  revealed,
  active = false,
  crossed = false,
  onClick,
  label,
}: {
  card?: Card
  revealed: boolean
  active?: boolean
  crossed?: boolean
  onClick?: () => void
  label?: string
}) {
  return (
    <button
      type="button"
      className={`tcard ${revealed ? 'is-revealed' : ''} ${active ? 'is-active' : ''} ${crossed ? 'is-crossed' : ''}`}
      onClick={onClick}
      disabled={!onClick || !revealed}
      aria-label={revealed && card ? `${label ? label + ': ' : ''}${card.name}` : 'Zakryta karta'}
    >
      <span className="tcard-inner">
        <span className="tcard-face tcard-back" aria-hidden="true">
          <span className="tcard-back-ornament">✦</span>
        </span>
        <span className="tcard-face tcard-front">
          {card && <img src={card.image} alt={card.name} draggable={false} />}
        </span>
      </span>
    </button>
  )
}

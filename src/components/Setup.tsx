import { useMemo, useState } from 'react'
import { SPHERES, SPREADS, SPREAD_ORDER, type Sphere, type SpreadId } from '../data/spreads'
import { moonPhase } from '../engine/moon'
import { sfxTap } from '../engine/audio'
import Moon from './Moon'

export interface SetupChoice {
  sphere: Sphere
  spread: SpreadId
  name: string
  question: string
}

const PLACEHOLDERS: Record<Sphere, string> = {
  love: 'np. Czy ta relacja ma przyszłość?',
  money: 'np. Czy to dobry moment na nowy projekt?',
  life: 'np. Czego potrzebuję, by odzyskać spokój?',
}

function untilMidnight(): string {
  const now = new Date()
  const m = new Date(now)
  m.setHours(24, 0, 0, 0)
  const mins = Math.ceil((m.getTime() - now.getTime()) / 60000)
  const h = Math.floor(mins / 60)
  return h > 0 ? `${h} godz. ${mins % 60} min` : `${mins} min`
}

export default function Setup({
  left,
  defaultName,
  onStart,
  onHistory,
  onLexicon,
}: {
  left: number
  defaultName: string
  onStart: (c: SetupChoice) => void
  onHistory: () => void
  onLexicon: () => void
}) {
  const [sphere, setSphere] = useState<Sphere>('love')
  const [spread, setSpread] = useState<SpreadId>('celtic')
  const [name, setName] = useState(defaultName)
  const [question, setQuestion] = useState('')
  const moon = useMemo(() => moonPhase(), [])
  const needsQuestion = !!SPREADS[spread].needsQuestion

  return (
    <section className="setup">
      <div className="setup-intro">
        <p className="eyebrow">✦ Komnata Ayleny ✦</p>
        <h1>Tajemnice Magii</h1>
        <p className="lead">
          Jestem Aylena, strażniczka starej talii. Wybierz, o co chcesz zapytać karty, a poprowadzę Cię przez wróżbę.
        </p>
        <div className="moon-badge" title={`Oświetlenie tarczy: ${Math.round(moon.light * 100)}%`}>
          <Moon age={moon.age} size={34} />
          <span>
            <strong>Dziś: {moon.name}</strong>
            <span className="small">{moon.meaning.charAt(0).toUpperCase() + moon.meaning.slice(1)}</span>
          </span>
        </div>
      </div>

      {left <= 0 ? (
        <div className="panel limit">
          <h2>Karty odpoczywają</h2>
          <p>
            Dzisiejsza wróżba została już odczytana. Talia potrzebuje nocy, by nabrać mocy. Wróć za {untilMidnight()}.
          </p>
          <div className="row" style={{ justifyContent: 'center' }}>
            <button className="btn" onClick={onHistory}>Otwórz Księgę wróżb</button>
            <button className="btn" onClick={onLexicon}>Poznaj karty</button>
          </div>
        </div>
      ) : (
        <form
          className="panel setup-form"
          onSubmit={(e) => {
            e.preventDefault()
            if (needsQuestion && !question.trim()) return
            onStart({ sphere, spread, name: name.trim(), question: question.trim() })
          }}
        >
          <fieldset>
            <legend>O czym mają mówić karty?</legend>
            <div className="choice-row choice-row-3">
              {(Object.keys(SPHERES) as Sphere[]).map((s) => (
                <label key={s} className={`choice choice-sphere ${sphere === s ? 'is-on' : ''}`}>
                  <input type="radio" name="sphere" checked={sphere === s} onChange={() => { setSphere(s); sfxTap() }} />
                  <span className="choice-icon" aria-hidden="true">{SPHERES[s].icon}</span>
                  <span className="choice-title">{SPHERES[s].name}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend>Rozkład</legend>
            <div className="choice-row choice-row-spreads">
              {SPREAD_ORDER.map((s) => (
                <label key={s} className={`choice choice-spread ${spread === s ? 'is-on' : ''}`}>
                  <input type="radio" name="spread" checked={spread === s} onChange={() => { setSpread(s); sfxTap() }} />
                  <span className="choice-spread-head">
                    <span className="choice-icon" aria-hidden="true">{SPREADS[s].icon}</span>
                    <span className="choice-title">{SPREADS[s].name}</span>
                  </span>
                  <span className="choice-desc">{SPREADS[s].description}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="fields">
            <label className="field">
              <span>Twoje imię <em>(opcjonalnie)</em></span>
              <input value={name} onChange={(e) => setName(e.target.value)} maxLength={30} autoComplete="given-name" />
            </label>
            <label className="field field-wide">
              <span>Twoje pytanie {needsQuestion ? <em>(wymagane: odpowiem tak albo nie)</em> : <em>(opcjonalnie)</em>}</span>
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                maxLength={160}
                required={needsQuestion}
                placeholder={needsQuestion ? 'np. Czy warto przyjąć tę propozycję?' : PLACEHOLDERS[sphere]}
              />
            </label>
          </div>

          <button type="submit" className="btn btn-primary btn-big btn-glow">Rozpocznij wróżbę</button>
          <p className="hint">
            Darmowa wróżba: {left === Infinity ? 'bez limitu' : 'jedna dziennie'} ·{' '}
            <button type="button" className="link-btn" onClick={onLexicon}>Poznaj znaczenia kart</button>
          </p>
        </form>
      )}
    </section>
  )
}

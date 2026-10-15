import { useState } from 'react'
import { SPHERES, SPREADS, type Sphere, type SpreadId } from '../data/spreads'

export interface SetupChoice {
  sphere: Sphere
  spread: SpreadId
  name: string
  question: string
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
}: {
  left: number
  defaultName: string
  onStart: (c: SetupChoice) => void
  onHistory: () => void
}) {
  const [sphere, setSphere] = useState<Sphere>('love')
  const [spread, setSpread] = useState<SpreadId>('celtic')
  const [name, setName] = useState(defaultName)
  const [question, setQuestion] = useState('')

  return (
    <section className="setup">
      <div className="setup-intro">
        <h1>Tajemnice Magii</h1>
        <p className="lead">
          Jestem Aylena, strażniczka starej talii. Wybierz, o co chcesz zapytać karty, a poprowadzę Cię przez wróżbę.
        </p>
      </div>

      {left <= 0 ? (
        <div className="panel limit">
          <h2>Karty odpoczywają</h2>
          <p>
            Dzisiejsza wróżba została już odczytana. Talia potrzebuje nocy, by nabrać mocy. Wróć za {untilMidnight()}.
          </p>
          <button className="btn" onClick={onHistory}>Otwórz Księgę wróżb</button>
        </div>
      ) : (
        <form
          className="panel setup-form"
          onSubmit={(e) => {
            e.preventDefault()
            onStart({ sphere, spread, name: name.trim(), question: question.trim() })
          }}
        >
          <fieldset>
            <legend>O czym mają mówić karty?</legend>
            <div className="choice-row">
              {(Object.keys(SPHERES) as Sphere[]).map((s) => (
                <label key={s} className={`choice ${sphere === s ? 'is-on' : ''}`}>
                  <input type="radio" name="sphere" checked={sphere === s} onChange={() => setSphere(s)} />
                  <span className="choice-icon" aria-hidden="true">{s === 'love' ? '❦' : '⚜'}</span>
                  <span className="choice-title">{SPHERES[s].name}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend>Rozkład</legend>
            <div className="choice-row">
              {(Object.keys(SPREADS) as SpreadId[]).map((s) => (
                <label key={s} className={`choice ${spread === s ? 'is-on' : ''}`}>
                  <input type="radio" name="spread" checked={spread === s} onChange={() => setSpread(s)} />
                  <span className="choice-title">{SPREADS[s].name}</span>
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
              <span>Twoje pytanie <em>(opcjonalnie)</em></span>
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                maxLength={160}
                placeholder={sphere === 'love' ? 'np. Czy ta relacja ma przyszłość?' : 'np. Czy to dobry moment na nowy projekt?'}
              />
            </label>
          </div>

          <button type="submit" className="btn btn-primary btn-big">Rozpocznij wróżbę</button>
          <p className="hint">Darmowa wróżba: {left === Infinity ? 'bez limitu' : 'jedna dziennie'}.</p>
        </form>
      )}
    </section>
  )
}

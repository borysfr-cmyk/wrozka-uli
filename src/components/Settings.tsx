import { useEffect, useState } from 'react'
import { DEFAULT_MODEL, saveSettings, type Settings as S } from '../engine/storage'
import { testGeminiKey } from '../engine/ai'
import { polishVoices, setVoiceOptions, speak, speechAvailable } from '../engine/speech'
import { audioAvailable, configureAudio, sfxFlip, unlockAudio } from '../engine/audio'

export default function Settings({ settings, onClose }: { settings: S; onClose: (s: S) => void }) {
  const [s, setS] = useState(settings)
  const [status, setStatus] = useState('')
  const [voices, setVoices] = useState(polishVoices)

  useEffect(() => {
    if (!speechAvailable()) return
    const update = () => setVoices(polishVoices())
    speechSynthesis.addEventListener('voiceschanged', update)
    return () => speechSynthesis.removeEventListener('voiceschanged', update)
  }, [])

  // zmiany dźwięku słychać od razu
  useEffect(() => {
    configureAudio({ effects: s.effects, ambient: s.ambient, volume: s.volume })
    setVoiceOptions(s.voiceName, s.voiceRate)
  }, [s.effects, s.ambient, s.volume, s.voiceName, s.voiceRate])

  const close = () => {
    saveSettings(s)
    onClose(s)
  }

  useEffect(() => {
    const key = (e: KeyboardEvent) => e.key === 'Escape' && close()
    addEventListener('keydown', key)
    return () => removeEventListener('keydown', key)
  })

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="settings-title" onClick={(e) => e.target === e.currentTarget && close()}>
      <div className="panel modal-box">
        <h2 id="settings-title">Ustawienia</h2>

        <h3>Głos Ayleny</h3>
        <label className="toggle">
          <input type="checkbox" checked={s.voice} onChange={(e) => setS({ ...s, voice: e.target.checked })} disabled={!speechAvailable()} />
          <span>Aylena czyta wróżbę na głos {speechAvailable() ? '' : '(niedostępne w tej przeglądarce)'}</span>
        </label>
        {speechAvailable() && voices.length > 1 && (
          <label className="field">
            <span>Głos</span>
            <select value={s.voiceName} onChange={(e) => setS({ ...s, voiceName: e.target.value })}>
              <option value="">Najlepszy dostępny</option>
              {voices.map((v) => (
                <option key={v.name} value={v.name}>{v.name}</option>
              ))}
            </select>
          </label>
        )}
        {speechAvailable() && (
          <label className="field">
            <span>Tempo mowy: {s.voiceRate.toFixed(2).replace('.', ',')}×</span>
            <input type="range" min={0.7} max={1.3} step={0.05} value={s.voiceRate} onChange={(e) => setS({ ...s, voiceRate: Number(e.target.value) })} />
          </label>
        )}
        {speechAvailable() && (
          <div className="row">
            <button className="btn" onClick={() => speak('Witaj w mojej komnacie. Karty już czekają.')}>Posłuchaj próbki</button>
          </div>
        )}

        <h3>Dźwięki komnaty</h3>
        {audioAvailable() ? (
          <>
            <label className="toggle">
              <input type="checkbox" checked={s.ambient} onChange={(e) => { unlockAudio(); setS({ ...s, ambient: e.target.checked }) }} />
              <span>Muzyka i trzask ognia w tle</span>
            </label>
            <label className="toggle">
              <input type="checkbox" checked={s.effects} onChange={(e) => setS({ ...s, effects: e.target.checked })} />
              <span>Szelest kart i dzwonki</span>
            </label>
            <label className="field">
              <span>Głośność: {Math.round(s.volume * 100)}%</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={s.volume}
                onChange={(e) => setS({ ...s, volume: Number(e.target.value) })}
                onPointerUp={() => { unlockAudio(); sfxFlip() }}
              />
            </label>
          </>
        ) : (
          <p className="small">Ta przeglądarka nie obsługuje dźwięku.</p>
        )}

        <h3>Teksty pisane przez AI (Gemini)</h3>
        <p className="small">
          Bez klucza Aylena korzysta z wbudowanej Księgi, która też dba o to, by wróżby się nie powtarzały. Z kluczem Gemini
          każda wróżba jest pisana od nowa przez AI. Klucz jest darmowy: utwórz go na{' '}
          <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer">aistudio.google.com/apikey</a>.
          Zapisuje się tylko w tej przeglądarce.
        </p>
        <label className="field">
          <span>Klucz API Gemini</span>
          <input type="password" value={s.geminiKey} onChange={(e) => setS({ ...s, geminiKey: e.target.value.trim() })} placeholder="AIza…" autoComplete="off" />
        </label>
        <label className="field">
          <span>Model</span>
          <input value={s.geminiModel} onChange={(e) => setS({ ...s, geminiModel: e.target.value.trim() || DEFAULT_MODEL })} />
        </label>
        <div className="row">
          <button
            className="btn"
            disabled={!s.geminiKey}
            onClick={async () => {
              setStatus('Sprawdzam…')
              const err = await testGeminiKey(s.geminiKey, s.geminiModel)
              setStatus(err ? `Nie działa: ${err}` : 'Klucz działa. Aylena będzie pisać przez AI.')
            }}
          >
            Sprawdź klucz
          </button>
          {status && <span className="small" role="status">{status}</span>}
        </div>

        <div className="row row-end">
          <button className="btn btn-primary" onClick={close}>Zapisz</button>
        </div>
      </div>
    </div>
  )
}

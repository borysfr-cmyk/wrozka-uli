import { useState } from 'react'
import { DEFAULT_MODEL, saveSettings, type Settings as S } from '../engine/storage'
import { testGeminiKey } from '../engine/ai'
import { speechAvailable } from '../engine/speech'

export default function Settings({ settings, onClose }: { settings: S; onClose: (s: S) => void }) {
  const [s, setS] = useState(settings)
  const [status, setStatus] = useState('')

  const close = () => {
    saveSettings(s)
    onClose(s)
  }

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="settings-title" onClick={(e) => e.target === e.currentTarget && close()}>
      <div className="panel modal-box">
        <h2 id="settings-title">Ustawienia</h2>

        <label className="toggle">
          <input type="checkbox" checked={s.voice} onChange={(e) => setS({ ...s, voice: e.target.checked })} disabled={!speechAvailable()} />
          <span>Aylena czyta wróżbę na głos {speechAvailable() ? '' : '(niedostępne w tej przeglądarce)'}</span>
        </label>

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

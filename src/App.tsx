import { useCallback, useRef, useState } from 'react'
import Setup, { type SetupChoice } from './components/Setup'
import Shuffle from './components/Shuffle'
import Session from './components/Session'
import Summary from './components/Summary'
import Settings from './components/Settings'
import History from './components/History'
import { createReading, drawCards } from './engine/reading'
import { addToHistory, countReading, getHistory, getSettings, readingsLeftToday, saveSettings } from './engine/storage'
import { readingFromLocation } from './engine/share'
import { stopSpeaking } from './engine/speech'
import type { Reading } from './engine/types'

type Screen =
  | { kind: 'setup' }
  | { kind: 'shuffle'; ready: boolean }
  | { kind: 'session'; reading: Reading }
  | { kind: 'summary'; reading: Reading; shared?: boolean }
  | { kind: 'history' }

export default function App() {
  const [settings, setSettings] = useState(getSettings)
  const [showSettings, setShowSettings] = useState(false)
  const [screen, setScreen] = useState<Screen>(() => {
    const shared = readingFromLocation()
    return shared ? { kind: 'summary', reading: shared, shared: true } : { kind: 'setup' }
  })
  const pending = useRef<Reading | null>(null)
  const [left, setLeft] = useState(readingsLeftToday)

  const goHome = () => {
    stopSpeaking()
    if (location.hash) history.replaceState(null, '', location.pathname + location.search)
    setLeft(readingsLeftToday())
    setScreen({ kind: 'setup' })
  }

  async function start(choice: SetupChoice) {
    if (choice.name !== settings.name) {
      const s = { ...settings, name: choice.name }
      setSettings(s)
      saveSettings(s)
    }
    pending.current = null
    setScreen({ kind: 'shuffle', ready: false })
    // karty losujemy od razu, żeby AI pisało w trakcie tasowania
    const cards = drawCards(choice.spread)
    const { reading } = await createReading({ ...choice, cards })
    countReading()
    addToHistory(reading)
    setLeft(readingsLeftToday())
    pending.current = reading
    setScreen((s) => (s.kind === 'shuffle' ? { kind: 'shuffle', ready: true } : s))
  }

  const toSession = useCallback(() => {
    if (pending.current) setScreen({ kind: 'session', reading: pending.current })
  }, [])

  const toSummary = useCallback((reading: Reading) => setScreen({ kind: 'summary', reading }), [])

  return (
    <div className="app">
      <header className="topbar">
        <button className="brand" onClick={goHome} aria-label="Strona główna">
          <span className="brand-star">✦</span> Tajemnice Magii
        </button>
        <nav>
          <button
            className="icon-btn"
            onClick={() => {
              const s = { ...settings, voice: !settings.voice }
              if (!s.voice) stopSpeaking()
              setSettings(s)
              saveSettings(s)
            }}
            aria-pressed={settings.voice}
            title={settings.voice ? 'Wyłącz głos' : 'Włącz głos'}
          >
            {settings.voice ? '🔊' : '🔇'}
          </button>
          <button className="icon-btn" onClick={() => { stopSpeaking(); setScreen({ kind: 'history' }) }} title="Księga wróżb">📜</button>
          <button className="icon-btn" onClick={() => setShowSettings(true)} title="Ustawienia">⚙</button>
        </nav>
      </header>

      <main>
        {screen.kind === 'setup' && (
          <Setup left={left} defaultName={settings.name} onStart={start} onHistory={() => setScreen({ kind: 'history' })} />
        )}
        {screen.kind === 'shuffle' && <Shuffle ready={screen.ready} voice={settings.voice} onDone={toSession} />}
        {screen.kind === 'session' && (
          <Session reading={screen.reading} voice={settings.voice} onFinish={() => toSummary(screen.reading)} />
        )}
        {screen.kind === 'summary' && (
          <Summary
            reading={screen.reading}
            voice={settings.voice}
            shared={screen.shared}
            onNew={goHome}
            onHistory={() => setScreen({ kind: 'history' })}
          />
        )}
        {screen.kind === 'history' && (
          <History items={getHistory()} onOpen={(r) => setScreen({ kind: 'summary', reading: r, shared: true })} onBack={goHome} />
        )}
      </main>

      <footer className="footer">
        Tajemnice Magii · wróżby mają charakter rozrywkowy · karty: talia Rider–Waite–Smith (1909, domena publiczna)
      </footer>

      {showSettings && (
        <Settings
          settings={settings}
          onClose={(s) => {
            setSettings(s)
            setShowSettings(false)
          }}
        />
      )}
    </div>
  )
}

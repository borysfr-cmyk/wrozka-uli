import { useCallback, useEffect, useRef, useState } from 'react'
import Setup, { type SetupChoice } from './components/Setup'
import Shuffle from './components/Shuffle'
import Session from './components/Session'
import Summary from './components/Summary'
import Settings from './components/Settings'
import History from './components/History'
import Lexicon from './components/Lexicon'
import Scene, { type SceneFocus } from './components/Scene'
import Icon from './components/Icon'
import { createReading, drawCards } from './engine/reading'
import { addToHistory, countReading, getSettings, readingsLeftToday, saveSettings, type Settings as SettingsT } from './engine/storage'
import { readingFromLocation } from './engine/share'
import { setVoiceOptions, stopSpeaking } from './engine/speech'
import { configureAudio, unlockAudio } from './engine/audio'
import type { Reading } from './engine/types'

type Screen =
  | { kind: 'setup' }
  | { kind: 'shuffle'; ready: boolean }
  | { kind: 'session'; reading: Reading }
  | { kind: 'summary'; reading: Reading; shared?: boolean }
  | { kind: 'history' }
  | { kind: 'lexicon' }

export default function App() {
  const [settings, setSettings] = useState(getSettings)
  const [showSettings, setShowSettings] = useState(false)
  const [screen, setScreen] = useState<Screen>(() => {
    const shared = readingFromLocation()
    return shared ? { kind: 'summary', reading: shared, shared: true } : { kind: 'setup' }
  })
  const pending = useRef<Reading | null>(null)
  const [left, setLeft] = useState(readingsLeftToday)

  // dźwięk i głos zgodnie z ustawieniami; przeglądarka pozwala grać dopiero po pierwszym geście
  useEffect(() => {
    configureAudio({ effects: settings.effects, ambient: settings.ambient, volume: settings.volume })
    setVoiceOptions(settings.voiceName, settings.voiceRate)
  }, [settings])
  useEffect(() => {
    const wake = () => {
      unlockAudio()
      removeEventListener('pointerdown', wake)
      removeEventListener('keydown', wake)
    }
    addEventListener('pointerdown', wake)
    addEventListener('keydown', wake)
    return () => {
      removeEventListener('pointerdown', wake)
      removeEventListener('keydown', wake)
    }
  }, [])

  const update = (patch: Partial<SettingsT>) => {
    const s = { ...settings, ...patch }
    setSettings(s)
    saveSettings(s)
  }
  const soundOn = settings.ambient || settings.effects

  const goHome = () => {
    stopSpeaking()
    if (location.hash) history.replaceState(null, '', location.pathname + location.search)
    setLeft(readingsLeftToday())
    setScreen({ kind: 'setup' })
  }

  async function start(choice: SetupChoice) {
    if (choice.name !== settings.name) update({ name: choice.name })
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

  const focus: SceneFocus =
    screen.kind === 'shuffle' || screen.kind === 'session' ? 'table' : screen.kind === 'summary' || screen.kind === 'lexicon' ? 'away' : 'welcome'

  return (
    <div className="app">
      <header className="topbar">
        <button className="brand" onClick={goHome} aria-label="Strona główna">
          <span className="brand-star">✦</span> <span className="brand-text">Tajemnice Magii</span>
        </button>
        <nav>
          <button
            className={`icon-btn ${settings.voice ? '' : 'is-off'}`}
            onClick={() => {
              if (settings.voice) stopSpeaking()
              update({ voice: !settings.voice })
            }}
            aria-pressed={settings.voice}
            title={settings.voice ? 'Wyłącz głos Ayleny' : 'Włącz głos Ayleny'}
            aria-label="Głos Ayleny"
          >
            <Icon name="voice" />
          </button>
          <button
            className={`icon-btn ${soundOn ? '' : 'is-off'}`}
            onClick={() => (soundOn ? update({ ambient: false, effects: false }) : update({ ambient: true, effects: true }))}
            aria-pressed={soundOn}
            title={soundOn ? 'Wycisz muzykę i efekty' : 'Włącz muzykę i efekty'}
            aria-label="Muzyka i efekty"
          >
            <Icon name="music" />
          </button>
          <button className="icon-btn" onClick={() => { stopSpeaking(); setScreen({ kind: 'lexicon' }) }} title="Księga kart" aria-label="Księga kart">
            <Icon name="cards" />
          </button>
          <button className="icon-btn" onClick={() => { stopSpeaking(); setScreen({ kind: 'history' }) }} title="Księga wróżb" aria-label="Księga wróżb">
            <Icon name="book" />
          </button>
          <button className="icon-btn" onClick={() => setShowSettings(true)} title="Ustawienia" aria-label="Ustawienia">
            <Icon name="gear" />
          </button>
        </nav>
      </header>

      <Scene focus={focus} voice={settings.voice}>
      <main key={screen.kind} className="screen-in">
        {screen.kind === 'setup' && (
          <Setup
            left={left}
            defaultName={settings.name}
            onStart={start}
            onHistory={() => setScreen({ kind: 'history' })}
            onLexicon={() => setScreen({ kind: 'lexicon' })}
          />
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
          <History onOpen={(r) => setScreen({ kind: 'summary', reading: r, shared: true })} onBack={goHome} />
        )}
        {screen.kind === 'lexicon' && <Lexicon onBack={goHome} />}
      </main>
      </Scene>

      <footer className="footer">
        Tajemnice Magii · wróżby mają charakter rozrywkowy · karty: talia Rider–Waite–Smith (1909, domena publiczna)
        <br />
        Skróty w trakcie wróżby: spacja wstrzymuje, strzałka w prawo przechodzi dalej.
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

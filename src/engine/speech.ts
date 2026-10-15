// Głos Ayleny: wbudowana w przeglądarkę synteza mowy (darmowa, działa offline na większości urządzeń).

let voice: SpeechSynthesisVoice | null = null

function chooseVoice(): SpeechSynthesisVoice | null {
  if (!('speechSynthesis' in window)) return null
  const pl = speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith('pl'))
  // preferuj głosy kobiece, jeśli są dostępne
  const female = pl.find((v) => /zosia|paulina|ewa|agnieszka|maja|female|kobieta/i.test(v.name))
  return female ?? pl.find((v) => /google/i.test(v.name)) ?? pl[0] ?? null
}

export function speechAvailable(): boolean {
  return 'speechSynthesis' in window
}

if (speechAvailable()) {
  voice = chooseVoice()
  speechSynthesis.onvoiceschanged = () => (voice = chooseVoice())
}

/** Czyta tekst; Promise kończy się po przeczytaniu albo po przerwaniu */
export function speak(text: string): Promise<void> {
  return new Promise((resolve) => {
    if (!speechAvailable()) return resolve()
    speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'pl-PL'
    if (voice) u.voice = voice
    u.rate = 0.95
    u.pitch = 1.05
    // zabezpieczenie: niektóre przeglądarki nie wysyłają zdarzenia końca
    const fallback = setTimeout(resolve, 1500 + text.split(/\s+/).length * 450)
    const done = () => {
      clearTimeout(fallback)
      resolve()
    }
    u.onend = done
    u.onerror = done
    speechSynthesis.speak(u)
  })
}

export function stopSpeaking() {
  if (speechAvailable()) speechSynthesis.cancel()
}

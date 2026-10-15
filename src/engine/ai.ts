// Teksty Ayleny pisane przez Google Gemini (darmowy klucz z Google AI Studio).
// Gdy klucza brak albo AI zawiedzie, aplikacja używa wbudowanego generatora.

import type { Card } from '../data/cards'
import type { Position, Sphere, SpreadId } from '../data/spreads'
import { SPHERES, SPREADS } from '../data/spreads'
import { pick } from './random'
import { TALISMANS, type Generated } from './generator'
import { getHistory } from './storage'

const MOTIFS = [
  'stary las i światło między drzewami', 'górska przełęcz o świcie', 'rzeka płynąca ku morzu', 'wieża obserwacyjna i gwiazdy',
  'kuźnia i złoto', 'ogród elfów jesienią', 'przystań i statki o zmierzchu', 'zimowa gospoda z kominkiem',
  'starożytna biblioteka', 'kamienne runy na wzgórzu', 'srebrny księżyc nad jeziorem', 'droga przez złote pola',
  'latarnia w mgle', 'ogień w palenisku i opowieści', 'skrzydła orła nad doliną', 'źródło w grocie kryształów',
]

const TONES = ['ciepły i kojący', 'tajemniczy i poetycki', 'rzeczowy i krzepiący', 'uroczysty i dostojny', 'czuły i bezpośredni']

export async function generateWithGemini(
  key: string,
  model: string,
  cards: Card[],
  positions: Position[],
  sphere: Sphere,
  spread: SpreadId,
  name: string,
  question: string,
): Promise<Generated> {
  const motif = pick(MOTIFS)
  const tone = pick(TONES)
  // Początki ostatnich wróżb: AI ma ich unikać, żeby nie powtarzać fraz
  const avoid = getHistory()
    .slice(0, 5)
    .flatMap((r) => [r.greeting, ...r.cards.map((k) => k.text)])
    .map((t) => t.split(' ').slice(0, 5).join(' '))
    .slice(0, 25)

  const layout = cards
    .map((k, i) => `${i + 1}. Pozycja „${positions[i].name}” (${positions[i].meaning}): ${k.name}. Słowa-klucze: ${k.keywords.join(', ')}. Znaczenie (${SPHERES[sphere].short}): ${k[sphere].join(' ')}`)
    .join('\n')

  const prompt = `Jesteś Ayleną, mądrą elfią wróżką z krainy wysokiej fantasy. Mówisz piękną, poprawną polszczyzną, z magicznym klimatem, ale jasno i profesjonalnie. Zwracasz się do pytającego per „Ty” (wielką literą), unikając form rodzajowych (nie wiesz, czy to kobieta czy mężczyzna).

Wróżba: ${SPREADS[spread].name}, sfera: ${SPHERES[sphere].name}.
${name ? `Imię pytającego: ${name}.` : ''}
${question ? `Pytanie: „${question}”.` : 'Pytający nie zadał konkretnego pytania.'}
Motyw przewodni obrazowania: ${motif}. Ton: ${tone}.

Karty (bez odwróceń):
${layout}

Napisz wróżbę zgodną z klasyczną symboliką tych kart w podanej sferze. Wymagania:
- "greeting": 1–2 zdania powitania.
- "cards": tablica ${cards.length} tekstów, po jednym na kartę w tej samej kolejności, każdy 2–4 zdania (40–70 słów). Wymień nazwę karty i pozycję, powiąż je z pytaniem.
- "summary": podsumowanie całego rozkładu, 4–6 zdań, łączące karty w jedną opowieść.
- "advice": konkretna rada, 1–2 zdania.
- "message": krótkie przesłanie na najbliższe dni, 1 zdanie.
- "talisman": jeden symboliczny przedmiot-talizman (2–4 słowa).
- Nie dawaj porad medycznych, prawnych ani inwestycyjnych typu „kup akcje X”. To rozrywka.
- Każda wróżba ma być niepowtarzalna. Nie zaczynaj zdań od: ${avoid.length ? avoid.map((a) => `„${a}”`).join(', ') : '(brak)'}.
Odpowiedz wyłącznie obiektem JSON.`

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 1.1,
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            greeting: { type: 'STRING' },
            cards: { type: 'ARRAY', items: { type: 'STRING' } },
            summary: { type: 'STRING' },
            advice: { type: 'STRING' },
            message: { type: 'STRING' },
            talisman: { type: 'STRING' },
          },
          required: ['greeting', 'cards', 'summary', 'advice', 'message', 'talisman'],
        },
      },
    }),
  })
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${(await res.text()).slice(0, 200)}`)
  const data = await res.json()
  const text: string = data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('') ?? ''
  const out = JSON.parse(text)
  if (!Array.isArray(out.cards) || out.cards.length !== cards.length || !out.summary) {
    throw new Error('Gemini zwróciło niepełną wróżbę')
  }
  return {
    greeting: String(out.greeting),
    texts: out.cards.map(String),
    summary: String(out.summary),
    advice: String(out.advice),
    message: String(out.message),
    talisman: String(out.talisman || pick(TALISMANS)),
  }
}

/** Szybki test klucza z ekranu ustawień */
export async function testGeminiKey(key: string, model: string): Promise<string | null> {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: 'Odpowiedz jednym słowem: działa' }] }] }),
    })
    if (res.ok) return null
    const body = await res.json().catch(() => null)
    return body?.error?.message ?? `Błąd ${res.status}`
  } catch (e) {
    return e instanceof Error ? e.message : 'Brak połączenia'
  }
}

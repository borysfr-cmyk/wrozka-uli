import { CARDS, CARD_BY_ID, type Card } from '../data/cards'
import { SPREADS, type Sphere, type SpreadId } from '../data/spreads'
import { generateReading, type Generated } from './generator'
import { generateWithGemini } from './ai'
import { shuffle, uid, hash } from './random'
import { getHashes, saveHashes, getSettings } from './storage'
import type { Reading } from './types'

/** Tasuje pełną talię 78 kart i wykłada tyle, ile wymaga rozkład */
export function drawCards(spread: SpreadId): Card[] {
  return shuffle(CARDS).slice(0, SPREADS[spread].positions.length)
}

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([p, new Promise<T>((_, rej) => setTimeout(() => rej(new Error('Przekroczono czas')), ms))])
}

export async function createReading(opts: {
  sphere: Sphere
  spread: SpreadId
  name: string
  question: string
  cards: Card[]
}): Promise<{ reading: Reading; aiError?: string }> {
  const { sphere, spread, name, question, cards } = opts
  const positions = SPREADS[spread].positions
  const settings = getSettings()

  let gen: Generated | null = null
  let source: Reading['source'] = 'ksiega'
  let aiError: string | undefined

  if (settings.geminiKey) {
    try {
      gen = await withTimeout(
        generateWithGemini(settings.geminiKey, settings.geminiModel, cards, positions, sphere, spread, name, question),
        30000,
      )
      source = 'ai'
    } catch (e) {
      aiError = e instanceof Error ? e.message : String(e)
      console.warn('Gemini niedostępne, używam Księgi Ayleny:', aiError)
    }
  }
  if (!gen) gen = generateReading(cards, positions, sphere, spread, name)

  // zapamiętaj odciski zdań, by nigdy ich nie powtórzyć
  const seen = getHashes()
  ;[gen.greeting, ...gen.texts, gen.summary].forEach((t) => seen.add(hash(t)))
  saveHashes(seen)

  const reading: Reading = {
    id: uid(),
    createdAt: new Date().toISOString(),
    sphere,
    spread,
    question: question || undefined,
    name: name || undefined,
    cards: cards.map((k, i) => ({ cardId: k.id, text: gen!.texts[i] })),
    greeting: gen.greeting,
    summary: gen.summary,
    advice: gen.advice,
    message: gen.message,
    talisman: gen.talisman,
    source,
  }
  return { reading, aiError }
}

export function cardOf(id: string): Card {
  return CARD_BY_ID[id]
}

import { describe, it, expect, beforeAll } from 'vitest'

// prosta pamięć zamiast localStorage przeglądarki
beforeAll(() => {
  const mem = new Map<string, string>()
  ;(globalThis as any).localStorage = {
    getItem: (k: string) => mem.get(k) ?? null,
    setItem: (k: string, v: string) => void mem.set(k, v),
    removeItem: (k: string) => void mem.delete(k),
  }
})

describe('talia', () => {
  it('ma 78 unikalnych kart z obrazami', async () => {
    const { CARDS } = await import('../src/data/cards')
    expect(CARDS).toHaveLength(78)
    expect(new Set(CARDS.map((k) => k.id)).size).toBe(78)
    expect(new Set(CARDS.map((k) => k.image)).size).toBe(78)
  })
})

describe('generator', () => {
  it('ten sam układ kart za każdym razem daje inny tekst', async () => {
    const { CARDS } = await import('../src/data/cards')
    const { SPREADS } = await import('../src/data/spreads')
    const { generateReading } = await import('../src/engine/generator')
    const { getHashes, saveHashes } = await import('../src/engine/storage')
    const { hash } = await import('../src/engine/random')
    const cards = CARDS.slice(0, 10)
    const seenTexts = new Set<string>()
    const seenSummaries = new Set<string>()
    for (let n = 0; n < 100; n++) {
      const g = generateReading(cards, SPREADS.celtic.positions, n % 2 ? 'love' : 'money', 'celtic', 'Ola')
      const h = getHashes()
      g.texts.forEach((t) => {
        expect(seenTexts.has(t)).toBe(false)
        seenTexts.add(t)
        h.add(hash(t))
      })
      expect(seenSummaries.has(g.summary)).toBe(false)
      seenSummaries.add(g.summary)
      h.add(hash(g.summary))
      saveHashes(h)
    }
  })

  it('losuje karty z pełnej talii bez duplikatów', async () => {
    const { drawCards } = await import('../src/engine/reading')
    for (let n = 0; n < 50; n++) {
      const d = drawCards('celtic')
      expect(d).toHaveLength(10)
      expect(new Set(d.map((k) => k.id)).size).toBe(10)
    }
  })
})

describe('rozkłady i sfery', () => {
  it('każda karta ma znaczenia we wszystkich trzech sferach', async () => {
    const { CARDS } = await import('../src/data/cards')
    for (const k of CARDS) {
      for (const s of ['love', 'money', 'life'] as const) {
        expect(k[s], `${k.id} ${s}`).toHaveLength(2)
        k[s].forEach((t) => expect(t.length).toBeGreaterThan(10))
      }
    }
  })

  it('każdy rozkład i sfera dają kompletną wróżbę', async () => {
    const { SPREADS, SPHERES } = await import('../src/data/spreads')
    const { generateReading } = await import('../src/engine/generator')
    const { drawCards } = await import('../src/engine/reading')
    for (const spread of Object.values(SPREADS)) {
      expect(spread.coords === undefined || spread.coords.length === spread.positions.length).toBe(true)
      spread.adviceFrom.forEach((i) => expect(i).toBeLessThan(spread.positions.length))
      for (const sphere of Object.keys(SPHERES) as (keyof typeof SPHERES)[]) {
        const cards = drawCards(spread.id)
        expect(cards).toHaveLength(spread.positions.length)
        const g = generateReading(cards, spread.positions, sphere, spread.id, '')
        expect(g.texts).toHaveLength(cards.length)
        g.texts.forEach((t) => expect(t).toContain(spread.positions[g.texts.indexOf(t)].name))
        expect(g.summary.length).toBeGreaterThan(30)
        expect(g.summary).not.toMatch(/undefined/)
        expect(g.advice).not.toMatch(/undefined/)
        expect(g.greeting).toMatch(/(nów|Księżyc|kwadra|pełnia)/)
      }
    }
  })

  it('Tak czy nie: odpowiedź wynika z karty i otwiera podsumowanie', async () => {
    const { CARDS } = await import('../src/data/cards')
    const { SPREADS } = await import('../src/data/spreads')
    const { generateReading, verdictOf } = await import('../src/engine/generator')
    for (const card of [CARDS.find((k) => k.tone === 1)!, CARDS.find((k) => k.tone === -1)!, CARDS.find((k) => k.tone === 0)!]) {
      const g = generateReading([card], SPREADS.yesno.positions, 'love', 'yesno', '')
      expect(g.verdict).toBe(verdictOf(card))
      const word = { tak: /tak/i, nie: /nie/i, moze: /(może|ani)/i }[g.verdict!]
      expect(g.summary.split('.')[0]).toMatch(word)
    }
  })
})

describe('Księżyc', () => {
  it('rozpoznaje znane pełnie i nowie', async () => {
    const { moonPhase } = await import('../src/engine/moon')
    expect(moonPhase(new Date('2024-04-23T23:49:00Z')).name).toBe('pełnia')
    expect(moonPhase(new Date('2024-04-08T18:21:00Z')).name).toBe('nów')
    expect(moonPhase(new Date('2025-03-14T06:55:00Z')).name).toBe('pełnia')
  })
})

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

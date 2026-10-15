// Kryptograficzna losowość: karty i warianty tekstów nie są przewidywalne.

export function randInt(max: number): number {
  if (max <= 0) return 0
  const buf = new Uint32Array(1)
  // odrzucanie wartości z ogona, żeby rozkład był równy
  const limit = Math.floor(0x100000000 / max) * max
  do crypto.getRandomValues(buf)
  while (buf[0] >= limit)
  return buf[0] % max
}

export function pick<T>(arr: readonly T[]): T {
  return arr[randInt(arr.length)]
}

/** Tasowanie Fishera–Yatesa */
export function shuffle<T>(arr: readonly T[]): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(i + 1)
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function uid(): string {
  const b = new Uint8Array(8)
  crypto.getRandomValues(b)
  return Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('')
}

/** Szybki 32-bitowy hash tekstu (FNV-1a) */
export function hash(text: string): string {
  let h = 0x811c9dc5
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return (h >>> 0).toString(36)
}

// Wszystko, co aplikacja pamięta, trzyma w przeglądarce użytkownika (bez serwera i kont).
import type { Reading } from './types'

const K = {
  settings: 'tm.settings',
  history: 'tm.history',
  recent: 'tm.recent',
  hashes: 'tm.hashes',
  lastDay: 'tm.lastDay',
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* tryb prywatny lub brak miejsca: aplikacja działa dalej bez pamięci */
  }
}

// ── Ustawienia ──
export interface Settings {
  voice: boolean
  geminiKey: string
  geminiModel: string
  name: string
}

export const DEFAULT_MODEL = 'gemini-2.5-flash'

export function getSettings(): Settings {
  const envKey = (import.meta.env.VITE_GEMINI_API_KEY as string | undefined) ?? ''
  return { voice: true, geminiKey: envKey, geminiModel: DEFAULT_MODEL, name: '', ...read<Partial<Settings>>(K.settings, {}) }
}

export function saveSettings(s: Settings) {
  write(K.settings, s)
}

// ── Limit wróżb dziennie ──
// na czas testów bez limitu; przywrócić 1, gdy aplikacja będzie gotowa
const LIMIT = Number(import.meta.env.VITE_DAILY_LIMIT ?? 0)

function today(): string {
  const d = new Date()
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

export function readingsLeftToday(): number {
  if (!LIMIT) return Infinity
  const rec = read<{ day: string; count: number }>(K.lastDay, { day: '', count: 0 })
  return rec.day === today() ? Math.max(0, LIMIT - rec.count) : LIMIT
}

export function countReading() {
  const rec = read<{ day: string; count: number }>(K.lastDay, { day: '', count: 0 })
  write(K.lastDay, rec.day === today() ? { day: rec.day, count: rec.count + 1 } : { day: today(), count: 1 })
}

// ── Księga wróżb (historia) ──
export function getHistory(): Reading[] {
  return read<Reading[]>(K.history, [])
}

export function addToHistory(r: Reading) {
  write(K.history, [r, ...getHistory()].slice(0, 30))
}

// ── Pamięć niepowtarzalności ──
/** Ostatnio użyte warianty tekstów w każdej puli: nie wracają, dopóki pula się nie zrotuje */
export function getRecent(): Record<string, number[]> {
  return read(K.recent, {})
}
export function saveRecent(r: Record<string, number[]>) {
  write(K.recent, r)
}

/** Odciski wszystkich wygenerowanych zdań: identyczne zdanie nie pojawi się drugi raz */
export function getHashes(): Set<string> {
  return new Set(read<string[]>(K.hashes, []))
}
export function saveHashes(h: Set<string>) {
  write(K.hashes, Array.from(h).slice(-5000))
}

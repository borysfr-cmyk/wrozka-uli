// Faza Księżyca liczona lokalnie (bez internetu), z dokładnością do kilku godzin.
// Wzorzec: nów 6 stycznia 2000, 18:14 UTC; miesiąc synodyczny 29,53 dnia.

const SYNODIC = 29.530588853
const NEW_MOON_2000 = Date.UTC(2000, 0, 6, 18, 14)

export interface MoonPhase {
  /** 0 = nów, 0,5 = pełnia, rośnie do 1 */
  age: number
  /** oświetlona część tarczy, 0–1 */
  light: number
  name: string
  /** co ta faza znaczy dla wróżby */
  meaning: string
  waxing: boolean
}

const PHASES: { until: number; name: string; meaning: string }[] = [
  { until: 0.033, name: 'nów', meaning: 'czas zasiewania nowych zamiarów' },
  { until: 0.22, name: 'młody sierp Księżyca', meaning: 'czas pierwszych kroków i nadziei' },
  { until: 0.28, name: 'pierwsza kwadra', meaning: 'czas decyzji i działania' },
  { until: 0.467, name: 'Księżyc przybywający', meaning: 'czas wzrostu i nabierania mocy' },
  { until: 0.533, name: 'pełnia', meaning: 'czas, gdy sprawy dojrzewają i wychodzą na jaw' },
  { until: 0.72, name: 'Księżyc ubywający', meaning: 'czas wdzięczności i porządkowania' },
  { until: 0.78, name: 'ostatnia kwadra', meaning: 'czas puszczania tego, co zbędne' },
  { until: 0.967, name: 'stary sierp Księżyca', meaning: 'czas odpoczynku i wyciszenia' },
  { until: 1.01, name: 'nów', meaning: 'czas zasiewania nowych zamiarów' },
]

export function moonPhase(date = new Date()): MoonPhase {
  const days = (date.getTime() - NEW_MOON_2000) / 86400000
  const age = (((days / SYNODIC) % 1) + 1) % 1
  const light = (1 - Math.cos(age * 2 * Math.PI)) / 2
  const p = PHASES.find((x) => age < x.until) ?? PHASES[0]
  return { age, light, name: p.name, meaning: p.meaning, waxing: age < 0.5 }
}

export type Sphere = 'love' | 'money'
export type SpreadId = 'celtic' | 'three'

export interface Position {
  name: string
  /** krótkie objaśnienie, co mówi ta pozycja */
  meaning: string
}

export interface Spread {
  id: SpreadId
  name: string
  description: string
  positions: Position[]
}

export const SPHERES: Record<Sphere, { name: string; short: string; topic: string }> = {
  love: { name: 'Miłość i związki', short: 'miłość', topic: 'sprawach serca' },
  money: { name: 'Finanse i biznes', short: 'finanse', topic: 'sprawach finansów i pracy' },
}

export const SPREADS: Record<SpreadId, Spread> = {
  celtic: {
    id: 'celtic',
    name: 'Krzyż Celtycki',
    description: '10 kart, pełny obraz sytuacji, ok. 2–3 minuty',
    positions: [
      { name: 'Sedno sprawy', meaning: 'to, co dzieje się teraz' },
      { name: 'Wyzwanie', meaning: 'to, co krzyżuje Twoją drogę' },
      { name: 'Korzenie', meaning: 'dawne źródło sytuacji' },
      { name: 'Przeszłość', meaning: 'to, co właśnie odchodzi' },
      { name: 'Korona', meaning: 'Twój cel i świadome pragnienie' },
      { name: 'Najbliższa przyszłość', meaning: 'to, co nadchodzi' },
      { name: 'Ty', meaning: 'Twoja postawa i siła' },
      { name: 'Otoczenie', meaning: 'ludzie i okoliczności wokół Ciebie' },
      { name: 'Nadzieje i obawy', meaning: 'to, czego pragniesz i czego się lękasz' },
      { name: 'Rozwiązanie', meaning: 'dokąd prowadzi ta droga' },
    ],
  },
  three: {
    id: 'three',
    name: 'Trzy karty',
    description: '3 karty: przeszłość, teraźniejszość, przyszłość, ok. 1 minuta',
    positions: [
      { name: 'Przeszłość', meaning: 'to, co Cię ukształtowało' },
      { name: 'Teraźniejszość', meaning: 'to, co dzieje się teraz' },
      { name: 'Przyszłość', meaning: 'dokąd zmierza sprawa' },
    ],
  },
}

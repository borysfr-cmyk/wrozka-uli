export type Sphere = 'love' | 'money' | 'life'
export type SpreadId = 'celtic' | 'three' | 'horseshoe' | 'crossroads' | 'yesno' | 'day'

export interface Position {
  name: string
  /** krótkie objaśnienie, co mówi ta pozycja */
  meaning: string
}

export interface Spread {
  id: SpreadId
  name: string
  description: string
  /** znak na kafelku wyboru */
  icon: string
  positions: Position[]
  /**
   * Miejsca kart na stole w jednostkach szerokości (x) i wysokości (y) karty.
   * Brak = karty w jednym rzędzie z podpisami (Trzy karty).
   */
  coords?: { x: number; y: number }[]
  /** szerokość karty jako ułamek szerokości kadru: [komputer, telefon] */
  scale: [number, number]
  /** pozycja „Ty”, o której wspomina podsumowanie */
  you?: number
  /** pozycje, z których bierzemy radę do podsumowania */
  adviceFrom: number[]
  /** rozkład wymaga pytania (Tak czy nie) */
  needsQuestion?: boolean
}

export const SPHERES: Record<Sphere, { name: string; short: string; topic: string; icon: string }> = {
  love: { name: 'Miłość i związki', short: 'miłość', topic: 'sprawach serca', icon: '❦' },
  money: { name: 'Finanse i biznes', short: 'finanse', topic: 'sprawach finansów i pracy', icon: '⚜' },
  life: { name: 'Droga życia', short: 'droga życia', topic: 'sprawach Twojej drogi życiowej', icon: '✧' },
}

export const SPREADS: Record<SpreadId, Spread> = {
  celtic: {
    id: 'celtic',
    name: 'Krzyż Celtycki',
    description: '10 kart, pełny obraz sytuacji',
    icon: '✠',
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
    // 1 środek, 2 krzyżuje 1, 3 pod spodem, 4 z lewej, 5 nad, 6 z prawej, 7–10 laska od dołu
    coords: [
      { x: 1.35, y: 1.3 },
      { x: 1.35, y: 1.3 },
      { x: 1.35, y: 2.45 },
      { x: 0, y: 1.3 },
      { x: 1.35, y: 0.15 },
      { x: 2.7, y: 1.3 },
      { x: 4.2, y: 3.15 },
      { x: 4.2, y: 2.1 },
      { x: 4.2, y: 1.05 },
      { x: 4.2, y: 0 },
    ],
    scale: [0.032, 0.027],
    you: 6,
    adviceFrom: [9, 4],
  },
  horseshoe: {
    id: 'horseshoe',
    name: 'Podkowa',
    description: '5 kart: przeszkoda, ukryty wpływ i rada',
    icon: '☊',
    positions: [
      { name: 'Sytuacja', meaning: 'to, w czym jesteś teraz' },
      { name: 'Przeszkoda', meaning: 'to, co stoi Ci na drodze' },
      { name: 'Ukryty wpływ', meaning: 'to, czego jeszcze nie widać' },
      { name: 'Rada', meaning: 'to, co warto zrobić' },
      { name: 'Wynik', meaning: 'dokąd zmierza sprawa' },
    ],
    // łuk podkowy: końce niżej, środek wyżej
    coords: [
      { x: 0, y: 0.62 },
      { x: 1.15, y: 0.2 },
      { x: 2.3, y: 0 },
      { x: 3.45, y: 0.2 },
      { x: 4.6, y: 0.62 },
    ],
    scale: [0.04, 0.034],
    adviceFrom: [3, 4],
  },
  crossroads: {
    id: 'crossroads',
    name: 'Rozdroże',
    description: '5 kart: dwie drogi i to, dokąd prowadzą',
    icon: '⑂',
    positions: [
      { name: 'Ty teraz', meaning: 'Twoje położenie przed wyborem' },
      { name: 'Pierwsza droga', meaning: 'czym jest pierwsza możliwość' },
      { name: 'Dokąd prowadzi pierwsza', meaning: 'skutek wyboru pierwszej drogi' },
      { name: 'Druga droga', meaning: 'czym jest druga możliwość' },
      { name: 'Dokąd prowadzi druga', meaning: 'skutek wyboru drugiej drogi' },
    ],
    // Ty na dole pośrodku, drogi rozchodzą się w lewo i w prawo
    coords: [
      { x: 1.3, y: 1.55 },
      { x: 0, y: 1.05 },
      { x: 0, y: 0 },
      { x: 2.6, y: 1.05 },
      { x: 2.6, y: 0 },
    ],
    scale: [0.04, 0.036],
    you: 0,
    adviceFrom: [0, 2],
  },
  three: {
    id: 'three',
    name: 'Trzy karty',
    description: '3 karty: przeszłość, teraźniejszość, przyszłość',
    icon: '⁂',
    positions: [
      { name: 'Przeszłość', meaning: 'to, co Cię ukształtowało' },
      { name: 'Teraźniejszość', meaning: 'to, co dzieje się teraz' },
      { name: 'Przyszłość', meaning: 'dokąd zmierza sprawa' },
    ],
    scale: [0.05, 0.045],
    adviceFrom: [2, 1],
  },
  yesno: {
    id: 'yesno',
    name: 'Tak czy nie',
    description: '1 karta, szybka odpowiedź na jedno pytanie',
    icon: '☯',
    positions: [{ name: 'Odpowiedź', meaning: 'to, co karty mówią na Twoje pytanie' }],
    coords: [{ x: 0, y: 0 }],
    scale: [0.06, 0.06],
    adviceFrom: [0],
    needsQuestion: true,
  },
  day: {
    id: 'day',
    name: 'Karta dnia',
    description: '1 karta, energia na dzisiaj',
    icon: '☀',
    positions: [{ name: 'Karta dnia', meaning: 'energia, która dziś Ci towarzyszy' }],
    coords: [{ x: 0, y: 0 }],
    scale: [0.06, 0.06],
    adviceFrom: [0],
  },
}

/** kolejność kafelków na ekranie startowym */
export const SPREAD_ORDER: SpreadId[] = ['celtic', 'horseshoe', 'crossroads', 'three', 'yesno', 'day']

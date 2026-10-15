// Wbudowany generator wróżb („Księga Ayleny”). Działa bez internetu i bez AI.
// Niepowtarzalność: każda pula zdań rotuje (ostatnio użyte warianty są blokowane),
// a odcisk każdego zdania trafia do pamięci, więc identyczny tekst nie pojawi się ponownie.

import type { Card, Suit } from '../data/cards'
import type { Position, Sphere, SpreadId } from '../data/spreads'
import { SPHERES } from '../data/spreads'
import { randInt, shuffle, hash } from './random'
import { getRecent, saveRecent, getHashes } from './storage'

const SUIT_GEN: Record<Exclude<Suit, 'major'>, string> = {
  kielichy: 'Kielichów',
  bulawy: 'Buław',
  miecze: 'Mieczy',
  denary: 'Denarów',
}
const SUIT_NOM: Record<Exclude<Suit, 'major'>, string> = {
  kielichy: 'Kielichy',
  bulawy: 'Buławy',
  miecze: 'Miecze',
  denary: 'Denary',
}
const SUIT_ELEMENT: Record<Exclude<Suit, 'major'>, string> = {
  kielichy: 'woda, czyli uczucia',
  bulawy: 'ogień, czyli działanie',
  miecze: 'powietrze, czyli myśl',
  denary: 'ziemia, czyli sprawy materialne',
}

// zwroty grzecznościowe (Ty, Twój, Ci, Wasz…) zostają wielką literą
const lower = (s: string) => (/^(Ty|Tw\S*|Ci|Cię|Ciebie|Wasz\S*|Wam|Was)(?=[\s,.;:!?])/u.test(s) ? s : s.charAt(0).toLowerCase() + s.slice(1))

class Picker {
  private recent = getRecent()
  /** Wybiera indeks z puli, omijając ostatnio użyte (ok. 60% puli) */
  index(key: string, size: number): number {
    const used = this.recent[key] ?? []
    const window = Math.max(0, Math.floor(size * 0.6))
    const blocked = new Set(used.slice(-window))
    const free = Array.from({ length: size }, (_, i) => i).filter((i) => !blocked.has(i))
    const i = free.length ? free[randInt(free.length)] : randInt(size)
    this.recent[key] = [...used, i].slice(-Math.max(window, 1))
    return i
  }
  from<T>(key: string, pool: readonly T[]): T {
    return pool[this.index(key, pool.length)]
  }
  save() {
    saveRecent(this.recent)
  }
}

// ── Pule zdań ──

type Opener = (p: string, m: string, c: string, i: number) => string
const OPENERS: Opener[] = [
  (p, m, c) => `„${p}”, czyli ${m}. Tu spoczywa karta ${c}.`,
  (p, _m, c) => `Odkrywam kartę ${c} na pozycji „${p}”.`,
  (p, _m, c) => `Pozycja „${p}”. Karty odsłaniają: ${c}.`,
  (p, _m, c) => `${c} wychodzi z talii jako „${p}”.`,
  (p, _m, c) => `Tam, gdzie leży „${p}”, widzę kartę ${c}.`,
  (p, _m, c, i) => (i > 0 ? `Kolejna karta, ${c}, zajmuje miejsce „${p}”.` : `Pierwsza karta, ${c}, zajmuje miejsce „${p}”.`),
  (p, _m, c) => `Moja dłoń zatrzymuje się nad kartą ${c}. To „${p}”.`,
  (p, _m, c) => `„${p}” mówi dziś głosem karty ${c}.`,
  (p, _m, c) => `Świeca migocze, gdy odsłaniam kartę ${c}. Jej miejsce to „${p}”.`,
  (p, _m, c) => `Spójrz: ${c}, na pozycji „${p}”.`,
  (p, _m, c) => `Los kładzie tu kartę ${c}, w miejscu „${p}”.`,
  (p, _m, c) => `W kręgu „${p}” pojawia się ${c}.`,
  (p, m, c) => `${c}. Ta pozycja to „${p}”, czyli ${m}.`,
  (p, _m, c) => `Kryształ rozbłyska przy karcie ${c}, która trafiła na „${p}”.`,
  (p, _m, c) => `Na „${p}” odwraca się karta ${c}.`,
]

const MEANING_PREFIX = (topic: string) => [
  '',
  '',
  'Słyszę wyraźnie: ',
  `W ${topic} jej przesłanie brzmi: `,
  'Karta szepcze: ',
  'Dla Ciebie znaczy to tyle: ',
  'Widzę to jasno: ',
  'Jej głos jest spokojny: ',
]

const SECOND_JOIN = ['', 'Dodam też: ', 'A jest i druga strona: ', 'I jeszcze jedno: ', 'Widzę też coś więcej: ']

type Weave = (a: string, b: string, c: string) => string
const WEAVES: Weave[] = [
  (a, b) => `Szepcze o tym, co ważne: ${a} i ${b}.`,
  (a, b) => `Jej słowa-klucze to ${a} oraz ${b}.`,
  (a, b) => `Dwa słowa unoszą się nad nią: ${a}, ${b}.`,
  (a) => `Jej energia to ${a}.`,
  (a, b, c) => `Symbolika jest czytelna: ${a}, ${b}, ${c}.`,
  (a, b) => `Runy nad tą kartą układają się w słowa: ${a} i ${b}.`,
  (a, b) => `W jej obrazie kryją się dwie nici: ${a} oraz ${b}.`,
  (a) => `Najmocniej brzmi tu jedno: ${a}.`,
]

const IMAGERY: Record<'1' | '0' | '-1', string[]> = {
  '1': [
    'Jak poranne słońce nad doliną, ta energia rozprasza mrok.',
    'Czuję ciepło, jakby ktoś rozpalił ogień w kominku starej gospody.',
    'To światło przypomina gwiazdę wieczorną nad lasem elfów.',
    'Wiatr z zachodu niesie dobre wieści.',
    'Złote liście wirują, gdy padają te słowa.',
    'Kryształ w mojej dłoni rozjaśnia się przy tej karcie.',
    'Srebrne dzwonki brzmią gdzieś w oddali.',
    'Rzeka płynie tu szeroko i spokojnie, prosto ku morzu.',
    'Ta karta pachnie wiosną po długiej zimie.',
    'Ptaki nad wieżą krążą w dobrym znaku.',
    'Ścieżka przed Tobą jest oświetlona latarniami.',
  ],
  '0': [
    'Mgła nad rzeką powoli opada, ale jeszcze nie wszystko widać.',
    'To jak ścieżka przez stary las: trzeba iść uważnie.',
    'Kamienie runiczne milczą, każąc Ci samemu znaleźć odpowiedź.',
    'Wiatr się zmienia; zwróć uwagę, skąd wieje.',
    'Księżyc jest w połowie drogi, a wraz z nim Twoja sprawa.',
    'Stary most trzyma mocno, ale wymaga uważnego kroku.',
    'Na rozstajach dróg kamień wskazuje dwa kierunki.',
    'Płomień świecy stoi prosto i czeka.',
  ],
  '-1': [
    'Nad tą kartą zbierają się chmury, ale za nimi wciąż świeci słońce.',
    'Nawet najdłuższa noc kończy się świtem.',
    'Ten cień jest przestrogą, nie wyrokiem.',
    'Jak burza w górach: groźna, lecz przemijająca.',
    'Zimny wiatr przypomina, by otulić się płaszczem rozwagi.',
    'Kruki krążą, ale nie siadają; to tylko ostrzeżenie.',
    'W ciemnym lesie najważniejsze jest, by nie zgasić latarni.',
    'Lód na jeziorze jest cienki; idź ostrożnie, a przejdziesz.',
  ],
}

const ADVICE_PREFIX = ['Moja rada: ', 'Zapamiętaj: ', 'Weź to ze sobą: ', 'Szepnę Ci jeszcze: ', 'Niech prowadzą Cię te słowa: ']

const GREETINGS: ((name: string, topic: string) => string)[] = [
  (n, t) => `Witaj${n}, wędrowcze. Jestem Aylena. Usiądź przy moim stole, a karty opowiedzą o ${t}.`,
  (n, t) => `Witaj${n}. Świece już płoną, a talia czeka. Zapytajmy karty o Twoją drogę w ${t.replace(/^sprawach/, 'sprawach')}.`,
  (n, t) => `Dobrze, że jesteś${n}. Wiatr przyniósł mi wieść o Twoim przybyciu. Spójrzmy razem w karty o ${t}.`,
  (n, t) => `Witaj w mojej komnacie${n}. Talia zna już Twoje pytanie o ${t}; pozwól, że ją przetasuję.`,
  (n, t) => `Usiądź${n}, proszę. Gwiazdy są dziś przychylne, by mówić o ${t}.`,
  (n, t) => `Witaj${n}. Gdy wieje wiatr znad gór, karty mówią najwyraźniej. Zapytajmy je o ${t}.`,
]

const TALISMANS = [
  'bursztyn', 'srebrny liść', 'kamień księżycowy', 'złoty pierścień', 'gałązka jemioły', 'pióro sowy',
  'kryształ górski', 'dębowy żołądź', 'muszla z dalekiego morza', 'niebieska wstążka', 'stary klucz',
  'kamień z rzeki', 'gwiazda z papieru', 'kropla wosku ze świecy', 'liść klonu', 'szafirowy koralik',
  'brązowa moneta', 'pierścień z cyny', 'gałązka lawendy', 'czarny turmalin', 'perła', 'róża ze złotym brzegiem',
]

const MESSAGE_OPENERS = [
  'Przesłanie na najbliższe dni:',
  'Słowa, które warto zapamiętać:',
  'Aylena przekazuje Ci na drogę:',
  'Niech towarzyszy Ci myśl:',
  'Na najbliższy czas:',
]

// ── Składanie tekstu jednej karty ──

function cardText(pk: Picker, card: Card, pos: Position, i: number, sphere: Sphere): string {
  const topic = SPHERES[sphere].topic
  const parts: string[] = []

  parts.push(pk.from('opener', OPENERS)(pos.name, pos.meaning, card.name, i))

  const meanings = shuffle(card[sphere])
  const prefix = pk.from('mprefix', MEANING_PREFIX(topic))
  parts.push(prefix ? prefix + lower(meanings[0]) : meanings[0])
  if (randInt(100) < 55) {
    const join = pk.from('join', SECOND_JOIN)
    parts.push(join ? join + lower(meanings[1]) : meanings[1])
  }

  if (randInt(100) < 55) {
    const kw = shuffle(card.keywords)
    parts.push(pk.from('weave', WEAVES)(kw[0], kw[1] ?? kw[0], kw[2] ?? kw[0]))
  }

  if (card.suit !== 'major' && randInt(100) < 25) {
    parts.push(`To karta ${SUIT_GEN[card.suit]}, a jej żywioł to ${SUIT_ELEMENT[card.suit]}.`)
  } else if (card.suit === 'major' && randInt(100) < 30) {
    parts.push('To karta z Arkanów Wielkich, więc dotyka sprawy większej niż codzienność.')
  }

  if (randInt(100) < 45) {
    parts.push(pk.from(`img${card.tone}`, IMAGERY[String(card.tone) as '1' | '0' | '-1']))
  }

  if (randInt(100) < 35) {
    parts.push(pk.from('aprefix', ADVICE_PREFIX) + lower(card.advice))
  }

  return parts.join(' ')
}

// ── Podsumowanie ──

function summaryText(pk: Picker, cards: Card[], positions: Position[], sphere: Sphere, spread: SpreadId) {
  const s: string[] = []
  const majors = cards.filter((k) => k.suit === 'major').length
  const bright = cards.filter((k) => k.tone === 1).length
  const dark = cards.filter((k) => k.tone === -1).length
  const counts: Partial<Record<Suit, number>> = {}
  cards.forEach((k) => (counts[k.suit] = (counts[k.suit] ?? 0) + 1))
  const dominant = (Object.entries(counts) as [Suit, number][])
    .filter(([suit]) => suit !== 'major')
    .sort((a, b) => b[1] - a[1])[0]

  // Charakter rozkładu
  if (majors >= Math.ceil(cards.length * 0.4)) {
    s.push(pk.from('sum-major', [
      `Aż ${majors} z ${cards.length} kart pochodzi z Arkanów Wielkich. To znak, że ta sprawa jest ważnym etapem Twojego losu, a nie przypadkiem.`,
      `W rozkładzie pojawiło się ${majors} Arkanów Wielkich. Przeznaczenie wyraźnie macza w tym palce.`,
      `${majors} Arkana Wielkie w jednym rozkładzie to rzadki widok. Twoja sprawa ma głębszy, duchowy wymiar.`,
    ]))
  } else if (dominant && dominant[1] >= 2) {
    const [suit, n] = dominant as [Exclude<Suit, 'major'>, number]
    s.push(pk.from('sum-suit', [
      `Przeważają karty ${SUIT_GEN[suit]} (${n}), więc kluczem jest ${SUIT_ELEMENT[suit]}.`,
      `Najczęściej przemawiają tu ${SUIT_NOM[suit]}: ${n} ${n < 5 ? 'karty' : 'kart'}. Ich żywioł to ${SUIT_ELEMENT[suit]}.`,
      `Żywioł, który dominuje w rozkładzie, to ${SUIT_ELEMENT[suit]}. Tam szukaj odpowiedzi.`,
    ]))
  }

  // Bilans światła i cienia
  if (bright > dark * 2) {
    s.push(pk.from('sum-bright', [
      'Światło wyraźnie przeważa nad cieniem. Energia sprzyja Twoim zamiarom.',
      'Większość kart świeci jasno. Masz wiatr w żaglach.',
      'Karty są dla Ciebie łaskawe: przewaga dobrych znaków jest wyraźna.',
    ]))
  } else if (dark > bright) {
    s.push(pk.from('sum-dark', [
      'W rozkładzie jest sporo cienia, ale cień pokazuje tylko, gdzie postawić latarnię.',
      'Karty ostrzegają, ale nie przesądzają. Masz wpływ na to, co nadejdzie.',
      'Kilka trudnych kart to zaproszenie do ostrożności, nie powód do lęku.',
    ]))
  } else {
    s.push(pk.from('sum-mixed', [
      'Światło i cień są w równowadze. Wiele zależy od Twoich decyzji.',
      'Rozkład jest zrównoważony: obok szans pojawiają się wyzwania.',
      'Karty mówią o drodze, na której każdy krok ma znaczenie.',
    ]))
  }

  // Oś opowieści: pierwsza i ostatnia karta
  const first = cards[0]
  const last = cards[cards.length - 1]
  const kf = shuffle(first.keywords)[0]
  const kl = shuffle(last.keywords)[0]
  s.push(pk.from('sum-arc', [
    `Twoja opowieść zaczyna się od karty ${first.name} (${kf}) i prowadzi do karty ${last.name} (${kl}).`,
    `Droga wiedzie od karty ${first.name} ku karcie ${last.name}, czyli od tematu: ${kf}, do tematu: ${kl}.`,
    `Początek to ${first.name}, a rozwiązanie to ${last.name}. Między nimi rozpięta jest cała Twoja historia.`,
  ]))

  // Rozwiązanie w sferze
  s.push(shuffle(last[sphere])[0])

  // Pozycja „Ty” w Krzyżu Celtyckim
  if (spread === 'celtic') {
    const you = cards[6]
    s.push(`Pozycja „${positions[6].name}” pokazuje kartę ${you.name}: ${lower(you.advice)}`)
  }

  const advice = `${last.advice} ${spread === 'celtic' ? cards[4].advice : cards[1].advice}`
  return { summary: s.join(' '), advice }
}

// ── API generatora ──

export interface Generated {
  greeting: string
  texts: string[]
  summary: string
  advice: string
  message: string
  talisman: string
}

export function generateReading(
  cards: Card[],
  positions: Position[],
  sphere: Sphere,
  spread: SpreadId,
  name: string,
): Generated {
  const pk = new Picker()
  const seen = getHashes()
  const topic = SPHERES[sphere].topic

  const texts = cards.map((card, i) => {
    let t = ''
    for (let attempt = 0; attempt < 12; attempt++) {
      t = cardText(pk, card, positions[i], i, sphere)
      if (!seen.has(hash(t))) break
    }
    return t
  })

  const greeting = pk.from('greet', GREETINGS)(name ? `, ${name}` : '', topic)
  let sum = summaryText(pk, cards, positions, sphere, spread)
  for (let attempt = 0; attempt < 6 && seen.has(hash(sum.summary)); attempt++) {
    sum = summaryText(pk, cards, positions, sphere, spread)
  }
  const msgCard = cards[randInt(cards.length)]
  const message = `${pk.from('msg', MESSAGE_OPENERS)} ${lower(msgCard.advice)}`
  const talisman = pk.from('talisman', TALISMANS)
  pk.save()

  return { greeting, texts, summary: sum.summary, advice: sum.advice, message, talisman }
}

export { TALISMANS }

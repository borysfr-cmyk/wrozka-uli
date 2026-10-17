import type { Sphere, SpreadId } from '../data/spreads'

/** odpowiedź w rozkładzie „Tak czy nie” */
export type Verdict = 'tak' | 'nie' | 'moze'

export interface ReadingCard {
  cardId: string
  text: string
}

export interface Reading {
  id: string
  createdAt: string
  sphere: Sphere
  spread: SpreadId
  question?: string
  name?: string
  cards: ReadingCard[]
  greeting: string
  summary: string
  advice: string
  message: string
  talisman: string
  source: 'ai' | 'ksiega'
  verdict?: Verdict
  /** faza Księżyca w chwili wróżby */
  moon?: string
}

import type { Sphere, SpreadId } from '../data/spreads'

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
}

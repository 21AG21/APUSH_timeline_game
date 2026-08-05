export interface Event {
  id: string
  year: number
  title: string
  description: string
  cause: string
  effect: string
  causes: string[]
  effects: string[]
  significance: string[]
  region: string
  units: number[]
  course: 'apush' | 'apworld'
}

export interface Note {
  eventId: string
  cause: string
  effect: string
  significance: string
}

export interface GameState {
  pool: Event[]
  timeline: Event[]
  current: Event | null
  score: number
  attempts: number
  tentativeSlot: number | null
  done: boolean
  gameOver: boolean
  streak: number
  bestStreak: number
  missWeights: Record<string, number>
  rngSeed: number
  missedIds: string[]
  timeTaken: number | null
}

export interface Settings {
  darkMode: boolean
  hideDates: boolean
  showUnderstanding: boolean
  hardMode: boolean
  /** Opt out of anonymous, cookieless usage analytics. */
  analyticsOptOut: boolean
  filterUnits: number[]
  filterRegions: string[]
}

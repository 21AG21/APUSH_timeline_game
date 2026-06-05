export interface Event {
  id: string
  year: number
  title: string
  description: string
  cause: string
  effect: string
  region: string
  units: number[]
  course: 'apush' | 'apworld'
}

export interface Note {
  eventId: string
  summary: string
  cause: string
  effect: string
}

export interface GameState {
  pool: Event[]
  timeline: Event[]
  current: Event | null
  score: number
  attempts: number
  tentativeSlot: number | null
  done: boolean
}

export interface Settings {
  darkMode: boolean
  hideDates: boolean
  showUnderstanding: boolean
}

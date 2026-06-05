import type { Event, GameState } from '../data/types'

export function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function startGame(events: Event[]): GameState {
  if (events.length < 2) throw new Error('Need at least 2 events to start a game')
  const shuffled = shuffleArray(events)
  // Place first event immediately on timeline, rest go into pool
  const [first, second, ...rest] = shuffled
  // Sort first event into timeline, draw second as the first challenge
  const timeline = [first].sort((a, b) => a.year - b.year)
  return {
    pool: rest,
    timeline,
    current: second,
    score: 0,
    attempts: 0,
    tentativeSlot: null,
    done: false,
  }
}

/**
 * Returns the valid slot indices where an event with the given year can be
 * inserted while keeping the timeline sorted.
 *
 * A slot index i means "insert before timeline[i]" (slot 0 = before everything,
 * slot timeline.length = after everything). Returns all slots where insertion
 * keeps the array sorted.
 */
export function validSlots(timeline: Event[], year: number): number[] {
  const slots: number[] = []
  for (let i = 0; i <= timeline.length; i++) {
    const prevOk = i === 0 || timeline[i - 1].year <= year
    const nextOk = i === timeline.length || timeline[i].year >= year
    if (prevOk && nextOk) slots.push(i)
  }
  return slots
}

export function checkPlacement(timeline: Event[], event: Event, slot: number): boolean {
  return validSlots(timeline, event.year).includes(slot)
}

export function applyPlacement(state: GameState, slot: number): GameState {
  if (!state.current) return state

  const correct = checkPlacement(state.timeline, state.current, slot)
  const newTimeline = [...state.timeline]
  newTimeline.splice(slot, 0, state.current)

  if (correct) {
    const [next, ...remaining] = state.pool
    return {
      ...state,
      timeline: newTimeline,
      pool: remaining,
      current: next ?? null,
      score: state.score + 1,
      attempts: state.attempts + 1,
      tentativeSlot: null,
      done: !next,
    }
  } else {
    return {
      ...state,
      attempts: state.attempts + 1,
      tentativeSlot: null,
    }
  }
}

export function drawNext(state: GameState): GameState {
  if (state.pool.length === 0) return { ...state, current: null, done: true }
  const [next, ...remaining] = state.pool
  return { ...state, current: next, pool: remaining }
}

export function setTentativeSlot(state: GameState, slot: number | null): GameState {
  return { ...state, tentativeSlot: slot }
}

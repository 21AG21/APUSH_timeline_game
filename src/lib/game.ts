import type { Event, GameState } from '../data/types'

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

export function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Mulberry32 seeded PRNG – returns a function that produces [0, 1) floats. */
export function seededRng(seed: number): () => number {
  let s = seed | 0
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ---------------------------------------------------------------------------
// Filtering
// ---------------------------------------------------------------------------

/**
 * Returns events that match ALL active filters.
 * Empty array in either dimension means "no filter on that dimension" (all pass).
 */
export function filterPool(events: Event[], units: number[], regions: string[]): Event[] {
  return events.filter((e) => {
    const unitOk = units.length === 0 || e.units.some((u) => units.includes(u))
    const regionOk = regions.length === 0 || regions.includes(e.region)
    return unitOk && regionOk
  })
}

// ---------------------------------------------------------------------------
// Slot utilities
// ---------------------------------------------------------------------------

/**
 * Returns all slot indices where inserting an event with `year` keeps the
 * timeline chronologically sorted. Slot i means "insert before timeline[i]".
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

/**
 * Scores a correct placement by the narrowness of the gap it fits into.
 * Tight gap (hard placement) → more points.
 */
export function scoreSlot(timeline: Event[], event: Event, slot: number): number {
  const prevYear = slot > 0 ? timeline[slot - 1].year : null
  const nextYear = slot < timeline.length ? timeline[slot].year : null

  if (prevYear === null && nextYear === null) return 1

  let gap: number
  if (prevYear === null) gap = nextYear! - event.year
  else if (nextYear === null) gap = event.year - prevYear
  else gap = nextYear - prevYear

  if (gap <= 20) return 3
  if (gap <= 60) return 2
  return 1
}

// ---------------------------------------------------------------------------
// Weighted draw (spaced repetition)
// ---------------------------------------------------------------------------

/**
 * Returns the index of a weighted-random pick from `pool`.
 * Events with a higher missWeight surface more frequently.
 */
export function weightedPick(
  pool: Event[],
  missWeights: Record<string, number>,
  rng: () => number
): number {
  if (pool.length === 0) return -1
  if (pool.length === 1) return 0
  const weights = pool.map((e) => missWeights[e.id] ?? 1)
  const total = weights.reduce((a, b) => a + b, 0)
  let r = rng() * total
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i]
    if (r <= 0) return i
  }
  return pool.length - 1
}

// ---------------------------------------------------------------------------
// Game lifecycle
// ---------------------------------------------------------------------------

const EMPTY_EXTRA: Pick<
  GameState,
  'gameOver' | 'streak' | 'bestStreak' | 'missWeights' | 'rngSeed' | 'missedIds' | 'timeTaken'
> = {
  gameOver: false,
  streak: 0,
  bestStreak: 0,
  missWeights: {},
  rngSeed: 0,
  missedIds: [],
  timeTaken: null,
}

export function startGame(events: Event[]): GameState {
  if (events.length < 2) throw new Error('Need at least 2 events to start a game')
  const shuffled = shuffleArray(events)
  const [first, second, ...rest] = shuffled
  const timeline = [first].sort((a, b) => a.year - b.year)
  const rngSeed = Math.floor(Math.random() * 0xffffffff)
  return {
    pool: rest,
    timeline,
    current: second,
    score: 0,
    attempts: 0,
    tentativeSlot: null,
    done: false,
    ...EMPTY_EXTRA,
    rngSeed,
  }
}

export function isGameOver(state: GameState): boolean {
  return state.done || state.gameOver
}

// ---------------------------------------------------------------------------
// Placement
// ---------------------------------------------------------------------------

export interface PlacementOptions {
  hardMode?: boolean
  rng?: () => number
}

export function applyPlacement(
  state: GameState,
  slot: number,
  opts?: PlacementOptions
): GameState {
  if (!state.current) return state

  const hardMode = opts?.hardMode ?? false
  const rng = opts?.rng ?? Math.random

  const correct = checkPlacement(state.timeline, state.current, slot)
  const missWeights = { ...state.missWeights }

  if (correct) {
    const newTimeline = [...state.timeline]
    newTimeline.splice(slot, 0, state.current)

    // Decay miss weight on correct placement
    if (missWeights[state.current.id] !== undefined) {
      missWeights[state.current.id] = Math.max(1, missWeights[state.current.id] - 1)
    }

    const points = scoreSlot(state.timeline, state.current, slot)
    const newStreak = state.streak + 1
    const bestStreak = Math.max(state.bestStreak, newStreak)

    if (state.pool.length === 0) {
      return {
        ...state,
        timeline: newTimeline,
        pool: [],
        current: null,
        score: state.score + points,
        attempts: state.attempts + 1,
        tentativeSlot: null,
        done: true,
        gameOver: false,
        streak: newStreak,
        bestStreak,
        missWeights,
      }
    }

    const idx = weightedPick(state.pool, missWeights, rng)
    const next = state.pool[idx]
    const remaining = state.pool.filter((_, i) => i !== idx)

    return {
      ...state,
      timeline: newTimeline,
      pool: remaining,
      current: next,
      score: state.score + points,
      attempts: state.attempts + 1,
      tentativeSlot: null,
      done: false,
      gameOver: false,
      streak: newStreak,
      bestStreak,
      missWeights,
    }
  } else {
    // Wrong placement
    const newWeight = (missWeights[state.current.id] ?? 1) + 2
    missWeights[state.current.id] = newWeight

    const missedIds = state.missedIds.includes(state.current.id)
      ? state.missedIds
      : [...state.missedIds, state.current.id]

    if (hardMode) {
      return {
        ...state,
        attempts: state.attempts + 1,
        tentativeSlot: null,
        gameOver: true,
        streak: 0,
        bestStreak: state.bestStreak,
        missWeights,
        missedIds,
      }
    }

    // Normal mode: re-insert current into pool, draw next via weighted pick
    const poolWithCurrent = [...state.pool, state.current]

    // If the re-inserted event is the only thing in pool, keep it as current
    if (poolWithCurrent.length === 1) {
      return {
        ...state,
        attempts: state.attempts + 1,
        tentativeSlot: null,
        streak: 0,
        missWeights,
        missedIds,
      }
    }

    const idx = weightedPick(poolWithCurrent, missWeights, rng)
    const next = poolWithCurrent[idx]
    const remaining = poolWithCurrent.filter((_, i) => i !== idx)

    return {
      ...state,
      pool: remaining,
      current: next,
      attempts: state.attempts + 1,
      tentativeSlot: null,
      streak: 0,
      missWeights,
      missedIds,
    }
  }
}

export function setTentativeSlot(state: GameState, slot: number | null): GameState {
  return { ...state, tentativeSlot: slot }
}

// Legacy drawNext kept for compatibility; prefer applyPlacement which does weighted draw.
export function drawNext(state: GameState): GameState {
  if (state.pool.length === 0) return { ...state, current: null, done: true }
  const [next, ...remaining] = state.pool
  return { ...state, current: next, pool: remaining }
}

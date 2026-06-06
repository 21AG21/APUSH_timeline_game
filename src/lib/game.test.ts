import { describe, it, expect } from 'vitest'
import {
  startGame,
  validSlots,
  checkPlacement,
  applyPlacement,
  drawNext,
  setTentativeSlot,
  shuffleArray,
  filterPool,
  seededRng,
  weightedPick,
  scoreSlot,
  isGameOver,
} from './game'
import type { Event, GameState } from '../data/types'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const makeEvent = (id: string, year: number, opts?: Partial<Event>): Event => ({
  id,
  year,
  title: `Event ${id}`,
  description: 'desc',
  cause: 'cause',
  effect: 'effect',
  causes: ['cause detail'],
  effects: ['effect detail'],
  significance: ['significance detail'],
  region: opts?.region ?? 'Northeast',
  units: opts?.units ?? [1],
  course: 'apush',
  ...opts,
})

const events = [
  makeEvent('a', 1776),
  makeEvent('b', 1865),
  makeEvent('c', 1920),
  makeEvent('d', 1620),
  makeEvent('e', 1803),
]

const buildState = (): GameState => ({
  timeline: [makeEvent('a', 1776), makeEvent('b', 1865)],
  current: makeEvent('c', 1803),
  pool: [makeEvent('d', 1920)],
  score: 0,
  attempts: 0,
  tentativeSlot: null,
  done: false,
  gameOver: false,
  streak: 0,
  bestStreak: 0,
  missWeights: {},
  rngSeed: 42,
  missedIds: [],
  timeTaken: null,
})

// ---------------------------------------------------------------------------
// shuffleArray
// ---------------------------------------------------------------------------

describe('shuffleArray', () => {
  it('returns array of same length', () => {
    expect(shuffleArray(events)).toHaveLength(events.length)
  })
  it('contains same elements', () => {
    expect(shuffleArray(events)).toEqual(expect.arrayContaining(events))
  })
  it('does not mutate original', () => {
    const copy = [...events]
    shuffleArray(events)
    expect(events).toEqual(copy)
  })
})

// ---------------------------------------------------------------------------
// filterPool
// ---------------------------------------------------------------------------

describe('filterPool', () => {
  const pool = [
    makeEvent('a', 1776, { units: [3], region: 'Northeast' }),
    makeEvent('b', 1865, { units: [5], region: 'South' }),
    makeEvent('c', 1920, { units: [7], region: 'North America' }),
    makeEvent('d', 1803, { units: [4], region: 'West' }),
    makeEvent('e', 1690, { units: [1, 2], region: 'New England' }),
  ]

  it('empty filters returns all events', () => {
    expect(filterPool(pool, [], [])).toHaveLength(pool.length)
  })

  it('unit filter returns matching events', () => {
    const result = filterPool(pool, [3, 5], [])
    expect(result.map((e) => e.id)).toEqual(expect.arrayContaining(['a', 'b']))
    expect(result).toHaveLength(2)
  })

  it('region filter returns matching events', () => {
    const result = filterPool(pool, [], ['South', 'West'])
    expect(result.map((e) => e.id)).toEqual(expect.arrayContaining(['b', 'd']))
    expect(result).toHaveLength(2)
  })

  it('unit AND region filters – intersection', () => {
    const result = filterPool(pool, [1, 2], ['New England'])
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('e')
  })

  it('returns empty when no event matches', () => {
    expect(filterPool(pool, [9], ['Pacific'])).toHaveLength(0)
  })

  it('multi-unit event matches if any unit selected', () => {
    const result = filterPool(pool, [2], [])
    expect(result.map((e) => e.id)).toContain('e')
  })
})

// ---------------------------------------------------------------------------
// startGame
// ---------------------------------------------------------------------------

describe('startGame', () => {
  it('throws with fewer than 2 events', () => {
    expect(() => startGame([makeEvent('x', 2000)])).toThrow()
    expect(() => startGame([])).toThrow()
  })

  it('creates valid initial state', () => {
    const state = startGame(events)
    expect(state.timeline).toHaveLength(1)
    expect(state.current).not.toBeNull()
    expect(state.pool).toHaveLength(events.length - 2)
    expect(state.score).toBe(0)
    expect(state.attempts).toBe(0)
    expect(state.done).toBe(false)
    expect(state.gameOver).toBe(false)
    expect(state.streak).toBe(0)
    expect(state.bestStreak).toBe(0)
    expect(state.missWeights).toEqual({})
    expect(state.missedIds).toEqual([])
    expect(state.timeTaken).toBeNull()
  })

  it('timeline starts sorted', () => {
    const state = startGame(events)
    for (let i = 1; i < state.timeline.length; i++) {
      expect(state.timeline[i].year).toBeGreaterThanOrEqual(state.timeline[i - 1].year)
    }
  })
})

// ---------------------------------------------------------------------------
// validSlots
// ---------------------------------------------------------------------------

describe('validSlots', () => {
  const timeline = [makeEvent('a', 1776), makeEvent('b', 1865), makeEvent('c', 1920)]

  it('returns [0] for event before all', () => {
    expect(validSlots(timeline, 1620)).toEqual([0])
  })

  it('returns [3] for event after all', () => {
    expect(validSlots(timeline, 2000)).toEqual([3])
  })

  it('returns middle slot for event between two', () => {
    expect(validSlots(timeline, 1803)).toEqual([1])
  })

  it('returns [0,1] for event with same year as first', () => {
    expect(validSlots(timeline, 1776)).toContain(0)
    expect(validSlots(timeline, 1776)).toContain(1)
  })

  it('returns [0] for empty timeline', () => {
    expect(validSlots([], 1776)).toEqual([0])
  })
})

// ---------------------------------------------------------------------------
// checkPlacement
// ---------------------------------------------------------------------------

describe('checkPlacement', () => {
  const timeline = [makeEvent('a', 1776), makeEvent('b', 1865)]

  it('accepts correct slot', () => {
    expect(checkPlacement(timeline, makeEvent('c', 1803), 1)).toBe(true)
  })

  it('rejects wrong slot', () => {
    expect(checkPlacement(timeline, makeEvent('c', 1803), 0)).toBe(false)
    expect(checkPlacement(timeline, makeEvent('c', 1803), 2)).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// scoreSlot
// ---------------------------------------------------------------------------

describe('scoreSlot', () => {
  it('tight gap (<=20 yrs) scores 3', () => {
    const tl = [makeEvent('x', 1800), makeEvent('y', 1810)]
    expect(scoreSlot(tl, makeEvent('z', 1805), 1)).toBe(3)
  })

  it('medium gap (<=60 yrs) scores 2', () => {
    const tl = [makeEvent('x', 1800), makeEvent('y', 1850)]
    // gap = 50 → score 2
    expect(scoreSlot(tl, makeEvent('z', 1825), 1)).toBe(2)
  })

  it('wide gap (>60 yrs) scores 1', () => {
    const tl = [makeEvent('x', 1776), makeEvent('y', 1865)]
    // gap = 89 → score 1
    expect(scoreSlot(tl, makeEvent('z', 1803), 1)).toBe(1)
  })

  it('no neighbors scores 1', () => {
    expect(scoreSlot([], makeEvent('a', 1776), 0)).toBe(1)
  })

  it('only prev neighbor uses distance to prev', () => {
    const tl = [makeEvent('x', 1776)]
    // slot 1 (after x), no next. gap = 1830-1776 = 54 → score 2
    expect(scoreSlot(tl, makeEvent('z', 1830), 1)).toBe(2)
  })
})

// ---------------------------------------------------------------------------
// Seeded RNG & weighted pick
// ---------------------------------------------------------------------------

describe('seededRng', () => {
  it('returns values in [0, 1)', () => {
    const rng = seededRng(42)
    for (let i = 0; i < 20; i++) {
      const v = rng()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })

  it('is deterministic for same seed', () => {
    const r1 = seededRng(99)
    const r2 = seededRng(99)
    for (let i = 0; i < 10; i++) {
      expect(r1()).toBe(r2())
    }
  })
})

describe('weightedPick', () => {
  it('returns valid index', () => {
    const pool = [makeEvent('a', 1776), makeEvent('b', 1865), makeEvent('c', 1920)]
    const rng = seededRng(42)
    const idx = weightedPick(pool, {}, rng)
    expect(idx).toBeGreaterThanOrEqual(0)
    expect(idx).toBeLessThan(pool.length)
  })

  it('returns 0 for single-item pool', () => {
    expect(weightedPick([makeEvent('a', 1776)], {}, seededRng(1))).toBe(0)
  })

  it('returns -1 for empty pool', () => {
    expect(weightedPick([], {}, seededRng(1))).toBe(-1)
  })

  it('biases toward higher-weight events', () => {
    const pool = [makeEvent('a', 1776), makeEvent('b', 1865), makeEvent('c', 1920)]
    const weights = { b: 20 }
    const rng = seededRng(123)
    const counts: Record<string, number> = { a: 0, b: 0, c: 0 }
    for (let i = 0; i < 200; i++) {
      const idx = weightedPick(pool, weights, rng)
      counts[pool[idx].id]++
    }
    expect(counts.b).toBeGreaterThan(counts.a * 5)
    expect(counts.b).toBeGreaterThan(counts.c * 5)
  })
})

// ---------------------------------------------------------------------------
// applyPlacement – core behaviour
// ---------------------------------------------------------------------------

describe('applyPlacement – correct placement', () => {
  it('increments score (1 pt for wide gap) and inserts into timeline', () => {
    const state = buildState()
    const next = applyPlacement(state, 1) // 1803 between 1776 and 1865
    expect(next.score).toBe(1) // gap=89 → 1pt
    expect(next.attempts).toBe(1)
    expect(next.timeline).toHaveLength(3)
    expect(next.timeline[1].id).toBe('c')
    expect(next.current?.id).toBe('d')
    expect(next.pool).toHaveLength(0)
  })

  it('awards 3 points for a tight gap (<=20 years)', () => {
    const state: GameState = {
      ...buildState(),
      timeline: [makeEvent('a', 1800), makeEvent('b', 1810)],
      current: makeEvent('c', 1805),
      pool: [makeEvent('d', 1900)],
    }
    const next = applyPlacement(state, 1)
    expect(next.score).toBe(3)
  })

  it('increments streak and updates bestStreak', () => {
    const state = { ...buildState(), streak: 2, bestStreak: 2 }
    const next = applyPlacement(state, 1)
    expect(next.streak).toBe(3)
    expect(next.bestStreak).toBe(3)
  })

  it('marks done when pool empties', () => {
    const state = { ...buildState(), pool: [] }
    const next = applyPlacement(state, 1)
    expect(next.done).toBe(true)
    expect(next.current).toBeNull()
  })

  it('returns state unchanged if no current event', () => {
    const state = { ...buildState(), current: null }
    expect(applyPlacement(state, 1)).toEqual(state)
  })
})

describe('applyPlacement – wrong placement (normal mode)', () => {
  it('does not change timeline', () => {
    const state = buildState()
    const next = applyPlacement(state, 0) // wrong: 1803 cannot go before 1776
    expect(next.timeline).toHaveLength(2)
    expect(next.score).toBe(0)
    expect(next.attempts).toBe(1)
  })

  it('increases miss weight for current event', () => {
    const state = buildState()
    const next = applyPlacement(state, 0)
    expect(next.missWeights['c']).toBeGreaterThan(1)
  })

  it('resets streak to 0', () => {
    const state = { ...buildState(), streak: 5 }
    const next = applyPlacement(state, 0)
    expect(next.streak).toBe(0)
  })

  it('records event in missedIds', () => {
    const state = buildState()
    const next = applyPlacement(state, 0)
    expect(next.missedIds).toContain('c')
  })

  it('does not duplicate missedIds on repeated miss', () => {
    const state = { ...buildState(), missedIds: ['c'] }
    const next = applyPlacement(state, 0)
    expect(next.missedIds.filter((id) => id === 'c')).toHaveLength(1)
  })

  it('missed event stays in play (current or pool)', () => {
    const state = buildState()
    const next = applyPlacement(state, 0)
    const allIds = [next.current?.id, ...next.pool.map((e) => e.id)].filter(Boolean)
    expect(allIds).toContain('c')
  })

  it('does NOT set gameOver in normal mode', () => {
    const state = buildState()
    expect(applyPlacement(state, 0).gameOver).toBe(false)
  })
})

describe('applyPlacement – hard mode sudden death', () => {
  it('wrong placement sets gameOver=true', () => {
    const state = buildState()
    const next = applyPlacement(state, 0, { hardMode: true })
    expect(next.gameOver).toBe(true)
  })

  it('correct placement does NOT set gameOver', () => {
    const state = buildState()
    const next = applyPlacement(state, 1, { hardMode: true })
    expect(next.gameOver).toBe(false)
  })

  it('timeline unchanged on hard-mode wrong placement', () => {
    const state = buildState()
    const next = applyPlacement(state, 0, { hardMode: true })
    expect(next.timeline).toHaveLength(2)
  })

  it('score unchanged on hard-mode wrong placement', () => {
    const state = buildState()
    const next = applyPlacement(state, 0, { hardMode: true })
    expect(next.score).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// Spaced repetition – weighted draw
// ---------------------------------------------------------------------------

describe('spaced repetition via applyPlacement', () => {
  it('missed event resurfaces (is in pool or current after wrong)', () => {
    const rng = seededRng(42)
    const state: GameState = {
      ...buildState(),
      pool: [makeEvent('d', 1900), makeEvent('e', 1950)],
    }
    const next = applyPlacement(state, 0, { rng })
    const allIds = [next.current?.id, ...next.pool.map((e) => e.id)].filter(Boolean)
    expect(allIds).toContain('c')
  })

  it('miss weight increases on wrong, decays on correct', () => {
    let state = buildState()
    state = applyPlacement(state, 0) // wrong: weight for 'c' increases
    const weightAfterMiss = state.missWeights['c'] ?? 1

    // Now assume 'c' is still current, place correctly
    // First make 'c' current if it isn't
    if (state.current?.id !== 'c') {
      state = { ...state, current: makeEvent('c', 1803), pool: [...state.pool.filter((e) => e.id !== 'c')] }
    }
    state = applyPlacement(state, 1) // correct
    const weightAfterCorrect = state.missWeights['c'] ?? 1
    expect(weightAfterMiss).toBeGreaterThan(1)
    expect(weightAfterCorrect).toBeLessThanOrEqual(weightAfterMiss)
  })

  it('higher-weight events are drawn preferentially over 100 trials', () => {
    const pool = [
      makeEvent('a', 1776),
      makeEvent('b', 1865),
      makeEvent('c', 1920),
    ]
    const weights = { b: 15 }
    const rng = seededRng(7)
    const counts: Record<string, number> = { a: 0, b: 0, c: 0 }
    for (let i = 0; i < 100; i++) {
      const idx = weightedPick(pool, weights, rng)
      counts[pool[idx].id]++
    }
    expect(counts.b).toBeGreaterThan(counts.a * 3)
    expect(counts.b).toBeGreaterThan(counts.c * 3)
  })
})

// ---------------------------------------------------------------------------
// isGameOver
// ---------------------------------------------------------------------------

describe('isGameOver', () => {
  it('returns false for active game', () => {
    expect(isGameOver(buildState())).toBe(false)
  })

  it('returns true when done=true', () => {
    expect(isGameOver({ ...buildState(), done: true })).toBe(true)
  })

  it('returns true when gameOver=true', () => {
    expect(isGameOver({ ...buildState(), gameOver: true })).toBe(true)
  })

  it('hard-mode wrong placement results in isGameOver=true', () => {
    const state = buildState()
    const next = applyPlacement(state, 0, { hardMode: true })
    expect(isGameOver(next)).toBe(true)
  })

  it('normal-mode wrong placement does NOT trigger isGameOver', () => {
    const state = buildState()
    const next = applyPlacement(state, 0, { hardMode: false })
    expect(isGameOver(next)).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// drawNext (legacy)
// ---------------------------------------------------------------------------

describe('drawNext', () => {
  const baseState: GameState = {
    ...buildState(),
    timeline: [],
    current: null,
    pool: [makeEvent('a', 1776), makeEvent('b', 1865)],
  }

  it('draws from front of pool', () => {
    const next = drawNext(baseState)
    expect(next.current?.id).toBe('a')
    expect(next.pool).toHaveLength(1)
  })

  it('marks done when pool is empty', () => {
    const next = drawNext({ ...baseState, pool: [] })
    expect(next.done).toBe(true)
    expect(next.current).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// setTentativeSlot
// ---------------------------------------------------------------------------

describe('setTentativeSlot', () => {
  it('sets tentative slot', () => {
    expect(setTentativeSlot(buildState(), 3).tentativeSlot).toBe(3)
    expect(setTentativeSlot(buildState(), null).tentativeSlot).toBeNull()
  })
})

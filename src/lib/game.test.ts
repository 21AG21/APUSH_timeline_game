import { describe, it, expect } from 'vitest'
import { startGame, validSlots, checkPlacement, applyPlacement, drawNext, setTentativeSlot, shuffleArray } from './game'
import type { Event, GameState } from '../data/types'

const makeEvent = (id: string, year: number): Event => ({
  id,
  year,
  title: `Event ${id}`,
  description: 'desc',
  cause: 'cause',
  effect: 'effect',
  region: 'Region',
  units: [1],
  course: 'apush',
})

const events = [
  makeEvent('a', 1776),
  makeEvent('b', 1865),
  makeEvent('c', 1920),
  makeEvent('d', 1620),
  makeEvent('e', 1803),
]

describe('shuffleArray', () => {
  it('returns array of same length', () => {
    expect(shuffleArray(events)).toHaveLength(events.length)
  })
  it('contains same elements', () => {
    const shuffled = shuffleArray(events)
    expect(shuffled).toEqual(expect.arrayContaining(events))
  })
  it('does not mutate original', () => {
    const copy = [...events]
    shuffleArray(events)
    expect(events).toEqual(copy)
  })
})

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
  })

  it('timeline starts sorted', () => {
    const state = startGame(events)
    for (let i = 1; i < state.timeline.length; i++) {
      expect(state.timeline[i].year).toBeGreaterThanOrEqual(state.timeline[i - 1].year)
    }
  })
})

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

  it('returns all slots for empty timeline', () => {
    expect(validSlots([], 1776)).toEqual([0])
  })
})

describe('checkPlacement', () => {
  const timeline = [makeEvent('a', 1776), makeEvent('b', 1865)]

  it('accepts correct slot', () => {
    const e = makeEvent('c', 1803)
    expect(checkPlacement(timeline, e, 1)).toBe(true)
  })

  it('rejects wrong slot', () => {
    const e = makeEvent('c', 1803)
    expect(checkPlacement(timeline, e, 0)).toBe(false)
    expect(checkPlacement(timeline, e, 2)).toBe(false)
  })
})

describe('applyPlacement', () => {
  let state: GameState

  const buildState = (): GameState => ({
    timeline: [makeEvent('a', 1776), makeEvent('b', 1865)],
    current: makeEvent('c', 1803),
    pool: [makeEvent('d', 1920)],
    score: 0,
    attempts: 0,
    tentativeSlot: null,
    done: false,
  })

  it('correct placement increments score and inserts into timeline', () => {
    state = buildState()
    const next = applyPlacement(state, 1)
    expect(next.score).toBe(1)
    expect(next.attempts).toBe(1)
    expect(next.timeline).toHaveLength(3)
    expect(next.timeline[1].id).toBe('c')
    expect(next.current?.id).toBe('d')
    expect(next.pool).toHaveLength(0)
  })

  it('wrong placement does not change timeline', () => {
    state = buildState()
    const next = applyPlacement(state, 0)
    expect(next.score).toBe(0)
    expect(next.attempts).toBe(1)
    expect(next.timeline).toHaveLength(2)
    expect(next.current?.id).toBe('c')
  })

  it('marks done when pool empties', () => {
    state = { ...buildState(), pool: [] }
    const next = applyPlacement(state, 1)
    expect(next.done).toBe(true)
    expect(next.current).toBeNull()
  })

  it('returns state unchanged if no current event', () => {
    state = { ...buildState(), current: null }
    const next = applyPlacement(state, 1)
    expect(next).toEqual(state)
  })
})

describe('drawNext', () => {
  it('draws from pool', () => {
    const state: GameState = {
      timeline: [],
      current: null,
      pool: [makeEvent('a', 1776), makeEvent('b', 1865)],
      score: 0,
      attempts: 0,
      tentativeSlot: null,
      done: false,
    }
    const next = drawNext(state)
    expect(next.current?.id).toBe('a')
    expect(next.pool).toHaveLength(1)
  })

  it('marks done when pool is empty', () => {
    const state: GameState = {
      timeline: [],
      current: null,
      pool: [],
      score: 0,
      attempts: 0,
      tentativeSlot: null,
      done: false,
    }
    const next = drawNext(state)
    expect(next.done).toBe(true)
    expect(next.current).toBeNull()
  })
})

describe('setTentativeSlot', () => {
  it('sets tentative slot', () => {
    const state: GameState = {
      timeline: [],
      current: null,
      pool: [],
      score: 0,
      attempts: 0,
      tentativeSlot: null,
      done: false,
    }
    expect(setTentativeSlot(state, 3).tentativeSlot).toBe(3)
    expect(setTentativeSlot(state, null).tentativeSlot).toBeNull()
  })
})

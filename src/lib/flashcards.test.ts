import { describe, it, expect } from 'vitest'
import apush from '../data/apush.json'
import type { Event } from '../data/types'
import {
  applyFilter,
  buildCards,
  buildQueue,
  deckStats,
  getProgress,
  grade,
  INTERVALS,
  MAX_BOX,
  maskYear,
  newProgress,
  type Card,
  type ProgressMap,
} from './flashcards'

const events = apush as Event[]
const cards = buildCards(events)
const DAY = 86_400_000

describe('card generation', () => {
  it('builds cards for every event', () => {
    const covered = new Set(cards.map((c) => c.eventId))
    expect(covered.size).toBe(events.length)
  })

  it('gives every event a date card and an identification card', () => {
    for (const e of events) {
      expect(cards.find((c) => c.eventId === e.id && c.kind === 'when')).toBeTruthy()
      expect(cards.find((c) => c.eventId === e.id && c.kind === 'what')).toBeTruthy()
    }
  })

  it('assigns unique, stable ids', () => {
    const ids = cards.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
    // Rebuilding must produce identical ids or scheduling would be lost on every deploy.
    expect(buildCards(events).map((c) => c.id)).toEqual(ids)
  })

  it('never emits a card with an empty answer', () => {
    for (const c of cards) {
      expect(c.answer.length).toBeGreaterThan(0)
      for (const a of c.answer) expect(a.trim()).not.toBe('')
    }
  })

  /**
   * The whole point of a date card is recalling the date. Titles like
   * "Election of 1828" and descriptions that restate the year would give it away.
   */
  it('does not leak the year in prompts that ask for the year', () => {
    const leaks = cards
      .filter((c) => c.kind === 'when' || c.kind === 'what')
      .filter((c) => new RegExp(`\\b${c.year}\\b`).test(c.prompt))
      .map((c) => c.id)
    expect(leaks).toEqual([])
  })

  it('masks only the event year, leaving other years readable', () => {
    expect(maskYear('Election of 1828 followed 1824', 1828)).toBe('Election of ____ followed 1824')
    expect(maskYear('Compromise of 1850', 1850)).toBe('Compromise of ____')
    // Must not match inside a longer number.
    expect(maskYear('18280 people', 1828)).toBe('18280 people')
  })

  it('carries the event units onto each card', () => {
    for (const c of cards) {
      const e = events.find((x) => x.id === c.eventId)!
      expect(c.units).toEqual(e.units)
    }
  })
})

describe('scheduling', () => {
  it('promotes one box on recall and caps at the top box', () => {
    let p = newProgress()
    for (let i = 0; i < MAX_BOX + 3; i++) p = grade(p, true, 0)
    expect(p.box).toBe(MAX_BOX)
    expect(p.seen).toBe(MAX_BOX + 3)
    expect(p.lapses).toBe(0)
  })

  it('drops back to box 0 on a miss and counts the lapse', () => {
    let p = grade(grade(newProgress(), true, 0), true, 0)
    expect(p.box).toBe(2)
    p = grade(p, false, 0)
    expect(p.box).toBe(0)
    expect(p.lapses).toBe(1)
    expect(p.due).toBe(0) // box 0 is due immediately
  })

  it('spaces each box further out than the last', () => {
    for (let b = 1; b < INTERVALS.length; b++) {
      expect(INTERVALS[b]).toBeGreaterThan(INTERVALS[b - 1])
    }
  })

  it('schedules a recalled card into the future', () => {
    const now = 1_000_000
    expect(grade(newProgress(), true, now).due).toBe(now + INTERVALS[1] * DAY)
  })
})

describe('queue', () => {
  const sample = cards.slice(0, 6)

  it('returns only due cards', () => {
    const now = 1_000_000
    const progress: ProgressMap = { [sample[0].id]: { box: 3, due: now + DAY, seen: 4, lapses: 0 } }
    const q = buildQueue(sample, progress, now)
    expect(q.find((c) => c.id === sample[0].id)).toBeUndefined()
    expect(q.length).toBe(sample.length - 1)
  })

  it('shows unseen cards before ones already in rotation', () => {
    const now = 1_000_000
    const progress: ProgressMap = { [sample[0].id]: { box: 1, due: now - DAY, seen: 2, lapses: 0 } }
    const q = buildQueue(sample, progress, now)
    expect(q[q.length - 1].id).toBe(sample[0].id)
  })

  it('is deterministic, so a reload resumes the same queue', () => {
    expect(buildQueue(sample, {}, 5).map((c) => c.id)).toEqual(buildQueue(sample, {}, 5).map((c) => c.id))
  })
})

describe('filtering', () => {
  it('filters by unit', () => {
    const out = applyFilter(cards, { units: [3], kinds: [] })
    expect(out.length).toBeGreaterThan(0)
    for (const c of out) expect(c.units).toContain(3)
  })

  it('filters by card kind', () => {
    const out = applyFilter(cards, { units: [], kinds: ['causes'] })
    expect(out.length).toBeGreaterThan(0)
    for (const c of out) expect(c.kind).toBe('causes')
  })

  it('treats empty filters as no filter', () => {
    expect(applyFilter(cards, { units: [], kinds: [] }).length).toBe(cards.length)
  })

  it('every unit yields a non-empty deck', () => {
    for (let u = 1; u <= 9; u++) {
      expect(applyFilter(cards, { units: [u], kinds: [] }).length).toBeGreaterThan(0)
    }
  })
})

describe('stats', () => {
  it('counts new, learning, mastered and due without double counting', () => {
    const now = 2_000_000
    const sample: Card[] = cards.slice(0, 5)
    const progress: ProgressMap = {
      [sample[0].id]: { box: MAX_BOX, due: now + DAY, seen: 9, lapses: 0 },
      [sample[1].id]: { box: 2, due: now - 1, seen: 3, lapses: 1 },
    }
    const s = deckStats(sample, progress, now)
    expect(s.total).toBe(5)
    expect(s.mastered).toBe(1)
    expect(s.learning).toBe(1)
    expect(s.unseen).toBe(3)
    expect(s.unseen + s.learning + s.mastered).toBe(s.total)
    expect(s.due).toBe(4) // the 3 unseen plus the overdue one
  })

  it('reports the next due time when nothing is due now', () => {
    const now = 2_000_000
    const c = cards[0]
    const s = deckStats([c], { [c.id]: { box: 1, due: now + 5000, seen: 1, lapses: 0 } }, now)
    expect(s.due).toBe(0)
    expect(s.nextDue).toBe(now + 5000)
  })
})

describe('progress lookup', () => {
  it('treats an unknown card as new', () => {
    expect(getProgress({}, 'nope').seen).toBe(0)
    expect(getProgress({}, 'nope').box).toBe(0)
  })
})

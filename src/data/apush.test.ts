import { describe, it, expect } from 'vitest'
import apushEvents from './apush.json'
import type { Event } from './types'

const events = apushEvents as Event[]

/**
 * Official College Board APUSH period boundaries. Periods deliberately overlap
 * at their edges (e.g. 1865 falls in both Period 5 and Period 6), so an event
 * may legitimately carry more than one unit — but every unit it carries must
 * actually contain its year.
 */
const PERIOD_RANGES: Record<number, [number, number]> = {
  1: [1491, 1607],
  2: [1607, 1754],
  3: [1754, 1800],
  4: [1800, 1848],
  5: [1844, 1877],
  6: [1865, 1898],
  7: [1890, 1945],
  8: [1945, 1980],
  9: [1980, 2100],
}

describe('apush dataset integrity', () => {
  it('has a non-trivial number of events', () => {
    expect(events.length).toBeGreaterThan(50)
  })

  it('has unique ids', () => {
    const seen = new Map<string, number>()
    events.forEach((e) => seen.set(e.id, (seen.get(e.id) ?? 0) + 1))
    const dupes = [...seen].filter(([, c]) => c > 1).map(([id]) => id)
    expect(dupes).toEqual([])
  })

  it('has unique titles', () => {
    const seen = new Map<string, number>()
    events.forEach((e) => seen.set(e.title.toLowerCase(), (seen.get(e.title.toLowerCase()) ?? 0) + 1))
    const dupes = [...seen].filter(([, c]) => c > 1).map(([t]) => t)
    expect(dupes).toEqual([])
  })

  it('has every required field populated', () => {
    const missing: string[] = []
    events.forEach((e) => {
      if (!e.id) missing.push(`${e.id}: id`)
      if (!e.title?.trim()) missing.push(`${e.id}: title`)
      if (!e.description?.trim()) missing.push(`${e.id}: description`)
      if (!e.cause?.trim()) missing.push(`${e.id}: cause`)
      if (!e.effect?.trim()) missing.push(`${e.id}: effect`)
      if (!e.region?.trim()) missing.push(`${e.id}: region`)
      if (e.course !== 'apush') missing.push(`${e.id}: course`)
    })
    expect(missing).toEqual([])
  })

  it('has non-empty causes, effects, and significance lists', () => {
    const empty: string[] = []
    events.forEach((e) => {
      if (!Array.isArray(e.causes) || e.causes.length === 0) empty.push(`${e.id}: causes`)
      if (!Array.isArray(e.effects) || e.effects.length === 0) empty.push(`${e.id}: effects`)
      if (!Array.isArray(e.significance) || e.significance.length === 0) {
        empty.push(`${e.id}: significance`)
      }
    })
    expect(empty).toEqual([])
  })

  it('has plausible integer years', () => {
    const bad = events
      .filter((e) => !Number.isInteger(e.year) || e.year < 1400 || e.year > 2030)
      .map((e) => `${e.id}: ${e.year}`)
    expect(bad).toEqual([])
  })

  it('assigns every event to at least one valid unit', () => {
    const bad = events
      .filter((e) => !Array.isArray(e.units) || e.units.length === 0)
      .map((e) => e.id)
    expect(bad).toEqual([])

    const unknown = events
      .flatMap((e) => e.units.map((u) => ({ id: e.id, u })))
      .filter(({ u }) => !(u in PERIOD_RANGES))
      .map(({ id, u }) => `${id}: unit ${u}`)
    expect(unknown).toEqual([])
  })

  it("places every event's year inside every unit it is tagged with", () => {
    const mismatched = events
      .map((e) => {
        const invalid = e.units.filter((u) => {
          const range = PERIOD_RANGES[u]
          return !(range && e.year >= range[0] && e.year <= range[1])
        })
        if (invalid.length === 0) return null
        const expected = Object.entries(PERIOD_RANGES)
          .filter(([, [lo, hi]]) => e.year >= lo && e.year <= hi)
          .map(([u]) => u)
          .join('/')
        return `${e.year} ${e.title}: tagged [${e.units}], unit ${invalid} excludes that year (belongs to ${expected})`
      })
      .filter(Boolean)
    expect(mismatched).toEqual([])
  })

  it('never states a year in the title that contradicts the year field', () => {
    const conflicts = events
      .map((e) => {
        const m = e.title.match(/\b(1[4-9]\d{2}|20[0-2]\d)\b/)
        return m && Number(m[1]) !== e.year ? `${e.title} vs year ${e.year}` : null
      })
      .filter(Boolean)
    expect(conflicts).toEqual([])
  })

  it('covers all nine units', () => {
    const covered = new Set(events.flatMap((e) => e.units))
    const missing = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((u) => !covered.has(u))
    expect(missing).toEqual([])
  })

  it('gives every unit enough events to be playable on its own', () => {
    const thin = [1, 2, 3, 4, 5, 6, 7, 8, 9]
      .map((u) => ({ u, n: events.filter((e) => e.units.includes(u)).length }))
      .filter(({ n }) => n < 5)
      .map(({ u, n }) => `unit ${u}: only ${n} events`)
    expect(thin).toEqual([])
  })
})

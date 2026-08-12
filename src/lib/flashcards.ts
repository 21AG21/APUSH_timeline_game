import type { Event } from '../data/types'

/**
 * Flashcards are derived from the event data rather than authored separately, so
 * a correction to an event propagates to every card drawn from it and the two can
 * never drift apart.
 */
export type CardKind = 'when' | 'what' | 'causes' | 'effects' | 'significance' | 'period'

export interface Card {
  /** Stable across rebuilds: scheduling survives dataset edits. */
  id: string
  eventId: string
  kind: CardKind
  prompt: string
  /** Rendered as a list when there is more than one line. */
  answer: string[]
  /** Shown under the answer for context, never as the thing being recalled. */
  footnote: string
  year: number
  units: number[]
}

export interface CardProgress {
  /** Leitner box. 0 = new or just missed. */
  box: number
  /** Epoch ms when this card next comes up. */
  due: number
  seen: number
  lapses: number
}

export type ProgressMap = Record<string, CardProgress>

export const PERIOD_LABEL: Record<number, string> = {
  1: '1491–1607',
  2: '1607–1754',
  3: '1754–1800',
  4: '1800–1848',
  5: '1844–1877',
  6: '1865–1898',
  7: '1890–1945',
  8: '1945–1980',
  9: '1980–present',
}

/** Leitner intervals in days, indexed by box. Box 0 is due immediately. */
export const INTERVALS = [0, 1, 3, 7, 16, 35]
export const MAX_BOX = INTERVALS.length - 1
const DAY = 86_400_000

/**
 * Blank out the event's own year wherever it appears in a prompt. Ten titles in the
 * deck name their year ("Election of 1828", "Compromise of 1850") and many
 * descriptions repeat it, which would hand over the answer on any card that asks
 * for the date. Only prompts need this — footnotes are shown after the reveal.
 */
export function maskYear(text: string, year: number): string {
  return text.replace(new RegExp(`\\b${year}\\b`, 'g'), '____')
}

export const KIND_LABEL: Record<CardKind, string> = {
  when: 'Date',
  what: 'Identify',
  causes: 'Causes',
  effects: 'Effects',
  significance: 'Significance',
  period: 'Period',
}

/**
 * Six angles on each event. Recognising a name is not the same as being able to
 * state what caused it, so each is scheduled independently.
 */
export function buildCards(events: Event[]): Card[] {
  const cards: Card[] = []
  const add = (e: Event, kind: CardKind, prompt: string, answer: string[], footnote = '') => {
    if (!answer.length || answer.every((a) => !a.trim())) return
    cards.push({ id: `${e.id}:${kind}`, eventId: e.id, kind, prompt, answer, footnote, year: e.year, units: e.units })
  }

  for (const e of events) {
    add(e, 'when', `In what year did this happen?\n\n${maskYear(e.title, e.year)}`, [String(e.year)], e.description)
    add(e, 'what', `Which event is this?\n\n${maskYear(e.description, e.year)}`, [`${e.title} (${e.year})`])
    add(e, 'causes', `What led to ${e.title}?`, e.causes, `${e.title}, ${e.year}`)
    add(e, 'effects', `What followed from ${e.title}?`, e.effects, `${e.title}, ${e.year}`)
    add(e, 'significance', `Why does ${e.title} matter?`, e.significance, `${e.title}, ${e.year}`)
    add(
      e,
      'period',
      `Which AP period does this belong to?\n\n${e.title}`,
      e.units.map((u) => `Unit ${u} — ${PERIOD_LABEL[u] ?? ''}`),
      `${e.title}, ${e.year}`
    )
  }
  return cards
}

export function newProgress(): CardProgress {
  return { box: 0, due: 0, seen: 0, lapses: 0 }
}

export function getProgress(map: ProgressMap, id: string): CardProgress {
  return map[id] ?? newProgress()
}

/** Promote on recall, reset to box 0 on a miss. */
export function grade(prev: CardProgress, got: boolean, now: number): CardProgress {
  const box = got ? Math.min(prev.box + 1, MAX_BOX) : 0
  return {
    box,
    due: now + INTERVALS[box] * DAY,
    seen: prev.seen + 1,
    lapses: prev.lapses + (got ? 0 : 1),
  }
}

export function isDue(p: CardProgress, now: number): boolean {
  return p.due <= now
}

export interface DeckFilter {
  units: number[]
  kinds: CardKind[]
}

export function applyFilter(cards: Card[], filter: DeckFilter): Card[] {
  return cards.filter(
    (c) =>
      (!filter.units.length || c.units.some((u) => filter.units.includes(u))) &&
      (!filter.kinds.length || filter.kinds.includes(c.kind))
  )
}

/**
 * Due cards, unseen first so a new deck introduces material before drilling it,
 * then by how overdue they are. Ordering is deterministic — no RNG — so a
 * reload mid-session resumes the same queue rather than reshuffling.
 */
export function buildQueue(cards: Card[], progress: ProgressMap, now: number): Card[] {
  return cards
    .map((c) => ({ c, p: getProgress(progress, c.id) }))
    .filter(({ p }) => isDue(p, now))
    .sort((a, b) => {
      if (a.p.seen === 0 !== (b.p.seen === 0)) return a.p.seen === 0 ? -1 : 1
      if (a.p.due !== b.p.due) return a.p.due - b.p.due
      return a.c.id.localeCompare(b.c.id)
    })
    .map(({ c }) => c)
}

export interface DeckStats {
  total: number
  due: number
  unseen: number
  learning: number
  mastered: number
  nextDue: number | null
}

export function deckStats(cards: Card[], progress: ProgressMap, now: number): DeckStats {
  let due = 0
  let unseen = 0
  let learning = 0
  let mastered = 0
  let nextDue: number | null = null

  for (const c of cards) {
    const p = getProgress(progress, c.id)
    if (p.seen === 0) unseen++
    else if (p.box >= MAX_BOX) mastered++
    else learning++
    if (isDue(p, now)) due++
    else if (nextDue === null || p.due < nextDue) nextDue = p.due
  }
  return { total: cards.length, due, unseen, learning, mastered, nextDue }
}

export function formatWhenDue(ms: number, now: number): string {
  const d = Math.max(0, ms - now)
  if (d < 60_000) return 'now'
  if (d < 3_600_000) return `${Math.round(d / 60_000)} min`
  if (d < DAY) return `${Math.round(d / 3_600_000)} h`
  return `${Math.round(d / DAY)} d`
}

import { useMemo, useState } from 'react'
import type { Event } from '../data/types'
import {
  applyFilter,
  buildCards,
  buildQueue,
  deckStats,
  formatWhenDue,
  getProgress,
  grade,
  KIND_LABEL,
  MAX_BOX,
  PERIOD_LABEL,
  type CardKind,
  type ProgressMap,
} from '../lib/flashcards'

interface Props {
  allEvents: Event[]
  progress: ProgressMap
  onProgress: (next: ProgressMap) => void
  onClose: () => void
}

const KINDS: CardKind[] = ['when', 'what', 'causes', 'effects', 'significance', 'period']
const UNITS = [1, 2, 3, 4, 5, 6, 7, 8, 9]

export function Flashcards({ allEvents, progress, onProgress, onClose }: Props) {
  const [units, setUnits] = useState<number[]>([])
  const [kinds, setKinds] = useState<CardKind[]>([])
  const [revealed, setRevealed] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  // Frozen at mount so a card graded to "due in 1 day" does not vanish and
  // reflow the queue underneath the user mid-session.
  const [now] = useState(() => Date.now())
  const [graded, setGraded] = useState(0)

  const all = useMemo(() => buildCards(allEvents), [allEvents])
  const deck = useMemo(() => applyFilter(all, { units, kinds }), [all, units, kinds])
  const stats = useMemo(() => deckStats(deck, progress, now), [deck, progress, now])
  const queue = useMemo(() => buildQueue(deck, progress, now), [deck, progress, now])

  const card = queue[0] ?? null

  const answer = (got: boolean) => {
    if (!card) return
    onProgress({ ...progress, [card.id]: grade(getProgress(progress, card.id), got, Date.now()) })
    setRevealed(false)
    setGraded((n) => n + 1)
  }

  const toggle = <T,>(list: T[], v: T, set: (n: T[]) => void) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v])

  const box = card ? getProgress(progress, card.id).box : 0

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-3 border-b border-om-border">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-om-text leading-none">Flashcards</h2>
          <p className="mt-1 text-xs text-om-muted">
            {stats.due} due · {stats.unseen} new · {stats.mastered} mastered · {stats.total} total
          </p>
        </div>
        <button
          onClick={onClose}
          aria-label="Close flashcards"
          className="h-11 w-11 shrink-0 rounded-full text-om-muted text-3xl leading-none active:bg-om-slot-hover"
        >
          ×
        </button>
      </div>

      <div className="shrink-0 px-4 sm:px-6 py-2 border-b border-om-border flex items-center gap-2">
        <button
          onClick={() => setFiltersOpen((o) => !o)}
          className="h-10 px-4 rounded-full border border-om-border text-sm font-medium text-om-text active:bg-om-slot-hover"
        >
          Filter{units.length || kinds.length ? ` (${units.length + kinds.length})` : ''}
        </button>
        {(units.length > 0 || kinds.length > 0) && (
          <button
            onClick={() => {
              setUnits([])
              setKinds([])
            }}
            className="h-10 px-3 text-sm text-om-muted underline"
          >
            Clear
          </button>
        )}
        <span className="ml-auto text-xs text-om-muted tabular-nums">{graded} done this session</span>
      </div>

      {filtersOpen && (
        <div className="shrink-0 px-4 sm:px-6 py-3 border-b border-om-border bg-om-bg space-y-3">
          <div>
            <p className="text-xs font-semibold text-om-muted mb-1.5">Period</p>
            <div className="flex flex-wrap gap-1.5">
              {UNITS.map((u) => (
                <button
                  key={u}
                  onClick={() => toggle(units, u, setUnits)}
                  className={`h-9 px-3 rounded-full text-xs font-medium border transition-colors ${
                    units.includes(u)
                      ? 'bg-om-accent border-om-accent text-om-accent-fg'
                      : 'border-om-border text-om-muted active:bg-om-slot-hover'
                  }`}
                >
                  {u} · {PERIOD_LABEL[u]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-om-muted mb-1.5">Card type</p>
            <div className="flex flex-wrap gap-1.5">
              {KINDS.map((k) => (
                <button
                  key={k}
                  onClick={() => toggle(kinds, k, setKinds)}
                  className={`h-9 px-3 rounded-full text-xs font-medium border transition-colors ${
                    kinds.includes(k)
                      ? 'bg-om-accent border-om-accent text-om-accent-fg'
                      : 'border-om-border text-om-muted active:bg-om-slot-hover'
                  }`}
                >
                  {KIND_LABEL[k]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="scroll-pane flex-1 min-h-0 overflow-y-auto p-4 sm:p-6">
        {!card ? (
          <div className="h-full flex flex-col items-center justify-center text-center gap-3 py-12">
            <p className="text-2xl font-serif font-bold text-om-text">
              {deck.length === 0 ? 'No cards match' : 'All caught up'}
            </p>
            <p className="text-sm text-om-muted max-w-xs">
              {deck.length === 0
                ? 'Widen the filter to bring cards back.'
                : stats.nextDue !== null
                  ? `Next card is due in ${formatWhenDue(stats.nextDue, Date.now())}. Spacing the reviews out is what makes them stick.`
                  : 'Nothing left to review.'}
            </p>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-0.5 rounded bg-om-tag text-[0.7rem] font-semibold text-om-muted uppercase tracking-wide">
                {KIND_LABEL[card.kind]}
              </span>
              <span className="text-[0.7rem] text-om-muted">
                {card.units.map((u) => `Unit ${u}`).join(', ')}
              </span>
              <span className="ml-auto text-[0.7rem] text-om-muted tabular-nums">
                {box === 0 ? 'new' : `box ${box}/${MAX_BOX}`}
              </span>
            </div>

            <div className="bg-om-surface border border-om-border rounded-xl p-5 sm:p-6 min-h-[9rem] flex items-center">
              <p className="text-lg sm:text-xl font-medium text-om-text whitespace-pre-line leading-snug">
                {card.prompt}
              </p>
            </div>

            {!revealed ? (
              <button
                onClick={() => setRevealed(true)}
                className="mt-4 w-full h-14 rounded-xl bg-om-accent text-om-accent-fg text-base font-semibold active:bg-om-accent-hover"
              >
                Show answer
              </button>
            ) : (
              <>
                <div className="mt-4 bg-om-accent-light border border-om-border rounded-xl p-5">
                  {card.answer.length === 1 ? (
                    <p className="text-lg font-semibold text-om-text">{card.answer[0]}</p>
                  ) : (
                    <ul className="space-y-1.5">
                      {card.answer.map((a, i) => (
                        <li key={i} className="text-base text-om-text flex gap-2">
                          <span className="text-om-gold">•</span>
                          <span>{a}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {card.footnote && (
                    <p className="mt-3 pt-3 border-t border-om-border text-sm text-om-muted">
                      {card.footnote}
                    </p>
                  )}
                </div>

                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => answer(false)}
                    className="flex-1 h-14 rounded-xl border-2 border-om-error text-om-error text-base font-semibold active:bg-om-error-bg"
                  >
                    Again
                  </button>
                  <button
                    onClick={() => answer(true)}
                    className="flex-1 h-14 rounded-xl bg-om-success text-om-accent-fg text-base font-semibold active:opacity-90"
                  >
                    Got it
                  </button>
                </div>
              </>
            )}

            <p className="mt-4 text-center text-xs text-om-muted">
              {queue.length} due in this deck
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

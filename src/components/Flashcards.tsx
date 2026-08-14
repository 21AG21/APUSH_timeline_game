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
import { Ghost } from './ui'

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
      <div className="shrink-0 flex items-start justify-between gap-3 px-4 sm:px-6 py-3 rule-double">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-om-text leading-none">
            Flashcards
          </h2>
          <p className="label-mono mt-2 text-om-muted">
            {stats.due} due · {stats.unseen} new · {stats.mastered} mastered · {stats.total} total
          </p>
        </div>
        <button
          onClick={onClose}
          aria-label="Close flashcards"
          className="h-11 w-11 shrink-0 text-om-muted hover:text-om-text text-3xl leading-none"
        >
          ×
        </button>
      </div>

      <div className="shrink-0 px-4 sm:px-6 py-2 border-b border-om-border flex items-center gap-2">
        <Ghost onClick={() => setFiltersOpen((o) => !o)} className="h-10">
          Filter{units.length || kinds.length ? ` (${units.length + kinds.length})` : ''}
        </Ghost>
        {(units.length > 0 || kinds.length > 0) && (
          <button
            onClick={() => {
              setUnits([])
              setKinds([])
            }}
            className="label-mono h-10 px-2 text-om-muted underline"
          >
            Clear
          </button>
        )}
        <span className="label-mono ml-auto text-om-muted">{graded} done this session</span>
      </div>

      {filtersOpen && (
        <div className="shrink-0 px-4 sm:px-6 py-3 border-b border-om-border bg-om-surface space-y-3">
          <div>
            <p className="label-mono text-om-muted mb-1.5">Period</p>
            <div className="flex flex-wrap gap-1.5">
              {UNITS.map((u) => (
                <Chip
                  key={u}
                  label={`${u} · ${PERIOD_LABEL[u]}`}
                  active={units.includes(u)}
                  onClick={() => toggle(units, u, setUnits)}
                />
              ))}
            </div>
          </div>
          <div>
            <p className="label-mono text-om-muted mb-1.5">Card type</p>
            <div className="flex flex-wrap gap-1.5">
              {KINDS.map((k) => (
                <Chip
                  key={k}
                  label={KIND_LABEL[k]}
                  active={kinds.includes(k)}
                  onClick={() => toggle(kinds, k, setKinds)}
                />
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
            <p className="text-sm text-om-body max-w-xs">
              {deck.length === 0
                ? 'Widen the filter to bring cards back.'
                : stats.nextDue !== null
                  ? `Next card is due in ${formatWhenDue(stats.nextDue, now)}. Spacing the reviews out is what makes them stick.`
                  : 'Nothing left to review.'}
            </p>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="label-mono text-om-accent">{KIND_LABEL[card.kind]}</span>
              {/* Letter-spaced mono runs two labels together without a mark
                  between them, so the separator is explicit. */}
              <span aria-hidden className="label-mono text-om-border">&middot;</span>
              <span className="label-mono text-om-muted">
                {card.units.map((u) => `Unit ${u}`).join(', ')}
              </span>
              <span className="label-mono ml-auto text-om-muted">
                {box === 0 ? 'new' : `box ${box}/${MAX_BOX}`}
              </span>
            </div>

            <div className="bg-om-card border border-om-border border-t-[3px] border-t-om-accent p-5 sm:p-6 min-h-[9rem] flex items-center">
              <p className="font-serif text-lg sm:text-xl font-bold text-om-text whitespace-pre-line leading-snug">
                {card.prompt}
              </p>
            </div>

            {!revealed ? (
              <button
                onClick={() => setRevealed(true)}
                className="label-mono mt-3 w-full h-14 bg-om-accent border border-om-accent text-om-accent-fg hover:bg-om-accent-hover transition-colors"
              >
                Show answer
              </button>
            ) : (
              <>
                <div className="mt-3 bg-om-accent-light border border-om-border border-l-[3px] border-l-om-accent p-5">
                  {card.answer.length === 1 ? (
                    <p className="font-serif text-lg font-bold text-om-text">{card.answer[0]}</p>
                  ) : (
                    <ul className="space-y-2">
                      {card.answer.map((a, i) => (
                        <li key={i} className="text-base leading-relaxed text-om-text flex gap-3">
                          <span className="label-mono text-om-gold pt-[0.3rem] shrink-0">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          <span>{a}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {card.footnote && (
                    <p className="mt-3 pt-3 border-t border-om-border text-sm leading-relaxed text-om-body">
                      {card.footnote}
                    </p>
                  )}
                </div>

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => answer(false)}
                    className="label-mono flex-1 h-14 border border-om-error text-om-error hover:bg-om-error-bg transition-colors"
                  >
                    Again
                  </button>
                  <button
                    onClick={() => answer(true)}
                    className="label-mono flex-1 h-14 bg-om-accent border border-om-accent text-om-accent-fg hover:bg-om-accent-hover transition-colors"
                  >
                    Got it
                  </button>
                </div>
              </>
            )}

            <p className="label-mono mt-4 text-center text-om-muted">
              {queue.length} due in this deck
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      aria-pressed={active}
      onClick={onClick}
      className={`inline-flex items-center h-9 px-2.5 text-sm border transition-colors ${
        active
          ? 'bg-om-accent border-om-accent text-om-accent-fg font-semibold'
          : 'border-om-border text-om-muted hover:text-om-text'
      }`}
    >
      {label}
    </button>
  )
}

import { useState } from 'react'
import type { Event, Note } from '../data/types'

interface Props {
  event: Event
  index: number
  hideDates: boolean
  hardMode: boolean
  note?: Note
  /** Mobile: collapse to a single row so several events fit on screen. */
  compact?: boolean
}

/** A card already filed in the record: ruled box, left accent rail, indexed. */
export function EventCard({ event, index, hideDates, hardMode, note, compact }: Props) {
  const [expanded, setExpanded] = useState(false)
  const showDetails = !compact || expanded
  const hasDetails = !hardMode || !!note

  return (
    <div
      onClick={compact && hasDetails ? () => setExpanded((v) => !v) : undefined}
      className={`bg-om-surface border border-om-border border-l-[3px] border-l-om-accent ${
        compact ? 'px-3 py-2.5 active:bg-om-slot-hover' : 'px-5 py-4'
      }`}
    >
      <div className="flex items-baseline justify-between gap-3">
        <div className="flex items-baseline gap-3 min-w-0">
          <span className="label-mono shrink-0 text-om-muted">
            {String(index + 1).padStart(2, '0')}
          </span>
          <h3
            className={`font-serif font-bold text-om-text leading-tight ${
              compact ? 'text-base' : 'text-xl'
            }`}
          >
            {event.title}
          </h3>
        </div>
        <div className="flex items-baseline gap-2 shrink-0">
          {!hideDates && (
            <span className="font-serif font-bold text-om-accent tabular-nums">{event.year}</span>
          )}
          {compact && hasDetails && (
            <span className="text-om-muted text-[0.6rem] leading-none">
              {expanded ? '▲' : '▼'}
            </span>
          )}
        </div>
      </div>

      {showDetails && (
        <div className={compact ? 'mt-2' : 'mt-2 ml-[3.25rem]'}>
          <p className="text-sm leading-relaxed text-om-body">{event.description}</p>

          {!hardMode && (
            <LabelledRows
              rows={[
                { label: 'Cause', text: event.cause, tone: 'accent' },
                { label: 'Effect', text: event.effect, tone: 'gold' },
              ]}
            />
          )}

          {note && (
            <div className="mt-3 border-t border-om-border pt-3">
              <p className="label-mono text-om-note-title mb-1.5">Your notes</p>
              <LabelledRows
                bare
                rows={[
                  { label: 'Cause', text: note.cause, tone: 'accent' },
                  { label: 'Effect', text: note.effect, tone: 'gold' },
                  { label: 'Meaning', text: note.significance, tone: 'muted' },
                ]}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

type Tone = 'accent' | 'gold' | 'muted'

const TONE: Record<Tone, string> = {
  accent: 'text-om-accent',
  gold: 'text-om-gold',
  muted: 'text-om-muted',
}

/**
 * Two-column ledger of stamped label against prose — the pattern used wherever
 * cause, effect and significance appear together.
 */
export function LabelledRows({
  rows,
  bare,
}: {
  rows: { label: string; text?: string; tone: Tone }[]
  /** Skip the leading rule, for use inside a block that already has one. */
  bare?: boolean
}) {
  const present = rows.filter((r) => r.text)
  if (present.length === 0) return null

  return (
    <div
      className={`grid grid-cols-[3.75rem_1fr] gap-x-3 gap-y-2 ${
        bare ? '' : 'mt-3 border-t border-om-border pt-3'
      }`}
    >
      {present.map((r) => (
        <div key={r.label} className="contents">
          <div className={`label-mono pt-[0.2rem] ${TONE[r.tone]}`}>{r.label}</div>
          <div className="text-sm leading-relaxed text-om-body">{r.text}</div>
        </div>
      ))}
    </div>
  )
}

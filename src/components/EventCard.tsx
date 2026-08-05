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

export function EventCard({ event, index, hideDates, hardMode, note, compact }: Props) {
  const [expanded, setExpanded] = useState(false)
  const showDetails = !compact || expanded
  const hasDetails = !hardMode || !!note

  return (
    <div
      onClick={compact && hasDetails ? () => setExpanded((v) => !v) : undefined}
      className={`bg-om-surface border border-om-border rounded-lg shadow-sm ${
        compact ? 'px-3 py-2.5 active:bg-om-slot-hover' : 'p-5'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-baseline gap-2 min-w-0">
          <span className="text-xs font-bold text-om-muted shrink-0 tabular-nums">
            {index + 1}
          </span>
          <h3
            className={`font-bold text-om-text leading-tight ${
              compact ? 'text-base' : 'text-xl'
            }`}
          >
            {event.title}
          </h3>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {!hideDates && (
            <span className="text-sm font-mono text-om-muted">{event.year}</span>
          )}
          {compact && hasDetails && (
            <span className="text-om-muted text-xs leading-none">{expanded ? '▲' : '▼'}</span>
          )}
        </div>
      </div>

      {showDetails && (
        <div className={compact ? 'mt-2' : ''}>
          <p className={`text-sm text-om-muted ${compact ? '' : 'mt-1 ml-7'}`}>
            {event.description}
          </p>

          {!hardMode && (
            <div className={`space-y-1 ${compact ? 'mt-2' : 'mt-2 ml-7'}`}>
              <p className="text-sm text-om-muted">
                <span className="font-semibold text-om-gold">Cause:</span> {event.cause}
              </p>
              <p className="text-sm text-om-muted">
                <span className="font-semibold text-om-success">Effect:</span> {event.effect}
              </p>
            </div>
          )}

          {note && (
            <div
              className={`bg-om-note border border-om-note-border rounded p-2 text-sm ${
                compact ? 'mt-2' : 'mt-2 ml-7'
              }`}
            >
              <p className="font-semibold text-om-note-title mb-0.5">Your notes</p>
              {note.cause && (
                <p className="text-om-text mt-0.5">
                  <span className="font-medium text-om-gold">Cause:</span> {note.cause}
                </p>
              )}
              {note.effect && (
                <p className="text-om-muted mt-0.5">
                  <span className="font-medium text-om-success">Effect:</span> {note.effect}
                </p>
              )}
              {note.significance && (
                <p className="text-om-muted mt-0.5">
                  <span className="font-medium text-om-accent">Significance:</span>{' '}
                  {note.significance}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

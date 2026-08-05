import { useState } from 'react'
import type { Event } from '../data/types'

interface Props {
  event: Event
  hideDates: boolean
  hardMode: boolean
  /** Compact sticky presentation used by the mobile layout. */
  compact?: boolean
  isDragging?: boolean
  onPointerDown: (e: React.PointerEvent) => void
}

export function PlacementCard({
  event,
  hideDates,
  hardMode,
  compact,
  isDragging,
  onPointerDown,
}: Props) {
  const [expanded, setExpanded] = useState(false)
  const showDetails = !hardMode && (!compact || expanded)

  return (
    <div className={compact ? 'px-3 py-2' : 'p-4'}>
      <div
        onPointerDown={onPointerDown}
        className={`drag-source bg-om-surface border border-om-border border-l-[3px] border-l-om-gold rounded-lg shadow-sm cursor-grab active:cursor-grabbing transition-opacity ${
          compact ? 'p-3' : 'p-4'
        } ${isDragging ? 'opacity-40' : ''}`}
      >
        <div className="flex items-start justify-between gap-2">
          <h2
            className={`font-bold text-om-text leading-tight ${
              compact ? 'text-lg' : 'text-2xl'
            }`}
          >
            {event.title}
          </h2>
          <div className="flex items-center gap-2 shrink-0">
            {hardMode && <span className="text-sm text-om-error font-medium">Hard</span>}
            {!hideDates && !hardMode && (
              <span className="text-sm font-mono text-om-gold bg-om-tag rounded px-2 py-0.5">
                {event.year}
              </span>
            )}
          </div>
        </div>

        {!hardMode && (
          <>
            {showDetails && (
              <>
                <p className="mt-1.5 text-sm text-om-muted">{event.description}</p>
                <div className="mt-3 space-y-1.5 border-t border-om-border pt-3">
                  <p className="text-sm text-om-muted">
                    <span className="font-semibold text-om-gold">Cause:</span> {event.cause}
                  </p>
                  <p className="text-sm text-om-muted">
                    <span className="font-semibold text-om-success">Effect:</span> {event.effect}
                  </p>
                </div>
                <div className="mt-2 flex gap-2 flex-wrap">
                  <span className="text-sm bg-om-tag text-om-muted rounded px-1.5 py-0.5">
                    {event.region}
                  </span>
                  <span className="text-sm bg-om-tag text-om-muted rounded px-1.5 py-0.5">
                    Unit {event.units.join(', ')}
                  </span>
                </div>
              </>
            )}

            {compact && (
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => setExpanded((v) => !v)}
                className="mt-1 -mb-1 h-10 inline-flex items-center text-sm font-medium text-om-accent"
              >
                {expanded ? 'Hide details' : 'Show details'}
              </button>
            )}
          </>
        )}
      </div>

      {compact && (
        <p className="mt-1.5 text-center text-xs text-om-muted">
          Drag onto the timeline, or tap a slot
        </p>
      )}
    </div>
  )
}

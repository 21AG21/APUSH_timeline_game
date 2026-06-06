import { useRef } from 'react'
import type { Event } from '../data/types'

interface Props {
  event: Event
  hideDates: boolean
  showUnderstanding: boolean
  hardMode: boolean
  onDragStart: (e: React.DragEvent) => void
}

export function PlacementCard({ event, hideDates, showUnderstanding, hardMode, onDragStart }: Props) {
  const cardRef = useRef<HTMLDivElement>(null)

  return (
    <div className="p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-om-accent mb-2">
        Place this event on the timeline
        {hardMode && <span className="ml-2 text-om-error">— HARD MODE</span>}
      </p>
      <div
        ref={cardRef}
        draggable
        onDragStart={onDragStart}
        className="bg-om-surface border border-om-border border-l-[3px] border-l-om-gold rounded-lg p-4 shadow-sm cursor-grab active:cursor-grabbing select-none"
      >
        {hardMode ? (
          <div>
            <h2 className="text-base font-bold font-serif text-om-text">{event.title}</h2>
            <p className="mt-2 text-xs text-om-error italic">
              Hard mode — name only, no dates or descriptions
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-base font-bold font-serif text-om-text">{event.title}</h2>
              {!hideDates && (
                <span className="shrink-0 text-sm font-mono text-om-gold bg-om-tag rounded px-2 py-0.5">
                  {event.year}
                </span>
              )}
            </div>
            <p className="mt-1.5 text-sm text-om-muted">{event.description}</p>
            {showUnderstanding && (
              <div className="mt-3 space-y-1.5 border-t border-om-border pt-3">
                <p className="text-xs text-om-muted">
                  <span className="font-semibold text-om-gold">Cause:</span> {event.cause}
                </p>
                <p className="text-xs text-om-muted">
                  <span className="font-semibold text-om-success">Effect:</span> {event.effect}
                </p>
              </div>
            )}
            <div className="mt-2 flex gap-2 flex-wrap">
              <span className="text-xs bg-om-tag text-om-muted rounded px-1.5 py-0.5">
                {event.region}
              </span>
              <span className="text-xs bg-om-tag text-om-muted rounded px-1.5 py-0.5">
                Unit {event.units.join(', ')}
              </span>
            </div>
          </>
        )}
        <p className="mt-2 text-xs text-om-muted italic">
          Drag · click a slot · 1–9 keys (press twice to confirm) · arrows + Enter
        </p>
      </div>
    </div>
  )
}

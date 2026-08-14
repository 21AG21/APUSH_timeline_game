import { useEffect, useRef, useState } from 'react'
import type { Event } from '../data/types'
import { LabelledRows } from './EventCard'

interface Props {
  event: Event
  hideDates: boolean
  hardMode: boolean
  /** Compact sticky presentation used by the mobile layout. */
  compact?: boolean
  isDragging?: boolean
  /** Increments on every wrong placement; each change replays the nudge. */
  nudgeCount?: number
  onPointerDown: (e: React.PointerEvent) => void
}

/**
 * The card in hand. It carries a rail along its top edge rather than its left,
 * which is what separates it at a glance from the cards already filed below.
 */
export function PlacementCard({
  event,
  hideDates,
  hardMode,
  compact,
  isDragging,
  nudgeCount = 0,
  onPointerDown,
}: Props) {
  const [expanded, setExpanded] = useState(false)

  // Driven straight on the node rather than through state. The element stays
  // mounted, so a drag started mid-animation is not cut off by React swapping
  // the node out from under the captured pointer, and no render is triggered
  // just to play an animation.
  const cardRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    if (!nudgeCount) return
    const el = cardRef.current
    if (!el) return

    el.classList.remove('nudge')
    void el.offsetWidth // reflow, so a repeat wrong answer replays the animation
    el.classList.add('nudge')

    const done = () => el.classList.remove('nudge')
    el.addEventListener('animationend', done, { once: true })
    return () => {
      el.removeEventListener('animationend', done)
      el.classList.remove('nudge')
    }
  }, [nudgeCount])

  return (
    <div className={compact ? 'px-3 py-2' : 'px-4 py-3'}>
      <div
        ref={cardRef}
        onPointerDown={onPointerDown}
        className={`drag-source bg-om-card border border-om-border border-t-[3px] border-t-om-accent cursor-grab active:cursor-grabbing transition-opacity ${
          compact ? 'p-3' : 'p-4'
        } ${isDragging ? 'opacity-40' : ''}`}
      >
        <div className="flex items-baseline justify-between gap-3">
          <h2
            className={`font-serif font-bold text-om-text leading-tight ${
              compact ? 'text-lg' : 'text-2xl'
            }`}
          >
            {event.title}
          </h2>
          <div className="flex items-baseline gap-2 shrink-0">
            {hardMode && <span className="label-mono text-om-error">Hard</span>}
            {!hideDates && !hardMode && (
              <span className="font-serif font-bold text-om-accent tabular-nums">
                {event.year}
              </span>
            )}
          </div>
        </div>

        {/* The description is always here to reason from; the analysis is one tap
            away. Keeping cause and effect open by default made this card taller
            than the panel, which pushed the settings below an invisible fold. */}
        {!hardMode && (
          <>
            <p className="mt-2 text-sm leading-relaxed text-om-body">{event.description}</p>

            {expanded && (
              <>
                <LabelledRows
                  rows={[
                    { label: 'Cause', text: event.cause, tone: 'accent' },
                    { label: 'Effect', text: event.effect, tone: 'gold' },
                  ]}
                />
                <p className="label-mono mt-3 text-om-muted">
                  {event.region} &middot; Unit {event.units.join(', ')}
                </p>
              </>
            )}

            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              className="label-mono mt-2 -mb-1 h-10 inline-flex items-center text-om-accent"
            >
              {expanded ? 'Hide cause & effect' : 'Cause & effect'}
            </button>
          </>
        )}
      </div>

      {compact && (
        <p className="mt-2 text-center text-xs text-om-muted">
          Drag onto the record, or tap a slot
        </p>
      )}
    </div>
  )
}

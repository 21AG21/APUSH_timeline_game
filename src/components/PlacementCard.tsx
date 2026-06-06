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
      <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400 mb-2">
        Place this event on the timeline
        {hardMode && <span className="ml-2 text-red-500 dark:text-red-400">— HARD MODE</span>}
      </p>
      <div
        ref={cardRef}
        draggable
        onDragStart={onDragStart}
        className="bg-white dark:bg-gray-800 border-2 border-indigo-400 dark:border-indigo-500 rounded-xl p-4 shadow-lg cursor-grab active:cursor-grabbing select-none"
      >
        {hardMode ? (
          /* Hard mode: name only */
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">{event.title}</h2>
            <p className="mt-2 text-xs text-red-500 dark:text-red-400 italic">
              Hard mode — name only, no dates or descriptions
            </p>
          </div>
        ) : (
          /* Normal mode */
          <>
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-base font-bold text-gray-900 dark:text-white">{event.title}</h2>
              {!hideDates && (
                <span className="shrink-0 text-sm font-mono font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 rounded px-2 py-0.5">
                  {event.year}
                </span>
              )}
            </div>
            <p className="mt-1.5 text-sm text-gray-600 dark:text-gray-300">{event.description}</p>
            {showUnderstanding && (
              <div className="mt-3 space-y-1.5 border-t border-gray-100 dark:border-gray-700 pt-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  <span className="font-semibold text-amber-600 dark:text-amber-400">Cause:</span> {event.cause}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">Effect:</span> {event.effect}
                </p>
              </div>
            )}
            <div className="mt-2 flex gap-2 flex-wrap">
              <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded px-1.5 py-0.5">
                {event.region}
              </span>
              <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded px-1.5 py-0.5">
                Unit {event.units.join(', ')}
              </span>
            </div>
          </>
        )}
        <p className="mt-2 text-xs text-gray-400 dark:text-gray-500 italic">
          Drag · click a slot · 1–9 keys (press twice to confirm) · arrows + Enter
        </p>
      </div>
    </div>
  )
}

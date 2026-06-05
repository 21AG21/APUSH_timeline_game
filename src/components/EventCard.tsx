import type { Event, Note } from '../data/types'

interface Props {
  event: Event
  index: number
  hideDates: boolean
  showUnderstanding: boolean
  note?: Note
}

export function EventCard({ event, index, hideDates, showUnderstanding, note }: Props) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-400 dark:text-gray-500 w-5 text-right shrink-0">
            {index + 1}
          </span>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{event.title}</h3>
        </div>
        {!hideDates && (
          <span className="shrink-0 text-xs font-mono font-semibold text-gray-500 dark:text-gray-400">
            {event.year}
          </span>
        )}
      </div>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 ml-7">{event.description}</p>
      {showUnderstanding && (
        <div className="mt-2 ml-7 space-y-1">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            <span className="font-semibold text-amber-600 dark:text-amber-400">Cause:</span> {event.cause}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">Effect:</span> {event.effect}
          </p>
        </div>
      )}
      {note && (
        <div className="mt-2 ml-7 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-2 text-xs">
          <p className="font-semibold text-yellow-700 dark:text-yellow-400 mb-0.5">YOUR NOTES</p>
          {note.summary && <p className="text-gray-700 dark:text-gray-300">{note.summary}</p>}
          {note.cause && (
            <p className="text-gray-600 dark:text-gray-400 mt-0.5">
              <span className="font-medium text-amber-600 dark:text-amber-400">Cause:</span> {note.cause}
            </p>
          )}
          {note.effect && (
            <p className="text-gray-600 dark:text-gray-400 mt-0.5">
              <span className="font-medium text-emerald-600 dark:text-emerald-400">Effect:</span> {note.effect}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

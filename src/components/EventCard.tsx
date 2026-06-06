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
    <div className="bg-om-surface border border-om-border rounded-lg p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-om-muted w-5 text-right shrink-0">
            {index + 1}
          </span>
          <h3 className="text-sm font-semibold font-serif text-om-text">{event.title}</h3>
        </div>
        {!hideDates && (
          <span className="shrink-0 text-xs font-mono text-om-muted">
            {event.year}
          </span>
        )}
      </div>
      <p className="mt-1 text-xs text-om-muted ml-7">{event.description}</p>
      {showUnderstanding && (
        <div className="mt-2 ml-7 space-y-1">
          <p className="text-xs text-om-muted">
            <span className="font-semibold text-om-gold">Cause:</span> {event.cause}
          </p>
          <p className="text-xs text-om-muted">
            <span className="font-semibold text-om-success">Effect:</span> {event.effect}
          </p>
        </div>
      )}
      {note && (
        <div className="mt-2 ml-7 bg-om-note border border-om-note-border rounded p-2 text-xs">
          <p className="font-semibold text-om-note-title mb-0.5">YOUR NOTES</p>
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
  )
}

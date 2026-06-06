import { useState } from 'react'
import type { Event, Note } from '../data/types'
import { NoteEditor } from './NoteEditor'

interface Props {
  allEvents: Event[]
  timelineEvents: Event[]
  notes: Note[]
  onSaveNote: (note: Note) => void
  onDeleteNote: (eventId: string) => void
}

export function StudyJournal({ allEvents, timelineEvents, notes, onSaveNote, onDeleteNote }: Props) {
  const [tab, setTab] = useState<'my-notes' | 'complete'>('my-notes')
  const [editing, setEditing] = useState<Event | null>(null)

  const noteMap = new Map(notes.map((n) => [n.eventId, n]))
  const timelineIds = new Set(timelineEvents.map((e) => e.id))

  const myNoteEvents = allEvents.filter((e) => noteMap.has(e.id))
  const displayEvents = tab === 'my-notes' ? myNoteEvents : allEvents

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex border-b border-om-border">
        <TabButton label="My Notes" active={tab === 'my-notes'} onClick={() => setTab('my-notes')} />
        <TabButton label="All Events" active={tab === 'complete'} onClick={() => setTab('complete')} />
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {displayEvents.length === 0 && (
          <p className="text-sm text-om-muted text-center py-4">
            {tab === 'my-notes' ? 'No notes yet.' : 'No events.'}
          </p>
        )}
        {displayEvents.map((event) => {
          const note = noteMap.get(event.id)
          const onTimeline = timelineIds.has(event.id)
          return (
            <div
              key={event.id}
              className="rounded border border-om-border p-2 text-sm"
            >
              <div className="flex items-start justify-between gap-1">
                <div>
                  <span className="font-semibold text-om-text">{event.title}</span>
                  <span className="ml-1 text-om-muted font-mono">{event.year}</span>
                  {onTimeline && <span className="ml-1 text-om-success">✓</span>}
                </div>
                <button
                  onClick={() => setEditing(event)}
                  className="shrink-0 text-om-accent hover:underline"
                >
                  {note ? 'Edit' : '+ Note'}
                </button>
              </div>

              {note && (
                <div className="mt-1.5 bg-om-note border border-om-note-border rounded p-1.5 space-y-0.5">
                  <p className="font-semibold text-om-note-title">Your notes</p>
                  {note.cause && (
                    <p className="text-om-text">
                      <span className="text-om-gold font-medium">Cause:</span> {note.cause}
                    </p>
                  )}
                  {note.effect && (
                    <p className="text-om-text">
                      <span className="text-om-success font-medium">Effect:</span> {note.effect}
                    </p>
                  )}
                  {note.significance && (
                    <p className="text-om-text">
                      <span className="text-om-accent font-medium">Significance:</span>{' '}
                      {note.significance}
                    </p>
                  )}
                </div>
              )}

              {tab === 'complete' && (
                <div className="mt-1.5 space-y-1">
                  <CanonicalList label="Causes" items={event.causes} color="gold" />
                  <CanonicalList label="Effects" items={event.effects} color="success" />
                  <CanonicalList label="Significance" items={event.significance} color="accent" />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {editing && (
        <NoteEditor
          eventId={editing.id}
          eventTitle={editing.title}
          note={noteMap.get(editing.id)}
          onSave={(note) => {
            onSaveNote(note)
            setEditing(null)
          }}
          onDelete={() => {
            onDeleteNote(editing.id)
            setEditing(null)
          }}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}

function CanonicalList({
  label,
  items,
  color,
}: {
  label: string
  items: string[]
  color: 'gold' | 'success' | 'accent'
}) {
  if (!items?.length) return null
  const labelColor = {
    gold: 'text-om-gold',
    success: 'text-om-success',
    accent: 'text-om-accent',
  }[color]
  return (
    <div>
      <p className={`font-medium ${labelColor}`}>{label}:</p>
      <ul className="mt-0.5 space-y-0.5 text-om-muted">
        {items.map((item, i) => (
          <li key={i}>• {item}</li>
        ))}
      </ul>
    </div>
  )
}

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${
        active
          ? 'border-om-accent text-om-accent'
          : 'border-transparent text-om-muted hover:text-om-text'
      }`}
    >
      {label}
    </button>
  )
}

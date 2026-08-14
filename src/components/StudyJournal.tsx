import { useState } from 'react'
import type { Event, Note } from '../data/types'
import { NoteEditor } from './NoteEditor'
import { LabelledRows } from './EventCard'

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
        <TabButton label="My notes" active={tab === 'my-notes'} onClick={() => setTab('my-notes')} />
        <TabButton label="All events" active={tab === 'complete'} onClick={() => setTab('complete')} />
      </div>

      <div className="scroll-pane flex-1 overflow-y-auto p-3 sm:p-4 space-y-2">
        {displayEvents.length === 0 && (
          <p className="text-sm text-om-muted text-center py-6">
            {tab === 'my-notes' ? 'No notes yet.' : 'No events.'}
          </p>
        )}
        {displayEvents.map((event) => {
          const note = noteMap.get(event.id)
          const onTimeline = timelineIds.has(event.id)
          return (
            <div
              key={event.id}
              className="border border-om-border border-l-[3px] border-l-om-accent bg-om-surface px-4 py-3"
            >
              <div className="flex items-baseline justify-between gap-3">
                <div className="min-w-0">
                  <span className="font-serif font-bold text-om-text">{event.title}</span>
                  <span className="ml-2 font-serif font-bold text-om-accent tabular-nums">
                    {event.year}
                  </span>
                  {onTimeline && (
                    <span className="label-mono ml-2 text-om-accent">Filed</span>
                  )}
                </div>
                <button
                  onClick={() => setEditing(event)}
                  className="label-mono shrink-0 text-om-accent underline"
                >
                  {note ? 'Edit' : 'Add note'}
                </button>
              </div>

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

              {tab === 'complete' && (
                <div className="mt-3 border-t border-om-border pt-3 space-y-3">
                  <CanonicalList label="Causes" items={event.causes} tone="accent" />
                  <CanonicalList label="Effects" items={event.effects} tone="gold" />
                  <CanonicalList label="Meaning" items={event.significance} tone="muted" />
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

const TONE = {
  accent: 'text-om-accent',
  gold: 'text-om-gold',
  muted: 'text-om-muted',
} as const

function CanonicalList({
  label,
  items,
  tone,
}: {
  label: string
  items: string[]
  tone: keyof typeof TONE
}) {
  if (!items?.length) return null
  return (
    <div className="grid grid-cols-[3.75rem_1fr] gap-x-3">
      <p className={`label-mono pt-[0.2rem] ${TONE[tone]}`}>{label}</p>
      <ul className="space-y-1 text-sm leading-relaxed text-om-body">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  )
}

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`label-mono flex-1 h-11 border-b-2 transition-colors ${
        active
          ? 'border-om-accent text-om-accent'
          : 'border-transparent text-om-muted hover:text-om-text'
      }`}
    >
      {label}
    </button>
  )
}

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
    <aside className="w-72 flex flex-col border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h2 className="font-semibold text-gray-900 dark:text-white text-sm">Study Journal</h2>
      </div>

      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <TabButton label="My Notes" active={tab === 'my-notes'} onClick={() => setTab('my-notes')} />
        <TabButton label="Complete Journal" active={tab === 'complete'} onClick={() => setTab('complete')} />
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {displayEvents.length === 0 && (
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-4">
            {tab === 'my-notes' ? 'No notes yet. Place events to add notes.' : 'No events.'}
          </p>
        )}
        {displayEvents.map((event) => {
          const note = noteMap.get(event.id)
          const onTimeline = timelineIds.has(event.id)
          return (
            <div
              key={event.id}
              className="rounded border border-gray-200 dark:border-gray-700 p-2 text-xs"
            >
              <div className="flex items-start justify-between gap-1">
                <div>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{event.title}</span>
                  <span className="ml-1 text-gray-400 dark:text-gray-500">{event.year}</span>
                  {onTimeline && <span className="ml-1 text-green-600 dark:text-green-400">✓</span>}
                </div>
                <button
                  onClick={() => setEditing(event)}
                  className="shrink-0 text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  {note ? 'Edit' : '+ Note'}
                </button>
              </div>

              {/* Student notes */}
              {note && (
                <div className="mt-1.5 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-1.5 space-y-0.5">
                  <p className="font-semibold text-yellow-700 dark:text-yellow-400">YOUR NOTES</p>
                  {note.cause && (
                    <p className="text-gray-700 dark:text-gray-300">
                      <span className="text-amber-600 dark:text-amber-400 font-medium">Cause:</span> {note.cause}
                    </p>
                  )}
                  {note.effect && (
                    <p className="text-gray-700 dark:text-gray-300">
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">Effect:</span> {note.effect}
                    </p>
                  )}
                  {note.significance && (
                    <p className="text-gray-700 dark:text-gray-300">
                      <span className="text-indigo-600 dark:text-indigo-400 font-medium">Significance:</span>{' '}
                      {note.significance}
                    </p>
                  )}
                </div>
              )}

              {/* Complete journal: canonical arrays */}
              {tab === 'complete' && (
                <div className="mt-1.5 space-y-1">
                  <CanonicalList label="Causes" items={event.causes} color="amber" />
                  <CanonicalList label="Effects" items={event.effects} color="emerald" />
                  <CanonicalList label="Significance" items={event.significance} color="indigo" />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {tab === 'my-notes' && (
        <div className="px-3 pb-3">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Notes also open automatically after correct placement when "Cause/Effect" is on.
          </p>
        </div>
      )}

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
    </aside>
  )
}

function CanonicalList({
  label,
  items,
  color,
}: {
  label: string
  items: string[]
  color: 'amber' | 'emerald' | 'indigo'
}) {
  if (!items?.length) return null
  const labelColor = {
    amber: 'text-amber-600 dark:text-amber-400',
    emerald: 'text-emerald-600 dark:text-emerald-400',
    indigo: 'text-indigo-600 dark:text-indigo-400',
  }[color]
  return (
    <div>
      <p className={`font-medium ${labelColor}`}>{label}:</p>
      <ul className="mt-0.5 space-y-0.5 text-gray-600 dark:text-gray-400">
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
      className={`flex-1 py-2 text-xs font-medium border-b-2 transition-colors ${
        active
          ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
          : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
      }`}
    >
      {label}
    </button>
  )
}

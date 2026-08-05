import { useState, useEffect } from 'react'
import type { Note } from '../data/types'

interface Props {
  eventId: string
  eventTitle: string
  note?: Note
  onSave: (note: Note) => void
  onDelete: () => void
  onClose: () => void
}

export function NoteEditor({ eventId, eventTitle, note, onSave, onDelete, onClose }: Props) {
  const [cause, setCause] = useState(note?.cause ?? '')
  const [effect, setEffect] = useState(note?.effect ?? '')
  const [significance, setSignificance] = useState(note?.significance ?? '')

  useEffect(() => {
    setCause(note?.cause ?? '')
    setEffect(note?.effect ?? '')
    setSignificance(note?.significance ?? '')
  }, [note, eventId])

  const handleSave = () => {
    onSave({ eventId, cause, effect, significance })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-om-surface rounded-t-2xl sm:rounded-lg shadow-2xl w-full max-w-md max-h-[92dvh] overflow-y-auto">
        <div className="flex items-center justify-between px-4 py-3 border-b border-om-border sticky top-0 bg-om-surface z-10">
          <h3 className="font-semibold text-om-text text-base pr-2">Note: {eventTitle}</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="h-10 w-10 shrink-0 rounded-full text-om-muted hover:text-om-text text-2xl leading-none"
          >
            ×
          </button>
        </div>
        <div className="p-4 space-y-3">
          <Field
            label="Cause"
            value={cause}
            onChange={setCause}
            placeholder="Cause in your words…"
            color="gold"
          />
          <Field
            label="Effect"
            value={effect}
            onChange={setEffect}
            placeholder="Effect in your words…"
            color="success"
          />
          <Field
            label="Significance"
            value={significance}
            onChange={setSignificance}
            placeholder="Why does this matter historically?"
            color="accent"
          />
        </div>
        <div className="flex gap-2 px-4 pb-6 sm:pb-4 sticky bottom-0 bg-om-surface pt-2">
          <button
            onClick={handleSave}
            className="flex-1 h-11 rounded-lg bg-om-accent hover:bg-om-accent-hover text-om-accent-fg text-sm font-medium transition-colors"
          >
            Save
          </button>
          {note && (
            <button
              onClick={onDelete}
              className="h-11 px-4 rounded-lg border border-om-error text-om-error text-sm hover:bg-om-error-bg transition-colors"
            >
              Delete
            </button>
          )}
          <button
            onClick={onClose}
            className="h-11 px-4 rounded-lg border border-om-border text-om-muted text-sm hover:bg-om-slot-hover transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  color,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  color: 'gold' | 'success' | 'accent'
}) {
  const labelColor = {
    gold: 'text-om-gold',
    success: 'text-om-success',
    accent: 'text-om-accent',
  }[color]

  return (
    <div>
      <label className={`block text-sm font-semibold mb-1 ${labelColor}`}>{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={2}
        className="w-full text-sm rounded border border-om-border bg-om-bg text-om-text placeholder:text-om-muted px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-om-accent resize-none"
      />
    </div>
  )
}

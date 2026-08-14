import { useState, useEffect } from 'react'
import type { Note } from '../data/types'
import { FIELD_CLASS } from './UnderstandingModal'
import { Ghost, Stamp } from './ui'

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
      <div className="bg-om-surface border border-om-border shadow-2xl w-full max-w-md max-h-[92dvh] overflow-y-auto">
        <div className="flex items-start justify-between gap-3 px-4 py-3 rule-double sticky top-0 bg-om-surface z-10">
          <div className="min-w-0">
            <p className="label-mono text-om-muted">Note</p>
            <h3 className="mt-1 font-serif font-bold text-om-text leading-tight">{eventTitle}</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="h-10 w-10 shrink-0 text-om-muted hover:text-om-text text-2xl leading-none"
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
            tone="accent"
          />
          <Field
            label="Effect"
            value={effect}
            onChange={setEffect}
            placeholder="Effect in your words…"
            tone="gold"
          />
          <Field
            label="Meaning"
            value={significance}
            onChange={setSignificance}
            placeholder="Why does this matter historically?"
            tone="muted"
          />
        </div>
        <div className="flex gap-2 px-4 pb-6 sm:pb-4 sticky bottom-0 bg-om-surface border-t border-om-border pt-3">
          <Stamp onClick={handleSave} className="flex-1">
            Save
          </Stamp>
          {note && (
            <Ghost onClick={onDelete} className="!border-om-error !text-om-error hover:!bg-om-error-bg">
              Delete
            </Ghost>
          )}
          <Ghost onClick={onClose}>Cancel</Ghost>
        </div>
      </div>
    </div>
  )
}

const TONE = {
  accent: 'text-om-accent',
  gold: 'text-om-gold',
  muted: 'text-om-muted',
} as const

function Field({
  label,
  value,
  onChange,
  placeholder,
  tone,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  tone: keyof typeof TONE
}) {
  return (
    <div>
      <label className={`label-mono block mb-1.5 ${TONE[tone]}`}>{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={2}
        className={FIELD_CLASS}
      />
    </div>
  )
}

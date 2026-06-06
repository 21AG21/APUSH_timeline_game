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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Note: {eventTitle}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg leading-none"
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
            color="amber"
          />
          <Field
            label="Effect"
            value={effect}
            onChange={setEffect}
            placeholder="Effect in your words…"
            color="emerald"
          />
          <Field
            label="Significance"
            value={significance}
            onChange={setSignificance}
            placeholder="Why does this matter historically?"
            color="indigo"
          />
        </div>
        <div className="flex gap-2 px-4 pb-4">
          <button
            onClick={handleSave}
            className="flex-1 py-1.5 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
          >
            Save
          </button>
          {note && (
            <button
              onClick={onDelete}
              className="py-1.5 px-3 rounded border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              Delete
            </button>
          )}
          <button
            onClick={onClose}
            className="py-1.5 px-3 rounded border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
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
  color: 'amber' | 'emerald' | 'indigo'
}) {
  const labelColor = {
    amber: 'text-amber-600 dark:text-amber-400',
    emerald: 'text-emerald-600 dark:text-emerald-400',
    indigo: 'text-indigo-600 dark:text-indigo-400',
  }[color]

  return (
    <div>
      <label className={`block text-xs font-semibold mb-1 ${labelColor}`}>{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={2}
        className="w-full text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
      />
    </div>
  )
}

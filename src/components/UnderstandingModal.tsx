import { useState } from 'react'
import type { Event, Note } from '../data/types'

interface Props {
  event: Event
  onSave: (note: Note) => void
  onSkip: () => void
}

export function UnderstandingModal({ event, onSave, onSkip }: Props) {
  const [cause, setCause] = useState('')
  const [effect, setEffect] = useState('')
  const [significance, setSignificance] = useState('')

  const handleSave = () => {
    onSave({ eventId: event.id, cause, effect, significance })
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-green-600 dark:text-green-400 mb-0.5">
                Correct!
              </p>
              <h3 className="font-semibold text-gray-900 dark:text-white">{event.title} ({event.year})</h3>
            </div>
            <button onClick={onSkip} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl leading-none shrink-0">
              ×
            </button>
          </div>
        </div>

        <div className="px-5 py-4 space-y-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Reflect in your own words. Your notes will appear inline on the timeline.
          </p>

          <JournalField
            label="Cause"
            hint={event.causes}
            value={cause}
            onChange={setCause}
            placeholder="What caused this event?"
            color="amber"
          />
          <JournalField
            label="Effect"
            hint={event.effects}
            value={effect}
            onChange={setEffect}
            placeholder="What were the immediate effects?"
            color="emerald"
          />
          <JournalField
            label="Significance"
            hint={event.significance}
            value={significance}
            onChange={setSignificance}
            placeholder="Why does this matter in the long run?"
            color="indigo"
          />
        </div>

        <div className="flex gap-2 px-5 pb-5">
          <button
            onClick={handleSave}
            className="flex-1 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
          >
            Save &amp; Continue
          </button>
          <button
            onClick={onSkip}
            className="py-2 px-4 rounded border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  )
}

function JournalField({
  label,
  hint,
  value,
  onChange,
  placeholder,
  color,
}: {
  label: string
  hint: string[]
  value: string
  onChange: (v: string) => void
  placeholder: string
  color: 'amber' | 'emerald' | 'indigo'
}) {
  const [showHint, setShowHint] = useState(false)

  const colorMap = {
    amber: 'text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20',
    emerald: 'text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20',
    indigo: 'text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className={`text-xs font-semibold ${colorMap[color].split(' ')[0]}`}>{label}</label>
        <button
          onClick={() => setShowHint((v) => !v)}
          className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
        >
          {showHint ? 'Hide hint' : 'Show hint'}
        </button>
      </div>
      {showHint && (
        <ul className={`mb-1.5 text-xs rounded border p-2 space-y-0.5 ${colorMap[color]}`}>
          {hint.map((h, i) => (
            <li key={i}>• {h}</li>
          ))}
        </ul>
      )}
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

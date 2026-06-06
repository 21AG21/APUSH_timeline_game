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
    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-om-surface rounded-t-xl sm:rounded-lg shadow-2xl w-full max-w-lg">
        <div className="px-5 py-4 border-b border-om-border">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-om-success mb-0.5">
                Correct!
              </p>
              <h3 className="font-semibold font-serif text-om-text">{event.title} ({event.year})</h3>
            </div>
            <button onClick={onSkip} className="text-om-muted hover:text-om-text text-xl leading-none shrink-0">
              ×
            </button>
          </div>
        </div>

        <div className="px-5 py-4 space-y-4">
          <p className="text-xs text-om-muted">
            Reflect in your own words. Your notes will appear inline on the timeline.
          </p>

          <JournalField
            label="Cause"
            hint={event.causes}
            value={cause}
            onChange={setCause}
            placeholder="What caused this event?"
            color="gold"
          />
          <JournalField
            label="Effect"
            hint={event.effects}
            value={effect}
            onChange={setEffect}
            placeholder="What were the immediate effects?"
            color="success"
          />
          <JournalField
            label="Significance"
            hint={event.significance}
            value={significance}
            onChange={setSignificance}
            placeholder="Why does this matter in the long run?"
            color="accent"
          />
        </div>

        <div className="flex gap-2 px-5 pb-5">
          <button
            onClick={handleSave}
            className="flex-1 py-2 rounded bg-om-accent hover:bg-om-accent-hover text-white text-sm font-medium transition-colors"
          >
            Save &amp; Continue
          </button>
          <button
            onClick={onSkip}
            className="py-2 px-4 rounded border border-om-border text-om-muted text-sm hover:bg-om-slot-hover transition-colors"
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
  color: 'gold' | 'success' | 'accent'
}) {
  const [showHint, setShowHint] = useState(false)

  const labelColor = {
    gold: 'text-om-gold',
    success: 'text-om-success',
    accent: 'text-om-accent',
  }[color]

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className={`text-xs font-semibold ${labelColor}`}>{label}</label>
        <button
          onClick={() => setShowHint((v) => !v)}
          className="text-xs text-om-muted hover:text-om-text"
        >
          {showHint ? 'Hide hint' : 'Show hint'}
        </button>
      </div>
      {showHint && (
        <ul className="mb-1.5 text-xs rounded border border-om-border bg-om-bg p-2 space-y-0.5 text-om-muted">
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
        className="w-full text-sm rounded border border-om-border bg-om-bg text-om-text placeholder:text-om-muted px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-om-accent resize-none"
      />
    </div>
  )
}

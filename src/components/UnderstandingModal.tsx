import { useState } from 'react'
import type { Event, Note } from '../data/types'
import { Ghost, Stamp } from './ui'

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
    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-om-surface border border-om-border shadow-2xl w-full max-w-lg max-h-[92dvh] overflow-y-auto">
        <div className="px-5 py-4 rule-double sticky top-0 bg-om-surface z-10">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="label-mono text-om-accent">Correct</p>
              <h3 className="mt-1 font-serif font-bold text-om-text leading-tight">
                {event.title}{' '}
                <span className="text-om-accent tabular-nums">{event.year}</span>
              </h3>
            </div>
            <button
              onClick={onSkip}
              aria-label="Skip"
              className="h-10 w-10 shrink-0 text-om-muted hover:text-om-text text-2xl leading-none"
            >
              ×
            </button>
          </div>
        </div>

        <div className="px-5 py-4 space-y-4">
          <p className="text-sm text-om-body">Set it down in your own words.</p>

          <JournalField
            label="Cause"
            hint={event.causes}
            value={cause}
            onChange={setCause}
            placeholder="What caused this event?"
            tone="accent"
          />
          <JournalField
            label="Effect"
            hint={event.effects}
            value={effect}
            onChange={setEffect}
            placeholder="What were the immediate effects?"
            tone="gold"
          />
          <JournalField
            label="Meaning"
            hint={event.significance}
            value={significance}
            onChange={setSignificance}
            placeholder="Why does this matter in the long run?"
            tone="muted"
          />
        </div>

        <div className="flex gap-2 px-5 pb-6 sm:pb-5 sticky bottom-0 bg-om-surface border-t border-om-border pt-3">
          <Stamp onClick={handleSave} className="flex-1">
            Save &amp; continue
          </Stamp>
          <Ghost onClick={onSkip}>Skip</Ghost>
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

export const FIELD_CLASS =
  'w-full text-sm border border-om-border bg-om-bg text-om-text placeholder:text-om-muted px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-om-accent focus:border-om-accent resize-none'

function JournalField({
  label,
  hint,
  value,
  onChange,
  placeholder,
  tone,
}: {
  label: string
  hint: string[]
  value: string
  onChange: (v: string) => void
  placeholder: string
  tone: keyof typeof TONE
}) {
  const [showHint, setShowHint] = useState(false)

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className={`label-mono ${TONE[tone]}`}>{label}</label>
        <button
          onClick={() => setShowHint((v) => !v)}
          className="label-mono text-om-muted hover:text-om-text"
        >
          {showHint ? 'Hide hint' : 'Show hint'}
        </button>
      </div>
      {showHint && (
        <ul className="mb-2 text-xs border border-om-border bg-om-bg p-2.5 space-y-1 text-om-body">
          {hint.map((h, i) => (
            <li key={i}>{h}</li>
          ))}
        </ul>
      )}
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

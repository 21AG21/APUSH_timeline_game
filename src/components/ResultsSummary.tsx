import { useState } from 'react'
import type { Event, GameState, Settings } from '../data/types'

interface Props {
  state: GameState
  settings: Settings
  allEvents: Event[]
}

export function ResultsSummary({ state, settings, allEvents }: Props) {
  const [copied, setCopied] = useState(false)

  const total = state.score + (state.done ? 0 : state.pool.length + 1)
  const correctPlacements = state.timeline.length > 0 ? state.timeline.length - 1 : 0
  const accuracy = state.attempts > 0 ? Math.round((correctPlacements / state.attempts) * 100) : 0

  const modes: string[] = []
  if (settings.hardMode) modes.push('Hard mode')
  if (settings.hideDates) modes.push('Dates hidden')
  if (settings.filterUnits.length || settings.filterRegions.length) {
    const parts: string[] = []
    if (settings.filterUnits.length) parts.push(`Units ${settings.filterUnits.join(',')}`)
    if (settings.filterRegions.length) parts.push(settings.filterRegions.join(', '))
    modes.push(`Filter: ${parts.join(' / ')}`)
  }

  const missedTitles = state.missedIds
    .map((id) => allEvents.find((e) => e.id === id)?.title ?? id)

  const summary = [
    `US History Timeline — Game Summary`,
    `Score: ${state.score}/${total}`,
    `Accuracy: ${accuracy}%`,
    `Attempts: ${state.attempts}`,
    `Best streak: ${state.bestStreak}`,
    modes.length ? `Modes: ${modes.join(', ')}` : null,
    missedTitles.length
      ? `Missed events (${missedTitles.length}):\n${missedTitles.map((t) => `  • ${t}`).join('\n')}`
      : 'No events missed!',
  ]
    .filter(Boolean)
    .join('\n')

  const handleCopy = () => {
    navigator.clipboard.writeText(summary).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="bg-om-card border border-om-border border-t-[3px] border-t-om-accent p-4 space-y-3">
      <h3 className="font-serif font-bold text-om-text text-lg leading-none">Game summary</h3>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2 border-y border-om-border py-3">
        <Kv label="Score" value={`${state.score} / ${total}`} />
        <Kv label="Accuracy" value={`${accuracy}%`} />
        <Kv label="Attempts" value={String(state.attempts)} />
        <Kv label="Best streak" value={String(state.bestStreak)} />
      </div>

      {modes.length > 0 && (
        <p className="text-xs text-om-muted">
          <span className="label-mono text-om-muted">Modes</span> {modes.join(' · ')}
        </p>
      )}

      {missedTitles.length > 0 ? (
        <div>
          <p className="label-mono text-om-error mb-1">Missed ({missedTitles.length})</p>
          <ul className="text-sm text-om-body space-y-0.5">
            {missedTitles.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="label-mono text-om-success">Nothing missed</p>
      )}

      <button
        onClick={handleCopy}
        className="label-mono w-full h-10 border border-om-border text-om-muted hover:text-om-text hover:bg-om-slot-hover transition-colors"
      >
        {copied ? 'Copied' : 'Copy summary'}
      </button>
    </div>
  )
}

function Kv({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="label-mono text-om-muted">{label}</p>
      <p className="figure text-xl text-om-text">{value}</p>
    </div>
  )
}

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
  const modes: string[] = []
  if (settings.hardMode) modes.push('Hard mode')
  if (settings.timedMode) modes.push(`Timed (${settings.timerSeconds}s)`)
  if (settings.hideDates) modes.push('Dates hidden')
  if (settings.filterUnits.length || settings.filterRegions.length) {
    const parts: string[] = []
    if (settings.filterUnits.length) parts.push(`Units ${settings.filterUnits.join(',')}`)
    if (settings.filterRegions.length) parts.push(settings.filterRegions.join(', '))
    modes.push(`Filter: ${parts.join(' / ')}`)
  }

  const missedTitles = state.missedIds
    .map((id) => allEvents.find((e) => e.id === id)?.title ?? id)

  const timeLine = state.timeTaken != null
    ? `Time: ${Math.round(state.timeTaken / 1000)}s`
    : null

  const summary = [
    `APUSH Timeline — Game Summary`,
    `Score: ${state.score}/${total}`,
    `Attempts: ${state.attempts}`,
    `Best streak: ${state.bestStreak}`,
    timeLine,
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
    <div className="bg-om-surface border border-om-border rounded-lg p-4 space-y-3">
      <h3 className="font-semibold text-om-text text-base">Game Summary</h3>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <Kv label="Score" value={`${state.score} / ${total}`} />
        <Kv label="Attempts" value={String(state.attempts)} />
        <Kv label="Best Streak" value={String(state.bestStreak)} />
        {timeLine && <Kv label="Time" value={timeLine.replace('Time: ', '')} />}
      </div>
      {modes.length > 0 && (
        <p className="text-sm text-om-muted">
          <span className="font-medium">Modes:</span> {modes.join(' · ')}
        </p>
      )}
      {missedTitles.length > 0 ? (
        <div>
          <p className="text-sm font-medium text-om-error mb-1">
            Missed ({missedTitles.length}):
          </p>
          <ul className="text-sm text-om-muted space-y-0.5">
            {missedTitles.map((t) => <li key={t}>• {t}</li>)}
          </ul>
        </div>
      ) : (
        <p className="text-sm text-om-success font-medium">No events missed!</p>
      )}
      <button
        onClick={handleCopy}
        className="w-full py-1.5 rounded border border-om-border text-sm text-om-text hover:bg-om-slot-hover transition-colors"
      >
        {copied ? 'Copied!' : 'Copy summary'}
      </button>
    </div>
  )
}

function Kv({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-om-bg rounded px-2 py-1.5">
      <p className="text-om-muted text-sm">{label}</p>
      <p className="font-bold font-mono text-om-text">{value}</p>
    </div>
  )
}

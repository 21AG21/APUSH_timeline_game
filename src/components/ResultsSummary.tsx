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
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-3">
      <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Game Summary</h3>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <Kv label="Score" value={`${state.score} / ${total}`} />
        <Kv label="Attempts" value={String(state.attempts)} />
        <Kv label="Best Streak" value={String(state.bestStreak)} />
        {timeLine && <Kv label="Time" value={timeLine.replace('Time: ', '')} />}
      </div>
      {modes.length > 0 && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          <span className="font-medium">Modes:</span> {modes.join(' · ')}
        </p>
      )}
      {missedTitles.length > 0 ? (
        <div>
          <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-1">
            Missed ({missedTitles.length}):
          </p>
          <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-0.5">
            {missedTitles.map((t) => <li key={t}>• {t}</li>)}
          </ul>
        </div>
      ) : (
        <p className="text-xs text-green-600 dark:text-green-400 font-medium">No events missed!</p>
      )}
      <button
        onClick={handleCopy}
        className="w-full py-1.5 rounded border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        {copied ? 'Copied!' : 'Copy summary'}
      </button>
    </div>
  )
}

function Kv({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded px-2 py-1.5">
      <p className="text-gray-400 dark:text-gray-500 text-xs">{label}</p>
      <p className="font-bold text-gray-800 dark:text-gray-100">{value}</p>
    </div>
  )
}

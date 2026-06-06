import type { Event, GameState, Settings } from '../data/types'
import { ResultsSummary } from './ResultsSummary'

interface Props {
  state: GameState
  settings: Settings
  allEvents: Event[]
  onNewGame: () => void
}

export function GameOverReview({ state, settings, allEvents, onNewGame }: Props) {
  // Build what the correct full timeline would look like: timeline + current (missed) + pool, sorted
  const allPlaced = [
    ...state.timeline,
    ...(state.current ? [state.current] : []),
    ...state.pool,
  ].sort((a, b) => a.year - b.year)

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-2xl my-4">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-red-600 dark:text-red-400">Game Over</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Hard mode — one wrong placement ends the game
            </p>
          </div>
          <button
            onClick={onNewGame}
            className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
          >
            New Game
          </button>
        </div>

        <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <ResultsSummary state={state} settings={settings} allEvents={allEvents} />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Correct Timeline
            </h3>
            <div className="space-y-1 max-h-96 overflow-y-auto pr-1">
              {allPlaced.map((event, i) => {
                const wasPlaced = state.timeline.some((e) => e.id === event.id)
                const isMissed = state.current?.id === event.id
                return (
                  <div
                    key={event.id}
                    className={`rounded border px-3 py-2 text-xs ${
                      isMissed
                        ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20'
                        : wasPlaced
                        ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10'
                        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-gray-800 dark:text-gray-200">
                        {i + 1}. {event.title}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 font-mono shrink-0">{event.year}</span>
                    </div>
                    {isMissed && (
                      <p className="text-red-600 dark:text-red-400 mt-0.5">← Missed placement</p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

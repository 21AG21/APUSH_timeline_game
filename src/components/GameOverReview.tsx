import type { Event, GameState, Settings } from '../data/types'
import { ResultsSummary } from './ResultsSummary'

interface Props {
  state: GameState
  settings: Settings
  allEvents: Event[]
  onNewGame: () => void
}

export function GameOverReview({ state, settings, allEvents, onNewGame }: Props) {
  const allPlaced = [
    ...state.timeline,
    ...(state.current ? [state.current] : []),
    ...state.pool,
  ].sort((a, b) => a.year - b.year)

  return (
    <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-om-surface rounded-t-2xl sm:rounded-lg shadow-2xl w-full max-w-2xl max-h-[92dvh] overflow-y-auto">
        <div className="px-4 sm:px-6 py-4 border-b border-om-border flex items-center justify-between gap-3 sticky top-0 bg-om-surface z-10">
          <div>
            <h2 className="text-lg font-bold text-om-error">Game Over</h2>
            <p className="text-sm text-om-muted">
              Hard mode — one wrong placement ends the game
            </p>
          </div>
          <button
            onClick={onNewGame}
            className="shrink-0 h-11 px-4 rounded-lg bg-om-accent hover:bg-om-accent-hover text-om-accent-fg text-sm font-medium transition-colors"
          >
            New Game
          </button>
        </div>

        <div className="px-4 sm:px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <ResultsSummary state={state} settings={settings} allEvents={allEvents} />
          </div>

          <div>
            <h3 className="text-base font-semibold text-om-text mb-2">
              Correct Timeline
            </h3>
            <div className="space-y-1 max-h-96 overflow-y-auto pr-1">
              {allPlaced.map((event, i) => {
                const wasPlaced = state.timeline.some((e) => e.id === event.id)
                const isMissed = state.current?.id === event.id
                return (
                  <div
                    key={event.id}
                    className={`rounded border px-3 py-2 text-sm ${
                      isMissed
                        ? 'border-om-error bg-om-error-bg'
                        : wasPlaced
                        ? 'border-om-success bg-om-success-bg'
                        : 'border-om-border bg-om-bg'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-om-text">
                        {i + 1}. {event.title}
                      </span>
                      <span className="text-om-muted font-mono shrink-0">{event.year}</span>
                    </div>
                    {isMissed && (
                      <p className="text-om-error mt-0.5">← Missed placement</p>
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

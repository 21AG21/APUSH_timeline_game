import type { Event, GameState, Settings } from '../data/types'
import { ResultsSummary } from './ResultsSummary'
import { Stamp } from './ui'

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
      <div className="bg-om-surface border border-om-border shadow-2xl w-full max-w-2xl max-h-[92dvh] overflow-y-auto">
        <div className="px-4 sm:px-6 py-4 rule-double flex items-center justify-between gap-3 sticky top-0 bg-om-surface z-10">
          <div>
            <h2 className="label-mono text-om-error">Game over</h2>
            <p className="mt-1 text-sm text-om-body">
              Hard mode — one wrong placement ends the game
            </p>
          </div>
          <Stamp onClick={onNewGame} className="shrink-0">
            New game
          </Stamp>
        </div>

        <div className="px-4 sm:px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <ResultsSummary state={state} settings={settings} allEvents={allEvents} />
          </div>

          <div>
            <p className="label-mono text-om-muted mb-2 border-b border-om-border pb-1.5">
              The correct order
            </p>
            <div className="max-h-96 overflow-y-auto pr-1">
              {allPlaced.map((event, i) => {
                const wasPlaced = state.timeline.some((e) => e.id === event.id)
                const isMissed = state.current?.id === event.id
                return (
                  <div
                    key={event.id}
                    className={`border-b border-l-[3px] border-b-om-border px-3 py-2 text-sm ${
                      isMissed
                        ? 'border-l-om-error bg-om-error-bg'
                        : wasPlaced
                          ? 'border-l-om-accent'
                          : 'border-l-transparent'
                    }`}
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-om-text">
                        <span className="label-mono text-om-muted mr-2">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        {event.title}
                      </span>
                      <span className="font-serif font-bold text-om-accent tabular-nums shrink-0">
                        {event.year}
                      </span>
                    </div>
                    {isMissed && (
                      <p className="label-mono text-om-error mt-1">Missed placement</p>
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

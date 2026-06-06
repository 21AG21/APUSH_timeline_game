interface Props {
  score: number
  attempts: number
  poolSize: number
  timelineSize: number
  streak: number
  done: boolean
  gameOver: boolean
  timedMode: boolean
  timerSecondsLeft: number | null
  onNewGame: () => void
}

export function Scoreboard({
  score,
  attempts,
  poolSize,
  timelineSize,
  streak,
  done,
  gameOver,
  timedMode,
  timerSecondsLeft,
  onNewGame,
}: Props) {
  const total = score + poolSize + (done || gameOver ? 0 : 1)
  return (
    <div className="flex items-center gap-4 px-4 py-2 bg-om-bg border-b border-om-border flex-wrap">
      <div className="flex gap-4 text-sm flex-wrap">
        <Stat label="Score" value={`${score} / ${total}`} />
        <Stat label="Attempts" value={String(attempts)} />
        <Stat label="Streak" value={String(streak)} highlight={streak >= 3} />
        <Stat label="Timeline" value={String(timelineSize)} />
        <Stat label="Remaining" value={String(poolSize)} />
        {timedMode && timerSecondsLeft !== null && (
          <Stat
            label="Time"
            value={`${timerSecondsLeft}s`}
            highlight={timerSecondsLeft <= 10}
            danger={timerSecondsLeft <= 10}
          />
        )}
      </div>
      <button
        onClick={onNewGame}
        className="ml-auto px-3 py-1.5 text-sm font-medium rounded bg-om-accent hover:bg-om-accent-hover text-white transition-colors"
      >
        New Game
      </button>
      {done && !gameOver && (
        <span className="text-sm font-semibold text-om-success">
          Complete! Final: {score}/{total}
        </span>
      )}
    </div>
  )
}

function Stat({
  label,
  value,
  highlight,
  danger,
}: {
  label: string
  value: string
  highlight?: boolean
  danger?: boolean
}) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-xs text-om-muted">{label}</span>
      <span
        className={`font-bold font-mono ${
          danger
            ? 'text-om-error'
            : highlight
            ? 'text-om-accent'
            : 'text-om-text'
        }`}
      >
        {value}
      </span>
    </div>
  )
}

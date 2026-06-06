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
}: Props) {
  const total = score + poolSize + (done || gameOver ? 0 : 1)

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Top row: Score + Attempts */}
      <div className="grid grid-cols-2 gap-3">
        <Stat label="Score" value={`${score} / ${total}`} />
        <Stat label="Attempts" value={String(attempts)} />
      </div>

      {/* Streak — centered, prominent */}
      <div className="flex flex-col items-center py-1">
        <div className="flex items-center gap-3">
          {streak > 0 && <span className="text-3xl select-none">🔥</span>}
          <span
            className={`text-5xl font-black font-mono leading-none ${
              streak >= 3 ? 'text-om-accent' : 'text-om-text'
            }`}
          >
            {streak}
          </span>
          {streak > 0 && <span className="text-3xl select-none">🔥</span>}
        </div>
        <span className="text-xs font-bold text-om-muted uppercase tracking-widest mt-1.5">
          Streak
        </span>
      </div>

      {/* Bottom row: Timeline + Remaining */}
      <div className="grid grid-cols-2 gap-3">
        <Stat label="Timeline" value={String(timelineSize)} />
        <Stat label="Remaining" value={String(poolSize)} />
      </div>

      {/* Timer (timed mode) */}
      {timedMode && timerSecondsLeft !== null && (
        <div className="flex justify-center">
          <Stat
            label="Time"
            value={`${timerSecondsLeft}s`}
            highlight={timerSecondsLeft <= 10}
            danger={timerSecondsLeft <= 10}
          />
        </div>
      )}

      {/* Completion message */}
      {done && !gameOver && (
        <p className="text-sm font-semibold text-om-success text-center">
          Complete! Final: {score} / {total}
        </p>
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
    <div className="flex flex-col items-center bg-om-bg rounded-lg px-3 py-2">
      <span className="text-xs text-om-muted uppercase tracking-wide font-medium">{label}</span>
      <span
        className={`text-2xl font-bold font-mono mt-0.5 ${
          danger ? 'text-om-error' : highlight ? 'text-om-accent' : 'text-om-text'
        }`}
      >
        {value}
      </span>
    </div>
  )
}

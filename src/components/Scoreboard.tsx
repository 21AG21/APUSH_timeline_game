interface Props {
  score: number
  attempts: number
  poolSize: number
  timelineSize: number
  streak: number
  done: boolean
  gameOver: boolean
}

export function Scoreboard({
  score,
  attempts,
  poolSize,
  timelineSize,
  streak,
  done,
  gameOver,
}: Props) {
  const total = score + poolSize + (done || gameOver ? 0 : 1)

  return (
    <div className="px-5 py-5 space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Score" value={`${score}/${total}`} />
        <StatCard label="Attempts" value={String(attempts)} />
      </div>

      <div className="flex flex-col items-center py-3 bg-om-bg rounded-xl border border-om-border">
        <span
          className={`text-6xl font-black leading-none tabular-nums ${
            streak > 0 ? 'streak-rainbow' : 'text-om-text'
          }`}
        >
          {streak}
        </span>
        <span className="text-sm font-bold text-om-muted uppercase tracking-[0.2em] mt-2">
          Streak
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Timeline" value={String(timelineSize)} />
        <StatCard label="Remaining" value={String(poolSize)} />
      </div>

      {done && !gameOver && (
        <div className="text-center py-2 bg-om-success-bg rounded-lg border border-om-border">
          <p className="text-base font-bold text-om-success">
            Complete! {score}/{total}
          </p>
        </div>
      )}
    </div>
  )
}

function StatCard({
  label,
  value,
  danger,
}: {
  label: string
  value: string
  danger?: boolean
}) {
  return (
    <div className="flex flex-col items-center bg-om-bg rounded-xl border border-om-border px-4 py-3">
      <span className="text-xs text-om-muted uppercase tracking-wider font-semibold">{label}</span>
      <span
        className={`text-3xl font-bold mt-1 leading-none tabular-nums ${
          danger ? 'text-om-error' : 'text-om-text'
        }`}
      >
        {value}
      </span>
    </div>
  )
}

interface Props {
  score: number
  attempts: number
  poolSize: number
  timelineSize: number
  streak: number
  done: boolean
  gameOver: boolean
  /** Single-line strip used by the mobile layout. */
  compact?: boolean
}

export function Scoreboard({
  score,
  attempts,
  poolSize,
  timelineSize,
  streak,
  done,
  gameOver,
  compact,
}: Props) {
  const total = score + poolSize + (done || gameOver ? 0 : 1)

  if (compact) {
    return (
      <div className="flex items-center justify-around gap-2 px-3 py-2 border-b border-om-border bg-om-bg">
        <Inline label="Score" value={`${score}/${total}`} />
        <Divider />
        <div className="flex flex-col items-center leading-none">
          <span
            className={`text-2xl font-black tabular-nums ${
              streak > 0 ? 'streak-rainbow' : 'text-om-text'
            }`}
          >
            {streak}
          </span>
          <span className="text-[0.65rem] font-bold text-om-muted uppercase tracking-wider mt-1">
            Streak
          </span>
        </div>
        <Divider />
        <Inline label="Left" value={String(poolSize)} />
        <Divider />
        <Inline label="Tries" value={String(attempts)} />
      </div>
    )
  }

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

function Divider() {
  return <span className="w-px self-stretch bg-om-border" />
}

function Inline({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center leading-none">
      <span className="text-lg font-bold text-om-text tabular-nums">{value}</span>
      <span className="text-[0.65rem] font-bold text-om-muted uppercase tracking-wider mt-1">
        {label}
      </span>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center bg-om-bg rounded-xl border border-om-border px-4 py-3">
      <span className="text-xs text-om-muted uppercase tracking-wider font-semibold">{label}</span>
      <span className="text-3xl font-bold mt-1 leading-none tabular-nums text-om-text">
        {value}
      </span>
    </div>
  )
}

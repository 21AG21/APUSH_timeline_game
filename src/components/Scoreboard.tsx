interface Props {
  score: number
  attempts: number
  poolSize: number
  streak: number
  bestStreak: number
  done: boolean
  gameOver: boolean
  /** Tighter type and padding where vertical space is scarce. */
  compact?: boolean
  /** One line, no sub-labels — for a landscape phone, where every row of the
      panel competes with the card the player has to drag. */
  dense?: boolean
}

/**
 * Three ruled columns of headline figures. The same block serves both layouts —
 * only the scale changes — so the numbers sit in the same order wherever you
 * read them.
 */
export function Scoreboard({
  score,
  attempts,
  poolSize,
  streak,
  bestStreak,
  done,
  gameOver,
  compact,
  dense,
}: Props) {
  const total = score + poolSize + (done || gameOver ? 0 : 1)

  if (dense) {
    return (
      // No "N left" here: the score already reads as a fraction of the total,
      // and a fourth item overruns the width a landscape panel has to spare.
      <div className="flex items-baseline justify-between gap-2 px-3 py-1.5">
        <DenseStat label="Streak" value={String(streak)} gradient={streak > 0} />
        <DenseStat label="Score" value={`${score}/${total}`} />
        <DenseStat label="Tries" value={String(attempts)} />
      </div>
    )
  }

  return (
    <div className={compact ? 'px-3 py-2.5' : 'px-5 py-3'}>
      <div className="flex items-stretch gap-4">
        <Stat
          label="Streak"
          value={String(streak)}
          sub={`best ${bestStreak}`}
          compact={compact}
          gradient={streak > 0}
        />
        <Rule />
        <Stat label="Score" value={String(score)} sub={`of ${total}`} compact={compact} />
        <Rule />
        <Stat label="Tries" value={String(attempts)} sub={`${poolSize} left`} compact={compact} />
      </div>

      {done && !gameOver && (
        <p className="label-mono mt-3 border border-om-border bg-om-success-bg px-3 py-2 text-om-success">
          Record complete — {score} of {total}
        </p>
      )}
    </div>
  )
}

function Rule() {
  return <span className="w-px self-stretch bg-om-border" />
}

function DenseStat({
  label,
  value,
  gradient,
}: {
  label: string
  value: string
  gradient?: boolean
}) {
  return (
    <span className="flex items-baseline gap-1.5 shrink-0">
      <span className="label-mono text-om-muted">{label}</span>
      <span
        className={`figure text-base ${gradient ? 'streak-gradient' : 'text-om-text'}`}
      >
        {value}
      </span>
    </span>
  )
}

function Stat({
  label,
  value,
  sub,
  compact,
  gradient,
}: {
  label: string
  value: string
  sub: string
  compact?: boolean
  gradient?: boolean
}) {
  return (
    <div className="flex-1 min-w-0">
      <div className="label-mono text-om-muted">{label}</div>
      <div
        className={`figure ${compact ? 'text-2xl' : 'text-4xl'} ${
          gradient ? 'streak-gradient' : 'text-om-text'
        }`}
      >
        {value}
      </div>
      <div className="text-xs text-om-muted truncate">{sub}</div>
    </div>
  )
}

interface Props {
  score: number
  attempts: number
  poolSize: number
  timelineSize: number
  done: boolean
  onNewGame: () => void
}

export function Scoreboard({ score, attempts, poolSize, timelineSize, done, onNewGame }: Props) {
  const total = score + poolSize + (done ? 0 : 1)
  return (
    <div className="flex items-center gap-4 px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-wrap">
      <div className="flex gap-4 text-sm flex-wrap">
        <Stat label="Score" value={`${score} / ${total}`} />
        <Stat label="Attempts" value={String(attempts)} />
        <Stat label="Timeline" value={String(timelineSize)} />
        <Stat label="Remaining" value={String(poolSize)} />
      </div>
      <button
        onClick={onNewGame}
        className="ml-auto px-3 py-1.5 text-sm font-medium rounded bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
      >
        New Game
      </button>
      {done && (
        <span className="text-sm font-semibold text-green-600 dark:text-green-400">
          Game complete! Final: {score}/{total}
        </span>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
      <span className="font-bold text-gray-800 dark:text-gray-100">{value}</span>
    </div>
  )
}

interface Props {
  index: number
  isTentative: boolean
  isDragOver: boolean
  onClick: () => void
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: () => void
  onDrop: (e: React.DragEvent) => void
}

export function SlotMarker({ index, isTentative, isDragOver, onClick, onDragOver, onDragLeave, onDrop }: Props) {
  const active = isTentative || isDragOver
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Slot ${index + 1}`}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      onDragOver={(e) => { e.preventDefault(); onDragOver(e) }}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`relative flex items-center justify-center h-7 mx-2 rounded transition-all cursor-pointer group ${
        active
          ? 'bg-indigo-100 dark:bg-indigo-900 border-2 border-indigo-400 dark:border-indigo-500'
          : 'border-2 border-dashed border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-600'
      }`}
    >
      <span className={`text-xs font-semibold px-2 ${active ? 'text-indigo-600 dark:text-indigo-300' : 'text-gray-300 dark:text-gray-600 group-hover:text-indigo-400'}`}>
        {isTentative ? `→ Slot ${index + 1} (Enter to confirm)` : isDragOver ? `Drop here` : `${index + 1}`}
      </span>
    </div>
  )
}

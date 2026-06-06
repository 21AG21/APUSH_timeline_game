interface Props {
  index: number
  slotCount: number
  isTentative: boolean
  isDragOver: boolean
  onClick: () => void
  onConfirm: () => void
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: () => void
  onDrop: (e: React.DragEvent) => void
}

export function SlotMarker({
  index,
  slotCount,
  isTentative,
  isDragOver,
  onClick,
  onConfirm,
  onDragOver,
  onDragLeave,
  onDrop,
}: Props) {
  const active = isTentative || isDragOver

  const handleClick = () => {
    if (isTentative) {
      onConfirm()
    } else {
      onClick()
    }
  }

  let label: string
  if (isTentative) {
    const keyNum = index + 1 <= 9 ? `press ${index + 1} or ` : ''
    label = `→ Slot ${index + 1} — ${keyNum}Enter to confirm`
  } else if (isDragOver) {
    label = 'Drop here'
  } else {
    label = index + 1 <= slotCount ? String(index + 1) : ''
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Slot ${index + 1}`}
      onClick={handleClick}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      onDragOver={(e) => {
        e.preventDefault()
        onDragOver(e)
      }}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`relative flex items-center justify-center h-7 mx-2 rounded transition-all cursor-pointer group ${
        active
          ? 'bg-indigo-100 dark:bg-indigo-900 border-2 border-indigo-400 dark:border-indigo-500'
          : 'border-2 border-dashed border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-600'
      }`}
    >
      <span
        className={`text-xs font-semibold px-2 truncate ${
          active
            ? 'text-indigo-600 dark:text-indigo-300'
            : 'text-gray-300 dark:text-gray-600 group-hover:text-indigo-400'
        }`}
      >
        {label}
      </span>
    </div>
  )
}

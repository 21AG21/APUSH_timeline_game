interface Props {
  index: number
  slotCount: number
  isTentative: boolean
  isDragOver: boolean
  onClick: () => void
  onConfirm: () => void
}

export function SlotMarker({
  index,
  slotCount,
  isTentative,
  isDragOver,
  onClick,
  onConfirm,
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
    label = `Slot ${index + 1} — confirm?`
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
      className={`relative flex items-center justify-center min-h-[48px] sm:min-h-0 h-7 mx-2 rounded transition-all cursor-pointer group ${
        active
          ? 'bg-om-accent-light border-2 border-om-accent'
          : 'border-2 border-dashed border-om-border hover:border-om-accent'
      }`}
    >
      <span
        className={`text-sm font-semibold px-2 truncate ${
          active
            ? 'text-om-accent'
            : 'text-om-border group-hover:text-om-accent'
        }`}
      >
        {label}
      </span>
    </div>
  )
}

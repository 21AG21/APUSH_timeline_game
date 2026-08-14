interface Props {
  index: number
  isTentative: boolean
  isDragOver: boolean
  onClick: () => void
  onConfirm: () => void
}

/**
 * A gap in the filed record where the card in hand can go. Styled as an empty
 * ruled line with the same left accent rail as a filed card, so a placed card
 * lands exactly where the slot promised.
 */
export function SlotMarker({ index, isTentative, isDragOver, onClick, onConfirm }: Props) {
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
    label = 'Tap again to place'
  } else if (isDragOver) {
    label = 'Drop here'
  } else {
    label = 'File here'
  }

  // Only the first nine slots have a number key bound to them, so only those
  // advertise one — a digit on slot 12 would be an instruction that does nothing.
  const key = index < 9 ? String(index + 1) : null

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Slot ${index + 1}`}
      onClick={handleClick}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      className={`flex items-center justify-between gap-3 h-11 sm:h-10 px-4 border border-l-[3px] transition-colors cursor-pointer select-none ${
        active
          ? 'bg-om-accent-light border-om-accent border-l-om-accent'
          : 'border-om-border border-l-om-accent hover:bg-om-slot-hover'
      }`}
    >
      <span
        className={`label-mono truncate ${active ? 'text-om-accent' : 'text-om-muted'}`}
      >
        {label}
      </span>
      {key && !active && (
        <span className="label-mono shrink-0 text-om-muted opacity-60">{key}</span>
      )}
    </div>
  )
}

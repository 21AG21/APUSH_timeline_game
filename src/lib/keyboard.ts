export type KeyPressResult =
  | { type: 'tentative'; slot: number }
  | { type: 'confirm'; slot: number }
  | { type: 'step'; slot: number }
  | { type: 'clear' }
  | { type: 'noop' }

/**
 * Pure key-press handler for timeline slot selection.
 * Number keys: first press = tentative; SAME number pressed again = confirm.
 * Different number = re-tentative (not confirm).
 * Enter = confirm tentative. Arrows = step. Escape = clear.
 */
export function handleKeyPress(
  key: string,
  tentativeSlot: number | null,
  slotCount: number
): KeyPressResult {
  if (key >= '1' && key <= '9') {
    const slot = parseInt(key, 10) - 1
    if (slot >= slotCount) return { type: 'noop' }
    if (tentativeSlot === slot) return { type: 'confirm', slot }
    return { type: 'tentative', slot }
  }
  if (key === 'ArrowDown' || key === 'ArrowRight') {
    const next = tentativeSlot === null ? 0 : Math.min(tentativeSlot + 1, slotCount - 1)
    return { type: 'step', slot: next }
  }
  if (key === 'ArrowUp' || key === 'ArrowLeft') {
    const prev = tentativeSlot === null ? slotCount - 1 : Math.max(tentativeSlot - 1, 0)
    return { type: 'step', slot: prev }
  }
  if (key === 'Enter') {
    if (tentativeSlot !== null) return { type: 'confirm', slot: tentativeSlot }
    return { type: 'noop' }
  }
  if (key === 'Escape') {
    return { type: 'clear' }
  }
  return { type: 'noop' }
}

import { useEffect, useCallback } from 'react'
import type { Event, Note } from '../data/types'
import { EventCard } from './EventCard'
import { SlotMarker } from './SlotMarker'
import { EraBandHeader } from './EraBands'
import { handleKeyPress } from '../lib/keyboard'

interface Props {
  timeline: Event[]
  tentativeSlot: number | null
  hasCurrentEvent: boolean
  hideDates: boolean
  hardMode: boolean
  notes: Note[]
  lastPlacementCorrect: boolean | null
  /** Mobile: render collapsed event cards so several fit on screen. */
  compact?: boolean
  /** Slot currently under the dragged card, from usePointerDrag. */
  dragOverSlot: number | null
  registerSlot: (index: number, el: HTMLElement | null) => void
  registerScrollContainer: (el: HTMLElement | null) => void
  onSlotClick: (slot: number) => void
  onSlotConfirm: (slot: number) => void
}

export function Timeline({
  timeline,
  tentativeSlot,
  hasCurrentEvent,
  hideDates,
  hardMode,
  notes,
  lastPlacementCorrect,
  compact,
  dragOverSlot,
  registerSlot,
  registerScrollContainer,
  onSlotClick,
  onSlotConfirm,
}: Props) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!hasCurrentEvent) return
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      const slotCount = timeline.length + 1
      const result = handleKeyPress(e.key, tentativeSlot, slotCount)

      if (result.type === 'noop') return
      e.preventDefault()

      if (result.type === 'tentative' || result.type === 'step') {
        onSlotClick(result.slot)
      } else if (result.type === 'confirm') {
        onSlotConfirm(result.slot)
      } else if (result.type === 'clear') {
        onSlotClick(-1)
      }
    },
    [hasCurrentEvent, timeline.length, tentativeSlot, onSlotClick, onSlotConfirm]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const noteMap = new Map(notes.map((n) => [n.eventId, n]))
  const slotCount = timeline.length + 1

  const renderSlot = (index: number) => (
    <div ref={(el) => registerSlot(index, el)}>
      <SlotMarker
        index={index}
        slotCount={slotCount}
        isTentative={tentativeSlot === index}
        isDragOver={dragOverSlot === index}
        onClick={() => onSlotClick(index)}
        onConfirm={() => onSlotConfirm(index)}
      />
    </div>
  )

  const items: React.ReactNode[] = []

  if (hasCurrentEvent) {
    items.push(<div key="slot-0">{renderSlot(0)}</div>)
  }

  timeline.forEach((event, i) => {
    const prevYear = i > 0 ? timeline[i - 1].year : null
    if (!hardMode) {
      items.push(
        <EraBandHeader key={`era-${event.id}`} year={event.year} prevYear={prevYear} />
      )
    }
    items.push(
      <div key={event.id}>
        <EventCard
          event={event}
          index={i}
          hideDates={hideDates}
          hardMode={hardMode}
          note={noteMap.get(event.id)}
          compact={compact}
        />
      </div>
    )
    if (hasCurrentEvent) {
      items.push(<div key={`slot-${i + 1}`}>{renderSlot(i + 1)}</div>)
    }
  })

  return (
    <div
      ref={registerScrollContainer}
      className="scroll-pane flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 space-y-2 sm:space-y-3"
    >
      {lastPlacementCorrect === true && (
        <div className="mb-2 px-3 py-2 bg-om-success-bg border border-om-border rounded text-sm text-om-success font-semibold">
          Correct!
        </div>
      )}
      {lastPlacementCorrect === false && (
        <div className="mb-2 px-3 py-2 bg-om-error-bg border border-om-border rounded text-sm text-om-error font-semibold">
          Incorrect.
        </div>
      )}
      {items}
    </div>
  )
}

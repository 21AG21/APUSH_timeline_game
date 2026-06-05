import { useState, useEffect, useCallback } from 'react'
import type { Event, Note } from '../data/types'
import { EventCard } from './EventCard'
import { SlotMarker } from './SlotMarker'

interface Props {
  timeline: Event[]
  tentativeSlot: number | null
  hasCurrentEvent: boolean
  hideDates: boolean
  showUnderstanding: boolean
  notes: Note[]
  lastPlacementCorrect: boolean | null
  onSlotClick: (slot: number) => void
  onSlotConfirm: (slot: number) => void
  onDrop: (slot: number) => void
}

export function Timeline({
  timeline,
  tentativeSlot,
  hasCurrentEvent,
  hideDates,
  showUnderstanding,
  notes,
  lastPlacementCorrect,
  onSlotClick,
  onSlotConfirm,
  onDrop,
}: Props) {
  const [dragOverSlot, setDragOverSlot] = useState<number | null>(null)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!hasCurrentEvent) return
      const slotCount = timeline.length + 1
      if (e.key >= '1' && e.key <= '9') {
        const slot = parseInt(e.key) - 1
        if (slot < slotCount) {
          onSlotClick(slot)
          e.preventDefault()
        }
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault()
        const next = tentativeSlot === null ? 0 : Math.min(tentativeSlot + 1, slotCount - 1)
        onSlotClick(next)
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault()
        const prev = tentativeSlot === null ? slotCount - 1 : Math.max(tentativeSlot - 1, 0)
        onSlotClick(prev)
      } else if (e.key === 'Enter' && tentativeSlot !== null) {
        e.preventDefault()
        onSlotConfirm(tentativeSlot)
      } else if (e.key === 'Escape') {
        onSlotClick(tentativeSlot === null ? -1 : -1) // clear
      }
    },
    [hasCurrentEvent, timeline.length, tentativeSlot, onSlotClick, onSlotConfirm]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const noteMap = new Map(notes.map((n) => [n.eventId, n]))

  const items: React.ReactNode[] = []

  if (hasCurrentEvent) {
    items.push(
      <SlotMarker
        key="slot-0"
        index={0}
        isTentative={tentativeSlot === 0}
        isDragOver={dragOverSlot === 0}
        onClick={() => onSlotClick(0)}
        onDragOver={() => setDragOverSlot(0)}
        onDragLeave={() => setDragOverSlot(null)}
        onDrop={(e) => { e.preventDefault(); setDragOverSlot(null); onDrop(0) }}
      />
    )
  }

  timeline.forEach((event, i) => {
    items.push(
      <EventCard
        key={event.id}
        event={event}
        index={i}
        hideDates={hideDates}
        showUnderstanding={showUnderstanding}
        note={noteMap.get(event.id)}
      />
    )
    if (hasCurrentEvent) {
      items.push(
        <SlotMarker
          key={`slot-${i + 1}`}
          index={i + 1}
          isTentative={tentativeSlot === i + 1}
          isDragOver={dragOverSlot === i + 1}
          onClick={() => onSlotClick(i + 1)}
          onDragOver={() => setDragOverSlot(i + 1)}
          onDragLeave={() => setDragOverSlot(null)}
          onDrop={(e) => { e.preventDefault(); setDragOverSlot(null); onDrop(i + 1) }}
        />
      )
    }
  })

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-1">
      {lastPlacementCorrect === false && (
        <div className="mb-2 px-3 py-2 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded text-sm text-red-700 dark:text-red-400">
          Incorrect placement — try again. Use the year and context clues.
        </div>
      )}
      {lastPlacementCorrect === true && (
        <div className="mb-2 px-3 py-2 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded text-sm text-green-700 dark:text-green-400">
          Correct! Event placed on the timeline.
        </div>
      )}
      {timeline.length === 0 && !hasCurrentEvent && (
        <div className="text-center text-gray-400 dark:text-gray-500 py-8 text-sm">
          Press "New Game" to start playing.
        </div>
      )}
      {items}
    </div>
  )
}

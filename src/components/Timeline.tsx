import { useState, useEffect, useCallback } from 'react'
import type { Event, Note } from '../data/types'
import { EventCard } from './EventCard'
import { SlotMarker } from './SlotMarker'
import { EraBandHeader } from './EraBands'
import { handleKeyPress } from '../lib/keyboard'

interface WrongFeedback {
  prevYear: number | null
  nextYear: number | null
}

interface Props {
  timeline: Event[]
  tentativeSlot: number | null
  hasCurrentEvent: boolean
  hideDates: boolean
  showUnderstanding: boolean
  hardMode: boolean
  notes: Note[]
  lastPlacementCorrect: boolean | null
  wrongFeedback: WrongFeedback | null
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
  hardMode,
  notes,
  lastPlacementCorrect,
  wrongFeedback,
  onSlotClick,
  onSlotConfirm,
  onDrop,
}: Props) {
  const [dragOverSlot, setDragOverSlot] = useState<number | null>(null)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!hasCurrentEvent) return
      // Don't intercept keys while typing in inputs/textareas
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
    <SlotMarker
      index={index}
      slotCount={slotCount}
      isTentative={tentativeSlot === index}
      isDragOver={dragOverSlot === index}
      onClick={() => onSlotClick(index)}
      onConfirm={() => onSlotConfirm(index)}
      onDragOver={() => setDragOverSlot(index)}
      onDragLeave={() => setDragOverSlot(null)}
      onDrop={(e) => {
        e.preventDefault()
        setDragOverSlot(null)
        onDrop(index)
      }}
    />
  )

  const renderCard = (event: Event, i: number) => (
    <EventCard
      event={event}
      index={i}
      hideDates={hideDates}
      showUnderstanding={showUnderstanding}
      note={noteMap.get(event.id)}
    />
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
    items.push(<div key={event.id}>{renderCard(event, i)}</div>)
    if (hasCurrentEvent) {
      items.push(<div key={`slot-${i + 1}`}>{renderSlot(i + 1)}</div>)
    }
  })

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-1">
      {lastPlacementCorrect === true && (
        <div className="mb-2 px-3 py-2 bg-om-success-bg border border-om-border rounded text-sm text-om-success">
          Correct!
        </div>
      )}
      {lastPlacementCorrect === false && (
        <div className="mb-2 px-3 py-2 bg-om-error-bg border border-om-border rounded text-sm text-om-error">
          <span className="font-semibold">Incorrect.</span>
          {wrongFeedback && (
            <span className="ml-1">
              That slot is between{' '}
              {wrongFeedback.prevYear !== null ? (
                <strong>{wrongFeedback.prevYear}</strong>
              ) : (
                'the beginning'
              )}{' '}
              and{' '}
              {wrongFeedback.nextYear !== null ? (
                <strong>{wrongFeedback.nextYear}</strong>
              ) : (
                'the end'
              )}
              .
            </span>
          )}
          {!wrongFeedback && ' Try a different slot.'}
        </div>
      )}
      {timeline.length === 0 && !hasCurrentEvent && (
        <div className="text-center text-om-muted py-8 text-sm">
          Press "New Game" to start playing.
        </div>
      )}
      {items}
    </div>
  )
}

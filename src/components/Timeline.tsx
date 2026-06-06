import { useState, useEffect, useCallback, useRef } from 'react'
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
  onSlotClick: (slot: number) => void
  onSlotConfirm: (slot: number) => void
  onDrop: (slot: number) => void
}

export function Timeline({
  timeline,
  tentativeSlot,
  hasCurrentEvent,
  hideDates,
  hardMode,
  notes,
  lastPlacementCorrect,
  onSlotClick,
  onSlotConfirm,
  onDrop,
}: Props) {
  const [dragOverSlot, setDragOverSlot] = useState<number | null>(null)
  const slotRefs = useRef<Map<number, HTMLDivElement>>(new Map())

  const registerSlotRef = useCallback((index: number, el: HTMLDivElement | null) => {
    if (el) {
      slotRefs.current.set(index, el)
    } else {
      slotRefs.current.delete(index)
    }
  }, [])

  const findNearestSlot = useCallback((clientY: number): number | null => {
    let nearest: number | null = null
    let minDist = Infinity
    slotRefs.current.forEach((el, index) => {
      const rect = el.getBoundingClientRect()
      const center = rect.top + rect.height / 2
      const dist = Math.abs(clientY - center)
      if (dist < minDist) {
        minDist = dist
        nearest = index
      }
    })
    return nearest
  }, [])

  const handleContainerDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const nearest = findNearestSlot(e.clientY)
    if (nearest !== null && nearest !== dragOverSlot) {
      setDragOverSlot(nearest)
    }
  }, [findNearestSlot, dragOverSlot])

  const handleContainerDragLeave = useCallback((e: React.DragEvent) => {
    const container = e.currentTarget as HTMLElement
    const related = e.relatedTarget as Node | null
    if (!related || !container.contains(related)) {
      setDragOverSlot(null)
    }
  }, [])

  const handleContainerDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (dragOverSlot !== null) {
      onDrop(dragOverSlot)
    }
    setDragOverSlot(null)
  }, [dragOverSlot, onDrop])

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
    <div ref={(el) => registerSlotRef(index, el)}>
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

  const renderCard = (event: Event, i: number) => (
    <EventCard
      event={event}
      index={i}
      hideDates={hideDates}
      hardMode={hardMode}
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
    <div
      className="flex-1 overflow-y-auto p-4 space-y-3"
      onDragOver={hasCurrentEvent ? handleContainerDragOver : undefined}
      onDragLeave={hasCurrentEvent ? handleContainerDragLeave : undefined}
      onDrop={hasCurrentEvent ? handleContainerDrop : undefined}
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

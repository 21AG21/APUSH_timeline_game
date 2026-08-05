import { useCallback, useEffect, useRef, useState } from 'react'

/** Pixels the pointer must travel before a press becomes a drag. */
const DRAG_THRESHOLD = 6
/** Distance from a scroll edge that triggers auto-scrolling. */
const EDGE_ZONE = 72
const EDGE_SPEED = 14

interface Options {
  /** Called with the chosen slot when the drag is released over one. */
  onDrop: (slot: number) => void
  /** Drag is only possible while there is an event to place. */
  enabled: boolean
}

/**
 * Unified drag placement for mouse and touch.
 *
 * HTML5 drag-and-drop never fires on touch devices, so placement is driven by
 * Pointer Events instead: the source card captures the pointer, a ghost follows
 * it, and the slot nearest the pointer stays highlighted until release.
 */
export function usePointerDrag({ onDrop, enabled }: Options) {
  const slotRefs = useRef<Map<number, HTMLElement>>(new Map())
  const scrollRef = useRef<HTMLElement | null>(null)

  const [isDragging, setIsDragging] = useState(false)
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null)
  const [activeSlot, setActiveSlot] = useState<number | null>(null)

  // Refs mirror state so the window listeners never need re-subscribing.
  const activeSlotRef = useRef<number | null>(null)
  const originRef = useRef<{ x: number; y: number } | null>(null)
  const startedRef = useRef(false)
  const pointerYRef = useRef(0)
  const onDropRef = useRef(onDrop)
  onDropRef.current = onDrop

  const registerSlot = useCallback((index: number, el: HTMLElement | null) => {
    if (el) slotRefs.current.set(index, el)
    else slotRefs.current.delete(index)
  }, [])

  const registerScrollContainer = useCallback((el: HTMLElement | null) => {
    scrollRef.current = el
  }, [])

  const findNearestSlot = useCallback((clientY: number): number | null => {
    let nearest: number | null = null
    let minDist = Infinity
    slotRefs.current.forEach((el, index) => {
      const rect = el.getBoundingClientRect()
      // Ignore slots scrolled out of view so the highlight tracks what's visible.
      if (rect.bottom < 0 || rect.top > window.innerHeight) return
      const center = rect.top + rect.height / 2
      const dist = Math.abs(clientY - center)
      if (dist < minDist) {
        minDist = dist
        nearest = index
      }
    })
    return nearest
  }, [])

  const start = useCallback(
    (e: React.PointerEvent) => {
      if (!enabled) return
      if (e.button !== 0 && e.pointerType === 'mouse') return
      originRef.current = { x: e.clientX, y: e.clientY }
      pointerYRef.current = e.clientY
      startedRef.current = false
      setDragPos({ x: e.clientX, y: e.clientY })
      setIsDragging(true)
    },
    [enabled]
  )

  const reset = useCallback(() => {
    setIsDragging(false)
    setDragPos(null)
    setActiveSlot(null)
    activeSlotRef.current = null
    originRef.current = null
    startedRef.current = false
  }, [])

  // Window-level listeners: the pointer routinely leaves the source element.
  useEffect(() => {
    if (!isDragging) return

    const handleMove = (e: PointerEvent) => {
      const origin = originRef.current
      if (!origin) return

      if (!startedRef.current) {
        const dx = e.clientX - origin.x
        const dy = e.clientY - origin.y
        if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return
        startedRef.current = true
      }

      // Suppress scroll/selection now that this is a real drag.
      e.preventDefault()
      pointerYRef.current = e.clientY
      setDragPos({ x: e.clientX, y: e.clientY })
      const nearest = findNearestSlot(e.clientY)
      if (nearest !== activeSlotRef.current) {
        activeSlotRef.current = nearest
        setActiveSlot(nearest)
      }
    }

    const handleUp = () => {
      const slot = activeSlotRef.current
      const didDrag = startedRef.current
      reset()
      if (didDrag && slot !== null) onDropRef.current(slot)
    }

    const handleCancel = () => reset()

    window.addEventListener('pointermove', handleMove, { passive: false })
    window.addEventListener('pointerup', handleUp)
    window.addEventListener('pointercancel', handleCancel)
    return () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
      window.removeEventListener('pointercancel', handleCancel)
    }
  }, [isDragging, findNearestSlot, reset])

  // Auto-scroll the timeline when dragging near its top/bottom edge.
  useEffect(() => {
    if (!isDragging) return
    let frame = 0

    const tick = () => {
      const el = scrollRef.current
      if (el && startedRef.current) {
        const rect = el.getBoundingClientRect()
        const y = pointerYRef.current
        if (y < rect.top + EDGE_ZONE) {
          el.scrollTop -= EDGE_SPEED
        } else if (y > rect.bottom - EDGE_ZONE) {
          el.scrollTop += EDGE_SPEED
        }
        const nearest = findNearestSlot(y)
        if (nearest !== activeSlotRef.current) {
          activeSlotRef.current = nearest
          setActiveSlot(nearest)
        }
      }
      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [isDragging, findNearestSlot])

  return {
    /** Attach to the drag source via onPointerDown. */
    start,
    /** True once the pointer has moved past the threshold. */
    isDragging: isDragging && startedRef.current,
    dragPos,
    activeSlot,
    registerSlot,
    registerScrollContainer,
  }
}

import { useEffect, useRef, useState } from 'react'

interface Props {
  /** Current panel width in px, for the accessible value and keyboard nudges. */
  width: number
  min: number
  max: number
  /** Pointer moved to this viewport x. */
  onDragTo: (clientX: number) => void
  onNudge: (deltaPx: number) => void
  onReset: () => void
}

/**
 * Drag handle between the controls panel and the timeline.
 *
 * Pointer Events rather than mouse events so it works under a finger on a
 * touchscreen laptop or tablet, and pointer capture so the drag survives the
 * cursor outrunning the 6px handle — without capture, a fast drag drops as soon
 * as the pointer leaves the element.
 */
export function PanelDivider({ width, min, max, onDragTo, onNudge, onReset }: Props) {
  const [dragging, setDragging] = useState(false)
  const onDragToRef = useRef(onDragTo)
  useEffect(() => {
    onDragToRef.current = onDragTo
  })

  // While dragging, suppress selection and keep the resize cursor even when the
  // pointer is over the panels rather than the handle itself.
  useEffect(() => {
    if (!dragging) return
    const prevCursor = document.body.style.cursor
    const prevSelect = document.body.style.userSelect
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    return () => {
      document.body.style.cursor = prevCursor
      document.body.style.userSelect = prevSelect
    }
  }, [dragging])

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize the controls panel"
      aria-valuenow={Math.round(width)}
      aria-valuemin={min}
      aria-valuemax={max}
      tabIndex={0}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId)
        setDragging(true)
      }}
      onPointerMove={(e) => {
        if (dragging) onDragToRef.current(e.clientX)
      }}
      onPointerUp={(e) => {
        e.currentTarget.releasePointerCapture(e.pointerId)
        setDragging(false)
      }}
      onPointerCancel={() => setDragging(false)}
      onDoubleClick={onReset}
      onKeyDown={(e) => {
        const step = e.shiftKey ? 48 : 16
        if (e.key === 'ArrowLeft') {
          e.preventDefault()
          onNudge(-step)
        } else if (e.key === 'ArrowRight') {
          e.preventDefault()
          onNudge(step)
        } else if (e.key === 'Home') {
          e.preventDefault()
          onReset()
        }
      }}
      title="Drag to resize · double-click to reset"
      className={`panel-divider group relative shrink-0 self-stretch ${
        dragging ? 'is-dragging' : ''
      }`}
    >
      {/* Hairline, thickened on hover/drag so the handle is findable without
          taking layout width away from the panels. */}
      <span aria-hidden className="panel-divider-line" />
      <span aria-hidden className="panel-divider-grip" />
    </div>
  )
}

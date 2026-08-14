import { useEffect, useRef, useState } from 'react'

/**
 * Reports whether a scroll container has content still below the fold.
 *
 * The controls panel holds more than a short window can show. Browsers that
 * draw overlay scrollbars give no standing sign of that, so the cut-off at the
 * panel's ruled footer reads as a designed edge and the settings beneath it
 * look absent rather than merely scrolled past. This drives a visible hint.
 */
export function useScrollHint<T extends HTMLElement>(): readonly [
  React.RefObject<T | null>,
  boolean,
] {
  const ref = useRef<T | null>(null)
  const [more, setMore] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // A few pixels of slack: sub-pixel layout leaves a fractional remainder at
    // the very bottom, which would otherwise keep the hint permanently lit.
    const update = () => setMore(el.scrollHeight - el.scrollTop - el.clientHeight > 4)
    update()

    el.addEventListener('scroll', update, { passive: true })

    // The pane resizes with the window; its content resizes when a card is
    // expanded or a new one is dealt. Both change the answer, so watch both.
    const ro = new ResizeObserver(update)
    ro.observe(el)
    if (el.firstElementChild) ro.observe(el.firstElementChild)

    return () => {
      el.removeEventListener('scroll', update)
      ro.disconnect()
    }
  }, [])

  // A tuple rather than an object: reading `.more` off a record that also holds
  // a ref reads to the lint rules as touching a ref during render.
  return [ref, more] as const
}

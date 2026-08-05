import { useEffect, useState } from 'react'

/** Subscribes to a CSS media query so layout decisions can branch in JS. */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false
  )

  useEffect(() => {
    const mql = window.matchMedia(query)
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
    setMatches(mql.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [query])

  return matches
}

/**
 * Chooses between the stacked and side-by-side layouts.
 *
 * Side-by-side needs width; stacked needs height. A landscape phone has plenty
 * of the former and almost none of the latter, so it gets the split layout even
 * though it is far narrower than a desktop.
 */
export function useLayout() {
  const wide = useMediaQuery('(min-width: 768px)')
  const shortAndWideEnough = useMediaQuery('(min-width: 640px) and (max-height: 600px)')
  const short = useMediaQuery('(max-height: 600px)')

  const split = wide || shortAndWideEnough
  return {
    split,
    /** Collapse cards and stats when vertical space is scarce. */
    compact: !split || short,
  }
}

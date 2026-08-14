/**
 * The shared vocabulary of controls: a stamped primary action, a ruled ghost
 * button, and the label-plus-segments row used for every setting.
 *
 * Everything here is square-cornered and separated by rules rather than by
 * radius or shadow, which is what keeps the interface reading as a document.
 */

type Tone = 'accent' | 'ink' | 'danger'

const BASE = 'label-mono inline-flex items-center justify-center border transition-colors'

/** Filled primary action. One per region at most. */
export function Stamp({
  children,
  onClick,
  className = '',
}: {
  children: React.ReactNode
  onClick: () => void
  className?: string
}) {
  return (
    <button
      onClick={onClick}
      className={`${BASE} h-11 px-5 bg-om-accent border-om-accent text-om-accent-fg hover:bg-om-accent-hover ${className}`}
    >
      {children}
    </button>
  )
}

/** Secondary action: ruled outline, no fill. */
export function Ghost({
  children,
  onClick,
  className = '',
  ariaLabel,
}: {
  children: React.ReactNode
  onClick: () => void
  className?: string
  ariaLabel?: string
}) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className={`${BASE} h-11 px-4 border-om-border text-om-muted hover:text-om-text hover:bg-om-slot-hover ${className}`}
    >
      {children}
    </button>
  )
}

const SEGMENT_TONE: Record<Tone, { on: string; off: string }> = {
  accent: {
    on: 'bg-om-accent border-om-accent text-om-accent-fg',
    off: 'border-om-border text-om-muted hover:text-om-text',
  },
  ink: {
    on: 'bg-om-text border-om-text text-om-bg',
    off: 'border-om-border text-om-muted hover:text-om-text',
  },
  danger: {
    on: 'bg-om-error border-om-error text-om-error-fg',
    off: 'border-om-error text-om-error hover:bg-om-error-bg',
  },
}

/**
 * One option in a two-or-three-way choice. Rendered as a radio so the pair
 * announces itself as a single setting with a current value, rather than as
 * loose buttons whose state a screen reader has to infer.
 */
export function Segment({
  label,
  active,
  onClick,
  tone = 'accent',
}: {
  label: string
  active: boolean
  onClick: () => void
  tone?: Tone
}) {
  return (
    <button
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className={`inline-flex items-center justify-center border px-3 h-10 sm:h-9 text-sm transition-colors ${
        active ? `font-semibold ${SEGMENT_TONE[tone].on}` : SEGMENT_TONE[tone].off
      }`}
    >
      {label}
    </button>
  )
}

/** A setting: stamped label on the left, its controls right-aligned. */
export function SettingRow({
  label,
  children,
  /** False when the row holds something other than a set of Segments. */
  asGroup = true,
}: {
  label: string
  children: React.ReactNode
  asGroup?: boolean
}) {
  const id = `setting-${label.replace(/\s+/g, '-').toLowerCase()}`
  return (
    <div className="flex items-center justify-between gap-3">
      <span id={id} className="text-xs font-semibold uppercase tracking-[0.08em] text-om-text">
        {label}
      </span>
      <div
        role={asGroup ? 'radiogroup' : undefined}
        aria-labelledby={asGroup ? id : undefined}
        className="flex gap-1.5 shrink-0"
      >
        {children}
      </div>
    </div>
  )
}

/**
 * Marks that a scroll region continues below the fold. Needed because browsers
 * that draw overlay scrollbars give no standing sign of it, which makes the
 * cut-off look like a designed edge. Position the parent `relative`.
 */
export function ScrollHint({ show }: { show: boolean }) {
  if (!show) return null
  return (
    <div
      aria-hidden
      data-scroll-hint
      className="pointer-events-none absolute inset-x-0 bottom-0 h-7 flex items-end justify-center bg-gradient-to-t from-om-surface to-transparent text-om-muted text-xs leading-4"
    >
      ▾
    </div>
  )
}

/** Section heading inside a panel or modal. */
export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="label-mono text-om-muted">{children}</p>
}

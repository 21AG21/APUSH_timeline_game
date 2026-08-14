import { useState, useRef, useEffect } from 'react'
import type { Event } from '../data/types'

interface Props {
  allEvents: Event[]
  selectedUnits: number[]
  selectedRegions: string[]
  onChange: (units: number[], regions: string[]) => void
}

export function FilterPopover({ allEvents, selectedUnits, selectedRegions, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const allUnits = Array.from(new Set(allEvents.flatMap((e) => e.units))).sort((a, b) => a - b)
  const allRegions = Array.from(new Set(allEvents.map((e) => e.region))).sort()

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const toggleUnit = (u: number) => {
    const next = selectedUnits.includes(u) ? selectedUnits.filter((x) => x !== u) : [...selectedUnits, u]
    onChange(next, selectedRegions)
  }

  const toggleRegion = (r: string) => {
    const next = selectedRegions.includes(r) ? selectedRegions.filter((x) => x !== r) : [...selectedRegions, r]
    onChange(selectedUnits, next)
  }

  const reset = () => onChange([], [])

  const count = selectedUnits.length + selectedRegions.length
  const active = count > 0

  return (
    <div ref={ref} className="relative">
      {/* Sized to match a Segment so the Deck row lines up with the rows above it. */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={`inline-flex items-center justify-center border px-3 h-10 sm:h-9 text-sm transition-colors ${
          active
            ? 'font-semibold bg-om-accent border-om-accent text-om-accent-fg'
            : 'border-om-border text-om-muted hover:text-om-text'
        }`}
      >
        {active ? `Filtered (${count})` : 'All events'}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-40 bg-om-surface border border-om-border shadow-xl p-4 w-[min(20rem,calc(100vw-2rem))] max-h-[60dvh] overflow-y-auto">
          <div className="flex items-center justify-between gap-3 mb-3 border-b border-om-border pb-2">
            <span className="label-mono text-om-text">Filter pool</span>
            {active && (
              <button onClick={reset} className="label-mono text-om-accent underline">
                Reset
              </button>
            )}
          </div>

          <Section title="Units">
            <div className="flex flex-wrap gap-1.5">
              {allUnits.map((u) => (
                <CheckChip
                  key={u}
                  label={`Unit ${u}`}
                  checked={selectedUnits.includes(u)}
                  onChange={() => toggleUnit(u)}
                />
              ))}
            </div>
          </Section>

          <Section title="Regions">
            <div className="flex flex-wrap gap-1.5">
              {allRegions.map((r) => (
                <CheckChip key={r} label={r} checked={selectedRegions.includes(r)} onChange={() => toggleRegion(r)} />
              ))}
            </div>
          </Section>

          <p className="mt-3 border-t border-om-border pt-2 text-xs text-om-muted">
            Nothing selected means everything. Changing the filter deals a new game.
          </p>
        </div>
      )}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <p className="label-mono text-om-muted mb-1.5">{title}</p>
      {children}
    </div>
  )
}

function CheckChip({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="cursor-pointer select-none">
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
      <span
        className={`inline-flex items-center h-9 px-2.5 text-sm border transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-om-accent ${
          checked
            ? 'border-om-accent bg-om-accent text-om-accent-fg font-semibold'
            : 'border-om-border text-om-muted hover:text-om-text'
        }`}
      >
        {label}
      </span>
    </label>
  )
}

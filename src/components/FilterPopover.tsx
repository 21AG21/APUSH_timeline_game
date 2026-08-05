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

  const active = selectedUnits.length > 0 || selectedRegions.length > 0

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`h-11 px-4 text-sm rounded-full font-medium transition-all ${
          active
            ? 'bg-om-accent text-om-accent-fg shadow-sm'
            : 'bg-om-bg text-om-muted hover:text-om-text hover:bg-om-slot-hover border border-om-border'
        }`}
      >
        Filter{active ? ` (${selectedUnits.length + selectedRegions.length})` : ''}
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 z-40 bg-om-surface border border-om-border rounded-lg shadow-xl p-4 w-[min(18rem,calc(100vw-2rem))] max-h-[60dvh] overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-om-text uppercase tracking-wide">
              Filter Pool
            </span>
            {active && (
              <button onClick={reset} className="text-xs text-om-accent hover:underline">
                Reset all
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

          <p className="mt-3 text-xs text-om-muted">
            Empty selection = all. Changing filter starts a new game.
          </p>
        </div>
      )}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <p className="text-sm font-medium text-om-muted mb-1.5">{title}</p>
      {children}
    </div>
  )
}

function CheckChip({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex items-center gap-1.5 cursor-pointer select-none">
      <input type="checkbox" checked={checked} onChange={onChange} className="w-4 h-4 accent-om-accent" />
      <span
        className={`text-sm px-2 py-1.5 rounded border transition-colors ${
          checked
            ? 'border-om-accent bg-om-accent-light text-om-accent'
            : 'border-om-border text-om-muted'
        }`}
      >
        {label}
      </span>
    </label>
  )
}

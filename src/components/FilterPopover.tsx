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
        className={`px-3 py-1.5 text-sm rounded border transition-colors ${
          active
            ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
        }`}
      >
        Filter{active ? ` (${selectedUnits.length + selectedRegions.length})` : ''}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-4 w-72">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              Filter Pool
            </span>
            {active && (
              <button onClick={reset} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
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

          <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
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
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{title}</p>
      {children}
    </div>
  )
}

function CheckChip({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex items-center gap-1 cursor-pointer select-none">
      <input type="checkbox" checked={checked} onChange={onChange} className="w-3 h-3 accent-indigo-600" />
      <span
        className={`text-xs px-1.5 py-0.5 rounded border transition-colors ${
          checked
            ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
            : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400'
        }`}
      >
        {label}
      </span>
    </label>
  )
}

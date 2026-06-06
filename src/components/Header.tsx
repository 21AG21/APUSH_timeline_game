import type { Event, Settings } from '../data/types'
import { FilterPopover } from './FilterPopover'

interface Props {
  settings: Settings
  allEvents: Event[]
  onToggleDark: () => void
  onToggleHideDates: () => void
  onToggleUnderstanding: () => void
  onToggleHardMode: () => void
  onToggleTimedMode: () => void
  onFilterChange: (units: number[], regions: string[]) => void
}

export function Header({
  settings,
  allEvents,
  onToggleDark,
  onToggleHideDates,
  onToggleUnderstanding,
  onToggleHardMode,
  onToggleTimedMode,
  onFilterChange,
}: Props) {
  return (
    <header className="bg-om-surface border-b border-om-border px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
      <div>
        <h1 className="text-4xl font-serif font-bold text-om-text tracking-tight leading-none">
          APUSH Timeline
        </h1>
        <div className="mt-2 h-0.5 bg-om-gold w-36" />
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <Toggle label="Hide Dates" checked={settings.hideDates} onChange={onToggleHideDates} />
        <Toggle label="Understanding Prompt" checked={settings.showUnderstanding} onChange={onToggleUnderstanding} />
        <Toggle
          label="Hard Mode"
          checked={settings.hardMode}
          onChange={onToggleHardMode}
          danger
        />
        <Toggle label="Timed" checked={settings.timedMode} onChange={onToggleTimedMode} />
        <FilterPopover
          allEvents={allEvents}
          selectedUnits={settings.filterUnits}
          selectedRegions={settings.filterRegions}
          onChange={onFilterChange}
        />
        <button
          onClick={onToggleDark}
          className="px-3 py-1.5 text-sm rounded border border-om-border bg-om-surface text-om-text hover:bg-om-slot-hover transition-colors"
        >
          {settings.darkMode ? 'Light' : 'Dark'}
        </button>
      </div>
    </header>
  )
}

function Toggle({
  label,
  checked,
  onChange,
  danger,
}: {
  label: string
  checked: boolean
  onChange: () => void
  danger?: boolean
}) {
  const onColor = danger ? 'bg-om-error' : 'bg-om-accent'
  return (
    <label className="flex items-center gap-1.5 cursor-pointer select-none text-sm text-om-text">
      <div
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
          checked ? onColor : 'bg-om-border'
        }`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-4' : 'translate-x-1'
          }`}
        />
      </div>
      {label}
    </label>
  )
}

import type { Settings } from '../data/types'

interface Props {
  settings: Settings
  onToggleDark: () => void
  onToggleHideDates: () => void
  onToggleUnderstanding: () => void
}

export function Header({ settings, onToggleDark, onToggleHideDates, onToggleUnderstanding }: Props) {
  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">APUSH Timeline</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">Place events in chronological order</p>
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <Toggle label="Hide Dates" checked={settings.hideDates} onChange={onToggleHideDates} />
        <Toggle label="Show Cause/Effect" checked={settings.showUnderstanding} onChange={onToggleUnderstanding} />
        <button
          onClick={onToggleDark}
          className="px-3 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          {settings.darkMode ? 'Light' : 'Dark'}
        </button>
      </div>
    </header>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex items-center gap-1.5 cursor-pointer select-none text-sm text-gray-700 dark:text-gray-300">
      <div
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
          checked ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
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

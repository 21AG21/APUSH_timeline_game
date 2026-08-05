import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// One-time migration keyed on a data version. Bump DATA_VERSION whenever the
// event set changes so every browser clears its stale saved game and filters
// exactly once. Using a dedicated version key (not the event count) guarantees
// the migration fires even if an earlier build already wrote an event count.
const DATA_VERSION = '4'
const VERSION_KEY = 'apush-data-version'
if (localStorage.getItem(VERSION_KEY) !== DATA_VERSION) {
  localStorage.removeItem('apush-game-state')
  try {
    const saved = JSON.parse(localStorage.getItem('apush-settings') || '{}')
    localStorage.setItem(
      'apush-settings',
      JSON.stringify({ ...saved, filterUnits: [], filterRegions: [] })
    )
  } catch {
    // Corrupt settings JSON: nothing to migrate, the app falls back to defaults.
  }
  localStorage.setItem(VERSION_KEY, DATA_VERSION)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

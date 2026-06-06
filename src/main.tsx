import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import apushEvents from './data/apush.json'

// Synchronous migration: if the event pool has grown, clear stale game state
// and reset filter settings so new events aren't hidden.
const EVENT_COUNT_KEY = 'apush-event-count'
const currentCount = String((apushEvents as unknown[]).length)
if (localStorage.getItem(EVENT_COUNT_KEY) !== currentCount) {
  localStorage.removeItem('apush-game-state')
  try {
    const saved = JSON.parse(localStorage.getItem('apush-settings') || '{}')
    localStorage.setItem(
      'apush-settings',
      JSON.stringify({ ...saved, filterUnits: [], filterRegions: [] })
    )
  } catch {}
  localStorage.setItem(EVENT_COUNT_KEY, currentCount)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

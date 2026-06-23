import { useEffect, useRef, useState, useCallback } from 'react'
import type { Note, Settings } from './data/types'
import apushEvents from './data/apush.json'
import type { Event } from './data/types'
import { Scoreboard } from './components/Scoreboard'
import { PlacementCard } from './components/PlacementCard'
import { Timeline } from './components/Timeline'
import { StudyJournal } from './components/StudyJournal'
import { UnderstandingModal } from './components/UnderstandingModal'
import { GameOverReview } from './components/GameOverReview'
import { ResultsSummary } from './components/ResultsSummary'
import { FilterPopover } from './components/FilterPopover'
import { useGameState } from './hooks/useGameState'
import { useLocalStorage } from './hooks/useLocalStorage'
import { filterPool, isGameOver } from './lib/game'

const allEvents = apushEvents as Event[]

const DEFAULT_SETTINGS: Settings = {
  darkMode: false,
  hideDates: false,
  showUnderstanding: false,
  hardMode: false,
  filterUnits: [],
  filterRegions: [],
}

export default function App() {
  const [rawSettings, setSettings] = useLocalStorage<Settings>('apush-settings', DEFAULT_SETTINGS)
  const settings: Settings = { ...DEFAULT_SETTINGS, ...rawSettings }
  const [notes, setNotes] = useLocalStorage<Note[]>('apush-notes', [])
  const { state, newGame, setTentative, place } = useGameState(allEvents)
  const [journalOpen, setJournalOpen] = useState(false)

  // Feedback state
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null)
  const [understandingEvent, setUnderstandingEvent] = useState<Event | null>(null)
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevAttempts = useRef(state.attempts)
  const prevScore = useRef(state.score)

  const gameOver = isGameOver(state)
  const showHardModeReview = gameOver && state.gameOver && settings.hardMode

  const lastPlacedEventRef = useRef<Event | null>(null)
  const lastAttemptedSlotRef = useRef<number | null>(null)

  // Apply dark mode
  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.darkMode)
  }, [settings.darkMode])

  // Detect placement result
  useEffect(() => {
    if (state.attempts !== prevAttempts.current) {
      const correct = state.score > prevScore.current
      setLastCorrect(correct)
      if (feedbackTimer.current) clearTimeout(feedbackTimer.current)

      if (correct) {
        if (settings.showUnderstanding && !settings.hardMode) {
          if (lastPlacedEventRef.current) {
            setUnderstandingEvent(lastPlacedEventRef.current)
          }
        }
        feedbackTimer.current = setTimeout(() => setLastCorrect(null), 2000)
      } else {
        feedbackTimer.current = setTimeout(() => setLastCorrect(null), 4000)
      }
    }
    prevScore.current = state.score
    prevAttempts.current = state.attempts
  })

  const getFilteredEvents = useCallback(() => {
    return filterPool(allEvents, settings.filterUnits, settings.filterRegions)
  }, [settings.filterUnits, settings.filterRegions])

  const handleNewGame = () => {
    const filtered = getFilteredEvents()
    if (filtered.length < 2) return
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current)
    prevAttempts.current = 0
    prevScore.current = 0
    newGame(filtered)
    setLastCorrect(null)
    setUnderstandingEvent(null)
  }

  const didInit = useRef(false)
  useEffect(() => {
    if (didInit.current) return
    didInit.current = true
    if (state.pool.length === 0 && state.timeline.length === 0 && !state.current) {
      handleNewGame()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleFilterChange = (units: number[], regions: string[]) => {
    setSettings((s) => ({ ...s, filterUnits: units, filterRegions: regions }))
    const filtered = filterPool(allEvents, units, regions)
    if (filtered.length >= 2) {
      if (feedbackTimer.current) clearTimeout(feedbackTimer.current)
      prevAttempts.current = 0
      prevScore.current = 0
      newGame(filtered)
    }
  }

  const handleSlotClick = (slot: number) => {
    if (slot < 0) {
      setTentative(null)
    } else {
      setTentative(slot)
    }
  }

  const handleSlotConfirm = (slot: number) => {
    lastPlacedEventRef.current = state.current
    lastAttemptedSlotRef.current = slot
    place(slot, settings.hardMode)
    setTentative(null)
  }

  const handleDrop = (slot: number) => {
    lastPlacedEventRef.current = state.current
    lastAttemptedSlotRef.current = slot
    place(slot, settings.hardMode)
    setTentative(null)
  }

  const saveNote = (note: Note) => {
    setNotes((ns) => {
      const filtered = ns.filter((n) => n.eventId !== note.eventId)
      return [...filtered, note]
    })
  }

  const deleteNote = (eventId: string) => {
    setNotes((ns) => ns.filter((n) => n.eventId !== eventId))
  }

  const dragStartHandler = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', 'card')
  }

  return (
    <div className="h-screen flex overflow-hidden bg-om-bg text-om-text">
      {/* Left panel */}
      <div className="w-1/3 min-w-[340px] shrink-0 flex flex-col border-r border-om-border bg-om-surface">
        {/* Title + Options */}
        <div className="px-5 pt-5 pb-4 space-y-4 shrink-0">
          <div className="inline-block">
            <h1 className="text-3xl font-serif font-bold text-om-text tracking-tight leading-none">
              APUSH Timeline
            </h1>
            <div className="mt-1.5 h-[3px] bg-om-gold rounded-full w-full" />
          </div>

          <div className="flex flex-wrap gap-2">
            <PillToggle
              label="Hide Dates"
              active={settings.hideDates}
              onClick={() => setSettings((s) => ({ ...s, hideDates: !s.hideDates }))}
            />
            <PillToggle
              label="Understanding"
              active={settings.showUnderstanding}
              onClick={() => setSettings((s) => ({ ...s, showUnderstanding: !s.showUnderstanding }))}
            />
            <PillToggle
              label="Hard Mode"
              active={settings.hardMode}
              onClick={() => setSettings((s) => ({ ...s, hardMode: !s.hardMode }))}
              danger
            />
            <FilterPopover
              allEvents={allEvents}
              selectedUnits={settings.filterUnits}
              selectedRegions={settings.filterRegions}
              onChange={handleFilterChange}
            />
            <PillToggle
              label={settings.darkMode ? 'Light' : 'Dark'}
              active={false}
              onClick={() => setSettings((s) => ({ ...s, darkMode: !s.darkMode }))}
            />
          </div>
        </div>

        <div className="border-t border-om-border mx-5 shrink-0" />

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {state.current && !gameOver ? (
            <PlacementCard
              event={state.current}
              hideDates={settings.hideDates}
              hardMode={settings.hardMode}
              onDragStart={dragStartHandler}
            />
          ) : (
            <div className="p-4 space-y-4">
              {(state.done || state.gameOver) && (
                <ResultsSummary state={state} settings={settings} allEvents={allEvents} />
              )}
            </div>
          )}

          <div className="border-t border-om-border mx-4" />

          <Scoreboard
            score={state.score}
            attempts={state.attempts}
            poolSize={state.pool.length}
            timelineSize={state.timeline.length}
            streak={state.streak}
            done={state.done}
            gameOver={state.gameOver}
          />
        </div>

        {/* Bottom actions */}
        <div className="shrink-0 border-t border-om-border p-4 space-y-2">
          <button
            onClick={handleNewGame}
            className="w-full py-3 text-base font-semibold rounded-lg bg-om-accent hover:bg-om-accent-hover text-white transition-colors"
          >
            New Game
          </button>
          <button
            onClick={() => setJournalOpen(true)}
            className="w-full py-2 text-sm text-om-muted hover:text-om-text border border-om-border rounded-lg transition-colors"
          >
            Study Journal
          </button>
        </div>
      </div>

      {/* Right: Timeline */}
      <Timeline
        timeline={state.timeline}
        tentativeSlot={state.tentativeSlot}
        hasCurrentEvent={!!state.current && !gameOver}
        hideDates={settings.hideDates}
        hardMode={settings.hardMode}
        notes={notes}
        lastPlacementCorrect={lastCorrect}
        onSlotClick={handleSlotClick}
        onSlotConfirm={handleSlotConfirm}
        onDrop={handleDrop}
      />

      {/* Journal drawer */}
      {journalOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="drawer-panel w-[80vw] bg-om-surface border-r border-om-border flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-om-border shrink-0">
              <h2 className="text-2xl font-serif font-bold text-om-text">Study Journal</h2>
              <button
                onClick={() => setJournalOpen(false)}
                className="text-om-muted hover:text-om-text text-3xl leading-none"
              >
                ×
              </button>
            </div>
            <StudyJournal
              allEvents={allEvents}
              timelineEvents={state.timeline}
              notes={notes}
              onSaveNote={saveNote}
              onDeleteNote={deleteNote}
            />
          </div>
          <div
            className="drawer-backdrop flex-1 bg-black/40 cursor-pointer"
            onClick={() => setJournalOpen(false)}
          />
        </div>
      )}

      {showHardModeReview && (
        <GameOverReview
          state={state}
          settings={settings}
          allEvents={allEvents}
          onNewGame={handleNewGame}
        />
      )}

      {understandingEvent && !gameOver && (
        <UnderstandingModal
          event={understandingEvent}
          onSave={(note) => {
            saveNote(note)
            setUnderstandingEvent(null)
          }}
          onSkip={() => setUnderstandingEvent(null)}
        />
      )}
    </div>
  )
}

function PillToggle({
  label,
  active,
  onClick,
  danger,
}: {
  label: string
  active: boolean
  onClick: () => void
  danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all cursor-pointer ${
        active
          ? danger
            ? 'bg-om-error text-white shadow-sm'
            : 'bg-om-accent text-white shadow-sm'
          : 'bg-om-bg text-om-muted hover:text-om-text hover:bg-om-slot-hover border border-om-border'
      }`}
    >
      {label}
    </button>
  )
}

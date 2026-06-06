import { useEffect, useRef, useState, useCallback } from 'react'
import type { Note, Settings } from './data/types'
import apushEvents from './data/apush.json'
import type { Event } from './data/types'
import { Header } from './components/Header'
import { Scoreboard } from './components/Scoreboard'
import { PlacementCard } from './components/PlacementCard'
import { Timeline } from './components/Timeline'
import { StudyJournal } from './components/StudyJournal'
import { UnderstandingModal } from './components/UnderstandingModal'
import { GameOverReview } from './components/GameOverReview'
import { ResultsSummary } from './components/ResultsSummary'
import { useGameState } from './hooks/useGameState'
import { useLocalStorage } from './hooks/useLocalStorage'
import { filterPool, isGameOver } from './lib/game'

const allEvents = apushEvents as Event[]

const DEFAULT_SETTINGS: Settings = {
  darkMode: false,
  hideDates: false,
  showUnderstanding: false,
  hardMode: false,
  timedMode: false,
  timerSeconds: 120,
  filterUnits: [],
  filterRegions: [],
}

export default function App() {
  const [rawSettings, setSettings] = useLocalStorage<Settings>('apush-settings', DEFAULT_SETTINGS)
  // Merge with defaults so any newly added keys are always present (guards against stale localStorage)
  const settings: Settings = { ...DEFAULT_SETTINGS, ...rawSettings }
  const [notes, setNotes] = useLocalStorage<Note[]>('apush-notes', [])
  const { state, newGame, setTentative, place, timeout } = useGameState(allEvents)

  // Feedback state
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null)
  const [wrongFeedback, setWrongFeedback] = useState<{ prevYear: number | null; nextYear: number | null } | null>(null)
  const [understandingEvent, setUnderstandingEvent] = useState<Event | null>(null)
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevAttempts = useRef(state.attempts)
  const prevScore = useRef(state.score)

  // Timer state
  const [timerLeft, setTimerLeft] = useState<number | null>(null)
  const timerStartRef = useRef<number | null>(null)
  const timerInterval = useRef<ReturnType<typeof setInterval> | null>(null)

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
        setWrongFeedback(null)
        // Show understanding modal if prompt is on and not hard mode
        if (settings.showUnderstanding && !settings.hardMode) {
          // Find the event that was just placed (last item doesn't work since we moved current)
          // We track via note: open modal for the placed event
          // The placed event is now in state.timeline; find the one that changed
          // We'll detect via prevScore change and show the modal for the current event BEFORE it changed
          // We stash it in a ref
          if (lastPlacedEventRef.current) {
            setUnderstandingEvent(lastPlacedEventRef.current)
          }
        }
        feedbackTimer.current = setTimeout(() => setLastCorrect(null), 2000)
      } else {
        // Compute neighbors for wrong-feedback (feature 8), only in normal mode
        if (!settings.hardMode && lastAttemptedSlotRef.current !== null) {
          const slot = lastAttemptedSlotRef.current
          const prevYear = slot > 0 ? state.timeline[slot - 1]?.year ?? null : null
          const nextYear = slot < state.timeline.length ? state.timeline[slot]?.year ?? null : null
          setWrongFeedback({ prevYear, nextYear })
        } else {
          setWrongFeedback(null)
        }
        feedbackTimer.current = setTimeout(() => { setLastCorrect(null); setWrongFeedback(null) }, 4000)
      }
    }
    prevScore.current = state.score
    prevAttempts.current = state.attempts
  })

  const lastPlacedEventRef = useRef<Event | null>(null)
  const lastAttemptedSlotRef = useRef<number | null>(null)

  // Timer management
  const stopTimer = useCallback(() => {
    if (timerInterval.current) {
      clearInterval(timerInterval.current)
      timerInterval.current = null
    }
  }, [])

  const startTimer = useCallback((seconds: number) => {
    stopTimer()
    timerStartRef.current = Date.now()
    setTimerLeft(seconds)
    timerInterval.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - (timerStartRef.current ?? Date.now())) / 1000)
      const left = seconds - elapsed
      if (left <= 0) {
        stopTimer()
        setTimerLeft(0)
        timeout(Date.now() - (timerStartRef.current ?? Date.now()))
      } else {
        setTimerLeft(left)
      }
    }, 500)
  }, [stopTimer, timeout])

  // Stop timer when game ends
  useEffect(() => {
    if (isGameOver(state)) {
      stopTimer()
      setTimerLeft(null)
    }
  }, [state, stopTimer])

  const getFilteredEvents = useCallback(() => {
    return filterPool(allEvents, settings.filterUnits, settings.filterRegions)
  }, [settings.filterUnits, settings.filterRegions])

  const handleNewGame = () => {
    const filtered = getFilteredEvents()
    if (filtered.length < 2) return
    newGame(filtered)
    setLastCorrect(null)
    setWrongFeedback(null)
    setUnderstandingEvent(null)
    if (settings.timedMode) {
      startTimer(settings.timerSeconds)
    } else {
      stopTimer()
      setTimerLeft(null)
    }
  }

  const handleFilterChange = (units: number[], regions: string[]) => {
    setSettings((s) => ({ ...s, filterUnits: units, filterRegions: regions }))
    // Start new game with new filters
    const filtered = filterPool(allEvents, units, regions)
    if (filtered.length >= 2) {
      newGame(filtered)
      if (settings.timedMode) startTimer(settings.timerSeconds)
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

  const gameOver = isGameOver(state)
  const showHardModeReview = gameOver && state.gameOver && settings.hardMode

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <Header
        settings={settings}
        allEvents={allEvents}
        onToggleDark={() => setSettings((s) => ({ ...s, darkMode: !s.darkMode }))}
        onToggleHideDates={() => setSettings((s) => ({ ...s, hideDates: !s.hideDates }))}
        onToggleUnderstanding={() => setSettings((s) => ({ ...s, showUnderstanding: !s.showUnderstanding }))}
        onToggleHardMode={() => setSettings((s) => ({ ...s, hardMode: !s.hardMode }))}
        onToggleTimedMode={() => setSettings((s) => ({ ...s, timedMode: !s.timedMode }))}
        onFilterChange={handleFilterChange}
      />
      <Scoreboard
        score={state.score}
        attempts={state.attempts}
        poolSize={state.pool.length}
        timelineSize={state.timeline.length}
        streak={state.streak}
        done={state.done}
        gameOver={state.gameOver}
        timedMode={settings.timedMode}
        timerSecondsLeft={timerLeft}
        onNewGame={handleNewGame}
      />
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel: placement card or end state */}
        <div className="w-80 shrink-0 flex flex-col border-r border-gray-200 dark:border-gray-700 overflow-y-auto bg-white dark:bg-gray-900">
          {state.current && !gameOver ? (
            <PlacementCard
              event={state.current}
              hideDates={settings.hideDates}
              showUnderstanding={settings.showUnderstanding}
              hardMode={settings.hardMode}
              onDragStart={dragStartHandler}
            />
          ) : (
            <div className="p-4 space-y-4">
              {gameOver && !state.gameOver && (
                <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
                  Press "New Game" to play again.
                </p>
              )}
              {!gameOver && !state.current && (
                <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
                  Press "New Game" to start.
                </p>
              )}
              {state.done && !state.gameOver && (
                <ResultsSummary state={state} settings={settings} allEvents={allEvents} />
              )}
              {state.gameOver && !settings.hardMode && (
                /* Timeout end state */
                <ResultsSummary state={state} settings={settings} allEvents={allEvents} />
              )}
            </div>
          )}
        </div>

        {/* Center: timeline */}
        <Timeline
          timeline={state.timeline}
          tentativeSlot={state.tentativeSlot}
          hasCurrentEvent={!!state.current && !gameOver}
          hideDates={settings.hideDates}
          showUnderstanding={settings.showUnderstanding}
          hardMode={settings.hardMode}
          notes={notes}
          lastPlacementCorrect={lastCorrect}
          wrongFeedback={wrongFeedback}
          onSlotClick={handleSlotClick}
          onSlotConfirm={handleSlotConfirm}
          onDrop={handleDrop}
        />

        {/* Right: journal */}
        <StudyJournal
          allEvents={allEvents}
          timelineEvents={state.timeline}
          notes={notes}
          onSaveNote={saveNote}
          onDeleteNote={deleteNote}
        />
      </div>

      {/* Modals */}
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

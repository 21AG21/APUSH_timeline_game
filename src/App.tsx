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
  const settings: Settings = { ...DEFAULT_SETTINGS, ...rawSettings }
  const [notes, setNotes] = useLocalStorage<Note[]>('apush-notes', [])
  const { state, newGame, setTentative, place, timeout } = useGameState(allEvents)
  const [journalOpen, setJournalOpen] = useState(false)

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
        if (settings.showUnderstanding && !settings.hardMode) {
          if (lastPlacedEventRef.current) {
            setUnderstandingEvent(lastPlacedEventRef.current)
          }
        }
        feedbackTimer.current = setTimeout(() => setLastCorrect(null), 2000)
      } else {
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
    <div className="h-screen flex flex-col bg-om-bg text-om-text">
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
        {/* Left panel: placement card + collapsible journal */}
        <div className="w-96 shrink-0 flex flex-col border-r border-om-border bg-om-surface overflow-y-auto">
          <div className="shrink-0">
            {state.current && !gameOver ? (
              <PlacementCard
                event={state.current}
                hideDates={settings.hideDates}
                hardMode={settings.hardMode}
                onDragStart={dragStartHandler}
              />
            ) : (
              <div className="p-4 space-y-4">
                {state.done && !state.gameOver && (
                  <ResultsSummary state={state} settings={settings} allEvents={allEvents} />
                )}
                {state.gameOver && !settings.hardMode && (
                  <ResultsSummary state={state} settings={settings} allEvents={allEvents} />
                )}
              </div>
            )}
          </div>

          {/* Journal toggle + content */}
          <button
            onClick={() => setJournalOpen((o) => !o)}
            className="flex items-center justify-between px-4 py-2.5 border-t border-om-border text-sm font-semibold text-om-text hover:bg-om-slot-hover transition-colors"
          >
            <span>Study Journal</span>
            <span className="text-om-muted">{journalOpen ? '▼' : '▶'}</span>
          </button>
          {journalOpen && (
            <StudyJournal
              allEvents={allEvents}
              timelineEvents={state.timeline}
              notes={notes}
              onSaveNote={saveNote}
              onDeleteNote={deleteNote}
            />
          )}
        </div>

        {/* Main: timeline */}
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

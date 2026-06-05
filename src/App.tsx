import { useEffect, useRef, useState } from 'react'
import type { Note, Settings } from './data/types'
import apushEvents from './data/apush.json'
import type { Event } from './data/types'
import { Header } from './components/Header'
import { Scoreboard } from './components/Scoreboard'
import { PlacementCard } from './components/PlacementCard'
import { Timeline } from './components/Timeline'
import { StudyJournal } from './components/StudyJournal'
import { useGameState } from './hooks/useGameState'
import { useLocalStorage } from './hooks/useLocalStorage'

const events = apushEvents as Event[]

export default function App() {
  const [settings, setSettings] = useLocalStorage<Settings>('apush-settings', {
    darkMode: false,
    hideDates: false,
    showUnderstanding: false,
  })
  const [notes, setNotes] = useLocalStorage<Note[]>('apush-notes', [])
  const { state, newGame, setTentative, place } = useGameState(events)

  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null)
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevScore = useRef(state.score)
  const prevAttempts = useRef(state.attempts)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.darkMode)
  }, [settings.darkMode])

  // Detect placement result by watching attempts change
  useEffect(() => {
    if (state.attempts !== prevAttempts.current) {
      const correct = state.score > prevScore.current
      setLastCorrect(correct)
      if (feedbackTimer.current) clearTimeout(feedbackTimer.current)
      feedbackTimer.current = setTimeout(() => setLastCorrect(null), 2500)
    }
    prevScore.current = state.score
    prevAttempts.current = state.attempts
  })

  const handleSlotClick = (slot: number) => {
    if (slot < 0) {
      setTentative(null)
    } else {
      setTentative(slot)
    }
  }

  const handleSlotConfirm = (slot: number) => {
    place(slot)
    setTentative(null)
  }

  const handleDrop = (slot: number) => {
    place(slot)
    setTentative(null)
  }

  const toggleDark = () => setSettings((s) => ({ ...s, darkMode: !s.darkMode }))
  const toggleHideDates = () => setSettings((s) => ({ ...s, hideDates: !s.hideDates }))
  const toggleUnderstanding = () => setSettings((s) => ({ ...s, showUnderstanding: !s.showUnderstanding }))

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

  const total = state.score + state.pool.length + (state.done ? 0 : 1)

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <Header
        settings={settings}
        onToggleDark={toggleDark}
        onToggleHideDates={toggleHideDates}
        onToggleUnderstanding={toggleUnderstanding}
      />
      <Scoreboard
        score={state.score}
        attempts={state.attempts}
        poolSize={state.pool.length}
        timelineSize={state.timeline.length}
        done={state.done}
        onNewGame={newGame}
      />
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel: placement card */}
        <div className="w-80 shrink-0 flex flex-col border-r border-gray-200 dark:border-gray-700 overflow-y-auto bg-white dark:bg-gray-900">
          {state.current ? (
            <PlacementCard
              event={state.current}
              hideDates={settings.hideDates}
              showUnderstanding={settings.showUnderstanding}
              onDragStart={dragStartHandler}
            />
          ) : (
            <div className="p-4 text-sm text-gray-400 dark:text-gray-500 text-center py-8">
              {state.done && state.timeline.length > 0
                ? `Game complete! You scored ${state.score}/${total}.`
                : 'Press "New Game" to start.'}
            </div>
          )}
        </div>

        {/* Center: timeline */}
        <Timeline
          timeline={state.timeline}
          tentativeSlot={state.tentativeSlot}
          hasCurrentEvent={!!state.current}
          hideDates={settings.hideDates}
          showUnderstanding={settings.showUnderstanding}
          notes={notes}
          lastPlacementCorrect={lastCorrect}
          onSlotClick={handleSlotClick}
          onSlotConfirm={handleSlotConfirm}
          onDrop={handleDrop}
        />

        {/* Right: journal */}
        <StudyJournal
          allEvents={events}
          timelineEvents={state.timeline}
          notes={notes}
          onSaveNote={saveNote}
          onDeleteNote={deleteNote}
        />
      </div>
    </div>
  )
}

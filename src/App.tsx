import { useEffect, useRef, useState, useCallback } from 'react'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
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
import { AboutModal } from './components/AboutModal'
import { useGameState } from './hooks/useGameState'
import { useLocalStorage } from './hooks/useLocalStorage'
import { usePointerDrag } from './hooks/usePointerDrag'
import { useLayout } from './hooks/useMediaQuery'
import { filterPool, isGameOver } from './lib/game'

const allEvents = apushEvents as Event[]

const DEFAULT_SETTINGS: Settings = {
  darkMode: false,
  hideDates: false,
  showUnderstanding: false,
  hardMode: false,
  analyticsOptOut: false,
  filterUnits: [],
  filterRegions: [],
}

export default function App() {
  const [rawSettings, setSettings] = useLocalStorage<Settings>('apush-settings', DEFAULT_SETTINGS)
  const settings: Settings = { ...DEFAULT_SETTINGS, ...rawSettings }
  const [notes, setNotes] = useLocalStorage<Note[]>('apush-notes', [])
  const { state, newGame, setTentative, place } = useGameState(allEvents)
  const [journalOpen, setJournalOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [aboutOpen, setAboutOpen] = useState(false)

  const { split, compact } = useLayout()

  // Feedback state
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null)
  const [understandingEvent, setUnderstandingEvent] = useState<Event | null>(null)
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevAttempts = useRef(state.attempts)
  const prevScore = useRef(state.score)

  const gameOver = isGameOver(state)
  const hasCurrentEvent = !!state.current && !gameOver
  const showHardModeReview = gameOver && state.gameOver && settings.hardMode

  const lastPlacedEventRef = useRef<Event | null>(null)

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

  const handlePlace = useCallback(
    (slot: number) => {
      lastPlacedEventRef.current = state.current
      place(slot, settings.hardMode)
      setTentative(null)
    },
    [state.current, place, settings.hardMode, setTentative]
  )

  const drag = usePointerDrag({ onDrop: handlePlace, enabled: hasCurrentEvent })

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

  const handleSlotClick = (slot: number) => setTentative(slot < 0 ? null : slot)

  const saveNote = (note: Note) => {
    setNotes((ns) => {
      const filtered = ns.filter((n) => n.eventId !== note.eventId)
      return [...filtered, note]
    })
  }

  const deleteNote = (eventId: string) => {
    setNotes((ns) => ns.filter((n) => n.eventId !== eventId))
  }

  const optionPills = (
    <>
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
    </>
  )

  /* College Board's guidelines require this attribution on the page itself,
     not only inside a legal page. */
  const trademarkFooter = (
    <button
      onClick={() => setAboutOpen(true)}
      className="w-full px-3 py-2 text-left text-[0.65rem] leading-snug text-om-muted hover:text-om-text border-t border-om-border bg-om-surface"
    >
      AP<sup>&reg;</sup> and Advanced Placement<sup>&reg;</sup> are trademarks registered by the
      College Board, which is not affiliated with, and does not endorse, this website.{' '}
      <span className="underline whitespace-nowrap">About &amp; privacy</span>
    </button>
  )

  const timelineEl = (
    <Timeline
      timeline={state.timeline}
      tentativeSlot={state.tentativeSlot}
      hasCurrentEvent={hasCurrentEvent}
      hideDates={settings.hideDates}
      hardMode={settings.hardMode}
      notes={notes}
      lastPlacementCorrect={lastCorrect}
      compact={compact}
      dragOverSlot={drag.isDragging ? drag.activeSlot : null}
      registerSlot={drag.registerSlot}
      registerScrollContainer={drag.registerScrollContainer}
      onSlotClick={handleSlotClick}
      onSlotConfirm={handlePlace}
    />
  )

  const placementEl = hasCurrentEvent ? (
    <PlacementCard
      event={state.current!}
      hideDates={settings.hideDates}
      hardMode={settings.hardMode}
      compact={compact}
      isDragging={drag.isDragging}
      onPointerDown={drag.start}
    />
  ) : (
    <div className="p-3 sm:p-4">
      {(state.done || state.gameOver) && (
        <ResultsSummary state={state} settings={settings} allEvents={allEvents} />
      )}
    </div>
  )

  return (
    <div
      className={`app-shell flex overflow-hidden bg-om-bg text-om-text ${
        split ? 'flex-row' : 'flex-col'
      }`}
    >
      {!split ? (
        /* ---------------- Mobile: stacked ---------------- */
        <>
          <header className="shrink-0 flex items-center justify-between gap-3 px-3 py-2 border-b border-om-border bg-om-surface">
            <div>
              <h1 className="text-xl font-serif font-bold text-om-text leading-none">
                US History Timeline
              </h1>
              <div className="mt-1 h-[2px] bg-om-gold rounded-full w-full" />
              <p className="mt-1 text-[0.65rem] text-om-muted leading-none">
                A study game for AP<sup>&reg;</sup> U.S. History
              </p>
            </div>
            <button
              onClick={() => setSettingsOpen(true)}
              aria-label="Options"
              className="shrink-0 h-11 px-4 rounded-full border border-om-border text-sm font-medium text-om-text active:bg-om-slot-hover"
            >
              Options
            </button>
          </header>

          <Scoreboard
            compact
            score={state.score}
            attempts={state.attempts}
            poolSize={state.pool.length}
            timelineSize={state.timeline.length}
            streak={state.streak}
            done={state.done}
            gameOver={state.gameOver}
          />

          <div className="shrink-0 border-b border-om-border bg-om-surface">{placementEl}</div>

          {timelineEl}

          <div className="shrink-0 flex gap-2 border-t border-om-border bg-om-surface p-3">
            <button
              onClick={handleNewGame}
              className="flex-1 h-12 text-base font-semibold rounded-lg bg-om-accent active:bg-om-accent-hover text-om-accent-fg"
            >
              New Game
            </button>
            <button
              onClick={() => setJournalOpen(true)}
              className="h-12 px-5 text-sm font-medium rounded-lg border border-om-border text-om-muted active:bg-om-slot-hover"
            >
              Journal
            </button>
          </div>

          {trademarkFooter}
        </>
      ) : (
        /* ---------------- Split: desktop and landscape phones ---------------- */
        <>
          <div className="w-1/3 min-w-[300px] max-w-[460px] shrink-0 flex flex-col border-r border-om-border bg-om-surface">
            <div className={`shrink-0 ${compact ? 'px-3 pt-3 pb-2 space-y-2' : 'px-5 pt-5 pb-4 space-y-4'}`}>
              <div className="inline-block">
                <h1
                  className={`font-serif font-bold text-om-text tracking-tight leading-none ${
                    compact ? 'text-xl' : 'text-3xl'
                  }`}
                >
                  US History Timeline
                </h1>
                <div
                  className={`mt-1 bg-om-gold rounded-full w-full ${
                    compact ? 'h-[2px]' : 'h-[3px]'
                  }`}
                />
                <p className="mt-1.5 text-xs text-om-muted leading-none">
                  A study game for AP<sup>&reg;</sup> U.S. History
                </p>
              </div>
              {compact ? (
                <button
                  onClick={() => setSettingsOpen(true)}
                  className="h-10 w-full rounded-full border border-om-border text-sm font-medium text-om-text hover:bg-om-slot-hover"
                >
                  Options
                </button>
              ) : (
                <div className="flex flex-wrap gap-2">{optionPills}</div>
              )}
            </div>

            <div className="border-t border-om-border mx-5 shrink-0" />

            <div className="scroll-pane flex-1 min-h-0 overflow-y-auto">
              {placementEl}
              <div className="border-t border-om-border mx-4" />
              <Scoreboard
                compact={compact}
                score={state.score}
                attempts={state.attempts}
                poolSize={state.pool.length}
                timelineSize={state.timeline.length}
                streak={state.streak}
                done={state.done}
                gameOver={state.gameOver}
              />
            </div>

            <div
              className={`shrink-0 border-t border-om-border ${
                compact ? 'p-2 flex gap-2' : 'p-4 space-y-2'
              }`}
            >
              <button
                onClick={handleNewGame}
                className={`font-semibold rounded-lg bg-om-accent hover:bg-om-accent-hover text-om-accent-fg transition-colors ${
                  compact ? 'flex-1 h-11 text-sm' : 'w-full py-3 text-base'
                }`}
              >
                New Game
              </button>
              <button
                onClick={() => setJournalOpen(true)}
                className={`text-sm text-om-muted hover:text-om-text border border-om-border rounded-lg transition-colors ${
                  compact ? 'h-11 px-4' : 'w-full py-2'
                }`}
              >
                {compact ? 'Journal' : 'Study Journal'}
              </button>
            </div>

            {trademarkFooter}
          </div>

          {timelineEl}
        </>
      )}

      {/* Card that follows the pointer while dragging */}
      {drag.isDragging && drag.dragPos && state.current && (
        <div
          className="drag-ghost bg-om-surface border border-om-border border-l-[3px] border-l-om-gold rounded-lg px-4 py-3 max-w-[80vw] sm:max-w-sm"
          style={{ left: drag.dragPos.x, top: drag.dragPos.y }}
        >
          <p className="font-bold text-om-text leading-tight truncate">{state.current.title}</p>
        </div>
      )}

      {/* Mobile options sheet */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 flex items-end" onClick={() => setSettingsOpen(false)}>
          <div className="drawer-backdrop absolute inset-0 bg-black/40" />
          <div
            className="relative w-full bg-om-surface rounded-t-2xl border-t border-om-border shadow-2xl p-4 pb-8 max-h-[80dvh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-serif font-bold text-om-text">Options</h2>
              <button
                onClick={() => setSettingsOpen(false)}
                aria-label="Close options"
                className="h-10 w-10 rounded-full text-om-muted text-2xl leading-none active:bg-om-slot-hover"
              >
                ×
              </button>
            </div>
            <div className="flex flex-wrap gap-2">{optionPills}</div>
          </div>
        </div>
      )}

      {/* Journal drawer */}
      {journalOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="drawer-panel w-full lg:w-[80vw] bg-om-surface border-r border-om-border flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-om-border shrink-0">
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-om-text">
                Study Journal
              </h2>
              <button
                onClick={() => setJournalOpen(false)}
                aria-label="Close journal"
                className="h-11 w-11 shrink-0 rounded-full text-om-muted text-3xl leading-none active:bg-om-slot-hover"
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
            className="drawer-backdrop hidden lg:block flex-1 bg-black/40 cursor-pointer"
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

      {aboutOpen && (
        <AboutModal
          analyticsOptOut={settings.analyticsOptOut}
          onToggleAnalytics={() =>
            setSettings((s) => ({ ...s, analyticsOptOut: !s.analyticsOptOut }))
          }
          onClose={() => setAboutOpen(false)}
        />
      )}

      {/* Cookieless and first-party, but still user-refusable — see AboutModal. */}
      {!settings.analyticsOptOut && (
        <>
          <Analytics />
          <SpeedInsights />
        </>
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
      className={`h-11 px-4 rounded-full text-sm font-medium transition-all cursor-pointer ${
        active
          ? danger
            ? 'bg-om-error text-om-error-fg shadow-sm'
            : 'bg-om-accent text-om-accent-fg shadow-sm'
          : 'bg-om-bg text-om-muted hover:text-om-text hover:bg-om-slot-hover border border-om-border'
      }`}
    >
      {label}
    </button>
  )
}

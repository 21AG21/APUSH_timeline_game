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
import { Flashcards } from './components/Flashcards'
import { PanelDivider } from './components/PanelDivider'
import { Ghost, ScrollHint, Segment, SettingRow, Stamp } from './components/ui'
import type { ProgressMap } from './lib/flashcards'

/** Panel resize bounds. The upper bound also leaves the timeline room to breathe. */
const PANEL_MIN = 260
const PANEL_MAX = 640
const TIMELINE_MIN = 320
import { useGameState } from './hooks/useGameState'
import { useLocalStorage } from './hooks/useLocalStorage'
import { usePointerDrag } from './hooks/usePointerDrag'
import { useLayout } from './hooks/useMediaQuery'
import { useScrollHint } from './hooks/useScrollHint'
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
  const [cardsOpen, setCardsOpen] = useState(false)
  const [cardProgress, setCardProgress] = useLocalStorage<ProgressMap>('apush-flashcards', {})
  // 0 means "not set yet" so the first render can fall back to a third of the
  // viewport, matching the old fixed w-1/3 rather than jumping on first load.
  const [panelWidth, setPanelWidth] = useLocalStorage<number>('apush-panel-width', 0)
  const panelRef = useRef<HTMLDivElement | null>(null)

  const { split, compact } = useLayout()
  const [panelScrollRef, panelHasMore] = useScrollHint<HTMLDivElement>()
  const [cardScrollRef, cardHasMore] = useScrollHint<HTMLDivElement>()

  /** Keep the panel usable, and always leave the timeline at least TIMELINE_MIN. */
  const clampPanel = useCallback((px: number) => {
    const ceiling = Math.max(PANEL_MIN, Math.min(PANEL_MAX, window.innerWidth - TIMELINE_MIN))
    return Math.round(Math.max(PANEL_MIN, Math.min(ceiling, px)))
  }, [])

  const resolvedPanelWidth = panelWidth || 0

  // A saved width can be too wide for a smaller window on the next visit, or after
  // a rotate/resize, which would squeeze the timeline out. Re-clamp when that happens.
  useEffect(() => {
    if (!split) return
    const fit = () => {
      setPanelWidth((w) => {
        const current = w || Math.round(window.innerWidth / 3)
        const next = clampPanel(current)
        return next === w ? w : next
      })
    }
    fit()
    window.addEventListener('resize', fit)
    window.addEventListener('orientationchange', fit)
    return () => {
      window.removeEventListener('resize', fit)
      window.removeEventListener('orientationchange', fit)
    }
  }, [split, clampPanel, setPanelWidth])

  // Feedback state
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null)
  /** Increments only on wrong placements, so the card in hand can nudge. */
  const [wrongCount, setWrongCount] = useState(0)
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
      const placed = lastPlacedEventRef.current
      if (feedbackTimer.current) clearTimeout(feedbackTimer.current)

      if (correct) {
        // Naming the year is the payoff for a correct placement, but not while
        // dates are hidden — that would hand back the very fact being tested.
        setFeedback({
          ok: true,
          text: settings.hideDates || !placed ? 'Correct.' : `Correct — ${placed.year}.`,
        })
        if (settings.showUnderstanding && !settings.hardMode && placed) {
          setUnderstandingEvent(placed)
        }
        feedbackTimer.current = setTimeout(() => setFeedback(null), 2000)
      } else {
        setFeedback({ ok: false, text: 'Not there.' })
        setWrongCount((n) => n + 1)
        feedbackTimer.current = setTimeout(() => setFeedback(null), 4000)
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
    setFeedback(null)
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

  const set = <K extends keyof Settings>(key: K, value: Settings[K]) =>
    setSettings((s) => ({ ...s, [key]: value }))

  /* Each setting reads as a statement with a current value rather than as a
     button whose label describes the thing it would do — "Year on card: hidden"
     instead of a "Hide dates" pill that is ambiguous once it is lit up. */
  const settingRows = (
    <div className="space-y-2.5">
      <SettingRow label="Year on card">
        <Segment label="Shown" active={!settings.hideDates} onClick={() => set('hideDates', false)} />
        <Segment label="Hidden" active={settings.hideDates} onClick={() => set('hideDates', true)} />
      </SettingRow>

      <SettingRow label="Reflection">
        <Segment
          label="Off"
          active={!settings.showUnderstanding}
          onClick={() => set('showUnderstanding', false)}
        />
        <Segment
          label="On"
          active={settings.showUnderstanding}
          onClick={() => set('showUnderstanding', true)}
        />
      </SettingRow>

      <SettingRow label="Hard mode">
        <Segment
          label="Off"
          tone="ink"
          active={!settings.hardMode}
          onClick={() => set('hardMode', false)}
        />
        <Segment
          label="On"
          tone="danger"
          active={settings.hardMode}
          onClick={() => set('hardMode', true)}
        />
      </SettingRow>

      <SettingRow label="Deck" asGroup={false}>
        <FilterPopover
          allEvents={allEvents}
          selectedUnits={settings.filterUnits}
          selectedRegions={settings.filterRegions}
          onChange={handleFilterChange}
        />
      </SettingRow>
    </div>
  )

  /* College Board's guidelines require this attribution on the page itself,
     not only inside a legal page. */
  const trademarkFooter = (dense?: boolean) => (
    <button
      onClick={() => setAboutOpen(true)}
      className={`pb-safe w-full px-3 pt-2 text-left text-[0.65rem] leading-snug text-om-muted hover:text-om-text border-t border-om-border bg-om-surface ${
        dense ? 'truncate' : ''
      }`}
    >
      {dense ? (
        <>
          AP<sup>&reg;</sup> is a College Board trademark; this site is unaffiliated.{' '}
          <span className="underline whitespace-nowrap">About &amp; privacy</span>
        </>
      ) : (
        <>
          AP<sup>&reg;</sup> and Advanced Placement<sup>&reg;</sup> are trademarks registered by
          the College Board, which is not affiliated with, and does not endorse, this website.{' '}
          <span className="underline whitespace-nowrap">About &amp; privacy</span>
        </>
      )}
    </button>
  )

  const masthead = (
    <div>
      <h1
        className={`font-serif font-bold text-om-text tracking-tight leading-none ${
          compact ? 'text-xl' : 'text-3xl'
        }`}
      >
        US History Timeline
      </h1>
      <p className="label-mono mt-2 text-om-muted">
        A study game for AP<sup>&reg;</sup> U.S. History
      </p>
    </div>
  )

  const timelineEl = (
    <Timeline
      timeline={state.timeline}
      tentativeSlot={state.tentativeSlot}
      hasCurrentEvent={hasCurrentEvent}
      hideDates={settings.hideDates}
      hardMode={settings.hardMode}
      notes={notes}
      feedback={feedback}
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
      nudgeCount={wrongCount}
      onPointerDown={drag.start}
    />
  ) : (
    <div className="p-3 sm:p-4">
      {(state.done || state.gameOver) && (
        <ResultsSummary state={state} settings={settings} allEvents={allEvents} />
      )}
    </div>
  )

  const scoreboardEl = (dense?: boolean) => (
    <Scoreboard
      compact={compact}
      dense={dense}
      score={state.score}
      attempts={state.attempts}
      poolSize={state.pool.length}
      streak={state.streak}
      bestStreak={state.bestStreak}
      done={state.done}
      gameOver={state.gameOver}
    />
  )

  const themeGhost = (
    <Ghost onClick={() => set('darkMode', !settings.darkMode)}>
      {settings.darkMode ? 'Light' : 'Dark'}
    </Ghost>
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
          <header className="shrink-0 flex items-center justify-between gap-3 px-3 py-2.5 rule-double bg-om-surface">
            {masthead}
            <Ghost onClick={() => setSettingsOpen(true)} className="shrink-0">
              Options
            </Ghost>
          </header>

          <div className="shrink-0 border-b border-om-border bg-om-surface">{scoreboardEl()}</div>

          <div className="shrink-0 border-b border-om-border bg-om-surface">{placementEl}</div>

          {timelineEl}

          <div className="shrink-0 flex gap-2 rule-double-top bg-om-surface p-3">
            <Stamp onClick={handleNewGame} className="flex-1">
              New game
            </Stamp>
            <Ghost onClick={() => setCardsOpen(true)}>Cards</Ghost>
            <Ghost onClick={() => setJournalOpen(true)}>Journal</Ghost>
          </div>

          {trademarkFooter()}
        </>
      ) : (
        /* ---------------- Split: desktop and landscape phones ---------------- */
        <>
          <div
            ref={panelRef}
            style={resolvedPanelWidth ? { width: resolvedPanelWidth } : undefined}
            className={`shrink-0 flex flex-col bg-om-surface border-r border-om-border ${
              resolvedPanelWidth ? '' : 'w-1/3 min-w-[300px] max-w-[460px]'
            }`}
          >
            {compact ? (
              /* A landscape phone has almost no vertical space. Sharing one
                 scroll region pushes the card in hand entirely below the fold —
                 the thing you have to drag is off-screen on load. So the header
                 and stats are pinned and the card gets the remaining height. */
              <>
                <header className="shrink-0 flex items-center justify-between gap-2 px-3 py-2 rule-double">
                  <h1 className="font-serif font-bold text-om-text text-sm leading-none truncate">
                    US History Timeline
                  </h1>
                  <Ghost onClick={() => setSettingsOpen(true)} className="shrink-0 h-10 px-2.5">
                    Options
                  </Ghost>
                </header>

                <div className="shrink-0 border-b border-om-border">{scoreboardEl(true)}</div>

                <div className="relative flex-1 min-h-0 flex flex-col">
                  <div ref={cardScrollRef} className="scroll-pane flex-1 min-h-0 overflow-y-auto">
                    <div>{placementEl}</div>
                  </div>
                  <ScrollHint show={cardHasMore} />
                </div>

                <div className="shrink-0 rule-double-top p-2 flex gap-2">
                  <Stamp onClick={handleNewGame} className="flex-1 h-10 px-3">
                    New
                  </Stamp>
                  <Ghost onClick={() => setCardsOpen(true)} className="flex-1 h-10 px-3">
                    Cards
                  </Ghost>
                  <Ghost onClick={() => setJournalOpen(true)} className="flex-1 h-10 px-3">
                    Journal
                  </Ghost>
                </div>
              </>
            ) : (
              /* One scroll region for the whole column, as in the source design.
                 Scrolling only the middle of it leaves the card in hand cut off
                 mid-sentence against a fixed footer, with nothing to say the rest
                 is reachable — and pushes the settings out of sight entirely. */
              <>
                <div className="relative flex-1 min-h-0 flex flex-col">
                  <div ref={panelScrollRef} className="scroll-pane flex-1 min-h-0 overflow-y-auto">
                    <div>
                      <div className="rule-double px-5 pt-5 pb-3">{masthead}</div>

                      <div className="border-b border-om-border">{scoreboardEl()}</div>

                      <div className="border-b border-om-border">{placementEl}</div>

                      <div className="px-5 py-3">{settingRows}</div>
                    </div>
                  </div>

                  <ScrollHint show={panelHasMore} />
                </div>

                <div className="shrink-0 rule-double-top space-y-2 px-5 py-3">
                  <Stamp onClick={handleNewGame} className="w-full">
                    New game
                  </Stamp>
                  <div className="flex gap-2">
                    <Ghost onClick={() => setCardsOpen(true)} className="flex-1">
                      Cards
                    </Ghost>
                    <Ghost onClick={() => setJournalOpen(true)} className="flex-1">
                      Journal
                    </Ghost>
                    {themeGhost}
                  </div>
                </div>
              </>
            )}

            {trademarkFooter(compact)}
          </div>

          <PanelDivider
            width={resolvedPanelWidth || 0}
            min={PANEL_MIN}
            max={PANEL_MAX}
            onDragTo={(clientX) => {
              const left = panelRef.current?.getBoundingClientRect().left ?? 0
              setPanelWidth(clampPanel(clientX - left))
            }}
            onNudge={(d) =>
              setPanelWidth((w) => clampPanel((w || Math.round(window.innerWidth / 3)) + d))
            }
            onReset={() => setPanelWidth(clampPanel(Math.round(window.innerWidth / 3)))}
          />

          {timelineEl}
        </>
      )}

      {/* Card that follows the pointer while dragging */}
      {drag.isDragging && drag.dragPos && state.current && (
        <div
          className="drag-ghost bg-om-card border border-om-border border-t-[3px] border-t-om-accent px-4 py-3 max-w-[80vw] sm:max-w-sm"
          style={{ left: drag.dragPos.x, top: drag.dragPos.y }}
        >
          <p className="font-serif font-bold text-om-text leading-tight truncate">
            {state.current.title}
          </p>
        </div>
      )}

      {/* Mobile options sheet */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 flex items-end" onClick={() => setSettingsOpen(false)}>
          <div className="drawer-backdrop absolute inset-0 bg-black/40" />
          <div
            className="relative w-full bg-om-surface rule-double-top shadow-2xl p-4 pb-8 max-h-[80dvh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-serif font-bold text-om-text">Options</h2>
              <button
                onClick={() => setSettingsOpen(false)}
                aria-label="Close options"
                className="h-10 w-10 text-om-muted text-2xl leading-none active:bg-om-slot-hover"
              >
                ×
              </button>
            </div>
            {settingRows}
            <div className="mt-4 border-t border-om-border pt-4">{themeGhost}</div>
          </div>
        </div>
      )}

      {/* Flashcards drawer */}
      {cardsOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="drawer-panel w-full lg:w-[80vw] bg-om-bg border-r border-om-border flex flex-col shadow-2xl">
            <Flashcards
              allEvents={allEvents}
              progress={cardProgress}
              onProgress={setCardProgress}
              onClose={() => setCardsOpen(false)}
            />
          </div>
          <div
            className="drawer-backdrop hidden lg:block flex-1 bg-black/40 cursor-pointer"
            onClick={() => setCardsOpen(false)}
          />
        </div>
      )}

      {/* Journal drawer */}
      {journalOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="drawer-panel w-full lg:w-[80vw] bg-om-surface border-r border-om-border flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 rule-double shrink-0">
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-om-text">
                Study Journal
              </h2>
              <button
                onClick={() => setJournalOpen(false)}
                aria-label="Close journal"
                className="h-11 w-11 shrink-0 text-om-muted text-3xl leading-none active:bg-om-slot-hover"
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

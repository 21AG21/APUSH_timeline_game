import { useReducer, useEffect } from 'react'
import type { GameState, Event } from '../data/types'
import { startGame, applyPlacement, setTentativeSlot } from '../lib/game'
import { useLocalStorage } from './useLocalStorage'

type Action =
  | { type: 'NEW_GAME'; events: Event[] }
  | { type: 'SET_TENTATIVE'; slot: number | null }
  | { type: 'PLACE'; slot: number; hardMode?: boolean }
  | { type: 'TIMEOUT'; timeTaken: number }
  | { type: 'LOAD'; state: GameState }

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'NEW_GAME':
      return startGame(action.events)
    case 'SET_TENTATIVE':
      return setTentativeSlot(state, action.slot)
    case 'PLACE':
      return applyPlacement(state, action.slot, { hardMode: action.hardMode ?? false })
    case 'TIMEOUT':
      return { ...state, gameOver: true, timeTaken: action.timeTaken, done: false }
    case 'LOAD':
      return action.state
    default:
      return state
  }
}

const EMPTY_STATE: GameState = {
  pool: [],
  timeline: [],
  current: null,
  score: 0,
  attempts: 0,
  tentativeSlot: null,
  done: true,
  gameOver: false,
  streak: 0,
  bestStreak: 0,
  missWeights: {},
  rngSeed: 0,
  missedIds: [],
  timeTaken: null,
}

export function useGameState(events: Event[]) {
  const [persisted, setPersisted] = useLocalStorage<GameState | null>('apush-game-state', null)
  const [savedCount, setSavedCount] = useLocalStorage<number>('apush-event-count', 0)

  const [state, dispatch] = useReducer(reducer, (() => {
    if (persisted && savedCount === events.length) {
      // Migrate: fill in any missing fields from EMPTY_STATE
      return { ...EMPTY_STATE, ...persisted }
    }
    // Event list has changed (new events added) — start fresh
    return EMPTY_STATE
  })())

  useEffect(() => {
    setPersisted(state)
  }, [state, setPersisted])

  useEffect(() => {
    setSavedCount(events.length)
  }, [events.length, setSavedCount])

  const newGame = (filteredEvents: Event[]) => dispatch({ type: 'NEW_GAME', events: filteredEvents })
  const setTentative = (slot: number | null) => dispatch({ type: 'SET_TENTATIVE', slot })
  const place = (slot: number, hardMode?: boolean) => dispatch({ type: 'PLACE', slot, hardMode })
  const timeout = (timeTaken: number) => dispatch({ type: 'TIMEOUT', timeTaken })

  return { state, newGame, setTentative, place, timeout }
}

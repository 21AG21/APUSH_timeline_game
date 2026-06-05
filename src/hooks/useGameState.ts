import { useReducer, useEffect } from 'react'
import type { GameState } from '../data/types'
import type { Event } from '../data/types'
import { startGame, applyPlacement, setTentativeSlot } from '../lib/game'
import { useLocalStorage } from './useLocalStorage'

type Action =
  | { type: 'NEW_GAME'; events: Event[] }
  | { type: 'SET_TENTATIVE'; slot: number | null }
  | { type: 'PLACE'; slot: number }
  | { type: 'LOAD'; state: GameState }

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'NEW_GAME':
      return startGame(action.events)
    case 'SET_TENTATIVE':
      return setTentativeSlot(state, action.slot)
    case 'PLACE':
      return applyPlacement(state, action.slot)
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
}

export function useGameState(events: Event[]) {
  const [persisted, setPersisted] = useLocalStorage<GameState | null>('apush-game-state', null)
  const [state, dispatch] = useReducer(reducer, persisted ?? EMPTY_STATE)

  // Persist on every state change
  useEffect(() => {
    setPersisted(state)
  }, [state, setPersisted])

  const newGame = () => dispatch({ type: 'NEW_GAME', events })
  const setTentative = (slot: number | null) => dispatch({ type: 'SET_TENTATIVE', slot })
  const place = (slot: number) => dispatch({ type: 'PLACE', slot })

  return { state, newGame, setTentative, place }
}

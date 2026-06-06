import { describe, it, expect } from 'vitest'
import { handleKeyPress } from './keyboard'

const SLOTS = 5

describe('number key – two-press confirm', () => {
  it('first press sets tentative slot', () => {
    expect(handleKeyPress('2', null, SLOTS)).toEqual({ type: 'tentative', slot: 1 })
  })

  it('second press of SAME number confirms', () => {
    expect(handleKeyPress('2', 1, SLOTS)).toEqual({ type: 'confirm', slot: 1 })
  })

  it('different number re-tentatives, does not confirm', () => {
    const r1 = handleKeyPress('2', null, SLOTS)
    expect(r1).toEqual({ type: 'tentative', slot: 1 })
    const r2 = handleKeyPress('3', 1, SLOTS)
    expect(r2.type).toBe('tentative')
    expect((r2 as { type: 'tentative'; slot: number }).slot).toBe(2)
  })

  it('out-of-range number key is noop', () => {
    expect(handleKeyPress('9', null, 3)).toEqual({ type: 'noop' })
  })

  it('key 1 selects slot 0', () => {
    expect(handleKeyPress('1', null, SLOTS)).toEqual({ type: 'tentative', slot: 0 })
  })
})

describe('Enter confirm path', () => {
  it('Enter confirms tentative slot', () => {
    expect(handleKeyPress('Enter', 2, SLOTS)).toEqual({ type: 'confirm', slot: 2 })
  })

  it('Enter with no tentative is noop', () => {
    expect(handleKeyPress('Enter', null, SLOTS)).toEqual({ type: 'noop' })
  })
})

describe('arrow key stepping', () => {
  it('ArrowDown from null goes to slot 0', () => {
    expect(handleKeyPress('ArrowDown', null, SLOTS)).toEqual({ type: 'step', slot: 0 })
  })

  it('ArrowDown increments slot', () => {
    expect(handleKeyPress('ArrowDown', 1, SLOTS)).toEqual({ type: 'step', slot: 2 })
  })

  it('ArrowDown clamps at last slot', () => {
    expect(handleKeyPress('ArrowDown', SLOTS - 1, SLOTS)).toEqual({ type: 'step', slot: SLOTS - 1 })
  })

  it('ArrowUp from null goes to last slot', () => {
    expect(handleKeyPress('ArrowUp', null, SLOTS)).toEqual({ type: 'step', slot: SLOTS - 1 })
  })

  it('ArrowUp decrements slot', () => {
    expect(handleKeyPress('ArrowUp', 2, SLOTS)).toEqual({ type: 'step', slot: 1 })
  })

  it('ArrowUp clamps at 0', () => {
    expect(handleKeyPress('ArrowUp', 0, SLOTS)).toEqual({ type: 'step', slot: 0 })
  })

  it('ArrowRight behaves like ArrowDown', () => {
    expect(handleKeyPress('ArrowRight', 1, SLOTS)).toEqual({ type: 'step', slot: 2 })
  })

  it('ArrowLeft behaves like ArrowUp', () => {
    expect(handleKeyPress('ArrowLeft', 2, SLOTS)).toEqual({ type: 'step', slot: 1 })
  })
})

describe('Escape', () => {
  it('Escape returns clear', () => {
    expect(handleKeyPress('Escape', 2, SLOTS)).toEqual({ type: 'clear' })
    expect(handleKeyPress('Escape', null, SLOTS)).toEqual({ type: 'clear' })
  })
})

describe('unknown keys', () => {
  it('other keys are noop', () => {
    expect(handleKeyPress('a', null, SLOTS)).toEqual({ type: 'noop' })
    expect(handleKeyPress('Tab', null, SLOTS)).toEqual({ type: 'noop' })
  })
})

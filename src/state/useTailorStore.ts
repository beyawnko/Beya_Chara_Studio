import { create } from 'zustand'

export type TailorPin = { vertex: number, type: 'fixed', target: [number, number, number] }

type State = {
  mode: 'character' | 'tailor'
  pins: TailorPin[]
  isSimulating: boolean
  setMode: (m: 'character' | 'tailor') => void
  addPin: (p: TailorPin) => void
  clearPins: () => void
  setSimulating: (v: boolean) => void
}

export const useTailorStore = create<State>(set => ({
  mode: 'character',
  pins: [],
  isSimulating: false,
  setMode: m => set({ mode: m }),
  addPin: p => set(s => ({ pins: [...s.pins, p] })),
  clearPins: () => set({ pins: [] }),
  setSimulating: v => set({ isSimulating: v })
}))

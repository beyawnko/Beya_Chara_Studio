import { useCharacterStore } from './useCharacterStore'
import { useTailorStore } from './useTailorStore'

export function initGarmentSubscriber() {
  return useCharacterStore.subscribe((state, prev) => {
    if (state.garment && state.garment !== prev.garment) {
      useTailorStore.getState().clearPins()
      useTailorStore.getState().setSimulating(false)
    }
  })
}

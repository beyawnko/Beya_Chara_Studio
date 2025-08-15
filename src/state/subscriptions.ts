import { useCharacterStore } from './useCharacterStore'
import { useTailorStore } from './useTailorStore'

export function initGarmentSubscriber() {
  return useCharacterStore.subscribe((state, prev) => {
    if (state.garment !== prev.garment) {
      const tailorState = useTailorStore.getState()
      tailorState.clearPins()
      tailorState.setSimulating(false)
    }
  })
}

import { useTailorStore } from '../state/useTailorStore'
import { DigitalTailorPanel } from './DigitalTailorPanel'

export function TailorModeSidebar() {
  const setMode = useTailorStore(s => s.setMode)
  return (
    <>
      <button className="btn" onClick={() => setMode('character')}>Back to Character Mode</button>
      <DigitalTailorPanel />
    </>
  )
}

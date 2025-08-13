import { useCharacterStore } from '../state/useCharacterStore'
import { useTailorStore } from '../state/useTailorStore'
import { FileDrop } from './FileDrop'

export function DigitalTailorPanel() {
  const garment = useCharacterStore(s => s.garment)
  const isSim = useTailorStore(s => s.isSimulating)
  const setSimulating = useTailorStore(s => s.setSimulating)

  return (
    <div>
      <h3>Digital Tailor</h3>
      {!garment ? (
        <FileDrop kind="garment" />
      ) : (
        <div><span className="badge">Garment</span>{garment.name ?? 'loaded'}</div>
      )}
      <button className="btn" disabled={!garment} onClick={() => setSimulating(!isSim)}>
        {isSim ? 'Stop Simulation' : 'Simulate Draping'}
      </button>
      <button className="btn" disabled={!garment} style={{marginLeft:8}}>Export Garment</button>
    </div>
  )
}

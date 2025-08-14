import { useEffect } from 'react'

import { CharacterModeSidebar } from './components/CharacterModeSidebar'
import { TailorModeSidebar } from './components/TailorModeSidebar'
import { Viewport } from './components/Viewport'
import { disposeMorphPool } from './lib/morphs'
import { disposeRetargetPool } from './lib/retarget'
import { useTailorStore } from './state/useTailorStore'

export default function App() {
  const mode = useTailorStore(s => s.mode)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const cleanup = () => {
      disposeMorphPool()
      disposeRetargetPool()
    }
    window.addEventListener('beforeunload', cleanup)
    return () => {
      cleanup()
      window.removeEventListener('beforeunload', cleanup)
    }
  }, [])

  const sidebar = mode === 'tailor' ? <TailorModeSidebar /> : <CharacterModeSidebar />

  return (
    <div className="row">
      <div className="sidebar">{sidebar}</div>
      <div className="main">
        <Viewport />
      </div>
    </div>
  )
}

import { useFrame, useThree } from '@react-three/fiber'
import { useRef, useState } from 'react'

/** Simple dev-only HUD showing renderer statistics */
const UPDATE_INTERVAL = 0.5 // seconds

export function PerfHUD() {
  const { gl } = useThree()
  const [geometries, setGeometries] = useState(gl.info.memory.geometries)
  const [textures, setTextures] = useState(gl.info.memory.textures)
  const lastUpdate = useRef(0)
  useFrame((state) => {
    if (state.clock.elapsedTime - lastUpdate.current > UPDATE_INTERVAL) {
      lastUpdate.current = state.clock.elapsedTime
      setGeometries(gl.info.memory.geometries)
      setTextures(gl.info.memory.textures)
    }
  })

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        background: 'rgba(0,0,0,0.5)',
        color: 'white',
        padding: 4,
        fontSize: 10,
      }}
    >
      <div>Geometries: {geometries}</div>
      <div>Textures: {textures}</div>
    </div>
  )
}


import { useFrame, useThree } from '@react-three/fiber'
import React, { useState } from 'react'

/** Simple dev-only HUD showing renderer statistics */
export function PerfHUD() {
  const { gl } = useThree()
  const [info, setInfo] = useState(gl.info)
  const UPDATE_INTERVAL = 0.5 // seconds
  const lastUpdate = React.useRef(0)
  useFrame((state) => {
    if (state.clock.elapsedTime - lastUpdate.current > UPDATE_INTERVAL) {
      lastUpdate.current = state.clock.elapsedTime
      setInfo({ ...gl.info })
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
      <div>Geometries: {info.memory.geometries}</div>
      <div>Textures: {info.memory.textures}</div>
    </div>
  )
}


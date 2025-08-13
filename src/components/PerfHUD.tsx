import React, { useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'

/** Simple dev-only HUD showing renderer statistics */
const UPDATE_INTERVAL = 0.5 // seconds

export function PerfHUD() {
  const { gl } = useThree()
  const [memoryInfo, setMemoryInfo] = useState(gl.info.memory)
  const lastUpdate = useRef(0)
  useFrame((state) => {
    if (state.clock.elapsedTime - lastUpdate.current > UPDATE_INTERVAL) {
      lastUpdate.current = state.clock.elapsedTime
      setMemoryInfo({ ...gl.info.memory })
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
      <div>Geometries: {memoryInfo.geometries}</div>
      <div>Textures: {memoryInfo.textures}</div>
    </div>
  )
}


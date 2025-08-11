import React, { useEffect, useState } from 'react'
import { useThree } from '@react-three/fiber'

/** Simple dev-only HUD showing renderer statistics */
export function PerfHUD() {
  const { gl } = useThree()
  const [info, setInfo] = useState(gl.info)

  useEffect(() => {
    const id = setInterval(() => setInfo({ ...gl.info }), 500)
    return () => clearInterval(id)
  }, [gl])

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


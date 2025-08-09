import React, { useEffect, useRef } from 'react'
import { TransformControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useCharacterStore } from '../state/useCharacterStore'

export function HeadTransformGizmo() {
  const head = useCharacterStore(s => s.head)
  const active = useCharacterStore(s => s.activePart)
  const setHeadOffset = useCharacterStore(s => s.setHeadOffset)
  const offset = useCharacterStore(s => s.headOffset)
  const ref = useRef<any>(null)
  const { camera, gl } = useThree()

  useEffect(() => {
    if (!head?.mesh || active!=='head') return
    const m = head.mesh
    m.position.set(offset.position.x, offset.position.y, offset.position.z)
    m.rotation.set(offset.rotation.x, offset.rotation.y, offset.rotation.z)
    m.scale.setScalar(offset.scale || 1)
  }, [head, active])

  if (!head?.mesh || active!=='head') return null

  return (
    <TransformControls ref={ref} object={head.mesh} mode="translate">
      {/* nothing, just attaches */}
    </TransformControls>
  )
}

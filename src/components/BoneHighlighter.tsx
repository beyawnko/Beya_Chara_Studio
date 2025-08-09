import { useFrame } from '@react-three/fiber'
import React, { useMemo } from 'react'
import * as THREE from 'three'

import { useCharacterStore } from '../state/useCharacterStore'

export function BoneHighlighter() {
  const head = useCharacterStore(s => s.head)
  const body = useCharacterStore(s => s.body)
  const selSrc = useCharacterStore(s => s.selSrcBone)
  const selDst = useCharacterStore(s => s.selDstBone)

  const srcSphere = useMemo(()=> new THREE.Mesh(
    new THREE.SphereGeometry(0.01),
    new THREE.MeshBasicMaterial({ color: 'yellow' })
  ),[])
  const dstSphere = useMemo(()=> new THREE.Mesh(
    new THREE.SphereGeometry(0.012),
    new THREE.MeshBasicMaterial({ color: 'cyan' })
  ),[])

  useFrame(()=>{
    if (head?.skeleton && selSrc) {
      const b = head.skeleton.bones.find(b=>b.name===selSrc)
      if (b) {
        b.updateWorldMatrix(true, false)
        srcSphere.position.setFromMatrixPosition(b.matrixWorld)
        srcSphere.visible = true
      } else srcSphere.visible = false
    } else srcSphere.visible = false

    if (body?.skeleton && selDst) {
      const b = body.skeleton.bones.find(b=>b.name===selDst)
      if (b) {
        b.updateWorldMatrix(true, false)
        dstSphere.position.setFromMatrixPosition(b.matrixWorld)
        dstSphere.visible = true
      } else dstSphere.visible = false
    } else dstSphere.visible = false
  })

  return (
    <group>
      <primitive object={srcSphere} />
      <primitive object={dstSphere} />
    </group>
  )
}

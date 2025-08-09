import { Environment,OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import React, { useMemo } from 'react'
import * as THREE from 'three'

import { useCharacterStore } from '../state/useCharacterStore'
import { BoneHighlighter } from './BoneHighlighter'
import { HeadTransformGizmo } from './HeadTransformGizmo'

export function Viewport() {
  const base = useCharacterStore(s => s.base)
  const head = useCharacterStore(s => s.head)
  const body = useCharacterStore(s => s.body)
  const activePart = useCharacterStore(s => s.activePart)
  const weights = useCharacterStore(s => s.morphWeights)
  const morphKeys = useCharacterStore(s => s.morphKeys)
  const assign = useCharacterStore(s => s.materialAssign)

  const active = activePart==='head' ? head : activePart==='body' ? body : base
  const mesh = active?.mesh

  useMemo(() => {
    if (!mesh) return
    mesh.traverse((obj: THREE.Object3D) => {
      if (obj instanceof THREE.Mesh) {
        const m = obj.material
        if (!m || !m.isMeshStandardMaterial) {
          obj.material = new THREE.MeshStandardMaterial({ metalness: 0.0, roughness: 0.5 })
        }
      }
    })
  }, [mesh])

  useMemo(() => {
    if (!mesh) return
    morphKeys.forEach((k, i) => {
      if (mesh.morphTargetInfluences) {
        mesh.morphTargetInfluences[i] = weights[k] ?? 0
      }
    })
  }, [mesh, weights, morphKeys])

  useMemo(() => {
    if (!mesh) return
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    mats.forEach((m: THREE.Material, i:number) => {
      const key = `${m?.name || 'mat'}#${i}`
      const val = assign[key] || 'none'
      let visible = true
      if (activePart==='head') visible = (val === 'head' || val === 'none')
      if (activePart==='body') visible = (val === 'body' || val === 'none')
      if (!m) return
      if (!visible) {
        m.transparent = true; m.opacity = 0; m.depthWrite = false
      } else {
        m.transparent = false; m.opacity = 1; m.depthWrite = true
      }
    })
  }, [mesh, assign, activePart])

  return (
    <Canvas dpr={[1,2]} gl={{ antialias: true }}>
      <color attach="background" args={['#0b0b0b']} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[5,10,5]} intensity={0.8} />
      {mesh && <primitive object={mesh} />}
      <HeadTransformGizmo />
      <BoneHighlighter />
      <Environment preset="city" />
      <OrbitControls makeDefault />
    </Canvas>
  )
}

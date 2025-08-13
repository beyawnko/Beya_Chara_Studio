import type { VRM } from '@pixiv/three-vrm'
import { Environment, OrbitControls } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

import { getMaterialSlotId, normalizeMeshMaterials } from '../lib/materials'
import { useCharacterStore } from '../state/useCharacterStore'
import { BoneHighlighter } from './BoneHighlighter'
import { HeadTransformGizmo } from './HeadTransformGizmo'
import { PerfHUD } from './PerfHUD'

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
  const vrmRef = useRef<VRM | null>(null)

  useEffect(() => {
    vrmRef.current = active?.vrm ?? null
  }, [active])

  useFrame((_, delta) => {
    vrmRef.current?.update(delta)
  })

  useEffect(() => {
    if (!mesh) return
    const created: THREE.Material[] = []
    mesh.traverse((obj: THREE.Object3D) => {
      if (obj instanceof THREE.Mesh) {
        normalizeMeshMaterials(obj, created)
      }
    })
    return () => {
      created.forEach(m => m.dispose())
    }
  }, [mesh])

  useEffect(() => {
    if (!mesh) return
    morphKeys.forEach((k, i) => {
      if (mesh.morphTargetInfluences) {
        mesh.morphTargetInfluences[i] = weights[k] ?? 0
      }
    })
  }, [mesh, weights, morphKeys])

  useEffect(() => {
    if (!mesh) return
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    mats.forEach((m: THREE.Material, i:number) => {
      const key = getMaterialSlotId(mesh, i)
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
      {import.meta.env.DEV && <PerfHUD />}
      <HeadTransformGizmo />
      <BoneHighlighter />
      <Environment preset="city" />
      <OrbitControls makeDefault />
    </Canvas>
  )
}

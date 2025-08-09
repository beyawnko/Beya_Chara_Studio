import * as THREE from 'three'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'

import type { LoadedFBX } from '../types'

export async function exportGLBBuffer(asset: LoadedFBX, opts?: { materialAllow?: Set<number> }): Promise<ArrayBuffer> {
  const root = new THREE.Group()
  const mesh = asset.mesh.clone()
  mesh.skeleton = asset.mesh.skeleton
  mesh.geometry = asset.geometry.clone()

  if (opts?.materialAllow && Array.isArray(mesh.material)) {
    mesh.material = mesh.material.map((m, i) => {
      if (!opts.materialAllow!.has(i)) {
        const mm = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
        mm.name = m.name || `hidden_${i}`
        return mm
      }
      return m
    })
  }

  root.add(mesh)
  root.scale.set(100,100,100)
  root.rotateX(-Math.PI/2)
  root.updateMatrixWorld(true)

  const exporter = new GLTFExporter()
  const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
    exporter.parse(root, (res) => resolve(res as ArrayBuffer), reject, {
      binary: true,
      onlyVisible: true,
      embedImages: true
    })
  })
  return arrayBuffer
}

export async function exportGLB(asset: LoadedFBX, opts?: { materialAllow?: Set<number> }) {
  const arrayBuffer = await exportGLBBuffer(asset, opts)
  const blob = new Blob([arrayBuffer], { type: 'model/gltf-binary' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'Character_UE.glb'
  a.click()
  URL.revokeObjectURL(url)
}


export { exportGLBBufferCombined } from './exportGLBCombined'


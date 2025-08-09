import * as THREE from 'three'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'
import type { LoadedFBX } from '../types'

export async function exportGLBBufferCombined(body: LoadedFBX|null, head: LoadedFBX|null, opts?: { bodyAllow?: Set<number>, headAllow?: Set<number> }): Promise<ArrayBuffer> {
  const root = new THREE.Group()

  if (body) {
    const b = body.mesh.clone()
    b.skeleton = body.mesh.skeleton
    b.geometry = body.geometry.clone()
    if (opts?.bodyAllow && Array.isArray(b.material)) {
      b.material = b.material.map((m, i) => opts.bodyAllow!.has(i) ? m : new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }))
    }
    root.add(b)
  }

  if (head) {
    const h = head.mesh.clone()
    h.skeleton = head.mesh.skeleton // may now be body.skeleton after rebind
    h.geometry = head.geometry.clone()
    if (opts?.headAllow && Array.isArray(h.material)) {
      h.material = h.material.map((m, i) => opts.headAllow!.has(i) ? m : new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }))
    }
    root.add(h)
  }

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

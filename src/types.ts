import * as THREE from 'three'

export type LoadedFBX = {
  name: string
  mesh: THREE.SkinnedMesh
  geometry: THREE.BufferGeometry
  skeleton: THREE.Skeleton
  bindMatrix: THREE.Matrix4
  head?: THREE.SkinnedMesh | null
  body?: THREE.SkinnedMesh | null
}

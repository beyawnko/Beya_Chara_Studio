import * as THREE from 'three'

import type { AnyAsset } from '../src/types'

export function mockAsset(overrides: Partial<AnyAsset> = {}): AnyAsset {
  const geometry = overrides.geometry ?? new THREE.BufferGeometry()
  return {
    name: 'mock',
    mesh: overrides.mesh ?? new THREE.SkinnedMesh(geometry),
    geometry,
    skeleton: overrides.skeleton ?? new THREE.Skeleton([]),
    bindMatrix: overrides.bindMatrix ?? new THREE.Matrix4(),
    ...overrides,
  }
}

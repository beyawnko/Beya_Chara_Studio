import * as THREE from 'three'

/**
 * Upgrade any material to MeshStandardMaterial, preserving basic properties
 * and tracking newly created materials for later disposal.
 */
export function toStandardMaterial(
  mat: THREE.Material,
  created: THREE.Material[],
): THREE.Material {
  if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhysicalMaterial) {
    return mat
  }
  const next = new THREE.MeshStandardMaterial()
  // try to preserve color & map when available
  const src = mat as THREE.Material & { color?: THREE.Color; map?: THREE.Texture }
  if (src.color) next.color = src.color.clone()
  if (src.map) next.map = src.map
  created.push(next)
  return next
}

/**
 * Normalise a mesh's material(s) to MeshStandardMaterial variants.
 * Any newly created materials are pushed to `created` for disposal.
 */
export function normalizeMeshMaterials(
  mesh: THREE.Mesh,
  created: THREE.Material[],
): void {
  if (Array.isArray(mesh.material)) {
    mesh.material = mesh.material.map(m => (m ? toStandardMaterial(m, created) : m))
  } else if (mesh.material) {
    mesh.material = toStandardMaterial(mesh.material, created)
  }
}

function hashGeometry(geom: THREE.BufferGeometry): string {
  const pos = geom.getAttribute('position') as THREE.BufferAttribute | undefined
  const idx = geom.getIndex()
  let hash = 2166136261
  if (pos && pos.array.length >= 3) {
    const arr = pos.array as ArrayLike<number>
    for (let i = 0; i < Math.min(9, arr.length); i++) {
      hash ^= Math.round(arr[i] * 1e3)
      hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24)
    }
  }
  if (idx) {
    hash ^= idx.count
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24)
  }
  return (hash >>> 0).toString(36)
}

/**
 * Generate a deterministic ID for a material slot on a mesh based on its
 * geometry contents and the material index. This remains stable across reloads
 * and multiple imports of identical geometry.
 */
export function getMaterialSlotId(mesh: THREE.Mesh, index: number): string {
  const geom = mesh.geometry as THREE.BufferGeometry
  return `${hashGeometry(geom)}:${index}`
}


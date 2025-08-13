import * as THREE from 'three'
import { describe, expect, it } from 'vitest'

import { getMaterialSlotId, normalizeMeshMaterials } from '../src/lib/materials'

describe('material helpers', () => {
  it('leaves MeshStandardMaterial untouched', () => {
    const mesh = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshStandardMaterial())
    const created: THREE.Material[] = []
    normalizeMeshMaterials(mesh, created)
    expect(created.length).toBe(0)
    expect(mesh.material).toBeInstanceOf(THREE.MeshStandardMaterial)
  })

  it('upgrades basic material preserving color', () => {
    const mat = new THREE.MeshBasicMaterial({ color: 'red' })
    const mesh = new THREE.Mesh(new THREE.BufferGeometry(), mat)
    const created: THREE.Material[] = []
    normalizeMeshMaterials(mesh, created)
    expect(created.length).toBe(1)
    const m = mesh.material as THREE.MeshStandardMaterial
    expect(m.color.getStyle()).toBe('rgb(255,0,0)')
  })

  it('handles array without collapsing', () => {
    const mats: THREE.Material[] = [new THREE.MeshBasicMaterial(), new THREE.MeshStandardMaterial()]
    const mesh = new THREE.Mesh(new THREE.BufferGeometry(), mats)
    const created: THREE.Material[] = []
    normalizeMeshMaterials(mesh, created)
    const arr = mesh.material as THREE.Material[]
    expect(arr).toHaveLength(2)
    expect(arr[1]).toBeInstanceOf(THREE.MeshStandardMaterial)
    expect(created.length).toBe(1)
  })

  it('generates stable material slot ids', () => {
    const geom = new THREE.BoxGeometry(1, 1, 1)
    const meshA = new THREE.Mesh(geom, [new THREE.MeshStandardMaterial()])
    const meshB = new THREE.Mesh(geom.clone(), [new THREE.MeshStandardMaterial()])
    const idA = getMaterialSlotId(meshA, 0)
    const idA2 = getMaterialSlotId(meshA, 0)
    const idB = getMaterialSlotId(meshB, 0)
    expect(idA).toBe(idA2)
    expect(idA).toBe(idB)
    const geom2 = new THREE.BoxGeometry(2, 1, 1)
    const meshC = new THREE.Mesh(geom2, [new THREE.MeshStandardMaterial()])
    expect(getMaterialSlotId(meshC, 0)).not.toBe(idA)
  })
})


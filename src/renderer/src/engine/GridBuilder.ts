import * as THREE from 'three'

/**
 * Genera la geometría de líneas de la cuadrícula del plano de trabajo
 * (estilo CAD, plano X-Z), equivalente a Engine/GridBuilder.cs de la
 * versión WPF.
 */
export function buildGrid(halfExtent = 25, cellSize = 1): THREE.LineSegments {
  const points: number[] = []

  for (let x = -halfExtent; x <= halfExtent + 1e-6; x += cellSize) {
    points.push(x, 0, -halfExtent, x, 0, halfExtent)
  }
  for (let z = -halfExtent; z <= halfExtent + 1e-6; z += cellSize) {
    points.push(-halfExtent, 0, z, halfExtent, 0, z)
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3))

  const material = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.24
  })

  return new THREE.LineSegments(geometry, material)
}

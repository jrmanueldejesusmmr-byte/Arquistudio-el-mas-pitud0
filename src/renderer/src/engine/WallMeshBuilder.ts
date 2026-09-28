import * as THREE from 'three'
import { Wall } from '../models/Wall'

/**
 * Convierte un objeto de datos Wall (línea + grosor + altura) en un
 * THREE.Mesh extruido (una caja orientada y posicionada según el segmento
 * start→end). Equivalente a Engine/WallMeshBuilder.cs de la versión WPF.
 */
export function buildWallMesh(wall: Wall): THREE.Mesh {
  const geometry = new THREE.BoxGeometry(wall.length, wall.height, wall.thickness)

  // La caja nace centrada en el origen y alineada al eje X; hay que
  // trasladarla al punto medio del segmento y rotarla para que su eje
  // largo apunte de start a end.
  geometry.translate(wall.length / 2, wall.height / 2, 0)

  const material = new THREE.MeshStandardMaterial({
    color: wall.isSelected ? 0x3d8bff : wall.color,
    roughness: 0.85,
    metalness: 0.05
  })

  const mesh = new THREE.Mesh(geometry, material)

  const direction = new THREE.Vector3().subVectors(wall.end, wall.start)
  const angle = Math.atan2(direction.z, direction.x)

  mesh.position.copy(wall.start)
  mesh.rotation.y = -angle
  mesh.userData.wallId = wall.id

  return mesh
}

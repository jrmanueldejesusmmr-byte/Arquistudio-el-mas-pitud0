import * as THREE from 'three'

/**
 * Tipo de segmento de pared, correspondiente a las tres herramientas del
 * panel izquierdo: "Walls", "Structural Wall Segments" y "Room Walls".
 */
export enum WallSegmentType {
  SimpleWall = 'SimpleWall',
  StructuralSegment = 'StructuralSegment',
  RoomWalls = 'RoomWalls'
}

let nextId = 1

/**
 * Representa una pared u objeto arquitectónico colocado sobre la
 * cuadrícula 3D. Es un objeto de datos puro (sin lógica de render): el
 * motor (engine/WallMeshBuilder) lo traduce a geometría de Three.js.
 */
export class Wall {
  readonly id: string = `wall-${nextId++}`

  type: WallSegmentType = WallSegmentType.SimpleWall
  start: THREE.Vector3
  end: THREE.Vector3
  height = 2.5
  thickness = 0.2
  color = 0xe0dace

  /**
   * Si es true, la IA tiene permiso para modificar/mover/borrar este
   * objeto automáticamente (ver instrucciones del proyecto: "La IA tendrá
   * dominio sobre objeto creado"). Los bocetos manuales del usuario deben
   * marcarse en false para protegerlos.
   */
  aiControlled = true

  isSelected = false

  constructor(start: THREE.Vector3, end: THREE.Vector3, type: WallSegmentType = WallSegmentType.SimpleWall) {
    this.start = start
    this.end = end
    this.type = type
  }

  get length(): number {
    return this.start.distanceTo(this.end)
  }
}

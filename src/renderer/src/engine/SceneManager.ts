import * as THREE from 'three'
import { Wall, WallSegmentType } from '../models/Wall'
import { ProjectDesign } from '../models/ProjectDesign'

type WallListener = (wall: Wall) => void
type SelectionListener = (wall: Wall | null) => void

/**
 * Fuente única de verdad para los objetos del lienzo. La capa de render
 * (viewport/ViewportRenderer.ts) se suscribe a onWallAdded/Removed/Changed
 * para regenerar solo la geometría afectada. Equivalente a
 * Engine/SceneManager.cs de la versión WPF.
 *
 * Es también el punto de entrada que usa AIChatService para aplicar los
 * comandos JSON que llegan del "Chat IA": todo objeto creado por la IA
 * pasa por aquí, igual que los creados manualmente por el usuario.
 */
export class SceneManager {
  private walls: Wall[] = []
  private selected: Wall | null = null

  private addedListeners: WallListener[] = []
  private removedListeners: WallListener[] = []
  private changedListeners: WallListener[] = []
  private selectionListeners: SelectionListener[] = []

  onWallAdded(fn: WallListener): void {
    this.addedListeners.push(fn)
  }
  onWallRemoved(fn: WallListener): void {
    this.removedListeners.push(fn)
  }
  onWallChanged(fn: WallListener): void {
    this.changedListeners.push(fn)
  }
  onSelectionChanged(fn: SelectionListener): void {
    this.selectionListeners.push(fn)
  }

  getWalls(): readonly Wall[] {
    return this.walls
  }

  addWall(
    type: WallSegmentType,
    start: THREE.Vector3,
    end: THREE.Vector3,
    aiControlled = false
  ): Wall {
    const wall = new Wall(start, end, type)
    wall.aiControlled = aiControlled
    this.walls.push(wall)
    this.addedListeners.forEach((fn) => fn(wall))
    return wall
  }

  removeWall(id: string): boolean {
    const idx = this.walls.findIndex((w) => w.id === id)
    if (idx === -1) return false

    const [wall] = this.walls.splice(idx, 1)
    this.removedListeners.forEach((fn) => fn(wall))
    if (this.selected === wall) this.select(null)
    return true
  }

  /** Reposiciona una pared existente (arrastre manual o comando de la IA). */
  moveWall(id: string, newStart: THREE.Vector3, newEnd: THREE.Vector3): void {
    const wall = this.walls.find((w) => w.id === id)
    if (!wall) return

    wall.start = newStart
    wall.end = newEnd
    this.changedListeners.forEach((fn) => fn(wall))
  }

  select(wall: Wall | null): void {
    if (this.selected) this.selected.isSelected = false
    this.selected = wall
    if (wall) wall.isSelected = true
    this.selectionListeners.forEach((fn) => fn(wall))
  }

  getSelected(): Wall | null {
    return this.selected
  }

  clear(): void {
    const toRemove = [...this.walls]
    this.walls = []
    toRemove.forEach((wall) => this.removedListeners.forEach((fn) => fn(wall)))
    this.select(null)
  }

  /** Carga un diseño predeterminado de la galería inferior, trasladado al origen indicado. */
  loadDesign(design: ProjectDesign, origin: THREE.Vector3): void {
    for (const templateWall of design.walls) {
      this.addWall(
        templateWall.type,
        new THREE.Vector3().addVectors(templateWall.start, origin),
        new THREE.Vector3().addVectors(templateWall.end, origin),
        false
      )
    }
  }

  getSceneBounds(): THREE.Box3 {
    if (this.walls.length === 0) {
      return new THREE.Box3(new THREE.Vector3(-5, 0, -5), new THREE.Vector3(5, 3, 5))
    }
    const box = new THREE.Box3()
    for (const wall of this.walls) {
      box.expandByPoint(wall.start)
      box.expandByPoint(wall.end)
    }
    return box
  }
}

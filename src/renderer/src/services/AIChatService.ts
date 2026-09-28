import * as THREE from 'three'
import { SceneManager } from '../engine/SceneManager'
import { WallSegmentType } from '../models/Wall'

/**
 * Comando estructurado que el widget "Chat IA" recibe del backend/modelo y
 * que este servicio traduce en operaciones sobre SceneManager. Mismo
 * contrato que Services/AIChatService.cs de la versión WPF.
 *
 * Ejemplo de comando para crear una pared:
 * {
 *   "action": "add_wall",
 *   "wallType": "SimpleWall",
 *   "start": { "x": 0, "y": 0, "z": 0 },
 *   "end":   { "x": 4, "y": 0, "z": 0 }
 * }
 */
interface XyzDto {
  x: number
  y: number
  z: number
}

interface AiCommand {
  action: 'add_wall' | 'move_wall' | 'remove_wall' | 'clear' | 'run_animation' | string
  wallId?: string
  wallType?: string
  start?: XyzDto
  end?: XyzDto
  animationName?: string
}

export interface AiCommandResult {
  success: boolean
  message: string
}

function toVector3(dto: XyzDto): THREE.Vector3 {
  return new THREE.Vector3(dto.x, dto.y, dto.z)
}

export class AIChatService {
  constructor(private readonly scene: SceneManager) {}

  /**
   * Punto de entrada único: recibe el texto JSON crudo devuelto por la IA
   * y lo aplica sobre la escena. Nunca confía ciegamente en la entrada:
   * valida el tipo de acción y los datos antes de tocar el SceneManager.
   */
  applyJsonCommand(json: string): AiCommandResult {
    let cmd: AiCommand
    try {
      cmd = JSON.parse(json)
    } catch (err) {
      return { success: false, message: `JSON inválido: ${(err as Error).message}` }
    }

    switch (cmd.action) {
      case 'add_wall':
        return this.handleAddWall(cmd)
      case 'move_wall':
        return this.handleMoveWall(cmd)
      case 'remove_wall':
        return this.handleRemoveWall(cmd)
      case 'clear':
        this.scene.clear()
        return { success: true, message: 'Escena limpiada.' }
      case 'run_animation':
        // Punto de extensión: aquí se dispara la animación de "correr por
        // la casa" mencionada en las instrucciones del proyecto.
        return { success: true, message: `Animación solicitada: ${cmd.animationName ?? '(sin nombre)'}` }
      default:
        return { success: false, message: `Acción desconocida: '${cmd.action}'.` }
    }
  }

  private handleAddWall(cmd: AiCommand): AiCommandResult {
    if (!cmd.start || !cmd.end) {
      return { success: false, message: "add_wall requiere 'start' y 'end'." }
    }
    const type =
      cmd.wallType && cmd.wallType in WallSegmentType
        ? (cmd.wallType as WallSegmentType)
        : WallSegmentType.SimpleWall

    const wall = this.scene.addWall(type, toVector3(cmd.start), toVector3(cmd.end), true)
    return { success: true, message: `Pared creada (${wall.id}).` }
  }

  private handleMoveWall(cmd: AiCommand): AiCommandResult {
    if (!cmd.wallId) return { success: false, message: "move_wall requiere un 'wallId'." }
    if (!cmd.start || !cmd.end) {
      return { success: false, message: "move_wall requiere 'start' y 'end'." }
    }
    this.scene.moveWall(cmd.wallId, toVector3(cmd.start), toVector3(cmd.end))
    return { success: true, message: 'Pared movida.' }
  }

  private handleRemoveWall(cmd: AiCommand): AiCommandResult {
    if (!cmd.wallId) return { success: false, message: "remove_wall requiere un 'wallId'." }
    const removed = this.scene.removeWall(cmd.wallId)
    return { success: removed, message: removed ? 'Pared eliminada.' : 'No se encontró la pared.' }
  }
}

import * as THREE from 'three'
import { CameraState, Axis3D } from '../models/CameraState'

/**
 * Controlador de cámara puro (sin dependencias del DOM más allá de tipos
 * de Three.js). Traduce gestos de entrada -delta de ratón, rueda- en
 * cambios sobre un CameraState, y expone la posición/mirada resultante
 * para que el renderer las aplique a la THREE.PerspectiveCamera.
 *
 * Se mantiene separado de la UI a propósito, igual que en la versión WPF
 * (Engine/Viewport3DController.cs).
 */
export class Viewport3DController {
  state: CameraState

  orbitSensitivity = 0.0075
  panSensitivity = 0.0025
  zoomSensitivity = 0.0015

  constructor(initialState?: CameraState) {
    this.state = initialState ?? new CameraState()
  }

  /** Órbita la cámara alrededor de target según el desplazamiento del ratón. */
  orbit(deltaX: number, deltaY: number): void {
    this.state.yaw -= deltaX * this.orbitSensitivity
    this.state.pitch += deltaY * this.orbitSensitivity
    this.state.clampPitch()
  }

  /** Desplaza el punto target en el plano de la pantalla (pan). */
  pan(deltaX: number, deltaY: number): void {
    const camPos = this.state.computePosition()
    const forward = new THREE.Vector3().subVectors(this.state.target, camPos).normalize()
    const worldUp = new THREE.Vector3(0, 1, 0)
    const right = new THREE.Vector3().crossVectors(forward, worldUp).normalize()
    const up = new THREE.Vector3().crossVectors(right, forward)

    const scale = this.state.distance * this.panSensitivity
    const offset = right
      .multiplyScalar(-deltaX * scale)
      .add(up.multiplyScalar(deltaY * scale))

    this.state.target.add(offset)
  }

  /** Aplica zoom acercando/alejando la cámara del target (rueda del ratón). */
  zoom(wheelDelta: number): void {
    this.state.distance -= wheelDelta * this.state.distance * this.zoomSensitivity
    this.state.clampDistance()
  }

  /** Fija el zoom a una fracción 0..1 (0 = más cerca, 1 = más lejos), para el slider de la UI. */
  setZoomFraction(fraction01: number): void {
    const f = Math.min(1, Math.max(0, fraction01))
    this.state.distance = this.state.minDistance + f * (this.state.maxDistance - this.state.minDistance)
  }

  /** Fracción 0..1 actual del zoom, para reflejar el estado en el slider. */
  getZoomFraction(): number {
    return (this.state.distance - this.state.minDistance) / (this.state.maxDistance - this.state.minDistance)
  }

  /** Encuadra la cámara para ver todo el contenido dado. */
  frameBounds(box: THREE.Box3): void {
    const center = box.getCenter(new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3())
    this.state.target.copy(center)

    const maxDim = Math.max(size.x, size.y, size.z)
    this.state.distance = Math.max(maxDim * 1.6, this.state.minDistance)
    this.state.clampDistance()
  }

  /** Alinea la vista a uno de los ejes principales (clic en el gizmo X/Y/Z). */
  snapToAxis(axis: Axis3D): void {
    switch (axis) {
      case Axis3D.X:
        this.state.yaw = Math.PI / 2
        this.state.pitch = 0
        break
      case Axis3D.Y:
        this.state.yaw = 0
        this.state.pitch = Math.PI / 2 - 0.001
        break
      case Axis3D.Z:
        this.state.yaw = 0
        this.state.pitch = 0
        break
    }
  }

  get cameraPosition(): THREE.Vector3 {
    return this.state.computePosition()
  }
}

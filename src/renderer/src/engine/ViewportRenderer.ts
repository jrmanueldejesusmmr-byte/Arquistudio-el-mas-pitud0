import * as THREE from 'three'
import { SceneManager } from '../engine/SceneManager'
import { Viewport3DController } from '../engine/Viewport3DController'
import { buildGrid } from '../engine/GridBuilder'
import { buildWallMesh } from '../engine/WallMeshBuilder'
import { Wall } from '../models/Wall'

/**
 * "Pegamento" entre el motor (Engine/Models) y Three.js: crea la escena,
 * la cámara y el loop de render, y traduce eventos de SceneManager en
 * THREE.Mesh concretos. Equivalente al code-behind de MainWindow.xaml.cs
 * de la versión WPF — deliberadamente sin lógica de negocio propia.
 */
export class ViewportRenderer {
  private readonly renderer: THREE.WebGLRenderer
  private readonly scene = new THREE.Scene()
  private readonly camera: THREE.PerspectiveCamera
  private readonly wallMeshes = new Map<string, THREE.Mesh>()

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly sceneManager: SceneManager,
    private readonly cameraController: Viewport3DController
  ) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.scene.background = new THREE.Color(0x0d0d0d)

    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000)
    this.syncCamera()

    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x222233, 1.1))
    const sun = new THREE.DirectionalLight(0xffffff, 0.9)
    sun.position.set(15, 25, 10)
    this.scene.add(sun)

    this.scene.add(buildGrid())

    sceneManager.onWallAdded((wall) => this.onWallAdded(wall))
    sceneManager.onWallRemoved((wall) => this.onWallRemoved(wall))
    sceneManager.onWallChanged((wall) => this.onWallChanged(wall))

    this.resize()
    window.addEventListener('resize', () => this.resize())

    // Observador para redimensionar automáticamente el canvas si el contenedor cambia de tamaño
    if (this.canvas.parentElement && typeof ResizeObserver !== 'undefined') {
      const resizeObserver = new ResizeObserver(() => this.resize())
      resizeObserver.observe(this.canvas.parentElement)
    }

    this.animate()
  }

  private onWallAdded(wall: Wall): void {
    const mesh = buildWallMesh(wall)
    this.wallMeshes.set(wall.id, mesh)
    this.scene.add(mesh)
  }

  private onWallRemoved(wall: Wall): void {
    const mesh = this.wallMeshes.get(wall.id)
    if (mesh) {
      this.scene.remove(mesh)
      mesh.geometry.dispose()
      ;(mesh.material as THREE.Material).dispose()
      this.wallMeshes.delete(wall.id)
    }
  }

  private onWallChanged(wall: Wall): void {
    // Forma simple y robusta: reconstruir la malla del segmento modificado.
    this.onWallRemoved(wall)
    this.onWallAdded(wall)
  }

  /** Aplica el estado del Viewport3DController a la THREE.PerspectiveCamera real. */
  syncCamera(): void {
    const pos = this.cameraController.cameraPosition
    this.camera.position.copy(pos)
    this.camera.lookAt(this.cameraController.state.target)
  }

  resize(): void {
    const parent = this.canvas.parentElement
    const width = parent ? parent.clientWidth : this.canvas.clientWidth
    const height = parent ? parent.clientHeight : this.canvas.clientHeight
    if (width === 0 || height === 0) return

    this.renderer.setSize(width, height, false)
    this.camera.aspect = width / Math.max(height, 1)
    this.camera.updateProjectionMatrix()
  }

  private animate = (): void => {
    requestAnimationFrame(this.animate)
    this.renderer.render(this.scene, this.camera)
  }
}

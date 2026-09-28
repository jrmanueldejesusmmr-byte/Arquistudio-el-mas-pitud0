import * as THREE from 'three'
import { SceneManager } from './engine/SceneManager'
import { Viewport3DController } from './engine/Viewport3DController'
import { ViewportRenderer } from './engine/ViewportRenderer'
import { AIChatService } from './services/AIChatService'
import { WallSegmentType } from './models/Wall'
import { ProjectDesign } from './models/ProjectDesign'
import { Axis3D } from './models/CameraState'
import { mountLeftToolbar } from './ui/LeftToolbar'
import { mountRightPanel } from './ui/RightPanel'
import { mountBottomGallery } from './ui/BottomGallery'
import { mountOrientationGizmo, mountNavigationSphere } from './ui/OrientationGizmo'

// ---------- Estado / motor (equivalente a MainViewModel.cs) ----------
const scene = new SceneManager()
const cameraController = new Viewport3DController()
const aiChat = new AIChatService(scene)

let activeTool: WallSegmentType = WallSegmentType.SimpleWall

const designs: ProjectDesign[] = [
  new ProjectDesign('Casa moderna A'),
  new ProjectDesign('Casa modular B'),
  new ProjectDesign('Departamento C')
]

const instructions = [
  "De la casa: Correr para ver una animación (referencia a 'correr' de la casa original).",
  'La IA tendrá dominio sobre el objeto creado; si quieres que te cree un boceto, hazlo tú en el dispositivo.',
  'Las opciones de diseño de casa: si solo quieres mejorar o agrandar lo que ya tienes, tendrá poder, pero eso queda a tu elección.'
]

// ---------- Viewport 3D ----------
const canvas = document.getElementById('viewport-canvas') as HTMLCanvasElement
const viewport = new ViewportRenderer(canvas, scene, cameraController)

// Un par de paredes de ejemplo para ver algo al arrancar la app.
scene.addWall(WallSegmentType.SimpleWall, new THREE.Vector3(-3, 0, 0), new THREE.Vector3(3, 0, 0))
scene.addWall(WallSegmentType.SimpleWall, new THREE.Vector3(3, 0, 0), new THREE.Vector3(3, 0, 4))

// ---------- Controles de cámara: órbita, pan, zoom ----------
let isOrbiting = false
let isPanning = false
let lastX = 0
let lastY = 0

canvas.addEventListener('contextmenu', (e) => e.preventDefault())

canvas.addEventListener('mousedown', (e) => {
  if (e.button === 0) isOrbiting = true
  if (e.button === 2) isPanning = true
  lastX = e.clientX
  lastY = e.clientY
})

window.addEventListener('mouseup', () => {
  isOrbiting = false
  isPanning = false
})

window.addEventListener('mousemove', (e) => {
  const dx = e.clientX - lastX
  const dy = e.clientY - lastY
  lastX = e.clientX
  lastY = e.clientY

  if (isOrbiting) cameraController.orbit(dx, dy)
  else if (isPanning) cameraController.pan(dx, dy)
  else return

  viewport.syncCamera()
  syncZoomSlider()
})

canvas.addEventListener('wheel', (e) => {
  e.preventDefault()
  cameraController.zoom(e.deltaY)
  viewport.syncCamera()
  syncZoomSlider()
})

const zoomSlider = document.getElementById('zoom-slider') as HTMLInputElement
zoomSlider.addEventListener('input', () => {
  cameraController.setZoomFraction(parseFloat(zoomSlider.value))
  viewport.syncCamera()
})

function syncZoomSlider(): void {
  zoomSlider.value = cameraController.getZoomFraction().toString()
}
syncZoomSlider()

// ---------- Paneles de UI ----------
mountLeftToolbar(
  document.getElementById('left-toolbar')!,
  (type) => {
    activeTool = type
  },
  () => {
    // Punto de enganche para el botón "(+) Añadir": abrir diálogo de
    // importación de modelos/planos externos.
  }
)

mountRightPanel(document.getElementById('right-panel')!, instructions, aiChat)

mountBottomGallery(document.getElementById('bottom-gallery')!, designs, (design) => {
  scene.loadDesign(design, new THREE.Vector3(0, 0, 0))
})

mountOrientationGizmo(document.getElementById('orientation-gizmo')!, (axis: Axis3D) => {
  cameraController.snapToAxis(axis)
  viewport.syncCamera()
  syncZoomSlider()
})

mountNavigationSphere(document.getElementById('navigation-sphere')!)

// Referencia disponible para depuración/futuras herramientas de colocación
// manual de paredes con el `activeTool` seleccionado.
void activeTool

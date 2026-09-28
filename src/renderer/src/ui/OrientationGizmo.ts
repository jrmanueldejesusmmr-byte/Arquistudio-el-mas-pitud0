import { Axis3D } from '../models/CameraState'

/**
 * Gizmo de orientación de la esquina superior del Viewport. Representación
 * ligera en DOM (sin coste de otra escena 3D) equivalente a
 * Views/Controls/OrientationGizmo.xaml. Los botones de eje llaman a
 * Viewport3DController.snapToAxis desde main.ts.
 */
export function mountOrientationGizmo(container: HTMLElement, onSnapAxis: (axis: Axis3D) => void): void {
  container.innerHTML = `
    <div class="gizmo-cube">⬚</div>
    <button class="gizmo-axis gizmo-x" data-axis="${Axis3D.X}">X</button>
    <button class="gizmo-axis gizmo-y" data-axis="${Axis3D.Y}">Y</button>
    <button class="gizmo-axis gizmo-z" data-axis="${Axis3D.Z}">Z</button>
  `

  container.querySelectorAll<HTMLButtonElement>('.gizmo-axis').forEach((btn) => {
    btn.addEventListener('click', () => onSnapAxis(btn.dataset.axis as Axis3D))
  })
}

/**
 * Esfera de navegación decorativa (los tres anillos entrelazados de la
 * esquina superior derecha del prototipo). Puramente visual, sin lógica.
 */
export function mountNavigationSphere(container: HTMLElement): void {
  container.innerHTML = `
    <svg viewBox="0 0 90 90" width="90" height="90">
      <ellipse cx="45" cy="45" rx="35" ry="15" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="1.2"/>
      <ellipse cx="45" cy="45" rx="15" ry="35" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="1.2"/>
      <circle cx="45" cy="45" r="35" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
    </svg>
  `
}

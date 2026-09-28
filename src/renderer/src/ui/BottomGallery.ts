import { ProjectDesign } from '../models/ProjectDesign'

/**
 * Galería inferior "Diseños de Cosas": miniatura 3D + plano 2D por diseño.
 * Al hacer clic se proyecta el diseño sobre la cuadrícula del Viewport.
 * Equivalente a Views/Controls/BottomGalleryView.xaml.
 */
export function mountBottomGallery(
  container: HTMLElement,
  designs: ProjectDesign[],
  onSelectDesign: (design: ProjectDesign) => void
): void {
  container.innerHTML = `
    <h1>Diseños de Cosas</h1>
    <div class="gallery-row" id="gallery-row"></div>
  `

  const row = container.querySelector<HTMLDivElement>('#gallery-row')!

  designs.forEach((design, index) => {
    const item = document.createElement('button')
    item.className = 'gallery-item'
    item.innerHTML = `
      <div class="thumb-3d"></div>
      <div class="thumb-arrow">↑</div>
      <div class="thumb-2d"></div>
      <span>${design.name}</span>
    `
    item.addEventListener('click', () => onSelectDesign(design))
    row.appendChild(item)
    void index
  })
}

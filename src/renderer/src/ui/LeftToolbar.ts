import { WallSegmentType } from '../models/Wall'

/**
 * Panel izquierdo con las herramientas de figuras/muros y el botón
 * "Añadir". Equivalente a Views/Controls/LeftToolbarView.xaml.
 */
export function mountLeftToolbar(
  container: HTMLElement,
  onSelectTool: (type: WallSegmentType) => void,
  onAddElement: () => void
): void {
  container.innerHTML = `
    <div class="toolbar-header">
      <span class="toolbar-heading">Herramientas</span>
    </div>
    <div class="toolbar-tools">
      <button class="tool-btn" data-tool="figuras" title="Herramienta Figuras">
        <div class="tool-icon icon-circle"></div>
        <span class="tool-name">Figuras</span>
      </button>
      <button class="tool-btn active" data-tool="${WallSegmentType.SimpleWall}" title="Muro Simple">
        <div class="tool-icon icon-rect"></div>
        <span class="tool-name">Walls</span>
      </button>
      <button class="tool-btn" data-tool="${WallSegmentType.StructuralSegment}" title="Segmentos Estructurales">
        <div class="tool-icon icon-segments">
          <span></span><span></span><span></span>
        </div>
        <span class="tool-name wrap-label">Structural Wall Segments</span>
      </button>
      <button class="tool-btn" data-tool="${WallSegmentType.RoomWalls}" title="Muros de Habitación">
        <div class="tool-icon icon-room"><div class="cross-h"></div><div class="cross-v"></div></div>
        <span class="tool-name">Room Walls</span>
      </button>
    </div>
    <div class="toolbar-add">
      <span class="add-label">Añadir</span>
      <button id="add-element-btn" class="add-circle" title="Añadir elemento">+</button>
    </div>
  `

  const toolButtons = container.querySelectorAll<HTMLButtonElement>('.tool-btn')
  toolButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      toolButtons.forEach((b) => b.classList.remove('active'))
      btn.classList.add('active')
      const tool = btn.dataset.tool
      if (tool && tool !== 'figuras') onSelectTool(tool as WallSegmentType)
    })
  })

  container.querySelector('#add-element-btn')?.addEventListener('click', onAddElement)
}

import { Wall } from './Wall'

/**
 * Representa un diseño predeterminado de la galería inferior
 * ("Diseños de Cosas"): un plano 2D en miniatura que, al seleccionarse,
 * se proyecta/carga como conjunto de Wall sobre la cuadrícula principal.
 */
export class ProjectDesign {
  constructor(
    public name: string,
    public walls: Wall[] = []
  ) {}
}

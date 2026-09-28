# ArqStudio 3D — versión Electron / Three.js / TypeScript

Misma arquitectura que la versión WPF (Models / Engine / Services / UI),
portada a TypeScript + Three.js dentro de Electron, para correr en tu
Chromebook con Linux.

## Requisitos en tu Chromebook

1. Activa el **entorno de Linux (Crostini)** si no lo tienes ya:
   Configuración → Avanzada → "Desarrolladores" → "Entorno de desarrollo
   de Linux" → Activar. Esto te da una terminal Debian dentro de ChromeOS.
2. Dentro de esa terminal Linux, instala Node.js 20 LTS (npm incluido).
   La forma más simple:

   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   node --version   # debe mostrar v20.x
   ```

3. Electron necesita algunas librerías de sistema que Crostini no trae por
   defecto. Instálalas una sola vez:

   ```bash
   sudo apt-get update
   sudo apt-get install -y libnss3 libatk-bridge2.0-0 libgtk-3-0 \
     libgbm1 libasound2
   ```

## Instalación del proyecto

1. Copia/descomprime la carpeta `arqstudio3d-electron` dentro de tu
   entorno Linux (por ejemplo en `~/proyectos/arqstudio3d-electron`;
   arrastrar el .zip a la carpeta "Linux files" en el Archivos de ChromeOS
   también funciona).
2. Entra a la carpeta e instala dependencias:

   ```bash
   cd ~/proyectos/arqstudio3d-electron
   npm install
   ```

## Ejecutar en desarrollo

```bash
npm run dev
```

Esto abre la ventana de Electron con hot-reload: los cambios en
`src/renderer` se reflejan al guardar, sin reiniciar la app.

> Si la ventana no se abre y ves un error de sandbox/GPU en la terminal
> (común en Crostini), reintenta con:
> `npm run dev -- --no-sandbox` o exporta `ELECTRON_DISABLE_GPU=1` antes
> de correrlo. Es una limitante conocida de Electron dentro de
> contenedores Linux ligeros como Crostini, no del código del proyecto.

## Generar un ejecutable (AppImage)

```bash
npm run package
```

Genera un `.AppImage` en `dist/` que puedes ejecutar directamente
(`chmod +x` y doble clic desde el gestor de archivos de Linux) sin
necesidad de volver a instalar dependencias.

## Arquitectura (idéntica en espíritu a la versión WPF)

```
src/main/       → Proceso Electron: solo crea la ventana (equivalente a Program.cs)
src/preload/    → Puente seguro main↔renderer (vacío por ahora)
src/renderer/   → La app real:
  models/       → Wall, GridNode, CameraState, ProjectDesign — datos puros
  engine/       → Viewport3DController, GridBuilder, WallMeshBuilder,
                  SceneManager, ViewportRenderer (Three.js)
  services/     → AIChatService — mismo contrato JSON que la versión WPF
  ui/           → LeftToolbar, RightPanel, BottomGallery, OrientationGizmo
                  (DOM + CSS, sin framework, para mantener el paralelismo
                  1:1 con los UserControls de WPF)
```

## Controles de cámara

| Acción         | Gesto                              |
|----------------|--------------------------------------|
| Órbita         | Arrastrar con clic izquierdo         |
| Pan            | Arrastrar con clic derecho           |
| Zoom           | Rueda del ratón / slider inferior    |
| Vista por eje  | Clic en el gizmo (X/Y/Z)             |

## Protocolo del Chat IA

Igual que en la versión WPF: pega o envía un JSON como

```json
{ "action": "add_wall", "wallType": "SimpleWall",
  "start": { "x": 0, "y": 0, "z": 0 }, "end": { "x": 4, "y": 0, "z": 0 } }
```

en el campo de texto del Chat IA para crear una pared vía
`AIChatService.applyJsonCommand`.

## Próximos pasos sugeridos

1. **Picking real**: usar `THREE.Raycaster` sobre `wallMeshes` para
   seleccionar y arrastrar paredes con snapping a `GridNode`.
2. **Animación "correr por la casa"**: implementar una interpolación de
   `CameraState` a lo largo de un recorrido, disparada desde
   `AIChatService` (`run_animation`).
3. **Miniaturas reales** en la galería inferior: renderizar cada
   `ProjectDesign` a una textura offscreen con Three.js en vez de los
   placeholders actuales.
4. **Persistencia**: guardar `SceneManager` a JSON en disco vía el
   proceso `preload`/`main` (usar `contextBridge` para exponerlo de forma
   segura al renderer).

## Nota sobre la orientación de las paredes

`WallMeshBuilder.buildWallMesh` orienta la caja extruida con
`Math.atan2(dz, dx)`; si al probarlo alguna pared aparece rotada 180°,
ajusta el signo de `angle` en `engine/WallMeshBuilder.ts` — es la única
parte de la geometría que conviene verificar visualmente al primer
`npm run dev`.

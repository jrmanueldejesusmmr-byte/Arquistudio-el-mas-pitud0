import { app, BrowserWindow } from 'electron'
import { join } from 'path'

/**
 * Proceso "main" de Electron. Su única responsabilidad es crear la ventana
 * y cargar el renderer (la app de Three.js/TypeScript). Toda la lógica de
 * escena, cámara y UI vive en src/renderer — igual que en la versión WPF,
 * donde MainWindow.xaml.cs es solo "pegamento".
 */
function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    backgroundColor: '#161616',
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  if (process.env['ELECTRON_RENDERER_URL']) {
    // Modo desarrollo: electron-vite sirve el renderer con hot-reload.
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// Puente entre el proceso "main" y el renderer con contextIsolation activo.
// Vacío por ahora: la app no necesita hoy acceso a APIs de Node desde la UI.
// Punto de extensión natural para, por ejemplo, exponer guardado/carga de
// proyectos en disco (fs) de forma segura vía contextBridge.exposeInMainWorld.

const { contextBridge, ipcRenderer, clipboard } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  onTranslate: (cb) => ipcRenderer.on('translate-result', (event, data) => cb(data)),
  copyToClipboard: (text) => ipcRenderer.invoke('copy-text', text),
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  setWindowHeight: (height) => ipcRenderer.invoke('set-window-height', height),
})

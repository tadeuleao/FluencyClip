const { contextBridge, ipcRenderer, clipboard } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  onTranslate: (cb) => ipcRenderer.on('translate-result', (event, data) => cb(data)),
  copyToClipboard: (text) => ipcRenderer.invoke('copy-text', text),
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  setWindowHeight: (height) => ipcRenderer.invoke('set-window-height', height),
  setTypingMode: (enabled) => ipcRenderer.invoke('set-typing-mode', enabled),
  onFocusedText: (cb) => ipcRenderer.on('focused-text', (event, data) => cb(data)),
  onFocusedError: (cb) => ipcRenderer.on('focused-error', (event, message) => cb(message)),
})

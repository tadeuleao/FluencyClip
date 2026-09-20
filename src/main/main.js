const path = require('path')
const { app, BrowserWindow, globalShortcut, clipboard, screen, ipcMain, dialog } = require('electron')
const translator = require('../services/googleTranslator')

let overlayWindow = null
let lastClipboardText = ''

function createOverlayWindow() {
  overlayWindow = new BrowserWindow({
    width: 320,
    height: 240, // Increased height for the new layout
    minWidth: 280,
    minHeight: 180,
    maxHeight: 600,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: false,
    resizable: true,
    show: true,
    icon: path.join(__dirname, '..', '..', 'assets', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  overlayWindow.setAlwaysOnTop(true, 'screen-saver')
  overlayWindow.setVisibleOnAllWorkspaces(true)
  
  overlayWindow.on('closed', () => {
    overlayWindow = null
  })

  overlayWindow.loadFile(path.join(__dirname, '..', 'renderer', 'overlay.html'))
}

async function updateTranslation(text) {
  if (!text || text === lastClipboardText) return
  lastClipboardText = text
  
  try {
    const result = await translator.translate(text)
    if (overlayWindow) {
      overlayWindow.webContents.send('translate-result', result)
    }
  } catch (e) {
    console.error('Translation error', e)
  }
}

function startClipboardMonitor() {
  // Check clipboard every 1 second
  setInterval(async () => {
    const text = clipboard.readText().trim()
    if (text && text !== lastClipboardText) {
      await updateTranslation(text)
    }
  }, 1000)
}

ipcMain.handle('set-window-height', (event, height) => {
  if (overlayWindow) {
    const [currentWidth] = overlayWindow.getSize()
    const nextHeight = Math.min(Math.max(Math.round(height), 180), 600)
    overlayWindow.setSize(currentWidth, nextHeight)
  }
  return true
})

ipcMain.handle('minimize-window', () => {
  if (overlayWindow) overlayWindow.minimize()
  return true
})

ipcMain.handle('copy-text', (event, text) => {
  clipboard.writeText(text)
  return true
})

app.whenReady().then(() => {
  createOverlayWindow()
  startClipboardMonitor()

  console.log('Tradutor pronto e monitorando clipboard...')
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createOverlayWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

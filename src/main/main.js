const path = require('path')
const { app, BrowserWindow, globalShortcut, clipboard, screen, ipcMain, dialog } = require('electron')
const translator = require('../services/googleTranslator')
const { spawn } = require('child_process')
const readline = require('readline')

let overlayWindow = null
let lastClipboardText = ''
let typingMode = false
let translationVersion = 0
let accessibilityProcess = null
let focusedState = ''
let focusedTimer = null

function stopAccessibilityMonitor() {
  clearTimeout(focusedTimer)
  focusedState = ''
  if (accessibilityProcess) accessibilityProcess.kill()
  accessibilityProcess = null
}

function startAccessibilityMonitor() {
  if (process.platform !== 'win32') throw new Error('Disponível apenas no Windows')
  const child = spawn('powershell.exe', ['-NoProfile', '-NonInteractive', '-STA', '-ExecutionPolicy', 'Bypass', '-File', path.join(__dirname, 'focused-text.ps1')], { windowsHide: true })
  accessibilityProcess = child
  const lines = readline.createInterface({ input: child.stdout })
  lines.on('line', line => {
    if (!typingMode || accessibilityProcess !== child) return
    let data
    try { data = JSON.parse(line) } catch { return }
    const text = typeof data.text === 'string' ? data.text.trim() : ''
    const state = data.available && text ? JSON.stringify([data.id, text]) : ''
    if (state === focusedState) return
    focusedState = state
    const version = ++translationVersion
    clearTimeout(focusedTimer)
    overlayWindow?.webContents.send('focused-text', { text: state ? text : '' })
    if (!state) return
    focusedTimer = setTimeout(async () => {
      const result = await translator.translate(text)
      if (typingMode && focusedState === state && version === translationVersion && overlayWindow) {
        overlayWindow.webContents.send('translate-result', result)
      }
    }, 2000)
  })
  child.on('error', () => overlayWindow?.webContents.send('focused-error', 'Não foi possível iniciar a acessibilidade do Windows.'))
  child.on('exit', () => {
    if (accessibilityProcess === child && typingMode) {
      accessibilityProcess = null
      overlayWindow?.webContents.send('focused-error', 'O monitor de acessibilidade foi encerrado.')
    }
  })
}

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
  const version = ++translationVersion
  
  try {
    const result = await translator.translate(text)
    if (overlayWindow && !typingMode && version === translationVersion) {
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
    if (!typingMode && text && text !== lastClipboardText) {
      await updateTranslation(text)
    }
  }, 1000)
}

ipcMain.handle('set-typing-mode', (event, enabled) => {
  if (enabled && process.platform !== 'win32') throw new Error('Disponível apenas no Windows')
  typingMode = enabled === true
  translationVersion++
  if (typingMode) startAccessibilityMonitor()
  else { stopAccessibilityMonitor(); lastClipboardText = '' }
})

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
  stopAccessibilityMonitor()
  globalShortcut.unregisterAll()
})

import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import * as path from 'path'
import * as fs from 'fs'

let mainWindow: BrowserWindow | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (process.env.NODE_ENV === 'development' || process.argv.includes('--dev')) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  app.quit()
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

ipcMain.handle('save-docx', async (_event, data: { buffer: number[]; defaultFileName: string }) => {
  if (!mainWindow) return { success: false, error: 'No window' }

  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: data.defaultFileName,
    filters: [{ name: 'Word 文件', extensions: ['docx'] }],
  })

  if (result.canceled || !result.filePath) {
    return { success: false, error: 'cancelled' }
  }

  try {
    const buffer = Buffer.from(data.buffer)
    fs.writeFileSync(result.filePath, buffer)
    return { success: true, filePath: result.filePath }
  } catch (err) {
    return { success: false, error: String(err) }
  }
})

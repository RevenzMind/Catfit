const { app, BrowserWindow, ipcMain } = require('electron/main')
const path = require('node:path')
const { fork, spawn } = require('child_process')

let win;
let server;

function startServer() {
  return new Promise((resolve) => {
    if (app.isPackaged) {
      const serverPath = path.join(process.resourcesPath, 'standalone/Front/server.js')
      server = fork(serverPath, { cwd: path.join(process.resourcesPath, 'standalone/Front'), env: { ...process.env, PORT: '3000', HOSTNAME: '127.0.0.1' } })
      server.on('message', () => resolve())
      setTimeout(resolve, 2000)
    } else {
      server = spawn('npm', ['run', 'dev'], { cwd: path.join(__dirname, '../Front'), shell: true })
      server.stdout?.on('data', (d) => { if (d.toString().includes('3000')) resolve() })
      setTimeout(resolve, 5000)
    }
  })
}

async function createWindow() {
  await startServer()
  win = new BrowserWindow({
    width: 850,
    height: 550,
    title: 'Roblox Avatar',
    resizable: false,
    darkTheme: true,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  })
  win.loadURL('http://127.0.0.1:3000')
}

ipcMain.on('window-minimize', () => win?.minimize())
ipcMain.on('window-close', () => win?.close())

app.whenReady().then(createWindow)
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow() })
app.on('window-all-closed', () => { server?.kill?.(); if (process.platform !== 'darwin') app.quit() })
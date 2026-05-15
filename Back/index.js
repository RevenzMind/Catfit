const { app, BrowserWindow, ipcMain } = require('electron/main')
const path = require('node:path')
const { fork, spawn } = require('child_process')
const http = require('http')

let win;
let server;

function waitForServer(url, maxAttempts = 60, interval = 500) {
  return new Promise((resolve) => {
    let attempts = 0
    function check() {
      attempts++
      http.get(url, (res) => {
        res.resume()
        resolve()
      }).on('error', () => {
        if (attempts < maxAttempts) {
          setTimeout(check, interval)
        } else {
          console.warn('Server did not become ready in time; loading anyway.')
          resolve()
        }
      })
    }
    check()
  })
}

function startServer() {
  if (app.isPackaged) {
    const serverPath = path.join(process.resourcesPath, 'standalone/Front/server.js')
    server = fork(serverPath, {
      cwd: path.join(process.resourcesPath, 'standalone/Front'),
      env: { ...process.env, PORT: '3000', HOSTNAME: '127.0.0.1' },
      stdio: 'ignore'
    })
  } else {
    server = spawn('npm', ['run', 'dev'], { cwd: path.join(__dirname, '../Front'), shell: true })
  }
}

async function createWindow() {
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

  win.loadFile(path.join(__dirname, 'loading.html'))

  startServer()
  await waitForServer('http://127.0.0.1:3000')

  win.loadURL('http://127.0.0.1:3000')
}

ipcMain.on('window-minimize', () => win?.minimize())
ipcMain.on('window-close', () => win?.close())

app.whenReady().then(createWindow)
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow() })
app.on('window-all-closed', () => { server?.kill?.(); if (process.platform !== 'darwin') app.quit() })
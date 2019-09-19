const remixd = require('remixd')
const path = require('path')
const os = require('os');

const { app, BrowserWindow, dialog } = require('electron')
const { AppManager, registerPackageProtocol } = require('@philipplgh/electron-app-manager')
registerPackageProtocol()


const updater = new AppManager({
  repository: 'https://github.com/ethereum/remix-desktop',
  auto: true,
  electron: true
})

const package = 'package://github.com/ethereum/remix-ide'
// const package = 'http://127.0.0.1:8080'

app.on('ready', () => {
  if (!process.argv[2]) {
    dialog.showOpenDialog(
      { 
        defaultPath: os.homedir(),
        buttonLabel: "Open",
        title: 'Select Working Directory (Default to the Home directory)', 
        properties: ['openDirectory', 'createDirectory', 'promptToCreate'],
        message: 'Working Directory'
      }).
      then((result) => {
        if (result.canceled || result.filePaths.length === 0) {
          remixdInit(os.homedir())
        } else {
          remixdInit(result.filePaths[0])
        }
      }).
      catch((error) => {
        console.log(error)
      })
  } else {
    var folder = process.argv[2]
    remixdInit(folder)
  }

  remixdStart()
  createWindow().loadURL(package)
})

const iconPath = () =>
  path.resolve(
    process.platform === 'win32'
      ? `${__dirname}/build/TrayIcon.ico`
      : `${__dirname}/build/IconTemplate.png`
  )

function createWindow () {
  // Create the browser window.
  return new BrowserWindow({
    width: 1024,
    height: 768,
    icon: iconPath(),
    webPreferences: {
      nodeIntegration: false
    }
  })
}

let remixdStart = () => {
  const remixIdeUrl = 'package://c8ef3f8f1976e3597787fab95b72bf83.mod'
  // const remixIdeUrl = 'http://127.0.0.1:8080'
  var router = new remixd.Router(65520, remixd.services.sharedFolder, { remixIdeUrl }, (webSocket) => {
    remixd.services.sharedFolder.setWebSocket(webSocket)
  })
  router.start()
}

let remixdInit = (folder) => {
  remixd.services.sharedFolder.sharedFolder(folder, false)
  remixd.services.sharedFolder.setupNotifications(folder)
}

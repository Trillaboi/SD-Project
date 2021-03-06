const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const ipc = ipcMain
const core = require("./core")


core.eventSetup()

function delimitInput(input){
  return "||"+input.toString()+"||"
}

function createWindow () {
    const win = new BrowserWindow({
    width: 1200,
    height: 680,
    minWidth: 940,
    minHeight: 560,
    frame: false,
    webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        devTools: true,
        preload: path.join(__dirname, 'preload.js')
    }
})

    // var options = {
    //   mode:'text',
    //   encoding:'utf8',
    //   pythonOptions: ['-u'],
    //   scriptPath: path.join(__dirname, 'python_scripts'),
    // }

    win.loadFile('src/index.html')
    win.setBackgroundColor('#343B48')

    //// CLOSE APP
    ipc.on('minimizeApp', ()=>{
        console.log('Clicked on Minimize Btn')
        win.minimize()
    })

    //// MAXIMIZE RESTORE APP
    ipc.on('maximizeRestoreApp', ()=>{
        if(win.isMaximized()){
            console.log('Clicked on Restore')
            win.restore()
        } else {
            console.log('Clicked on Maximize')
            win.maximize()
        }
    })
    // Check if is Maximized
    win.on('maximize', ()=>{
        win.webContents.send('isMaximized')
    })
    // Check if is Restored
    win.on('unmaximize', ()=>{
        win.webContents.send('isRestored')
    })

    // Start or stop the stream
    ipc.on('playBtn', ()=>{
      // gpc.send('display_on')
      core.startStream()
    })

    ipc.on('zoomINBtn', ()=> {
      core.zoomButton(5)
    })

    ipc.on('zoomOUTBtn', ()=> {
      core.zoomButton(-5)
    })



    ipc.on('resetBtn', ()=> {
      // gpc.send('get_info')
    })

    ipc.on('saveBtn', () =>{
      core.saveLocation()
    })


    // //// CLOSE APP
    // ipc.on('stopStream', ()=>{
    //     console.log('Clicked on Stop Btn')
    // })

    //// CLOSE APP
    ipc.on('closeApp', ()=>{
        console.log('Clicked on Close Btn')
        win.close()
    })

    // child.on('message', function(message) {
    //   console.log('Received message...');
    //   console.log(message);
    //   });


}

app.whenReady().then(() => {
  createWindow()
  process.stdout.on('data', data => {
    console.log(data.toString());
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

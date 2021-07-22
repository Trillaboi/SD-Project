const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const ipc = ipcMain
const {spawn, fork} = require('child_process');
const EventEmitter = require('events');


const gpc = spawn('python3', [path.join(__dirname, 'python_scripts/gpc.py')], {stdio:['ipc','pipe', 'pipe']})
const controller = spawn('python3', [path.join(__dirname, 'python_scripts/controller.py')], {stdio:['ipc','pipe', 'pipe']})
// const pi = spawn('ssh', [`pi@${pi_ipaddress}`, 'python3', '~/Documents/motor.py'], {stdio:['ipc','pipe', 'pipe']})

class MyEmitter extends EventEmitter {}
const buttonEmitter = new MyEmitter();

const commandDict = {
  LEFT_THUMB_X: 0,
  'LEFT_THUMB_-X': 0,
  LEFT_THUMB_Y: 0,
  'LEFT_THUMB_-Y': 0,
  RIGHT_THUMB_X: 0,
  'RIGHT_THUMB_-X': 0,
  RIGHT_THUMB_Y: 'zoom',
  'RIGHT_THUMB_-Y': 'zoom -',
  LEFT_TRIGGER: 0,
  RIGHT_TRIGGER: 0,
  DPAD_UP: 'stream',
  DPAD_DOWN: false,
  DPAD_LEFT: false,
  DPAD_RIGHT: false,
  START: 'record_start',
  BACK: 'record_stop',
  LEFT_THUMB: 'display_on',
  RIGHT_THUMB: 'display_off',
  LEFT_SHOULDER: false,
  RIGHT_SHOULDER: false,
  A: false,
  B: false,
  X: false,
  Y: false
}

var controllerDict = {}
var statusDict = {
  ZOOM:0,
  RIGHT_X_AXIS:0,
  RIGHT_Y_AXIS:0,
  LEFT_X_AXIS:0,
  LEFT_Y_AXIS:0,
}

function adjustRange(analogInput){
  // will move in increments of one since range is set from -1 to 1.
  return Math.floor(32768/analogInput)
}
function eventSetup(){
  controller.on('message', (data) => {
    console.log(data)
  })

  controller.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`)
  })

  controller.stderr.on('data', (data) =>{
      try {
          controllerDict = JSON.parse(data)
          buttonEmitter.emit('input')
      } catch(err){
        console.log(err)
        console.log(`stderr: ${data}`)

    }
      // console.log(controller.connected)
  })

  controller.on('close', (code) => {
    console.log(`controller exited with code ${code}`)
  })

  buttonEmitter.on('input', () => {
    // use the dictionary here and handle if the correepsonding button will control the goPro or the motor
    console.log(controllerDict)
    if(controllerDict != {})
    {
      if(controllerDict["RIGHT_THUMB_Y"] != 0){
          statusDict.ZOOM += adjustRange(controllerDict["RIGHT_THUMB_Y"])
          if(statusDict.ZOOM > 100)
            statusDict.ZOOM = 100
          gpc.send("zoom " + statusDict.ZOOM)
      }
      else if(controllerDict["RIGHT_THUMB_-Y"] != 0){
        statusDict.ZOOM += adjustRange(controllerDict["RIGHT_THUMB_-Y"])
        if(statusDict.ZOOM < 0)
          statusDict.ZOOM = 0
          gpc.send("zoom " + statusDict.ZOOM)
      }
      if(controllerDict["A"] == true)
      {
        console.log("A")
      }
      if(controllerDict["B"] == true)
      {
        console.log("B")
      }
      if(controllerDict["X"] == true)
      {
        console.log("X")
      }
      if(controllerDict["Y"] == true)
      {
        console.log("Y")
      }
      if(controllerDict["START"] == true)
      {
        console.log(commandDict.START)
        gpc.send(commandDict.START)
      }
      if(controllerDict["BACK"] == true)
      {
        gpc.send(commandDict.BACK)
      }
      if(controllerDict["LEFT_THUMB"] == true)
      {
        gpc.send(commandDict.LEFT_THUMB)
      }
      if(controllerDict["RIGHT_THUMB"] == true)
      {
        console.log("RIGHT_THUMB")
      }
      if(controllerDict["DPAD_UP"] == true)
      {
        gpc.send(commandDict.DPAD_UP)
      }
    }

    console.log('button input has been detected')
  })


  gpc.on('message', (data) => {
    console.log(data)
  })

  gpc.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`)
  })

  gpc.stderr.on('data', (data) =>{
      console.error(`stderr: ${data}`)
      // console.log(gpc.connected)
  })

  gpc.on('close', (code) => {
    console.log(`gpc exited with code ${code}`)
  })

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
      gpc.send(commandDict.START)
    })

    ipc.on('speedBtn', ()=> {
      // gpc.send('display_off')
    })


    ipc.on('resetBtn', ()=> {
      // gpc.send('get_info')
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
  eventSetup()
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

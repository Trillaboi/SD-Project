const path = require('path');
const {spawn, fork} = require('child_process');
const EventEmitter = require('events');
var ffmpeg = require('fluent-ffmpeg');

// udp://{gopro.ip_address}:{gopro.udp_port} 10.5.5.9:8554

const pi = spawn('ssh', ['pi@10.5.5.100', 'python3 ~/Documents/motor.py'], {stdio:['ipc','pipe', 'pipe']})
// wait a few seconds for the ssh to connect, not waiting started to cause problems as the program got larger.
const seconds = 5
var waitTill = new Date(new Date().getTime() + seconds * 1000);
while(waitTill > new Date()){}

const gpc = spawn('python3', [path.join(__dirname, 'python_scripts/gpc.py')], {stdio:['ipc','pipe', 'pipe']})
const controller = spawn('python3', [path.join(__dirname, 'python_scripts/controller.py')], {stdio:['ipc','pipe', 'pipe']})

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
  LEFT_X_AXIS:0,
  LEFT_Y_AXIS:0,
}

function delimitInput(input){
  return "||"+input.toString()+"||"
}

function startStream()
{
  gpc.send(delimitInput(commandDict.DPAD_UP))
  // var waitTill = new Date(new Date().getTime() + seconds * 1000);
  // while(waitTill > new Date()){}
  var ffplay = spawn('ffplay', ['-loglevel', 'panic', '-fflags', 'nobuffer', '-f:v', 'mpegts', '-probesize', '8192', '-window_title', 'PTZ Camera', 'udp://10.5.5.100:8554'])
  // ffplay.on('message', (data) => {
  //   console.log(data)
  //   console.log("here")
  // })

  ffplay.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`)
  })

  ffplay.stderr.on('data', (data) =>{
      console.error(`stderr: ${data}`)
      // console.log(gpc.connected)
  })

  ffplay.on('close', (code) => {
    console.log(`gpc exited with code ${code}`)
  })
}

function zoomButton(zoom){
  statusDict.ZOOM+=zoom
  if(statusDict.ZOOM > 100)
  {
    statusDict.ZOOM = 100
  }
  else if(statusDict.ZOOM < 0){
    statusDict.ZOOM = 0
  }
  gpc.send(delimitInput("zoom " + statusDict.ZOOM))
}

function adjustRange(analogInput){
  // will move in increments of one since range is set from -1 to 1.
  return Math.floor(32768/analogInput)
}

function PTRange(analogInput){
  // will move in increments of one since range is set from -1 to 1.
  return Math.ceil(1/(3276.8/analogInput))
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

  pi.on('message', (data) => {
    console.log(data)
  })

  pi.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`)
  })

  pi.stderr.on('data', (data) =>{
      console.error(`stderr: ${data}`)
  })

  pi.on('close', (code) => {
    console.log(`pi exited with code ${code}`)
  })


  buttonEmitter.on('input', () => {
    // use the dictionary here and handle if the correepsonding button will control the goPro or the motor
    // console.log(controllerDict)
    if(controllerDict != {})
    {
      if(controllerDict["RIGHT_THUMB_Y"] != 0){
          statusDict.ZOOM += adjustRange(controllerDict["RIGHT_THUMB_Y"])
          if(statusDict.ZOOM > 100)
            statusDict.ZOOM = 100
          gpc.send(delimitInput("zoom " + statusDict.ZOOM))
      }
      else if(controllerDict["RIGHT_THUMB_-Y"] != 0){
        statusDict.ZOOM += adjustRange(controllerDict["RIGHT_THUMB_-Y"])
        if(statusDict.ZOOM < 0)
          statusDict.ZOOM = 0
          gpc.send(delimitInput("zoom " + statusDict.ZOOM))
      }

      if(controllerDict["LEFT_THUMB_Y"] != 0){

          statusDict.LEFT_Y_AXIS +=  PTRange(controllerDict["LEFT_THUMB_Y"])
           if(statusDict.LEFT_Y_AXIS > 146)
            statusDict.LEFT_Y_AXIS = 146
            setTimeout(function (loc){
                  pi.send(delimitInput('move_one '+loc))
                  console.log("thumb up: "+loc)
            }, 10, statusDict.LEFT_Y_AXIS)
      }else if(controllerDict["LEFT_THUMB_-Y"] != 0){
        statusDict.LEFT_Y_AXIS +=  PTRange(controllerDict["LEFT_THUMB_-Y"])
        if(statusDict.LEFT_Y_AXIS < -55)
          statusDict.LEFT_Y_AXIS = -55
          setTimeout(function (loc){
                pi.send(delimitInput('move_one '+loc))
                console.log("thumb down: "+loc)
          }, 10, statusDict.LEFT_Y_AXIS)
      }

      if(controllerDict["LEFT_THUMB_X"] != 0 ){
          statusDict.LEFT_X_AXIS +=  PTRange(controllerDict["LEFT_THUMB_X"])
          if(statusDict.LEFT_X_AXIS > 275)
            statusDict.LEFT_X_AXIS = 275

          setTimeout(function (loc){
                pi.send(delimitInput('move_two '+loc))
                console.log("thumb right: "+loc)
          }, 10, statusDict.LEFT_X_AXIS)


      }else if(controllerDict["LEFT_THUMB_-X"] != 0){
        statusDict.LEFT_X_AXIS +=  PTRange(controllerDict["LEFT_THUMB_-X"])
        if(statusDict.LEFT_X_AXIS < -55)
          statusDict.LEFT_X_AXIS = -55

          setTimeout(function (loc){
                pi.send(delimitInput('move_two '+loc))
                console.log("thumb left: "+loc)
          }, 10, statusDict.LEFT_X_AXIS)
      }
      if(controllerDict["A"] == true)
      {
        pi.send("Hello A")
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
        gpc.send(delimitInput(commandDict.START))
      }
      if(controllerDict["BACK"] == true)
      {
        gpc.send(delimitInput(commandDict.BACK))
      }
      if(controllerDict["LEFT_THUMB"] == true)
      {
        gpc.send(delimitInput(commandDict.LEFT_THUMB))
      }
      if(controllerDict["RIGHT_THUMB"] == true)
      {
        gpc.send(delimitInput(commandDict.RIGHT_THUMB))
      }
      if(controllerDict["DPAD_UP"] == true)
      {
        startStream()

      }
    }
    // console.log('button input has been detected')
  })

}

module.exports = { eventSetup, startStream, zoomButton};
//eventSetup()

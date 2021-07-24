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

function adjustRange(analogInput){
  // will move in increments of one since range is set from -1 to 1.
  return Math.floor(32768/analogInput)
}

function PTRange(analogInput){
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
          if(statusDict.LEFT_Y_AXIS > 235)
            statusDict.LEFT_Y_AXIS = 235
          var outputx = delimitInput("move_one "+statusDict.LEFT_Y_AXIS)
          pi.send(outputx)
      }else if(controllerDict["LEFT_THUMB_-Y"] != 0){
        statusDict.LEFT_Y_AXIS +=  PTRange(controllerDict["LEFT_THUMB_-Y"])
        if(statusDict.LEFT_Y_AXIS < -55)
          statusDict.LEFT_Y_AXIS = -55
        var outputy = delimitInput('move_one '+statusDict.LEFT_Y_AXIS)
        pi.send(outputy)
      }

      if(controllerDict["LEFT_THUMB_X"] != 0){
          statusDict.LEFT_X_AXIS +=  PTRange(controllerDict["LEFT_THUMB_X"])
          if(statusDict.LEFT_X_AXIS > 145)
            statusDict.LEFT_X_AXIS = 145
          pi.send(delimitInput('move_two '+statusDict.LEFT_X_AXIS))

      }else if(controllerDict["LEFT_THUMB_-X"] != 0){
        statusDict.LEFT_X_AXIS +=  PTRange(controllerDict["LEFT_THUMB_-X"])
        if(statusDict.LEFT_X_AXIS < -55)
          statusDict.LEFT_X_AXIS = -55

        pi.send(delimitInput("move_two "+statusDict.LEFT_X_AXIS))
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
        gpc.send(commandDict.RIGHT_THUMB)
      }
      if(controllerDict["DPAD_UP"] == true)
      {
        gpc.send(commandDict.DPAD_UP)
        var command = ffmpeg('udp://@10.5.5.100:8554')
        // set video bitrate
          .videoBitrate(1024)
          // set h264 preset
          .addOption('-preset','superfast')
          // set target codec
          .videoCodec('libx264')
          // set audio bitrate
          .audioBitrate('128k')
          // set audio codec
          .audioCodec('aac')
          // set number of audio channels
          .audioChannels(2)
          // set hls segments time
          .addOption('-hls_time', 10)
          // include all the segments in the list
          .addOption('-hls_list_size',0)
          // setup event handlers
          .on('end', function() {
            console.log('file has been converted succesfully');
          })
          .on('error', function(err) {
            console.log('an error happened: ' + err.message);
          })
          // save to file
          .save(path.join(__dirname, 'src/videos/stream.m3u8'));

        }
    }
    // console.log('button input has been detected')
  })

}

module.exports = { eventSetup };
//eventSetup()

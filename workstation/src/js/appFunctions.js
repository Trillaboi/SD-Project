const { ipcRenderer, desktopCapturer } = require('electron')
// const { Menu } = remote;
const maxResBtn = document.getElementById('maxResBtn')
const mySidebar = document.getElementById('mySidebar')

// const videoElement = document.querySelector('video')
const startBtn = document.getElementById('startBtn')
const speedBtn = document.getElementById('speedBtn')
const resetBtn = document.getElementById('resetBtn')
// const videoSelectBtn = document.getElementById('videoSelectBtn')
// videoSelectBtn.onclick = getVideoSources


const ipc = ipcRenderer
var isLeftMenuActive = true


// async function getVideoSources() {
//   const inputSources = await desktopCapturer.getSources({
//     types: ['window', 'screen']
//   });
//
//   const videoOptionsMenu = Menu.buildFromTemplate(
//     inputSources.map(source => {
//       return {
//         label: source.name,
//         click: () => selectSource(source)
//       };
//     })
//   );
//
//   vidfeoOptionsMenu.popup()
// }

//// MINIMIZE APP
minimizeBtn.addEventListener('click', ()=>{
    ipc.send('minimizeApp')
})

//// MAXIMIZE RESTORE APP
function changeMaxResBtn(isMaximizedApp){
    if(isMaximizedApp){
        maxResBtn.title = 'Restore'
        maxResBtn.classList.remove('maximizeBtn')
        maxResBtn.classList.add('restoreBtn')
    } else {
        maxResBtn.title = 'Maximize'
        maxResBtn.classList.remove('restoreBtn')
        maxResBtn.classList.add('maximizeBtn')
    }
}
maxResBtn.addEventListener('click', ()=>{
    ipc.send('maximizeRestoreApp')
})
ipc.on('isMaximized', ()=> { changeMaxResBtn(true) })
ipc.on('isRestored', ()=> { changeMaxResBtn(false) })

playBtn.addEventListener('click', ()=>{
    ipc.send('playBtn')
})

speedBtn.addEventListener('click', ()=>{
    ipc.send('speedBtn')
})

resetBtn.addEventListener('click', ()=>{
    ipc.send('resetBtn')
})


//// CLOSE APP
closeBtn.addEventListener('click', ()=>{
    ipc.send('closeApp')
})

//// TOGGLE MENU
// Expand and Retract
showHideMenus.addEventListener('click', ()=>{
    if(isLeftMenuActive){
        mySidebar.style.width = '0px'
        mySidebar.style.display = 'none'
        isLeftMenuActive = false
    } else {
        mySidebar.style.width = '280px'
        mySidebar.style.display = 'block'
        isLeftMenuActive = true
    }
})

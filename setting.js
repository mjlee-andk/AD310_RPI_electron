const { BrowserWindow, ipcRenderer } = require('electron')
const remote = require('electron').remote;

const settingOkButton = document.getElementById("settingOk");

settingOkButton.addEventListener('click', function(){
  var window = remote.getCurrentWindow();
  window.close();
})

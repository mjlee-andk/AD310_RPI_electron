const { BrowserWindow, ipcRenderer } = require('electron')
const remote = require('electron').remote;

class uartFlag{
  constructor(port, baudrate, databits, parity, stopbits, terminator) {
    this.port = port;
    this.baudrate = baudrate;
    this.databits = databits;
    this.parity = parity;
    this.stopbits = stopbits;
    this.terminator = terminator;
  }
}

const settingOkButton = document.getElementById("settingOk");
settingOkButton.addEventListener('click', function(){
  tmpfunc();
})

const closeSettingWindowButton = document.getElementById("closeSettingWindow");
closeSettingWindowButton.addEventListener('click', function(){
  var window = remote.getCurrentWindow();
  window.close();
  ipcRenderer.send('set_stream_mode', 'ok');
})

const baudrateSelect = document.getElementById("baudrateSelect");
const dataBitsRadios1 = document.getElementById("dataBitsRadios1");
const dataBitsRadios2 = document.getElementById("dataBitsRadios2");
const parityRadios1 = document.getElementById("parityRadios1");
const parityRadios2 = document.getElementById("parityRadios2");
const parityRadios3 = document.getElementById("parityRadios3");
const stopbitsRadios1 = document.getElementById("stopbitsRadios1");
const stopbitsRadios2 = document.getElementById("stopbitsRadios2");
const terminatorRadios1 = document.getElementById("terminatorRadios1");
const terminatorRadios2 = document.getElementById("terminatorRadios2");

ipcRenderer.on('get_basic_setting_data', (event, data) => {
  console.log('get_basic_setting_data');

  baudrateSelect.value = data.baudrate;
  if(data.databits == 7) {
    dataBitsRadios1.checked = true;
  }
  else if(data.databits == 8) {
    dataBitsRadios2.checked = true;
  }
  if(data.parity == 0) {
    parityRadios1.checked = true;
  }
  else if(data.parity == 1) {
    parityRadios2.checked = true;
  }
  else if(data.parity == 2) {
    parityRadios3.checked = true;
  }
  if(data.stopbits == 1) {
    stopbitsRadios1.checked = true;
  }
  else if(data.stopbits == 2) {
    stopbitsRadios2.checked = true;
  }
  if(data.terminator == 1) {
    terminatorRadios1.checked = true;
  }
  else if(data.terminator == 2) {
    terminatorRadios2.checked = true;
  }
});

ipcRenderer.on('set_basic_setting_data', (event, arg) => {
  var window = remote.getCurrentWindow();
  console.log('set basic setting ' + arg );
  window.close();
  return;
})
// 기본 설정에서 선택된 값들 가져오기
var tmpfunc = function() {
  var basicSettingNow = new uartFlag();

  basicSettingNow.baudrate = baudrateSelect.options[baudrateSelect.selectedIndex].value;

  if(dataBitsRadios1.checked) {
    basicSettingNow.databits = dataBitsRadios1.value;
  }
  else if(dataBitsRadios2.checked) {
    basicSettingNow.databits = dataBitsRadios2.value;
  }

  if(parityRadios1.checked) {
    basicSettingNow.parity = parityRadios1.value;
  }
  else if(parityRadios2.checked) {
    basicSettingNow.parity = parityRadios2.value;
  }
  else if(parityRadios3.checked) {
    basicSettingNow.parity = parityRadios3.value;
  }

  if(stopbitsRadios1.checked) {
    basicSettingNow.stopbits = stopbitsRadios1.value;
  }
  else if(stopbitsRadios2.checked) {
    basicSettingNow.stopbits = stopbitsRadios2.value;
  }

  if(terminatorRadios1.checked) {
    basicSettingNow.terminator = terminatorRadios1.value;
  }
  else if(terminatorRadios2.checked) {
    basicSettingNow.terminator = terminatorRadios2.value;
  }

  ipcRenderer.send('set_basic_setting_data', basicSettingNow);
  return;
}

// ipcRenderer.send('get_basic_setting_data', 'ok');

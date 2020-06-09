const { BrowserWindow, ipcRenderer } = require('electron')
const remote = require('electron').remote;

const Store = require('electron-store');

const CONSTANT = require('./constant');

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

const pcConfigOkButton = document.getElementById("pcConfigOk");
pcConfigOkButton.addEventListener('click', function(){
  setPcConfig();

  var window = remote.getCurrentWindow();
  window.close();
})

const closePCConfigWindowButton = document.getElementById("closePCConfigWindow");
closePCConfigWindowButton.addEventListener('click', function(){
  var window = remote.getCurrentWindow();
  window.close();
})

const portSelect = document.getElementById("portSelect");
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

// PC설정 화면 시작시 데이터 받아오기
ipcRenderer.on('get_pc_config_data', (event, data) => {
  console.log('get_pc_config_data');

  portSelect.value = data.port;
  baudrateSelect.value = data.baudrate;
  if(data.databits == 7) {
    dataBitsRadios1.checked = true;
  }
  else if(data.databits == 8) {
    dataBitsRadios2.checked = true;
  }
  if(data.parity == CONSTANT.PARITY_NONE) {
    parityRadios1.checked = true;
  }
  else if(data.parity == CONSTANT.PARITY_ODD) {
    parityRadios2.checked = true;
  }
  else if(data.parity == CONSTANT.PARITY_EVEN) {
    parityRadios3.checked = true;
  }
  if(data.stopbits == 1) {
    stopbitsRadios1.checked = true;
  }
  else if(data.stopbits == 2) {
    stopbitsRadios2.checked = true;
  }
  if(data.terminator == CONSTANT.CRLF) {
    terminatorRadios1.checked = true;
  }
  else if(data.terminator == CONSTANT.CR) {
    terminatorRadios2.checked = true;
  }
});

// Port 리스트 받아오기
ipcRenderer.on('port_list', (event, data) => {
  console.log('port_list');
  data.forEach(function(item, index, array){
    var objOption = document.createElement("option");
    objOption.text = item.path;
    objOption.value = item.path;

    portSelect.options.add(objOption);
  })
});

// pc config에서 설정한 값들 보내기
var setPcConfig = function() {
  var pcConfigNow = new uartFlag('COM1', 24, 8, CONSTANT.PARITY_NONE, 1, CONSTANT.CRLF);

  pcConfigNow.port = portSelect.options[portSelect.selectedIndex].value;
  pcConfigNow.baudrate = baudrateSelect.options[baudrateSelect.selectedIndex].value;

  if(dataBitsRadios1.checked) {
    pcConfigNow.databits = dataBitsRadios1.value;
  }
  else if(dataBitsRadios2.checked) {
    pcConfigNow.databits = dataBitsRadios2.value;
  }

  if(parityRadios1.checked) {
    pcConfigNow.parity = parityRadios1.value;
  }
  else if(parityRadios2.checked) {
    pcConfigNow.parity = parityRadios2.value;
  }
  else if(parityRadios3.checked) {
    pcConfigNow.parity = parityRadios3.value;
  }

  if(stopbitsRadios1.checked) {
    pcConfigNow.stopbits = stopbitsRadios1.value;
  }
  else if(stopbitsRadios2.checked) {
    pcConfigNow.stopbits = stopbitsRadios2.value;
  }

  if(terminatorRadios1.checked) {
    pcConfigNow.terminator = terminatorRadios1.value;
  }
  else if(terminatorRadios2.checked) {
    pcConfigNow.terminator = terminatorRadios2.value;
  }

  const localStorage = new Store();

  localStorage.set('pc_config.port', pcConfigNow.port);
  localStorage.set('pc_config.baudrate', pcConfigNow.baudrate);
  localStorage.set('pc_config.databits', pcConfigNow.databits);
  localStorage.set('pc_config.parity', pcConfigNow.parity);
  localStorage.set('pc_config.stopbits', pcConfigNow.stopbits);
  localStorage.set('pc_config.terminator', pcConfigNow.terminator);

  ipcRenderer.send('set_pc_config_data', pcConfigNow);
  return;
}

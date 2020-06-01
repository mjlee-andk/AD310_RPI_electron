const { BrowserWindow, ipcRenderer } = require('electron')
const remote = require('electron').remote;

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

const pcSettingOkButton = document.getElementById("pcSettingOk");
pcSettingOkButton.addEventListener('click', function(){
  tmpfunc();

  var window = remote.getCurrentWindow();
  window.close();
})

const closePCSettingWindowButton = document.getElementById("closePCSettingWindow");
closePCSettingWindowButton.addEventListener('click', function(){
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
ipcRenderer.on('get_pc_setting_data', (event, data) => {
  console.log('get_pc_setting_data');
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

// pc setting에서 설정한 값들 보내기
var tmpfunc = function() {
  var pcSettingNow = new uartFlag('COM1', 24, 7, CONSTANT.PARITY_EVEN, 1, CONSTANT.CRLF);

  pcSettingNow.port = portSelect.options[portSelect.selectedIndex].value;
  pcSettingNow.baudrate = baudrateSelect.options[baudrateSelect.selectedIndex].value;

  if(dataBitsRadios1.checked) {
    pcSettingNow.databits = dataBitsRadios1.value;
  }
  else if(dataBitsRadios2.checked) {
    pcSettingNow.databits = dataBitsRadios2.value;
  }

  if(parityRadios1.checked) {
    pcSettingNow.parity = parityRadios1.value;
  }
  else if(parityRadios2.checked) {
    pcSettingNow.parity = parityRadios2.value;
  }
  else if(parityRadios3.checked) {
    pcSettingNow.parity = parityRadios3.value;
  }

  if(stopbitsRadios1.checked) {
    pcSettingNow.stopbits = stopbitsRadios1.value;
  }
  else if(stopbitsRadios2.checked) {
    pcSettingNow.stopbits = stopbitsRadios2.value;
  }

  if(terminatorRadios1.checked) {
    pcSettingNow.terminator = terminatorRadios1.value;
  }
  else if(terminatorRadios2.checked) {
    pcSettingNow.terminator = terminatorRadios2.value;
  }

  ipcRenderer.send('set_pc_setting_data', pcSettingNow);
  return;
}

// PC 설정 변경 후 설정값 보내기

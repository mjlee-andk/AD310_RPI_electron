const { BrowserWindow, ipcRenderer } = require('electron')
const remote = require('electron').remote;

class pcSettingFlag{
  constructor() {
    this.port = 'COM1';
    this.baudrate = 2400;
    this.databits = 7;
    this.parity = 'even';
    this.stopbits = 1;
    this.terminator = '\r\n';
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

// PC 설정창 시작시 PC 설정값 받아오기
ipcRenderer.on('pc_setting_data', (event, data) => {
  console.log('pc_setting_data');
});

// Port 리스트 받아오기
const portSelect = document.getElementById("portSelect");
ipcRenderer.on('port_list', (event, data) => {
  console.log('port_list');
  data.forEach(function(item, index, array){
    var objOption = document.createElement("option");
    objOption.text = item.path;
    objOption.value = item.path;

    portSelect.options.add(objOption);
  })
});

// pc setting에서 선택된 값들 가져오기
var tmpfunc = function() {
  var pcSettingNow = new pcSettingFlag();

  const portSelect = document.getElementById("portSelect");
  pcSettingNow.port = portSelect.options[portSelect.selectedIndex].value;

  const baudrateSelect = document.getElementById("baudrateSelect");
  pcSettingNow.baudrate = baudrateSelect.options[baudrateSelect.selectedIndex].value;

  const dataBitsRadios1 = document.getElementById("dataBitsRadios1");
  const dataBitsRadios2 = document.getElementById("dataBitsRadios2");

  if(dataBitsRadios1.checked) {
    pcSettingNow.databits = dataBitsRadios1.value;
  }
  else if(dataBitsRadios2.checked) {
    pcSettingNow.databits = dataBitsRadios2.value;
  }

  const parityRadios1 = document.getElementById("parityRadios1");
  const parityRadios2 = document.getElementById("parityRadios2");
  const parityRadios3 = document.getElementById("parityRadios3");

  if(parityRadios1.checked) {
    pcSettingNow.parity = parityRadios1.value;
  }
  else if(parityRadios2.checked) {
    pcSettingNow.parity = parityRadios2.value;
  }
  else if(parityRadios3.checked) {
    pcSettingNow.parity = parityRadios3.value;
  }

  const stopbitsRadios1 = document.getElementById("stopbitsRadios1");
  const stopbitsRadios2 = document.getElementById("stopbitsRadios2");

  if(stopbitsRadios1.checked) {
    pcSettingNow.stopbits = stopbitsRadios1.value;
  }
  else if(stopbitsRadios2.checked) {
    pcSettingNow.stopbits = stopbitsRadios2.value;
  }

  const terminatorRadios1 = document.getElementById("terminatorRadios1");
  const terminatorRadios2 = document.getElementById("terminatorRadios2");

  if(terminatorRadios1.checked) {
    pcSettingNow.terminator = terminatorRadios1.value;
  }
  else if(terminatorRadios2.checked) {
    pcSettingNow.terminator = terminatorRadios2.value;
  }

  ipcRenderer.send('pc_setting_data', pcSettingNow);
  return;
}

// PC 설정 변경 후 설정값 보내기

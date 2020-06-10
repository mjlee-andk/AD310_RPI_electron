const { ipcRenderer } = require('electron')
const remote = require('electron').remote;
const { FIVE_HUNDRED_MS } = require('../util/constant');
const { uartFlag } = require('../util/flag');


// 통신 설정
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


ipcRenderer.on('get_serial_config_data', (event, data) => {
  console.log('get_serial_config_data');
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

ipcRenderer.on('set_serial_config_data', (event, arg) => {
  console.log('set serial config ' + arg );

  setTimeout(function(){
    ipcRenderer.send('set_stream_mode', 'ok');
    var window = remote.getCurrentWindow();
    window.close();
  }, FIVE_HUNDRED_MS);
});

const setSerialConfigData = function() {
  var serialConfigNow = new uartFlag();

  serialConfigNow.baudrate = baudrateSelect.options[baudrateSelect.selectedIndex].value;

  if(dataBitsRadios1.checked) {
    serialConfigNow.databits = dataBitsRadios1.value;
  }
  else if(dataBitsRadios2.checked) {
    serialConfigNow.databits = dataBitsRadios2.value;
  }

  if(parityRadios1.checked) {
    serialConfigNow.parity = parityRadios1.value;
  }
  else if(parityRadios2.checked) {
    serialConfigNow.parity = parityRadios2.value;
  }
  else if(parityRadios3.checked) {
    serialConfigNow.parity = parityRadios3.value;
  }

  if(stopbitsRadios1.checked) {
    serialConfigNow.stopbits = stopbitsRadios1.value;
  }
  else if(stopbitsRadios2.checked) {
    serialConfigNow.stopbits = stopbitsRadios2.value;
  }

  if(terminatorRadios1.checked) {
    serialConfigNow.terminator = terminatorRadios1.value;
  }
  else if(terminatorRadios2.checked) {
    serialConfigNow.terminator = terminatorRadios2.value;
  }

  ipcRenderer.send('set_serial_config_data', serialConfigNow);
  return;
};

module.exports = {
  setSerialConfigData: setSerialConfigData
}

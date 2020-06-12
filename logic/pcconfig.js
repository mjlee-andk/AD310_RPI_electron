const { ipcRenderer } = require('electron')
const { uartFlag } = require('../util/flag');
const { PARITY_NONE, PARITY_ODD, PARITY_EVEN, CRLF, CR } = require('../util/constant');

const pcConfigOkButton = document.getElementById("pcConfigOkButton");
const pCConfigCloseButton = document.getElementById("pCConfigCloseButton");

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

pcConfigOkButton.addEventListener('click', function() {
  setTimeout(function(){
    pcConfigOkButton.blur();
  }, 200)
  pcConfigSetData();
  closeWindow();
})

pCConfigCloseButton.addEventListener('click', function() {
  setTimeout(function(){
    pCConfigCloseButton.blur();
  }, 200)
  closeWindow();
})

// PC설정 화면 시작시 데이터 받아오기
ipcRenderer.on('pc_config_get_data', (event, data) => {
  console.log('pc_config_get_data');

  portSelect.value = data.port;
  baudrateSelect.value = data.baudrate;

  dataBitsRadios1.checked = (data.databits == 7);
  dataBitsRadios2.checked = (data.databits == 8);

  parityRadios1.checked = (data.parity == PARITY_NONE);
  parityRadios2.checked = (data.parity == PARITY_ODD);
  parityRadios3.checked = (data.parity == PARITY_EVEN);

  stopbitsRadios1.checked = (data.stopbits == 1);
  stopbitsRadios2.checked = (data.stopbits == 2);

  terminatorRadios1.checked = (data.terminator == CRLF);
  terminatorRadios2.checked = (data.terminator == CR);
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

// 기기 설정 페이지에서 입력 받은 데이터로 설정하기
const pcConfigSetData = function() {
  var pcConfigNow = new uartFlag('COM1', 24, 8, PARITY_NONE, 1, CRLF);

  pcConfigNow.port = portSelect.options[portSelect.selectedIndex].value;
  pcConfigNow.baudrate = baudrateSelect.options[baudrateSelect.selectedIndex].value;

  pcConfigNow.port = portSelect.options[portSelect.selectedIndex].value;
  pcConfigNow.baudrate = baudrateSelect.options[baudrateSelect.selectedIndex].value;

  pcConfigNow.databits = dataBitsRadios1.checked ? dataBitsRadios1.value : dataBitsRadios2.value;
  pcConfigNow.parity = parityRadios1.checked ? parityRadios1.value : (parityRadios2.checked ? parityRadios2.value : parityRadios3.value);
  pcConfigNow.stopbits = stopbitsRadios1.checked ? stopbitsRadios1.value : stopbitsRadios2.value;
  pcConfigNow.terminator = terminatorRadios1.checked ? terminatorRadios1.value : terminatorRadios2.value;

  ipcRenderer.send('pc_config_set_data', pcConfigNow);
  return;
}

const closeWindow = function() {
  ipcRenderer.send('window_close', 'pc_config');
}

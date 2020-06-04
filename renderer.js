const { BrowserWindow, ipcRenderer } = require('electron')
const remote = require('electron').remote;

// 메인 화면 상단 버튼
const closeMainWindowButton = document.getElementById("closeMainWindow");
const openPCConfigWindowButton = document.getElementById("openPCConfigWindow");
const openConfigWindowButton = document.getElementById("openConfigWindow");

closeMainWindowButton.addEventListener('click', function(){
  ipcRenderer.send('set_stream_mode', 'ok');
  var window = remote.getCurrentWindow();
  window.close();
})

openPCConfigWindowButton.addEventListener('click', function(){
  console.log('openPCConfigWindowButton');
  ipcRenderer.send('open_pc_config_window', 'ok');
})

openConfigWindowButton.addEventListener('click', function(){
  console.log('openConfigWindowButton');
  ipcRenderer.send('open_config_window', 'ok');
})



ipcRenderer.on('rx_data', (event, data) => {
  document.getElementById("displayMsg").innerHTML = data.displayMsg;

  // 단위 표시
  const unitTag = document.getElementById("unit");
  if(data.unit == 1) {
    unitTag.innerHTML = 'g';
  }
  else if(data.unit == 2) {
    unitTag.innerHTML = 'kg';
  }
  else if(data.unit == 3) {
    unitTag.innerHTML = 't';
  }
  else {
    unitTag.innerHTML = '';
  }

  // 라벨 표시
  const labelStableClass = document.getElementById("labelStable");
  const labelHoldClass = document.getElementById("labelHold");
  const labelZeroClass = document.getElementById("labelZero");
  const labelNetClass = document.getElementById("labelNet");

  if(data.isStable) {
    labelStableClass.style.color = 'red';
  }
  else {
    // labelStableClass.remove('badge-success');
    // labelStableClass.add('badge-secondary');
    labelStableClass.style.color = 'black';
  }

  if(data.isHold) {
    labelHoldClass.style.color = 'red';
    // labelHoldClass.add('badge-success');
  }
  else {
    labelHoldClass.style.color = 'black';
    // labelHoldClass.add('badge-secondary');
  }

  if(data.isZero) {
    // labelZeroClass.remove('badge-secondary');
    labelZeroClass.style.color = 'red';
  }
  else {
    // labelZeroClass.remove('badge-success');
    labelZeroClass.style.color = 'black';
  }

  if(data.isNet) {
    // labelNetClass.remove('badge-secondary');
    labelNetClass.style.color = 'red';
  }
  else {
    // labelNetClass.remove('badge-success');
    labelNetClass.style.color = 'black';
  }
})


const setClearTareButton = document.getElementById("setClearTare");
const setZeroTareButton = document.getElementById("setZeroTare");
const setGrossNetButton = document.getElementById("setGrossNet");
const setHoldButton = document.getElementById("setHold");
const printButton = document.getElementById("print");
const onOffButton = document.getElementById("onOff");

ipcRenderer.on('on_off', (event, message) => {
  onOffButton.innerHTML = message

  // 프로그램 OFF 상태
  if(message == 'ON') {
    setClearTareButton.disabled = true;
    setZeroTareButton.disabled = true;
    setGrossNetButton.disabled = true;
    setHoldButton.disabled = true;
    printButton.disabled = true;
    openPCConfigWindowButton.disabled = false;
    openConfigWindowButton.disabled = true;
  }
  // 프로그램 ON 상태
  else {
    setClearTareButton.disabled = false;
    setZeroTareButton.disabled = false;
    setGrossNetButton.disabled = false;
    setHoldButton.disabled = false;
    printButton.disabled = false;
    openPCConfigWindowButton.disabled = true;
    openConfigWindowButton.disabled = false;
  }
});


ipcRenderer.on('print', (event, data) => {

});


setClearTareButton.addEventListener('click', function(){
  ipcRenderer.send('set_clear_tare', 'ok');
})

setZeroTareButton.addEventListener('click', function(){
  ipcRenderer.send('set_zero_tare', 'ok');
})

setGrossNetButton.addEventListener('click', function(){
  ipcRenderer.send('set_gross_net', 'ok');
})

setHoldButton.addEventListener('click', function(){
  ipcRenderer.send('set_hold', 'ok');
})

printButton.addEventListener('click', function(){
  ipcRenderer.send('print', 'ok');
})

onOffButton.addEventListener('click', function(){
  ipcRenderer.send('on_off', 'ok');
})

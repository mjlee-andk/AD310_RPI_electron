const { ipcRenderer } = require('electron')
const remote = require('electron').remote;

// 메인 화면 상단 버튼
const openPCConfigWindowButton = document.getElementById("openPCConfigWindow");
const openConfigWindowButton = document.getElementById("openConfigWindow");
const openInfoWindowButton = document.getElementById("openInfoWindow");
const closeMainWindowButton = document.getElementById("closeMainWindow");
// 계량값 표시부
const displayMsg = document.getElementById("displayMsg");
const unitTag = document.getElementById("unit");
// 라벨 표시
const labelStableClass = document.getElementById("labelStable");
const labelHoldClass = document.getElementById("labelHold");
const labelZeroClass = document.getElementById("labelZero");
const labelNetClass = document.getElementById("labelNet");

// 메인 동작 관련 커맨드 버튼
const setClearTareButton = document.getElementById("setClearTare");
const setZeroTareButton = document.getElementById("setZeroTare");
const setGrossNetButton = document.getElementById("setGrossNet");
const setHoldButton = document.getElementById("setHold");
const printButton = document.getElementById("print");
const onOffButton = document.getElementById("onOff");

openPCConfigWindowButton.addEventListener('click', function(){
  console.log('openPCConfigWindowButton');
  setTimeout(function(){
    openPCConfigWindowButton.blur();
  }, 200)
  ipcRenderer.send('open_pc_config_window', 'ok');
})

openConfigWindowButton.addEventListener('click', function(){
  console.log('openConfigWindowButton');
  setTimeout(function(){
    openConfigWindowButton.blur();
  }, 200)
  ipcRenderer.send('open_config_window', 'ok');
})

openInfoWindowButton.addEventListener('click', function(){
  setTimeout(function(){
    openInfoWindowButton.blur();
  }, 200)
  // TODO 다이얼로그 삭제 후 remote 없앨것
  remote.dialog.showMessageBox({type: 'info', title: '정보', message: '준비중입니다.'});
  return;
  console.log('openInfoWindowButton');
  setTimeout(function(){
    openInfoWindowButton.blur();
  }, 200)
  ipcRenderer.send('open_info_window', 'ok');
})

closeMainWindowButton.addEventListener('click', function(){
  console.log('closeMainWindowButton');

  setTimeout(function(){
    closeMainWindowButton.blur();
  }, 200)

  ipcRenderer.send('set_stream_mode', 'ok');
  closeWindow();
})

ipcRenderer.on('rx_data', (event, data) => {
  displayMsg.innerHTML = data.displayMsg;

  // 단위 표시
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

  if(data.isStable) {
    labelStableClass.style.color = 'red';
  }
  else {
    labelStableClass.style.color = 'black';
  }

  if(data.isHold) {
    labelHoldClass.style.color = 'red';
  }
  else {
    labelHoldClass.style.color = 'black';
  }

  if(data.isZero) {
    labelZeroClass.style.color = 'red';
  }
  else {
    labelZeroClass.style.color = 'black';
  }

  if(data.isNet) {
    labelNetClass.style.color = 'red';
  }
  else {
    labelNetClass.style.color = 'black';
  }
})

ipcRenderer.on('print', (event, data) => {

});

ipcRenderer.on('main_button_active', (event, isActive) => {
  // 프로그램 ON 상태
  if(!isActive) {
    setClearTareButton.disabled = true;
    setZeroTareButton.disabled = true;
    setGrossNetButton.disabled = true;
    setHoldButton.disabled = true;
    printButton.disabled = true;
    openConfigWindowButton.disabled = true;
  }
  // 프로그램 OFF 상태
  else {
    setClearTareButton.disabled = false;
    setZeroTareButton.disabled = false;
    setGrossNetButton.disabled = false;
    setHoldButton.disabled = false;
    printButton.disabled = false;
    openConfigWindowButton.disabled = false;
  }
})

setClearTareButton.addEventListener('click', function(){
  // setTimeout(function(){
  //   setClearTareButton.blur();
  // }, 200)
  ipcRenderer.send('set_clear_tare', 'ok');
})

setZeroTareButton.addEventListener('click', function(){
  // setTimeout(function(){
  //   setZeroTareButton.blur();
  // }, 200)
  ipcRenderer.send('set_zero_tare', 'ok');
})

setGrossNetButton.addEventListener('click', function(){
  // setTimeout(function(){
  //   setGrossNetButton.blur();
  // }, 200)
  ipcRenderer.send('set_gross_net', 'ok');
})

setHoldButton.addEventListener('click', function(){
  // setTimeout(function(){
  //   setHoldButton.blur();
  // }, 200)
  ipcRenderer.send('set_hold', 'ok');
})

printButton.addEventListener('click', function(){
  // setTimeout(function(){
  //   printButton.blur();
  // }, 200)
  ipcRenderer.send('print', 'ok');
})

onOffButton.addEventListener('click', function(){
  setTimeout(function(){
    // onOffButton.blur();
  }, 300)

  setOnOffView();
})

const closeWindow = function() {
  ipcRenderer.send('window_close', 'main');
}

const setOnOffView = function() {
  const onoffLabel = onOffButton.innerHTML;

  // 프로그램 시작
  if(onoffLabel == 'ON') {
    onOffButton.innerHTML = 'OFF';
    openPCConfigWindowButton.disabled = true;
  }
  // 프로그램 종료
  else {
    onOffButton.innerHTML = 'ON';
    openPCConfigWindowButton.disabled = false;

    displayMsg.innerHTML = 'off';
    unitTag.innerHTML = '';

    labelStableClass.style.color = 'black';
    labelHoldClass.style.color = 'black';
    labelZeroClass.style.color = 'black';
    labelNetClass.style.color = 'black';
  }

  ipcRenderer.send('on_off', onoffLabel);
}

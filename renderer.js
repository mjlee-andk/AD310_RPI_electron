const { BrowserWindow, ipcRenderer } = require('electron')

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
  const labelStableClass = document.getElementById("labelStable").classList;
  const labelHoldClass = document.getElementById("labelHold").classList;
  const labelZeroClass = document.getElementById("labelZero").classList;
  const labelNetClass = document.getElementById("labelNet").classList;

  if(data.isStable) {
    labelStableClass.remove('badge-secondary');
    labelStableClass.add('badge-success');
  }
  else {
    labelStableClass.remove('badge-success');
    labelStableClass.add('badge-secondary');
  }

  if(data.isHold) {
    labelHoldClass.remove('badge-secondary');
    labelHoldClass.add('badge-success');
  }
  else {
    labelHoldClass.remove('badge-success');
    labelHoldClass.add('badge-secondary');
  }

  if(data.isZero) {
    labelZeroClass.remove('badge-secondary');
    labelZeroClass.add('badge-success');
  }
  else {
    labelZeroClass.remove('badge-success');
    labelZeroClass.add('badge-secondary');
  }

  if(data.isNet) {
    labelNetClass.remove('badge-secondary');
    labelNetClass.add('badge-success');
  }
  else {
    labelNetClass.remove('badge-success');
    labelNetClass.add('badge-secondary');
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

  if(message == 'ON') {
    setClearTareButton.disabled = true;
    setZeroTareButton.disabled = true;
    setGrossNetButton.disabled = true;
    setHoldButton.disabled = true;
    printButton.disabled = true;
  }
  else {
    setClearTareButton.disabled = false;
    setZeroTareButton.disabled = false;
    setGrossNetButton.disabled = false;
    setHoldButton.disabled = false;
    printButton.disabled = false;
  }
});

// TODO 현재는 설정창 띄우는 기능으로 해놓았음. 수정해야함.
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

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

//
// 화면 상단
//
const configOkButton = document.getElementById("configOk");
configOkButton.addEventListener('click', function(){
  if(basicLeftDiv.style.display == 'flex') {
    setBasicLeftConfigData();
  }
  if(basicRightDiv.style.display == 'flex') {
    setBasicRightConfigData();
  }

  // tmpfunc();
})

const closeConfigWindowButton = document.getElementById("closeConfigWindow");
closeConfigWindowButton.addEventListener('click', function(){
  console.log('closeConfigWindowButton');
  ipcRenderer.send('set_stream_mode', 'ok');
  var window = remote.getCurrentWindow();
  window.close();
})

// 기본 설정에서 선택된 값들 가져오기
var tmpfunc = function() {
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
}

//
// 내용
//

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

  ipcRenderer.send('set_stream_mode', 'ok');
  var window = remote.getCurrentWindow();
  window.close();
  return;
})

// 기본 설정 좌
const digitalFilterSelect = document.getElementById("digitalFilterSelect");
const holdModeSelect = document.getElementById("holdModeSelect");
const averageTimeSlider = document.getElementById('averageTimeSlider');

noUiSlider.create(averageTimeSlider, {
    start: [0],
    step: 0.1,
    connect: 'upper',
    tooltips: true,
    range: {
        'min': [0],
        'max': [9.9]
    }
});

ipcRenderer.on('get_basic_left_config_data', (event, data) => {
  console.log('get_basic_left_config_data');

  digitalFilterSelect.value = data.digitalFilter;
  holdModeSelect.value = data.holdMode;
  averageTimeSlider.noUiSlider.set(data.averageTime/10);
});

ipcRenderer.on('set_basic_left_config_data', (event, arg) => {
  console.log('set basic left config ' + arg );

  ipcRenderer.send('set_stream_mode', 'ok');
  var window = remote.getCurrentWindow();
  window.close();
  return;
})

const setBasicLeftConfigData = function() {
  console.log('setBasicLeftConfigData');

  var basicLeftConfigData = {
    digitalFilter: digitalFilterSelect.options[digitalFilterSelect.selectedIndex].value,
    holdMode: holdModeSelect.options[holdModeSelect.selectedIndex].value,
    averageTime: averageTimeSlider.noUiSlider.get()*10
  };

  ipcRenderer.send('set_basic_left_config_data', basicLeftConfigData);
  return;
}

// 기본 설정 우
const zeroRangeSlider = document.getElementById("zeroRangeSlider");
const zeroTrackingTimeSlider = document.getElementById("zeroTrackingTimeSlider");
const zeroTrackingWidthSlider = document.getElementById('zeroTrackingWidthSlider');
const powerOnZeroToggle = document.getElementById('powerOnZeroToggle');

noUiSlider.create(zeroRangeSlider, {
    start: [0],
    step: 1,
    connect: 'upper',
    tooltips: true,
    range: {
        'min': [0],
        'max': [100]
    }
});

noUiSlider.create(zeroTrackingTimeSlider, {
    start: [0],
    step: 0.1,
    connect: 'upper',
    tooltips: true,
    range: {
        'min': [0],
        'max': [5]
    }
});

noUiSlider.create(zeroTrackingWidthSlider, {
    start: [0],
    step: 0.1,
    connect: 'upper',
    tooltips: true,
    range: {
        'min': [0],
        'max': [9.9]
    }
});

ipcRenderer.on('get_basic_right_config_data', (event, data) => {
  console.log('get_basic_right_config_data');

  zeroRangeSlider.noUiSlider.set(data.zeroRange);
  zeroTrackingTimeSlider.noUiSlider.set(data.zeroTrackingTime/10);
  zeroTrackingWidthSlider.noUiSlider.set(data.zeroTrackingWidth/10);
  if(data.powerOnZero == 0) {
    powerOnZeroToggle.checked = false;
  }
  else if(data.powerOnZero == 1) {
    powerOnZeroToggle.checked = true;
  }

});

ipcRenderer.on('set_basic_right_config_data', (event, arg) => {
  console.log('set basic right ' + arg );

  var window = remote.getCurrentWindow();
  window.close();
  return;
})

const setBasicRightConfigData = function() {
  console.log('setBasicRightConfigData');

  var basicRightConfigData = {
    zeroRange: Math.floor(zeroRangeSlider.noUiSlider.get()),
    zeroTrackingTime: zeroTrackingTimeSlider.noUiSlider.get()*10,
    zeroTrackingWidth: zeroTrackingWidthSlider.noUiSlider.get()*10,
    powerOnZero: powerOnZeroToggle.checked == true ? 1 : 0
  };

  ipcRenderer.send('set_basic_right_config_data', basicRightConfigData);
  return;
}


// 외부 출력
const printConditionRadios1 = document.getElementById("printConditionRadios1");
const printConditionRadios2 = document.getElementById("printConditionRadios2");
const comparatorModeRadios1 = document.getElementById("comparatorModeRadios1");
const comparatorModeRadios2 = document.getElementById("comparatorModeRadios2");
const comparatorModeRadios3 = document.getElementById("comparatorModeRadios3");

// TODO 설정값, 영점부근 표시 어떻게 할지 고민
ipcRenderer.on('get_external_print_config_data', (event, data) => {
  console.log('get_external_print_config_data');

  if(data.printCondition == 1) {
    printConditionRadios1.checked = true;
  }
  else if(data.printCondition == 2) {
    printConditionRadios2.checked = true;
  }
  if(data.comparatorMode == 0) {
    comparatorModeRadios1.checked = true;
  }
  else if(data.comparatorMode == 1) {
    comparatorModeRadios2.checked = true;
  }
  else if(data.comparatorMode == 2) {
    comparatorModeRadios3.checked = true;
  }
});


//
// 화면 하단
//

const serialConfigButton = document.getElementById("serialConfigButton");
const basicLeftConfigButton = document.getElementById("basicLeftConfigButton");
const basicRightConfigButton = document.getElementById("basicRightConfigButton");
const externalPrintConfigButton = document.getElementById("externalPrintConfigButton");
const calibrationConfigButton = document.getElementById("calibrationConfigButton");
const resetButton = document.getElementById("resetButton");

const serialDiv = document.getElementById("serialDiv");
const basicLeftDiv = document.getElementById("basicLeftDiv");
const basicRightDiv = document.getElementById("basicRightDiv");
const externalPrintDiv = document.getElementById("externalPrintDiv");
const calibrationDiv = document.getElementById("calibrationDiv");
const resetDiv = document.getElementById("resetDiv");

serialConfigButton.addEventListener('click', function(){
  ipcRenderer.send('get_serial_config_data', 'ok');

  serialDiv.style.display = "flex";
  basicLeftDiv.style.display = "none";
  basicRightDiv.style.display = "none";
  externalPrintDiv.style.display = "none";
  calibrationDiv.style.display = "none";
  resetDiv.style.display = "none";

  serialDiv.classList.add("active");
  basicLeftDiv.classList.remove("active");
  basicRightDiv.classList.remove("active");
  externalPrintDiv.classList.remove("active");
  calibrationDiv.classList.remove("active");
  resetDiv.classList.remove("active");
})

basicLeftConfigButton.addEventListener('click', function(){
  ipcRenderer.send('get_basic_left_config_data', 'ok');

  serialDiv.style.display = "none";
  basicLeftDiv.style.display = "flex";
  basicRightDiv.style.display = "none";
  externalPrintDiv.style.display = "none";
  calibrationDiv.style.display = "none";
  resetDiv.style.display = "none";

  serialDiv.classList.remove("active");
  basicLeftDiv.classList.add("active");
  basicRightDiv.classList.remove("active");
  externalPrintDiv.classList.remove("active");
  calibrationDiv.classList.remove("active");
  resetDiv.classList.remove("active");
})

basicRightConfigButton.addEventListener('click', function(){
  ipcRenderer.send('get_basic_right_config_data', 'ok');

  serialDiv.style.display = "none";
  basicLeftDiv.style.display = "none";
  basicRightDiv.style.display = "flex";
  externalPrintDiv.style.display = "none";
  calibrationDiv.style.display = "none";
  resetDiv.style.display = "none";

  serialDiv.classList.remove("active");
  basicLeftDiv.classList.remove("active");
  basicRightDiv.classList.add("active");
  externalPrintDiv.classList.remove("active");
  calibrationDiv.classList.remove("active");
  resetDiv.classList.remove("active");
})

externalPrintConfigButton.addEventListener('click', function(){
  serialDiv.style.display = "none";
  basicLeftDiv.style.display = "none";
  basicRightDiv.style.display = "none";
  externalPrintDiv.style.display = "flex";
  calibrationDiv.style.display = "none";
  resetDiv.style.display = "none";

  serialDiv.classList.remove("active");
  basicLeftDiv.classList.remove("active");
  basicRightDiv.classList.remove("active");
  externalPrintDiv.classList.add("active");
  calibrationDiv.classList.remove("active");
  resetDiv.classList.remove("active");
})

calibrationConfigButton.addEventListener('click', function(){
  serialDiv.style.display = "none";
  basicLeftDiv.style.display = "none";
  basicRightDiv.style.display = "none";
  externalPrintDiv.style.display = "none";
  calibrationDiv.style.display = "flex";
  resetDiv.style.display = "none";

  serialDiv.classList.remove("active");
  basicLeftDiv.classList.remove("active");
  basicRightDiv.classList.remove("active");
  externalPrintDiv.classList.remove("active");
  calibrationDiv.classList.add("active");
  resetDiv.classList.remove("active");
})

resetButton.addEventListener('click', function(){
  serialDiv.style.display = "none";
  basicLeftDiv.style.display = "none";
  basicRightDiv.style.display = "none";
  externalPrintDiv.style.display = "none";
  calibrationDiv.style.display = "none";
  resetDiv.style.display = "flex";

  serialDiv.classList.remove("active");
  basicLeftDiv.classList.remove("active");
  basicRightDiv.classList.remove("active");
  externalPrintDiv.classList.remove("active");
  calibrationDiv.classList.remove("active");
  resetDiv.classList.add("active");
})

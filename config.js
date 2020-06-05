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

//
// 화면 상단
//
const configOkButton = document.getElementById("configOk");
configOkButton.addEventListener('click', function(){
  if(serialDiv.style.display == 'flex') {
    setSerialConfigData();
  }
  if(basicLeftDiv.style.display == 'flex') {
    setBasicLeftConfigData();
  }
  if(basicRightDiv.style.display == 'flex') {
    setBasicRightConfigData();
  }

  if(externalPrintDiv.style.display == 'flex') {
    setExternalPrintConfigData();
  }

  if(calibrationConfigDiv.style.display == 'flex') {
    setCalibrationConfigData();
  }


  // tmpfunc();
})

const closeConfigWindowButton = document.getElementById("closeConfigWindow");
closeConfigWindowButton.addEventListener('click', function(){
  console.log('closeConfigWindowButton');

  ipcRenderer.send('set_stream_mode', 'ok');
  var window = remote.getCurrentWindow();
  window.close();
});



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

  setTimeout(function(){
    ipcRenderer.send('set_stream_mode', 'ok');
    var window = remote.getCurrentWindow();
    window.close();
  }, CONSTANT.FIVE_HUNDRED_MS);
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

  setTimeout(function(){
    ipcRenderer.send('set_stream_mode', 'ok');
    var window = remote.getCurrentWindow();
    window.close();
  }, CONSTANT.FIVE_HUNDRED_MS);
});

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

  setTimeout(function(){
    ipcRenderer.send('set_stream_mode', 'ok');
    var window = remote.getCurrentWindow();
    window.close();
  }, CONSTANT.FIVE_HUNDRED_MS);

  // ipcRenderer.send('set_stream_mode', 'ok');
  // var window = remote.getCurrentWindow();
  // window.close();
  // return;
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
const configValueText = document.getElementById("configValueText");
const configValueStepUp = document.getElementById("configValueStepUp");
const configValueStepDown = document.getElementById("configValueStepDown");
const configValueOptionSelect = document.getElementById("configValueOptionSelect");
const comparatorModeRadios1 = document.getElementById("comparatorModeRadios1");
const comparatorModeRadios2 = document.getElementById("comparatorModeRadios2");
const comparatorModeRadios3 = document.getElementById("comparatorModeRadios3");
const nearZeroText = document.getElementById("nearZeroText");
const nearZeroStepUp = document.getElementById("nearZeroStepUp");
const nearZeroStepDown = document.getElementById("nearZeroStepDown");
const nearZeroOptionSelect = document.getElementById("nearZeroOptionSelect");

configValueStepUp.addEventListener('click', function() {
  const selectedConfigValueOption = configValueOptionSelect.options[configValueOptionSelect.selectedIndex].value;
  configValueText.stepUp(selectedConfigValueOption);
})

configValueStepDown.addEventListener('click', function() {
  const selectedConfigValueOption = configValueOptionSelect.options[configValueOptionSelect.selectedIndex].value;
  configValueText.stepDown(selectedConfigValueOption);
})

nearZeroStepUp.addEventListener('click', function() {
  const selectedNearZeroOption = nearZeroOptionSelect.options[nearZeroOptionSelect.selectedIndex].value;
  nearZeroText.stepUp(selectedNearZeroOption);
})

nearZeroStepDown.addEventListener('click', function() {
  const selectedNearZeroOption = nearZeroOptionSelect.options[nearZeroOptionSelect.selectedIndex].value;
  nearZeroText.stepDown(selectedNearZeroOption);
})

ipcRenderer.on('get_external_print_config_data', (event, data) => {
  console.log('get_external_print_config_data');

  if(data.printCondition == 0) {
    printConditionRadios1.checked = true;
  }
  else if(data.printCondition == 1) {
    printConditionRadios2.checked = true;
  }

  configValueText.value = data.configValue;

  if(data.comparatorMode == 0) {
    comparatorModeRadios1.checked = true;
  }
  else if(data.comparatorMode == 1) {
    comparatorModeRadios2.checked = true;
  }
  else if(data.comparatorMode == 2) {
    comparatorModeRadios3.checked = true;
  }

  nearZeroText.value = data.nearZero;
});

ipcRenderer.on('set_external_print_config_data', (event, arg) => {
  console.log('set external print config ' + arg);

  setTimeout(function(){
    ipcRenderer.send('set_stream_mode', 'ok');
    var window = remote.getCurrentWindow();
    window.close();
  }, CONSTANT.FIVE_HUNDRED_MS);
});

const setExternalPrintConfigData = function() {
  console.log('setExternalPrintConfigData');

  var externalPrintConfigData = {
    printCondition: 0,
    configValue: 0,
    comparatorMode: 0,
    nearZero:0,
  };

  if(printConditionRadios1.checked) {
    externalPrintConfigData.printCondition = printConditionRadios1.value;
  }
  else if(printConditionRadios2.checked) {
    externalPrintConfigData.printCondition = printConditionRadios2.value;
  }

  externalPrintConfigData.configValue = configValueText.value;

  if(comparatorModeRadios1.checked) {
    externalPrintConfigData.comparatorMode = comparatorModeRadios1.value;
  }
  else if(comparatorModeRadios2.checked) {
    externalPrintConfigData.comparatorMode = comparatorModeRadios2.value;
  }
  else if(comparatorModeRadios3.checked) {
    externalPrintConfigData.comparatorMode = comparatorModeRadios3.value;
  }

  externalPrintConfigData.nearZero = nearZeroText.value;
  ipcRenderer.send('set_external_print_config_data', externalPrintConfigData);
  return;
}

// 교정 설정
// TODO 스팬값 추가해야함.
const capaText = document.getElementById("capaText");
const capaStepUp = document.getElementById("capaStepUp");
const capaStepDown = document.getElementById("capaStepDown");
const capaOptionSelect = document.getElementById("capaOptionSelect");
const divSelect = document.getElementById("divSelect");
const decimalPointSelect = document.getElementById("decimalPointSelect");
const unitSelect = document.getElementById("unitSelect");

capaStepUp.addEventListener('click', function() {
  const selectedCapaOption = capaOptionSelect.options[capaOptionSelect.selectedIndex].value;
  capaText.stepUp(selectedCapaOption);
})

capaStepDown.addEventListener('click', function() {
  const selectedCapaOption = capaOptionSelect.options[capaOptionSelect.selectedIndex].value;
  capaText.stepDown(selectedCapaOption);
})

ipcRenderer.on('get_calibration_config_data', (event, data) => {
  console.log('get_calibration_config_data');
  capaText.value = data.capa;
  divSelect.value = data.div;
  decimalPointSelect.value = data.decimalPoint;
  unitSelect.value = data.unit;
});

ipcRenderer.on('set_calibration_config_data', (event, arg) => {
  console.log('set calibration ' + arg );

  setTimeout(function(){
    ipcRenderer.send('set_stream_mode', 'ok');
    var window = remote.getCurrentWindow();
    window.close();
  }, CONSTANT.FIVE_HUNDRED_MS);
});

const setCalibrationConfigData = function() {
  console.log('setCalibrationConfigData');

  var calibrationConfigData = {
    capa: capaText.value,
    div: divSelect.options[divSelect.selectedIndex].value,
    decimalPoint: decimalPointSelect.options[decimalPointSelect.selectedIndex].value,
    unit: unitSelect.options[unitSelect.selectedIndex].value,
  };

  ipcRenderer.send('set_calibration_config_data', calibrationConfigData);
  return;
}

// 교정
const spanValueText = document.getElementById("spanValueText");
const spanValueStepUp = document.getElementById("spanValueStepUp");
const spanValueStepDown = document.getElementById("spanValueStepDown");
const spanValueOptionSelect = document.getElementById("spanValueOptionSelect");

const calZeroButton = document.getElementById("calZeroButton");
const checkCalZero = document.getElementById("checkCalZero");

const calSpanButton = document.getElementById("calSpanButton");
const checkCalSpan = document.getElementById("checkCalSpan");

spanValueStepUp.addEventListener('click', function() {
  const selectedSpanValue = spanValueOptionSelect.options[spanValueOptionSelect.selectedIndex].value;
  spanValueText.stepUp(selectedSpanValue);
})

spanValueStepDown.addEventListener('click', function() {
  const selectedSpanValue = spanValueOptionSelect.options[spanValueOptionSelect.selectedIndex].value;
  spanValueText.stepDown(selectedSpanValue);
})

calZeroButton.addEventListener('click', function(){
  remote.dialog
  .showMessageBox(
    { type: 'info',
      title: 'CAL 0',
      message: 'CAL 0를 진행하시겠습니까?',
      buttons: ['ok', 'cancel']
    }).then(result => {
      console.log(result);
      const response = result.response;
      if(response == 0) {
        ipcRenderer.send('set_cal_zero', 'ok');
      }
      else {
        checkCalZero.innerHTML = 'NG';
      }

    }).catch(err => {
      console.log(err);
    });
})

calSpanButton.addEventListener('click', function(){
  remote.dialog
  .showMessageBox(
    { type: 'info',
      title: 'CAL F',
      message: 'CAL F를 진행하시겠습니까?',
      buttons: ['ok', 'cancel']
    }).then(result => {
      console.log(result);
      const response = result.response;
      if(response == 0) {
        ipcRenderer.send('set_cal_span', 'ok');
      }
      else {
        checkCalSpan.innerHTML = 'NG';
      }

    }).catch(err => {
      console.log(err);
    });
})

ipcRenderer.on('set_cal_zero', (event, arg) => {
  console.log('set_cal_zero');

  if(arg == 'ok') {
    checkCalZero.innerHTML = 'OK';
  }
  else {
    checkCalZero.innerHTML = 'NG';
  }
});

ipcRenderer.on('set_cal_span', (event, arg) => {
  console.log('set_cal_span');

  if(arg == 'ok') {
    setSpanValue();
    checkCalSpan.innerHTML = 'OK';
  }
  else {
    checkCalSpan.innerHTML = 'NG';
  }
});

ipcRenderer.on('get_cal_data', (event, data) => {
  console.log('get_cal_data');
  spanValueText.value = data.spanValue;
});

const setSpanValue = function() {
  console.log('setSpanValue');

  ipcRenderer.send('set_span_value_data', spanValueText.value);
  return;
}

// 초기화
const initFunctionFButton = document.getElementById("initFunctionFButton");
const initConfigButton = document.getElementById("initConfigButton");

initFunctionFButton.addEventListener('click', function(){
  remote.dialog
  .showMessageBox(
    { type: 'info',
      title: 'F펑션 초기화',
      message: 'F펑션 초기화를 진행하시겠습니까?',
      buttons: ['ok', 'cancel']
    }).then(result => {
      console.log(result);
      const response = result.response;
      if(response == 0) {
        ipcRenderer.send('init_function_f', 'ok');
      }

    }).catch(err => {
      console.log(err);
    });
})

initConfigButton.addEventListener('click', function(){
  remote.dialog
  .showMessageBox(
    { type: 'info',
      title: '설정 초기화',
      message: '설정 초기화를 진행하시겠습니까?',
      buttons: ['ok', 'cancel']
    }).then(result => {
      console.log(result);

      const response = result.response;
      if(response == 0) {
        ipcRenderer.send('init_config', 'ok');
      }
    }).catch(err => {
      console.log(err);
    });
})

ipcRenderer.on('init_finish', (event, arg) => {
  console.log('init_finish');

  remote.dialog
  .showMessageBox(
    { type: 'info',
      title: '초기화 완료',
      message: '초기화가 완료 되었습니다. 확인을 누르시면 첫 화면으로 돌아갑니다.'
    }).then(result => {
      var window = remote.getCurrentWindow();
      window.close();
    }).catch(err => {
      console.log(err);
    });
});


//
// 화면 하단
//

const serialConfigButton = document.getElementById("serialConfigButton");
const basicLeftConfigButton = document.getElementById("basicLeftConfigButton");
const basicRightConfigButton = document.getElementById("basicRightConfigButton");
const externalPrintConfigButton = document.getElementById("externalPrintConfigButton");
const calibrationConfigButton = document.getElementById("calibrationConfigButton");
const calButton = document.getElementById("calButton");
const resetButton = document.getElementById("resetButton");

const serialDiv = document.getElementById("serialDiv");
const basicLeftDiv = document.getElementById("basicLeftDiv");
const basicRightDiv = document.getElementById("basicRightDiv");
const externalPrintDiv = document.getElementById("externalPrintDiv");
const calibrationConfigDiv = document.getElementById("calibrationConfigDiv");
const calDiv = document.getElementById("calDiv");
const resetDiv = document.getElementById("resetDiv");

serialDiv.style.display = "flex";

serialConfigButton.addEventListener('click', function(){
  ipcRenderer.send('get_serial_config_data', 'ok');

  serialDiv.style.display = "flex";
  basicLeftDiv.style.display = "none";
  basicRightDiv.style.display = "none";
  externalPrintDiv.style.display = "none";
  calibrationConfigDiv.style.display = "none";
  calDiv.style.display = "none";
  resetDiv.style.display = "none";

  serialConfigButton.classList.add("active");
  basicLeftConfigButton.classList.remove("active");
  basicRightConfigButton.classList.remove("active");
  externalPrintConfigButton.classList.remove("active");
  calibrationConfigButton.classList.remove("active");
  calButton.classList.remove("active");
  resetButton.classList.remove("active");
})

basicLeftConfigButton.addEventListener('click', function(){
  ipcRenderer.send('get_basic_left_config_data', 'ok');

  serialDiv.style.display = "none";
  basicLeftDiv.style.display = "flex";
  basicRightDiv.style.display = "none";
  externalPrintDiv.style.display = "none";
  calibrationConfigDiv.style.display = "none";
  calDiv.style.display = "none";
  resetDiv.style.display = "none";

  serialConfigButton.classList.remove("active");
  basicLeftConfigButton.classList.add("active");
  basicRightConfigButton.classList.remove("active");
  externalPrintConfigButton.classList.remove("active");
  calibrationConfigButton.classList.remove("active");
  calButton.classList.remove("active");
  resetButton.classList.remove("active");
})

basicRightConfigButton.addEventListener('click', function(){
  ipcRenderer.send('get_basic_right_config_data', 'ok');

  serialDiv.style.display = "none";
  basicLeftDiv.style.display = "none";
  basicRightDiv.style.display = "flex";
  externalPrintDiv.style.display = "none";
  calibrationConfigDiv.style.display = "none";
  calDiv.style.display = "none";
  resetDiv.style.display = "none";

  serialConfigButton.classList.remove("active");
  basicLeftConfigButton.classList.remove("active");
  basicRightConfigButton.classList.add("active");
  externalPrintConfigButton.classList.remove("active");
  calibrationConfigButton.classList.remove("active");
  calButton.classList.remove("active");
  resetButton.classList.remove("active");
})

externalPrintConfigButton.addEventListener('click', function(){
  // remote.dialog.showMessageBox({type: 'info', title: '외부출력', message: '준비중입니다.'});
  // return;
  ipcRenderer.send('get_external_print_config_data', 'ok');

  serialDiv.style.display = "none";
  basicLeftDiv.style.display = "none";
  basicRightDiv.style.display = "none";
  externalPrintDiv.style.display = "flex";
  calibrationConfigDiv.style.display = "none";
  calDiv.style.display = "none";
  resetDiv.style.display = "none";

  serialConfigButton.classList.remove("active");
  basicLeftConfigButton.classList.remove("active");
  basicRightConfigButton.classList.remove("active");
  externalPrintConfigButton.classList.add("active");
  calibrationConfigButton.classList.remove("active");
  calButton.classList.remove("active");
  resetButton.classList.remove("active");
})

calibrationConfigButton.addEventListener('click', function(){
  // remote.dialog.showMessageBox({type: 'info', title: '교정', message: '준비중입니다.'});
  // return;
  ipcRenderer.send('get_calibration_config_data', 'ok');

  serialDiv.style.display = "none";
  basicLeftDiv.style.display = "none";
  basicRightDiv.style.display = "none";
  externalPrintDiv.style.display = "none";
  calibrationConfigDiv.style.display = "flex";
  calDiv.style.display = "none";
  resetDiv.style.display = "none";

  serialConfigButton.classList.remove("active");
  basicLeftConfigButton.classList.remove("active");
  basicRightConfigButton.classList.remove("active");
  externalPrintConfigButton.classList.remove("active");
  calibrationConfigButton.classList.add("active");
  calButton.classList.remove("active");
  resetButton.classList.remove("active");
})

calButton.addEventListener('click', function(){
  // remote.dialog.showMessageBox({type: 'info', title: '교정', message: '준비중입니다.'});
  // return;
  ipcRenderer.send('get_cal_data', 'ok');

  serialDiv.style.display = "none";
  basicLeftDiv.style.display = "none";
  basicRightDiv.style.display = "none";
  externalPrintDiv.style.display = "none";
  calibrationConfigDiv.style.display = "none";
  calDiv.style.display = "flex";
  resetDiv.style.display = "none";

  serialConfigButton.classList.remove("active");
  basicLeftConfigButton.classList.remove("active");
  basicRightConfigButton.classList.remove("active");
  externalPrintConfigButton.classList.remove("active");
  calibrationConfigButton.classList.remove("active");
  calButton.classList.add("active");
  resetButton.classList.remove("active");
})

resetButton.addEventListener('click', function(){
  serialDiv.style.display = "none";
  basicLeftDiv.style.display = "none";
  basicRightDiv.style.display = "none";
  externalPrintDiv.style.display = "none";
  calibrationConfigDiv.style.display = "none";
  calDiv.style.display = "none";
  resetDiv.style.display = "flex";

  serialConfigButton.classList.remove("active");
  basicLeftConfigButton.classList.remove("active");
  basicRightConfigButton.classList.remove("active");
  externalPrintConfigButton.classList.remove("active");
  calibrationConfigButton.classList.remove("active");
  calButton.classList.remove("active");
  resetButton.classList.add("active");
})

const { ipcRenderer } = require('electron')
const remote = require('electron').remote;
const { TAB_SERIAL_CONFIG, TAB_BASIC_LEFT_CONFIG, TAB_BASIC_RIGHT_CONFIG, TAB_EXTERNAL_PRINT_CONFIG, TAB_CALIBRATION_CONFIG, TAB_CALIBRATION, TAB_INIT } = require('../util/constant');
const { setSerialConfigData } = require('./serialConfig');
const { setBasicLeftConfigData, setBasicRightConfigData } = require('./basicConfig');
const { setExternalPrintConfigData } = require('./externalPrintConfig');
const { setCalibrationConfigData } = require('./calibrationConfig');
require('./calibration');
require('./init');

//
// 화면 상단
//
const configOkButton = document.getElementById("configOk");
configOkButton.addEventListener('click', function(){
  configOkButton.blur();
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
})

const closeConfigWindowButton = document.getElementById("closeConfigWindow");
closeConfigWindowButton.addEventListener('click', function(){
  console.log('closeConfigWindowButton');

  ipcRenderer.send('set_stream_mode', 'ok');
  var window = remote.getCurrentWindow();
  window.close();
});

const romVer = document.getElementById("romVer");

ipcRenderer.on('get_rom_ver', (event, data) => {
  console.log('get_rom_ver');

  romVer.innerHTML = data;
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
const initButton = document.getElementById("initButton");

const serialDiv = document.getElementById("serialDiv");
const basicLeftDiv = document.getElementById("basicLeftDiv");
const basicRightDiv = document.getElementById("basicRightDiv");
const externalPrintDiv = document.getElementById("externalPrintDiv");
const calibrationConfigDiv = document.getElementById("calibrationConfigDiv");
const calDiv = document.getElementById("calDiv");
const initDiv = document.getElementById("initDiv");

const setDivDisplay = function(tab) {

  serialDiv.style.display = "none";
  basicLeftDiv.style.display = "none";
  basicRightDiv.style.display = "none";
  externalPrintDiv.style.display = "none";
  calibrationConfigDiv.style.display = "none";
  calDiv.style.display = "none";
  initDiv.style.display = "none";
  configOkButton.style.display = "none";

  if(tab == TAB_SERIAL_CONFIG) {
    serialDiv.style.display = "flex";
    configOkButton.style.display = "flex";
  }
  else if(tab == TAB_BASIC_LEFT_CONFIG) {
    basicLeftDiv.style.display = "flex";
    configOkButton.style.display = "flex";
  }
  else if(tab == TAB_BASIC_RIGHT_CONFIG) {
    basicRightDiv.style.display = "flex";
    configOkButton.style.display = "flex";
  }
  else if(tab == TAB_EXTERNAL_PRINT_CONFIG) {
    externalPrintDiv.style.display = "flex";
    configOkButton.style.display = "flex";
  }
  else if(tab == TAB_CALIBRATION_CONFIG) {
    calibrationConfigDiv.style.display = "flex";
    configOkButton.style.display = "flex";
  }
  else if(tab == TAB_CALIBRATION) {
    calDiv.style.display = "flex";
  }
  else if(tab == TAB_INIT) {
    initDiv.style.display = "flex";
  }
}

const setButtonActive = function(tab) {
  serialConfigButton.classList.remove("active");
  basicLeftConfigButton.classList.remove("active");
  basicRightConfigButton.classList.remove("active");
  externalPrintConfigButton.classList.remove("active");
  calibrationConfigButton.classList.remove("active");
  calButton.classList.remove("active");
  initButton.classList.remove("active");

  if(tab == TAB_SERIAL_CONFIG) {
    serialConfigButton.classList.add("active");
  }
  else if(tab == TAB_BASIC_LEFT_CONFIG) {
    basicLeftConfigButton.classList.add("active");
  }
  else if(tab == TAB_BASIC_RIGHT_CONFIG) {
    basicRightConfigButton.classList.add("active");
  }
  else if(tab == TAB_EXTERNAL_PRINT_CONFIG) {
    externalPrintConfigButton.classList.add("active");
  }
  else if(tab == TAB_CALIBRATION_CONFIG) {
    calibrationConfigButton.classList.add("active");
  }
  else if(tab == TAB_CALIBRATION) {
    calButton.classList.add("active");
  }
  else if(tab == TAB_INIT) {
    initButton.classList.add("active");
  }
}

serialConfigButton.addEventListener('click', function(){
  ipcRenderer.send('get_serial_config_data', 'ok');

  setDivDisplay(TAB_SERIAL_CONFIG);
  setButtonActive(TAB_SERIAL_CONFIG);
})

basicLeftConfigButton.addEventListener('click', function(){
  ipcRenderer.send('get_basic_left_config_data', 'ok');

  setDivDisplay(TAB_BASIC_LEFT_CONFIG);
  setButtonActive(TAB_BASIC_LEFT_CONFIG);
})

basicRightConfigButton.addEventListener('click', function(){
  ipcRenderer.send('get_basic_right_config_data', 'ok');

  setDivDisplay(TAB_BASIC_RIGHT_CONFIG);
  setButtonActive(TAB_BASIC_RIGHT_CONFIG);
})

externalPrintConfigButton.addEventListener('click', function(){
  ipcRenderer.send('get_external_print_config_data', 'ok');

  setDivDisplay(TAB_EXTERNAL_PRINT_CONFIG);
  setButtonActive(TAB_EXTERNAL_PRINT_CONFIG);
})

calibrationConfigButton.addEventListener('click', function(){
  ipcRenderer.send('get_calibration_config_data', 'ok');

  setDivDisplay(TAB_CALIBRATION_CONFIG);
  setButtonActive(TAB_CALIBRATION_CONFIG);
})

calButton.addEventListener('click', function(){
  ipcRenderer.send('get_cal_data', 'ok');

  setDivDisplay(TAB_CALIBRATION);
  setButtonActive(TAB_CALIBRATION);
})

initButton.addEventListener('click', function(){
  setDivDisplay(TAB_INIT);
  setButtonActive(TAB_INIT);
})


// serialDiv.style.display = "flex";

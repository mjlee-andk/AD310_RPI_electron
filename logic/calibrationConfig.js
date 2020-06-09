const { ipcRenderer } = require('electron')
const remote = require('electron').remote;
const { FIVE_HUNDRED_MS } = require('../util/constant');

// 교정 설정
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
  }, FIVE_HUNDRED_MS);
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

module.exports = {
  setCalibrationConfigData: setCalibrationConfigData
}

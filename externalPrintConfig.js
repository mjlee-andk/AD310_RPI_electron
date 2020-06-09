const { ipcRenderer } = require('electron')
const remote = require('electron').remote;
const { FIVE_HUNDRED_MS } = require('./constant');

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
  }, FIVE_HUNDRED_MS);
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

module.exports = {
  setExternalPrintConfigData: setExternalPrintConfigData
}

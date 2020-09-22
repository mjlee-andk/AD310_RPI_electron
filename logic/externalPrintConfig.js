const { ipcRenderer } = require('electron')
const remote = require('electron').remote;
const { FIVE_HUNDRED_MS } = require('../util/constant');

// 외부 출력
const printConditionRadios1 = document.getElementById("printConditionRadios1");
const printConditionRadios2 = document.getElementById("printConditionRadios2");
const configValueText = document.getElementById("configValueText");

const comparatorModeRadios1 = document.getElementById("comparatorModeRadios1");
const comparatorModeRadios2 = document.getElementById("comparatorModeRadios2");
const comparatorModeRadios3 = document.getElementById("comparatorModeRadios3");
const nearZeroText = document.getElementById("nearZeroText");

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

$(document).ready(function(){
  // 외부출력 - 설정값 키패드
  $('#configValueText').click(function(){
      $('#keypad_config').fadeToggle('fast');
      event.stopPropagation();
  });

  $('.key_config').click(function(){
      var numBox = document.getElementById('configValueText');
      var numBoxValue = numBox.value;
      var numBoxLength = numBox.value.length;
      var keyValue = this.innerHTML;

      // 양수일 때
      if(numBoxValue.indexOf('-') == -1) {
        // 최대 99999까지 입력 가능
        if(numBoxLength <= 4) {
          // 입력값이 0인 경우
          if(numBoxValue == 0) {
            numBox.value = keyValue;
          }
          else {
            numBox.value = numBox.value + keyValue;
          }
        }
      }
      else {
        // 최대 -99999까지 입력 가능
        if(numBoxLength <= 5) {
          // 입력값이 0인 경우
          if(numBoxValue == 0) {
            numBox.value = keyValue;
          }
          else {
            numBox.value = numBox.value + keyValue;
          }
        }
      }
      event.stopPropagation();
  });

  $('.key_btn_config').click(function(){
      var numBox = document.getElementById('configValueText');
      var inputValLength = numBox.value.length;
      if(this.innerHTML == '삭제'){
          if(inputValLength > 0){
              numBox.value = numBox.value.substring(0, inputValLength - 1);
          }
      }
      else if(this.innerHTML == '확인'){
          if(inputValLength == 0) {
            alert('값을 입력해주세요.');
            return;
          }
          $('#keypad_config').css('display', 'none');
      }
      // 입력값의 양/음수를 결정
      else {
        if(inputValLength > 0){
          if(numBox.value.includes('-')) {
              numBox.value = numBox.value.replace('-', '');
          }
          else {
            numBox.value = '-' + numBox.value;
          }
        }
      }

      event.stopPropagation();
  });

  // 외부출력 - 영점부근비교 키패드
  $('#nearZeroText').click(function(){
      $('#keypad_nearzero').fadeToggle('fast');
      event.stopPropagation();
  });

  $('.key_nearzero').click(function(){
      var numBox = document.getElementById('nearZeroText');
      var numBoxValue = numBox.value;
      var numBoxLength = numBox.value.length;
      var keyValue = this.innerHTML;

      // 양수일 때
      if(numBoxValue.indexOf('-') == -1) {
        // 최대 99999까지 입력 가능
        if(numBoxLength <= 4) {
          // 입력값이 0인 경우
          if(numBoxValue == 0) {
            numBox.value = keyValue;
          }
          else {
            numBox.value = numBox.value + keyValue;
          }
        }
      }
      else {
        // 최대 -99999까지 입력 가능
        if(numBoxLength <= 5) {
          // 입력값이 0인 경우
          if(numBoxValue == 0) {
            numBox.value = keyValue;
          }
          else {
            numBox.value = numBox.value + keyValue;
          }
        }
      }

      event.stopPropagation();
  });

  $('.key_btn_nearzero').click(function(){
      var numBox = document.getElementById('nearZeroText');
      var inputValLength = numBox.value.length;
      if(this.innerHTML == '삭제'){
          if(inputValLength > 0){
              numBox.value = numBox.value.substring(0, inputValLength - 1);
          }
      }
      else if(this.innerHTML == '확인'){
          if(inputValLength == 0) {
            alert('값을 입력해주세요.');
            return;
          }
          $('#keypad_nearzero').css('display', 'none');
      }
      // 입력값의 양/음수를 결정
      else {
        if(inputValLength > 0){
          if(numBox.value.includes('-')) {
              numBox.value = numBox.value.replace('-', '');
          }
          else {
            numBox.value = '-' + numBox.value;
          }
        }
      }

      event.stopPropagation();
  });
})

module.exports = {
  setExternalPrintConfigData: setExternalPrintConfigData
}

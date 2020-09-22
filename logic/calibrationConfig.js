const { ipcRenderer } = require('electron')
const remote = require('electron').remote;
const { FIVE_HUNDRED_MS } = require('../util/constant');

// 교정 설정
const capaText = document.getElementById("capaText");
const divSelect = document.getElementById("divSelect");
const decimalPointSelect = document.getElementById("decimalPointSelect");
const unitSelect = document.getElementById("unitSelect");

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

// 교정설정 - CAPA 키패드
$(document).ready(function(){
  $('#capaText').click(function(){
      $('#keypad_capa').fadeToggle('fast');
      // $('#keypad').css('display', 'block');
      event.stopPropagation();
  });

  $('.key_capa').click(function(){
      var numBox = document.getElementById('capaText');
      var numBoxValue = numBox.value;
      var numBoxLength = numBox.value.length;
      var keyValue = this.innerHTML;

      // 최대 99999까지 입력 가능
      if(numBoxLength <= 4) {
        // 입력값이 0인 경우
        if(numBoxLength == 0 || numBoxValue == 0) {
          numBox.value = keyValue;
        }
        else {
          numBox.value = numBox.value + keyValue;
        }
      }

      event.stopPropagation();
  });

  $('.key_btn_capa').click(function(){
      var numBox = document.getElementById('capaText');
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
          if(numBox.value < 1) {
            alert('1 이상 값을 입력해주세요.');
            return;
          }
          $('#keypad_capa').css('display', 'none');
      }

      event.stopPropagation();
  });
})

module.exports = {
  setCalibrationConfigData: setCalibrationConfigData
}

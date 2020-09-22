const { ipcRenderer } = require('electron')
const remote = require('electron').remote;

// 교정
const spanValueText = document.getElementById("spanValueText");

const calZeroButton = document.getElementById("calZeroButton");
const checkCalZero = document.getElementById("checkCalZero");

const calSpanButton = document.getElementById("calSpanButton");
const checkCalSpan = document.getElementById("checkCalSpan");

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

$(document).ready(function(){
  $('#spanValueText').click(function(){
      $('#keypad_span').fadeToggle('fast');
      event.stopPropagation();
  });

  $('.key_span').click(function(){
      var numBox = document.getElementById('spanValueText');
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

  $('.key_btn_span').click(function(){
      var numBox = document.getElementById('spanValueText');
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
          $('#keypad_span').css('display', 'none');
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

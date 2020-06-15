const { ipcRenderer } = require('electron')
const remote = require('electron').remote;

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

const { ipcRenderer } = require('electron')
const remote = require('electron').remote;
const { FIVE_HUNDRED_MS } = require('./constant');

// 기본 설정 좌
const digitalFilterSelect = document.getElementById("digitalFilterSelect");
const holdModeSelect = document.getElementById("holdModeSelect");
const averageTimeSlider = document.getElementById('averageTimeSlider');
const averageTimeSliderValue = document.getElementById('averageTimeSliderValue');

noUiSlider.create(averageTimeSlider, {
    start: [0],
    step: 0.1,
    connect: 'upper',
    range: {
        'min': [0],
        'max': [9.9]
    }
});

averageTimeSlider.noUiSlider.on('update', function(values, handle){
  averageTimeSliderValue.innerHTML = values[handle];
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
  }, FIVE_HUNDRED_MS);
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
const zeroRangeSliderValue = document.getElementById("zeroRangeSliderValue");

const zeroTrackingTimeSlider = document.getElementById("zeroTrackingTimeSlider");
const zeroTrackingTimeSliderValue = document.getElementById("zeroTrackingTimeSliderValue");

const zeroTrackingWidthSlider = document.getElementById('zeroTrackingWidthSlider');
const zeroTrackingWidthSliderValue = document.getElementById("zeroTrackingWidthSliderValue");

const powerOnZeroToggle = document.getElementById('powerOnZeroToggle');

noUiSlider.create(zeroRangeSlider, {
    start: [0],
    step: 1,
    connect: 'upper',
    range: {
        'min': [0],
        'max': [100]
    }
});

zeroRangeSlider.noUiSlider.on('update', function(values, handle){
  zeroRangeSliderValue.innerHTML = values[handle];
});

noUiSlider.create(zeroTrackingTimeSlider, {
    start: [0],
    step: 0.1,
    connect: 'upper',
    range: {
        'min': [0],
        'max': [5]
    }
});

zeroTrackingTimeSlider.noUiSlider.on('update', function(values, handle){
  zeroTrackingTimeSliderValue.innerHTML = values[handle];
});

noUiSlider.create(zeroTrackingWidthSlider, {
    start: [0],
    step: 0.1,
    connect: 'upper',
    range: {
        'min': [0],
        'max': [9.9]
    }
});

zeroTrackingWidthSlider.noUiSlider.on('update', function(values, handle){
  zeroTrackingWidthSliderValue.innerHTML = values[handle];
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
  }, FIVE_HUNDRED_MS);
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

module.exports = {
  setBasicLeftConfigData: setBasicLeftConfigData,
  setBasicRightConfigData: setBasicRightConfigData
}

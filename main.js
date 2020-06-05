const { app, BrowserWindow, ipcMain, dialog } = require('electron')

const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline')
const path = require('path');

const CONSTANT = require('./constant');

class scaleFlag {
  constructor() {
    // 상태 표시
    this.isStable = false;
    this.isZero = false;
    this.isNet = false;
    this.isHold = false;
    this.isHg = false;

    // 표시 데이터
    this.displayMsg = 'off';

    this.f = false
    this.cf = false
    this.array_index_f = 0
    this.array_index_cf = 0
    this.read = false
    this.write = false
    this.hi = 0
    this.lo = 0
    this.terminator = 'CRLF'  // CRLF
    this.block = false

    // 단위 표시
    this.unit = 0

    // 스팬 적용
    this.do_span = false

    // init F 모드
    this.mode_init_f = false

    // init All 모드
    this.mode_init_a = false

    // init 응답 플래그
    this.init_f = false

    // 100ms 카운터
    this.cnt_100ms = 0

    // 초기화 루틴 진입
    this.do_init = false

    // 대기 시간
    this.waiting_sec = 0
  }
}

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

class basicConfigFlag{
  constructor() {
    // 커맨드로 정보 읽어오는건지 아닌지 확인
    this.isRead = true;

    // 기본설정 좌
    this.digitalFilter = 0, // 디지털 필터
    this.holdMode = 0, // 홀드모드
    this.averageTime = 0, // 평균화시간
    // 기본설정 우
    this.zeroRange = 2, // 제로범위
    this.zeroTrackingTime = 0, // 영점트래킹시간
    this.zeroTrackingWidth = 0, // 영점트래킹폭
    this.powerOnZero = 0 // 파워온제로
  }
}

class externalPrintConfigFlag{
  constructor() {
    this.isRead = true,

    this.printCondition = 0,
    this.configValue = 0,
    this.comparatorMode = 2,
    this.nearZero = 0
  }
}

class calibrationConfigFlag {
  constructor() {
    this.isRead = true,

    this.capa = 10000, // 최대용량
    this.div = 1, // 최소눈금
    this.decimalPoint = 0, // 소수점 위치
    this.unit = 2, // 단위
    this.spanValue = 10000 //  스팬의 입력 전압에 관한 표시값
  }
}

var sp;
var win;
var configWin;
var pcConfigWin;
var scale = new scaleFlag();
var pcConfig = new uartFlag('COM1', 24, 8, CONSTANT.PARITY_NONE, 1, CONSTANT.CRLF);
var serialConfig = new uartFlag();
var basicConfig = new basicConfigFlag();
var externalPrintConfig = new externalPrintConfigFlag();
var calibrationConfig = new calibrationConfigFlag();

var createWindow = function() {
  // 브라우저 창을 생성합니다.
  win = new BrowserWindow({
    width: 757,
    height: 400,
    webPreferences: {
      nodeIntegration: true
    },
    frame: false,
    // fullscreen: true
  })
  win.loadFile('index.html');
  win.webContents.openDevTools();
}

var openConfigWindow = function() {
  // 브라우저 창을 생성합니다.
  configWin = new BrowserWindow({
    parent: win,
    width: 757,
    height: 400,
    webPreferences: {
      nodeIntegration: true
    },
    frame: false,
    // fullscreen: true
  })


  configWin.loadFile('config.html');
  configWin.webContents.openDevTools();

  configWin.webContents.on('did-finish-load', () => {
    setTimeout(function() {
      getSerialConfig();
    }, CONSTANT.FIVE_HUNDRED_MS);
  })
}

var openPCConfigWindow = function() {
  // 브라우저 창을 생성합니다.
  pcConfigWin = new BrowserWindow({
    parent: win,
    width: 757,
    height: 400,
    webPreferences: {
      nodeIntegration: true
    },
    frame: false,
    // fullscreen: true
  })

  pcConfigWin.loadFile('pcconfig.html');
  pcConfigWin.webContents.openDevTools();

  // PC설정 화면 로드 완료되면 포트 목록 호출 및 PC설정 데이터 전송
  pcConfigWin.webContents.on('did-finish-load', () => {
    // 포트목록 불러오기
    SerialPort.list().then(
      ports => {
        pcConfigWin.webContents.send('port_list', ports);
        pcConfigWin.webContents.send('get_pc_config_data', pcConfig)
      }
    );
  })
}

var setStreamMode = function() {
  console.log('set stream mode');
  const command = 'F206,1' + '\r\n';
  sp.write(command, function(err){
    if(err) {
      console.log(err.message);
      return;
    }
  });
}

var setCommandMode = function() {
  console.log('set command mode');
  const command = 'F206,2' + '\r\n';
  sp.write(command, function(err){
    if(err) {
      console.log(err.message);
      return;
    }
    openConfigWindow();
  });
}

var rssetCommand = function() {
  var command = 'RSSET' + '\r\n';

  scale.f = true;
  sp.write(command, function(err){
    if(err) {
      console.log(err.message)
      serialConfig = new uartFlag();
      configWin.webContents.send('set_serial_config_data', 'fail');
      return;
    }
  })
}

//TODO scale의 변수명 수정 및 scale 클래스 추가
const readHeader = function(rx) {
  // TODO trim을 하는게 맞는건지 판단 필요
  rx = rx.trim();
  console.log(rx);
  const header1bit = rx.substr(0, 1);
  const header2bit = rx.substr(0, 2);
  const header3bit = rx.substr(0, 3);
  const header4bit = rx.substr(0, 4);
  const header5bit = rx.substr(0, 5);
  const header7bit = rx.substr(0, 7);

  if(header5bit == 'INFOK' || header5bit == 'INCOK') {
    // 초기화 된 설정값으로 변경 후 재연결
    const currentPort = pcConfig.port;
    pcConfig = new uartFlag(currentPort, 24, 8, CONSTANT.PARITY_NONE, 1, CONSTANT.CRLF);
    sp.close(function(err){
      if(err) {
        console.log(err.message)
        return;
      }
      openPort();
      configWin.webContents.send('init_finish', 'ok');
    });

    return;
  }

  if(scale.cf &&
    (header1bit == '?') ||
    (header1bit == 'I') ||
    (header2bit == 'CF') ||
    (header7bit == 'CALZERO') ||
    (header7bit == 'CALSPAN')) {
      scale.cf = false;
      console.log('scale cf');

      if(header2bit == 'CF') {
        const data = Number(rx.substr(5,7));
        if(basicConfig.isRead) {
          // 기본설정(우)
          if(header4bit == 'CF05') {
            basicConfig.zeroRange = data;
          }

          if(header4bit == 'CF06') {
            basicConfig.zeroTrackingTime = data;
          }

          if(header4bit == 'CF07') {
            basicConfig.zeroTrackingWidth = data;
          }

          if(header4bit == 'CF08') {
            basicConfig.powerOnZero = data;
            configWin.webContents.send('get_basic_right_config_data', basicConfig);
          }
        }
        else {
          if(header4bit == 'CF08') {
            configWin.webContents.send('set_basic_right_config_data', 'ok');
            basicConfig.isRead = false;
          }
        }

        if(calibrationConfig.isRead) {
          // 교정 설정값
          if(header4bit == 'CF03') {
            calibrationConfig.capa = data;
          }

          if(header4bit == 'CF02') {
            calibrationConfig.div = data;
          }

          if(header4bit == 'CF01') {
            calibrationConfig.decimalPoint = data;
          }

          if(header4bit == 'CF09') {
            calibrationConfig.unit = data;
            configWin.webContents.send('get_calibration_config_data', calibrationConfig);
          }
          // 교정
          if(header4bit == 'CF04') {
            calibrationConfig.spanValue = data;
            configWin.webContents.send('get_cal_data', calibrationConfig);
          }
        }
        else {
          if(header4bit == 'CF09') {
            configWin.webContents.send('set_calibration_config_data', 'ok');
            calibrationConfig.isRead = false;
          }
        }
      }

      if(header7bit == 'CALZERO') {
        configWin.webContents.send('set_cal_zero', 'ok');
        return;
      }

      if(header7bit == 'CALSPAN') {
        configWin.webContents.send('set_cal_span', 'ok');
        return;
      }
    }
  else if (scale.f &&
    (header1bit == '?') ||
    (header1bit == 'I') ||
    (header1bit == 'F') ||
    (header3bit == 'VER') ||
    (header5bit == 'STOOK') ||
    (header5bit == 'SETOK')) {
      scale.f = false;
      console.log('scale f');

      if(header5bit == 'STOOK') {
        console.log('STOOK');
        rssetCommand();
      }

      if(header5bit == 'SETOK') {
        console.log('SETOK');

        pcConfig.baudrate = serialConfig.baudrate;
        pcConfig.databits = serialConfig.databits;
        pcConfig.parity = serialConfig.parity;
        pcConfig.stopbits = serialConfig.stopbits;
        pcConfig.terminator = serialConfig.terminator;

        configWin.webContents.send('set_serial_config_data', 'ok');

        try {
          sp.close(function(err){
            if(err) {
              console.log(err.message)
              return;
            }
            console.log('closed');
            openPort();
            return;
          });
        }
        catch(e) {
          console.log(e);
          console.log('Cannot open port.');
        }
      }

      if(header1bit == 'F') {
        const data = Number(rx.substr(5,7));
        if(basicConfig.isRead) {
          if(header4bit == 'F001') {
            basicConfig.digitalFilter = data;
          }

          if(header4bit == 'F002') {
            basicConfig.holdMode = data;
          }

          if(header4bit == 'F003') {
            basicConfig.averageTime = data;
            configWin.webContents.send('get_basic_left_config_data', basicConfig);
          }
        }
        else {
          if(header4bit == 'F003') {
            configWin.webContents.send('set_basic_left_config_data', 'ok');
            basicConfig.isRead = false;
          }
        }

        if(externalPrintConfig.isRead){
          if(header4bit == 'F101') {
            externalPrintConfig.printCondition = data;
          }

          if(header4bit == 'F102') {
            externalPrintConfig.configValue = data;
          }

          if(header4bit == 'F103') {
            externalPrintConfig.comparatorMode = data;
          }

          if(header4bit == 'F104') {
            externalPrintConfig.nearZero = data;
            configWin.webContents.send('get_external_print_config_data', externalPrintConfig);
          }
        }
        else {
          if(header4bit == 'F104') {
            configWin.webContents.send('set_external_print_config_data', 'ok');
            externalPrintConfig.isRead = false;
          }
        }

        if(header4bit == 'F201') {
          console.log('success F201');
          serialConfig.baudrate = data;
        }

        if(header4bit == 'F202') {
          console.log('success F202');
          serialConfig.databits = data;
        }

        if(header4bit == 'F203') {
          console.log('success F203');
          serialConfig.parity = data;
        }

        if(header4bit == 'F204') {
          console.log('success F204');
          serialConfig.stopbits = data;
        }

        if(header4bit == 'F205') {
          console.log('success F205');
          serialConfig.terminator = data;
          console.log(serialConfig);
          configWin.webContents.send('get_serial_config_data', serialConfig);
        }
      }
    }
  else {
    if(rx.length < 16) {
      return;
    }
    const state = rx.substr(3, 2);
    if (header2bit == 'ST') {
      scale.isStable = true;
      scale.isHold = false;
      scale.isHg = false;
      scale.isNet = false;
      if(state == 'NT') {
        scale.isNet = true;
      }
      scale.displayMsg = makeFormat(rx);
    }

    else if (header2bit == 'US') {
      scale.isStable = false;
      scale.isHold = false;
      scale.isHg = false;
      scale.isNet = false;
      if(state == 'NT') {
        scale.isNet = true;
      }
      scale.displayMsg = makeFormat(rx);
    }

    else if (header2bit == 'HD') {
      scale.isStable = false;
      scale.isHold = true;
      scale.isHg = false;
      scale.isNet = false;
      scale.displayMsg = makeFormat(rx);
    }

    else if (header2bit == 'HG') {
      scale.isStable = false;
      scale.isHold = true;
      scale.isHg = true;
      scale.isNet = false;
      scale.displayMsg = makeFormat(rx);
    }

    else if (header2bit == 'OL') {
      scale.isStable = false;
      scale.isHold = false;
      scale.isHg = false;
      scale.isNet = false;
      scale.displayMsg = '   .  ';
    }

    else {
      scale.isStable = false;
      scale.isHold = false;
      scale.isHg = false;
      scale.isNet = false;
      scale.isZero = false;
      scale.block = true;
      rx = '';
    }
    rx = '';
  }
}

const makeFormat = function(data) {
  var result = '';
  if(data == '' || data == undefined){
    return result;
  }

  const value = data.substr(6,8);
  const unit = data.substr(14,2).trim();

   result = Number(value).toString();

   const pointPos = value.indexOf('.');
   if(pointPos > 0) {
     result = Number(value).toFixed(7-pointPos).toString();
   }

   scale.isZero = false;
   if(result.substr(0,1).includes('0')) {
     scale.isZero = true;
   }

   if(unit.length == 2) {
     scale.unit = 2;
   }
   else {
     scale.unit = 1;
     if(unit == 't') {
       scale.unit = 3;
     }
   }

   return result;
}

ipcMain.on('open_pc_config_window', (event, arg) =>{
  console.log('open_pc_config_window');
  openPCConfigWindow();
})

ipcMain.on('open_config_window', (event, arg) =>{
  console.log('open_config_window');
  setCommandMode();
})

ipcMain.on('set_pc_config_data', (event, data) => {
  console.log('set_pc_config_data');
  pcConfig = data;
})

ipcMain.on('set_serial_config_data', (event, data) => {
  console.log('set_serial_config_data');

  serialConfig = data;
  setSerialConfig(data);
})

ipcMain.on('set_basic_left_config_data', (event, data) => {
  console.log('set_basic_left_config_data');

  setBasicLeftConfig(data);
})

ipcMain.on('set_basic_right_config_data', (event, data) => {
  console.log('set_basic_right_config_data');

  setBasicRightConfig(data);
})

ipcMain.on('set_external_print_config_data', (event, data) => {
  console.log('set_external_print_config_data');

  setExternalPrintConfig(data);
})

ipcMain.on('set_calibration_config_data', (event, data) => {
  console.log('set_calibration_config_data');

  setCalibrationConfig(data);
})

ipcMain.on('set_cal_zero', (event, data) => {
  console.log('set_cal_zero');

  setCalZero();
})

ipcMain.on('set_cal_span', (event, data) => {
  console.log('set_cal_span');

  setCalSpan();
})

ipcMain.on('set_span_value_data', (event, data) => {
  console.log('set_span_value_data');
  setSpanValue(data);
})


const setSerialConfig = function(data) {
  console.log('set_serial_config');

  console.log('set_device_baudrate');
  var arg = '';
  if(data.baudrate.length == 2) {
    arg += '0' + data.baudrate;
  }
  else {
    arg += data.baudrate;
  }

  arg = arg + data.databits + data.parity + data.stopbits + data.terminator;

  var command = 'RSSTO,' + arg + '\r\n';
  console.log(command);
  console.log(data);
  scale.f = true;
  sp.write(command, function(err){
    if(err) {
      console.log(err.message)
      serialConfig = new uartFlag();
      configWin.webContents.send('set_serial_config_data', 'fail');
      return;
    }
  })
}

const getSerialConfig = function() {
  console.log('get_serial_config');

  console.log('get_device_baudrate');
  var command = '?F201' + '\r\n';
  scale.f = true;
  sp.write(command, function(err){
    if(err) {
      console.log(err.message)
      serialConfig = new uartFlag();
      return;
    }
    console.log('get_device_databits');
    command = '?F202' + '\r\n';
    scale.f = true;
    sp.write(command, function(err){
      if(err) {
        console.log(err.message)
        serialConfig = new uartFlag();
        return;
      }
      console.log('get_device_parity');
      command = '?F203' + '\r\n';
      scale.f = true;
      sp.write(command, function(err){
        if(err) {
          console.log(err.message)
          serialConfig = new uartFlag();
          return;
        }
        console.log('get_device_stopbits');
        command = '?F204' + '\r\n';
        scale.f = true;
        sp.write(command, function(err){
          if(err) {
            console.log(err.message)
            serialConfig = new uartFlag();
            return;
          }
          console.log('get_device_terminator');
          command = '?F205' + '\r\n';
          scale.f = true;
          sp.write(command, function(err){
            if(err) {
              console.log(err.message)
              serialConfig = new uartFlag();
              return;
            }
          })
        })
      })
    })
  })
}

const setBasicLeftConfig = function(data) {
  console.log('set_basic_left_config');

  console.log('set_device_digital_filter');
  var command = 'F001,' + data.digitalFilter.toString() + '\r\n';
  scale.f = true;
  basicConfig.isRead = false;
  sp.write(command, function(err){
    if(err) {
      console.log(err.message)
      return;
    }

    setTimeout(function(){
      console.log('set_device_hold_mode');
      command = 'F002,' + data.holdMode.toString() + '\r\n';
      scale.f = true;
      basicConfig.isRead = false;
      sp.write(command, function(err){
        if(err) {
          console.log(err.message)
          return;
        }

        setTimeout(function(){
          console.log('set_device_average_time');
          command = 'F003,' + data.averageTime.toString() + '\r\n';
          scale.f = true;
          basicConfig.isRead = false;
          sp.write(command, function(err){
            if(err) {
              console.log(err.message)
              return;
            }
          })
        }, CONSTANT.FIVE_HUNDRED_MS);
      })
    }, CONSTANT.FIVE_HUNDRED_MS);
  })
}

const getBasicLeftConfig = function() {
  console.log('get_basic_left_config');

  console.log('get_device_digital_filter');
  var command = '?F001' + '\r\n';
  scale.f = true;
  basicConfig.isRead = true;
  sp.write(command, function(err){
    if(err) {
      console.log(err.message)
      return;
    }
    console.log('get_device_hold_mode');
    command = '?F002' + '\r\n';
    scale.f = true;
    basicConfig.isRead = true;
    sp.write(command, function(err){
      if(err) {
        console.log(err.message)
        return;
      }
      console.log('get_device_average_time');
      command = '?F003' + '\r\n';
      scale.f = true;
      basicConfig.isRead = true;
      sp.write(command, function(err){
        if(err) {
          console.log(err.message)
          return;
        }
      })
    })
  })
}

const setBasicRightConfig = function(data) {
  console.log('set_basic_right_config');

  console.log('set_device_zero_range');
  var command = 'CF05,' + data.zeroRange + '\r\n';
  scale.cf = true;
  basicConfig.isRead = false;
  sp.write(command, function(err){
    if(err) {
      console.log(err.message)
      return;
    }

    setTimeout(function(){
      console.log('set_device_zero_tracking_time');
      command = 'CF06,' + data.zeroTrackingTime + '\r\n';
      scale.cf = true;
      basicConfig.isRead = false;
      sp.write(command, function(err){
        if(err) {
          console.log(err.message)
          return;
        }

        setTimeout(function(){
          console.log('set_device_zero_tracking_width');
          command = 'CF07,' + data.zeroTrackingWidth + '\r\n';
          scale.cf = true;
          basicConfig.isRead = false;
          sp.write(command, function(err){
            if(err) {
              console.log(err.message)
              return;
            }

            setTimeout(function(){
              console.log('set_device_power_on_zero');
              command = 'CF08,' + data.powerOnZero + '\r\n';
              scale.cf = true;
              basicConfig.isRead = false;
              sp.write(command, function(err){
                if(err) {
                  console.log(err.message)
                  return;
                }
              })
            }, CONSTANT.FIVE_HUNDRED_MS);
          })
        }, CONSTANT.FIVE_HUNDRED_MS);
      })
    }, CONSTANT.FIVE_HUNDRED_MS);
  })
}

const getBasicRightConfig = function() {
  console.log('get_basic_right_config');

  console.log('get_device_zero_range');
  var command = '?CF05' + '\r\n';
  scale.cf = true;
  basicConfig.isRead = true;
  sp.write(command, function(err){
    if(err) {
      console.log(err.message)
      return;
    }
    console.log('get_device_zero_tracking_time');
    command = '?CF06' + '\r\n';
    scale.cf = true;
    basicConfig.isRead = true;
    sp.write(command, function(err){
      if(err) {
        console.log(err.message)
        return;
      }
      console.log('get_device_zero_tracking_width');
      command = '?CF07' + '\r\n';
      scale.cf = true;
      basicConfig.isRead = true;
      sp.write(command, function(err){
        if(err) {
          console.log(err.message)
          return;
        }

        console.log('get_device_power_on_zero');
        command = '?CF08' + '\r\n';
        scale.cf = true;
        basicConfig.isRead = true;
        sp.write(command, function(err){
          if(err) {
            console.log(err.message)
            return;
          }
        })
      })
    })
  })
}

const setExternalPrintConfig = function(data) {
  console.log('set_external_print_config');

  console.log('set_device_print_condition');
  var command = 'F101,' + data.printCondition + '\r\n';
  scale.f = true;
  externalPrintConfig.isRead = false;
  sp.write(command, function(err){
    if(err) {
      console.log(err.message)
      return;
    }
    setTimeout(function(){
      console.log('set_device_config_value');
      command = 'F102,' + data.configValue + '\r\n';
      scale.f = true;
      externalPrintConfig.isRead = false;
      sp.write(command, function(err){
        if(err) {
          console.log(err.message)
          return;
        }
        setTimeout(function(){
          console.log('set_device_comparator_mode');
          command = 'F103,' + data.comparatorMode + '\r\n';
          scale.f = true;
          externalPrintConfig.isRead = false;
          sp.write(command, function(err){
            if(err) {
              console.log(err.message)
              return;
            }
            setTimeout(function(){
              console.log('set_device_near_zero');
              command = 'F104,' + data.nearZero + '\r\n';
              scale.f = true;
              externalPrintConfig.isRead = false;
              sp.write(command, function(err){
                if(err) {
                  console.log(err.message)
                  return;
                }
              })
            }, CONSTANT.FIVE_HUNDRED_MS)
          })
        }, CONSTANT.FIVE_HUNDRED_MS)
      })
    }, CONSTANT.FIVE_HUNDRED_MS)
  })
}

const getExternalPrintConfig = function() {
  console.log('get_external_print_config');

  console.log('get_device_print_condition');
  var command = '?F101' + '\r\n';
  scale.f = true;
  externalPrintConfig.isRead = true;
  sp.write(command, function(err){
    if(err) {
      console.log(err.message)
      return;
    }
    console.log('get_device_config_value');
    command = '?F102' + '\r\n';
    scale.f = true;
    externalPrintConfig.isRead = true;
    sp.write(command, function(err){
      if(err) {
        console.log(err.message)
        return;
      }
      console.log('get_device_comparator_mode');
      command = '?F103' + '\r\n';
      scale.f = true;
      externalPrintConfig.isRead = true;
      sp.write(command, function(err){
        if(err) {
          console.log(err.message)
          return;
        }
        console.log('get_device_near_zero');
        command = '?F104' + '\r\n';
        scale.f = true;
        externalPrintConfig.isRead = true;
        sp.write(command, function(err){
          if(err) {
            console.log(err.message)
            return;
          }
        })
      })
    })
  })
}

const setCalibrationConfig = function(data) {
  console.log('set_calibration_config');

  console.log('set_device_capa');
  var command = 'CF03,' + data.capa + '\r\n';
  scale.cf = true;
  calibrationConfig.isRead = false;
  sp.write(command, function(err){
    if(err) {
      console.log(err.message)
      return;
    }
    setTimeout(function(){
      console.log('set_device_div');
      command = 'CF02,' + data.div + '\r\n';
      scale.cf = true;
      calibrationConfig.isRead = false;
      sp.write(command, function(err){
        if(err) {
          console.log(err.message)
          return;
        }
        setTimeout(function(){
          console.log('set_device_decimal_point');
          command = 'CF01,' + data.decimalPoint + '\r\n';
          scale.cf = true;
          calibrationConfig.isRead = false;
          sp.write(command, function(err){
            if(err) {
              console.log(err.message)
              return;
            }
            setTimeout(function(){
              console.log('set_device_unit');
              command = 'CF09,' + data.unit + '\r\n';
              scale.cf = true;
              calibrationConfig.isRead = false;
              sp.write(command, function(err){
                if(err) {
                  console.log(err.message)
                  return;
                }
              })
            }, CONSTANT.FIVE_HUNDRED_MS)
          })
        }, CONSTANT.FIVE_HUNDRED_MS)
      })
    }, CONSTANT.FIVE_HUNDRED_MS)
  })
}

const getCalibrationConfig = function() {
  console.log('get_calibration_config');

  console.log('get_device_capa');
  var command = '?CF03' + '\r\n';
  scale.cf = true;
  calibrationConfig.isRead = true;
  sp.write(command, function(err){
    if(err) {
      console.log(err.message)
      return;
    }
    console.log('get_device_div');
    command = '?CF02' + '\r\n';
    scale.cf = true;
    calibrationConfig.isRead = true;
    sp.write(command, function(err){
      if(err) {
        console.log(err.message)
        return;
      }
      console.log('get_device_decimal_point');
      command = '?CF01' + '\r\n';
      scale.cf = true;
      calibrationConfig.isRead = true;
      sp.write(command, function(err){
        if(err) {
          console.log(err.message)
          return;
        }

        console.log('get_device_unit');
        command = '?CF09' + '\r\n';
        scale.cf = true;
        calibrationConfig.isRead = true;
        sp.write(command, function(err){
          if(err) {
            console.log(err.message)
            return;
          }
        })
      })
    })
  })
}

const setCalZero = function() {
  console.log('set_cal_zero');

  console.log('set_device_cal_zero');
  var command = 'CALZERO' + '\r\n';
  scale.cf = true;
  sp.write(command, function(err){
    if(err) {
      console.log(err.message)
      configWin.webContents.send('set_cal_zero', 'fail');
      return;
    }
  });
}

const setCalSpan = function() {
  console.log('set_cal_span');

  console.log('set_device_cal_span');
  var command = 'CALSPAN' + '\r\n';
  scale.cf = true;
  sp.write(command, function(err){
    if(err) {
      console.log(err.message)
      configWin.webContents.send('set_cal_span', 'fail');
      return;
    }
  });
}

const setSpanValue = function(data) {
  console.log('set_span_value');

  var command = 'CF04,' + data + '\r\n';
  scale.cf = true;
  calibrationConfig.isRead = false;
  sp.write(command, function(err){
    if(err) {
      console.log(err.message)
      return;
    }
  })
}

const getCal = function() {
  console.log('get_cal');

  console.log('get_device_span_value');
  var command = '?CF04' + '\r\n';
  scale.cf = true;
  calibrationConfig.isRead = true;
  sp.write(command, function(err){
    if(err) {
      console.log(err.message)
      return;
    }
  })
}

ipcMain.on('set_stream_mode', (event, data) => {
  console.log('set_stream_mode');
  if(sp == undefined) {
    return;
  }
  setStreamMode();
})

ipcMain.on('get_serial_config_data', (event, arg) => {
  getSerialConfig();
})

ipcMain.on('get_basic_left_config_data', (event, arg) => {
  getBasicLeftConfig();
})

ipcMain.on('get_basic_right_config_data', (event, arg) => {
  getBasicRightConfig();
})

ipcMain.on('get_external_print_config_data', (event, arg) => {
  getExternalPrintConfig();
})

ipcMain.on('get_calibration_config_data', (event, arg) => {
  getCalibrationConfig();
})

ipcMain.on('get_cal_data', (event, arg) => {
  getCal();
});

ipcMain.on('init_function_f', (event, arg) => {
  console.log('init_function_f');

  initFunctionF();
})

const initFunctionF = function() {
  var command = 'INF' + '\r\n';
  sp.write(command, function(err){
    if(err) {
      console.log(err.message)
      return;
    }
  });
}

ipcMain.on('init_config', (event, arg) => {
  console.log('init_config');

  initConfig();
})

const initConfig = function() {
  var command = 'INC' + '\r\n';
  sp.write(command, function(err){
    if(err) {
      console.log(err.message)
      return;
    }
  });
}

ipcMain.on('set_clear_tare', (event, arg) =>{
  console.log('set_clear_tare');
  const command = 'CT' + '\r\n';
  sp.write(command, function(err){
    if(err) {
      console.log(err.message)
      return;
    }
  })
})

ipcMain.on('set_zero_tare', (event, arg) =>{
  console.log('set_zero_tare');
  const command = 'MZT' + '\r\n';
  sp.write(command, function(err){
    if(err) {
      console.log(err.message)
      return
    }
  })
})

ipcMain.on('set_gross_net', (event, arg) =>{
  console.log('set_gross_net');
  var command = 'MN' + '\r\n';

  if(scale.isNet) {
    command = 'MG' + '\r\n';
  }
  sp.write(command, function(err){
    if(err) {
      console.log(err.message)
      return
    }
  })
})

ipcMain.on('set_hold', (event, arg) =>{
  console.log('set_hold');
  var command = 'HS' + '\r\n';

  if(scale.isHold) {
    command = 'HC' + '\r\n';
  }
  sp.write(command, function(err){
    if(err) {
      console.log(err.message)
      return
    }
  })
})

ipcMain.on('print', (event, arg) => {
  console.log('print');
  // TODO 프린트 기능 추가 필요
  dialog.showMessageBox({type: 'info', title: '프린트', message: '준비중입니다.'});
  return;
})

const openPort = function() {
  try {
    sp = new SerialPort(pcConfig.port, {
      baudRate: pcConfig.baudrate * 100,
      dataBits: Number(pcConfig.databits),
      stopBits: Number(pcConfig.stopbits)
    });

    if(pcConfig.parity == CONSTANT.NONE) {
      sp.parity = 'none';
    }
    else if(pcConfig.parity == CONSTANT.ODD) {
      sp.parity = 'odd';
    }
    else if(pcConfig.parity == CONSTANT.EVEN) {
      sp.parity = 'even';
    }

    const lineStream = sp.pipe(new Readline({ delimiter: pcConfig.terminator == CONSTANT.CRLF ? '\r\n' : '\r' }));
    lineStream.on('data', function(rx) {
      readHeader(rx);
      win.webContents.send('rx_data', scale);
    });

    win.webContents.send('on_off', 'OFF');
  }
  catch(e) {
    console.log(e);
    console.log('Cannot open port.');
  }
};
// TODO 주석처리한부분 코드 수정하기
ipcMain.on('on_off', (event, arg) =>{
  console.log('on_off');

  // 최초 실행시
  if(sp == undefined) {
    openPort();
    return;
  }
  // PC설정값과 통신설정값이 일치하지 않아서 연결이 안되었거나
  // 유저가 프로그램을 종료했다가 다시 켜는 경우
  if(!sp.isOpen) {
    openPort();
    return;
  }

  // 프로그램 종료
  try {
    // 스트림 모드로 설정
    // 디스플레이 타이머 멈추기
    // 대기시간 타이머 멈추기
    sp.close(function(err){
      if(err) {
        console.log(err.message)
        return;
      }
      console.log('closed');
    });
    // 버튼 ON 표시
    win.webContents.send('on_off', 'ON');

    // 디스플레이부 OFF 표시
    scale.displayMsg = 'off';
    // 상태표시 라벨 초기화
    scale.isStable = false;
    scale.isZero = false;
    scale.isNet = false;
    scale.isHold = false;
    scale.isHg = false;

    scale.unit = 0;

    win.webContents.send('rx_data', scale);
  }
  catch(e) {
    console.log(e);
  }
})

app.whenReady().then(createWindow)

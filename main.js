const { app, BrowserWindow, ipcMain } = require('electron')

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

var sp;
var win;
var settingWin;
var pcSettingWin;
var scale = new scaleFlag();
var pcSetting = new uartFlag('COM1', 24, 7, CONSTANT.PARITY_EVEN, 1, CONSTANT.CRLF);
var basicSetting = new uartFlag();

var createWindow = function() {
  // 브라우저 창을 생성합니다.
  win = new BrowserWindow({
    width: 757,
    height: 400,
    webPreferences: {
      nodeIntegration: true
      // preload: path.join(app.getAppPath(), 'preload.js'),
      // enableRemoteModule: true
    },
    frame: false
  })

  win.loadFile('index.html');
  win.webContents.openDevTools();
}

var openSettingWindow = function() {
  // 브라우저 창을 생성합니다.
  settingWin = new BrowserWindow({
    parent: win,
    width: 757,
    height: 400,
    webPreferences: {
      nodeIntegration: true
    },
    frame: false
  })


  settingWin.loadFile('setting.html');
  settingWin.webContents.openDevTools();

  settingWin.webContents.on('did-finish-load', () => {
    setTimeout(function(){
      getBasicSetting();
    }, 1000);
  })
}

var openPCSettingWindow = function() {
  // 브라우저 창을 생성합니다.
  pcSettingWin = new BrowserWindow({
    parent: win,
    width: 757,
    height: 400,
    webPreferences: {
      nodeIntegration: true
    },
    frame: false
  })

  pcSettingWin.loadFile('pcsetting.html');
  pcSettingWin.webContents.openDevTools();

  // PC설정 화면 로드 완료되면 포트 목록 호출 및 PC설정 데이터 전송
  pcSettingWin.webContents.on('did-finish-load', () => {
    // 포트목록 불러오기
    SerialPort.list().then(
      ports => {
        pcSettingWin.webContents.send('port_list', ports);
        pcSettingWin.webContents.send('get_pc_setting_data', pcSetting)
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
    openSettingWindow();
  });
}

var rssetCommand = function() {
  var command = 'RSSET' + '\r\n';

  scale.f = true;
  sp.write(command, function(err){
    if(err) {
      console.log(err.message)
      basicSetting = new uartFlag();
      settingWin.webContents.send('set_basic_setting_data', 'fail');
      return;
    }
  })
}

//TODO scale의 변수명 수정 및 scale 클래스 추가, makeFormat 함수 만들기
const readHeader = function(rx) {
  // TODO trim을 하는게 맞는건지 판단 필요
  rx = rx.trim();
  const header1bit = rx.substr(0, 1);
  const header2bit = rx.substr(0, 2);
  const header3bit = rx.substr(0, 3);
  const header4bit = rx.substr(0, 4);
  const header5bit = rx.substr(0, 5);

  if(scale.cf &&
    (header1bit == '?') ||
    (header1bit == 'I') ||
    (header2bit == 'CF') ||
    (header2bit == 'CS')) {
      scale.cf = false;
    }
  else if (scale.f &&
    (header1bit == '?') ||
    (header1bit == 'I') ||
    (header1bit == 'F') ||
    (header3bit == 'VER') ||
    (header5bit == 'STOOK') ||
    (header5bit == 'SETOK')) {
      scale.f = false;
      console.log('scalef');

      if(header5bit == 'STOOK') {
        console.log('STOOK');
        rssetCommand();
      }

      if(header5bit == 'SETOK') {
        console.log('SETOK');

        pcSetting.baudrate = basicSetting.baudrate;
        pcSetting.databits = basicSetting.databits;
        pcSetting.parity = basicSetting.parity;
        pcSetting.stopbits = basicSetting.stopbits;
        pcSetting.terminator = basicSetting.terminator;

        settingWin.webContents.send('set_basic_setting_data', 'ok');

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
        if(header4bit == 'F001') {

        }

        if(header4bit == 'F002') {

        }

        if(header4bit == 'F003') {

        }

        if(header4bit == 'F101') {

        }

        if(header4bit == 'F102') {

        }

        if(header4bit == 'F103') {

        }

        if(header4bit == 'F104') {

        }

        if(header4bit == 'F201') {
          console.log('success F201');
          basicSetting.baudrate = data;
        }

        if(header4bit == 'F202') {
          console.log('success F202');
          basicSetting.databits = data;
        }

        if(header4bit == 'F203') {
          console.log('success F203');
          basicSetting.parity = data;
        }

        if(header4bit == 'F204') {
          console.log('success F204');
          basicSetting.stopbits = data;
        }

        if(header4bit == 'F205') {
          console.log('success F205');
          basicSetting.terminator = data;
          console.log(basicSetting);
          settingWin.webContents.send('get_basic_setting_data', basicSetting);
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
  const unit = data.substr(14,3);

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

ipcMain.on('open_pc_setting_window', (event, arg) =>{
  console.log('open_pc_setting_window');
  openPCSettingWindow();
})

ipcMain.on('open_setting_window', (event, arg) =>{
  console.log('open_setting_window');
  setCommandMode();
})

ipcMain.on('set_pc_setting_data', (event, data) => {
  console.log('set_pc_setting_data');
  pcSetting = data;
})

ipcMain.on('set_basic_setting_data', (event, data) => {
  console.log('set_basic_setting_data');
  basicSetting = data;
  setBasicSetting(data);
})

var setBasicSetting = function(data) {
  console.log('set_device_setting');

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
      basicSetting = new uartFlag();
      settingWin.webContents.send('set_basic_setting_data', 'fail');
      return;
    }
  })
}

var getBasicSetting = function() {
  console.log('get_device_setting');


  console.log('get_device_baudrate');
  var command = '?F201' + '\r\n';
  scale.f = true;
  sp.write(command, function(err){
    if(err) {
      console.log(err.message)
      basicSetting = new uartFlag();
      return;
    }
    console.log('get_device_databits');
    command = '?F202' + '\r\n';
    scale.f = true;
    sp.write(command, function(err){
      if(err) {
        console.log(err.message)
        basicSetting = new uartFlag();
        return;
      }
      console.log('get_device_parity');
      command = '?F203' + '\r\n';
      scale.f = true;
      sp.write(command, function(err){
        if(err) {
          console.log(err.message)
          basicSetting = new uartFlag();
          return;
        }
        console.log('get_device_stopbits');
        command = '?F204' + '\r\n';
        scale.f = true;
        sp.write(command, function(err){
          if(err) {
            console.log(err.message)
            basicSetting = new uartFlag();
            return;
          }
          console.log('get_device_terminator');
          command = '?F205' + '\r\n';
          scale.f = true;
          sp.write(command, function(err){
            if(err) {
              console.log(err.message)
              basicSetting = new uartFlag();
              return;
            }
          })
        })
      })
    })
  })

}

ipcMain.on('set_stream_mode', (event, data) => {
  if(sp == undefined) {
    return;
  }
  setStreamMode();
})

ipcMain.on('get_basic_setting_data', (event, data) =>{
  getBasicSetting();
})

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
})

const openPort = function() {
  try {
    sp = new SerialPort(pcSetting.port, {
      baudRate: pcSetting.baudrate * 100,
      dataBits: Number(pcSetting.databits),
      stopBits: Number(pcSetting.stopbits)
    });

    if(pcSetting.parity == CONSTANT.NONE) {
      sp.parity = 'none';
    }
    else if(pcSetting.parity == CONSTANT.ODD) {
      sp.parity = 'odd';
    }
    else if(pcSetting.parity == CONSTANT.EVEN) {
      sp.parity = 'even';
    }

    const lineStream = sp.pipe(new Readline({ delimiter: pcSetting.terminator == CONSTANT.CRLF ? '\r\n' : '\r' }));
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

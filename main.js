const { app, BrowserWindow, ipcMain } = require('electron')

const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline')
const path = require('path');

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
    this.terminator = '\r\n'  // CRLF
    this.block = false

    // 단위 표시
    this.unit = 0

    // 스팬 적용
    this.do_span = false

    // 통신 모드 파악
    this.is_stream_mode = true

    // 통신 설정 모드
    this.is_serial_mode = false

    // 기본 설정 모드
    this.is_basic_mode = false

    // 외부 출력 모드
    this.is_comp_mode = false

    // 교정 모드
    this.is_cal_mode = false

    // 버전
    this.is_ver_mode = false

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

var sp;
var win;
var scale = new scaleFlag();

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

var createSettingWindow = function() {
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
}

// 포트목록 불러오기
SerialPort.list().then(
  ports => ports.forEach(function(item, index, array){
    console.log(item.path)
  })
);

//TODO scale의 변수명 수정 및 scale 클래스 추가, makeFormat 함수 만들기
const readHeader = function(rx) {
  if(rx.length < 16) {
    scale.block = true;
    return;
  }

  const header1bit = rx.substr(0, 1);
  const header2bit = rx.substr(0, 2);
  const header3bit = rx.substr(0, 3);
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
    }
  else {
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

const makeFormat = function(data){
  var result = ''
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
  // TODO 아래 코드 수정해야함.
  createSettingWindow();
})

// TODO 주석처리한부분 코드 수정하기
ipcMain.on('on_off', (event, arg) =>{
  console.log('on_off');

  // 최초 실행시
  if(sp == undefined) {
    sp = new SerialPort('COM3',{
      baudRate: 4800,
      parity: 'none',
      dataBits: 8,
      stopBits: 1
    });
    const lineStream = sp.pipe(new Readline({ delimiter: '\r\n' }));
    lineStream.on('data', function(rx) {
      readHeader(rx);
      win.webContents.send('rx_data', scale)
    })
    win.webContents.send('on_off', 'OFF');
    return;
  }

  if(!sp.isOpen) {
    try {
      sp.open();
      // scale.displayMsg = '';
      // scale.block = true;
      // scale.waitingSec = 0;

      // 대기시간 타이머 시작
      // 디스플레이 타이머 시작

      // 스트림 모드 날리기

      const lineStream = sp.pipe(new Readline({ delimiter: '\r\n' }));
      lineStream.on('data', function(rx) {
        readHeader(rx);
        win.webContents.send('rx_data', scale)
      })
      // 버튼 OFF 표시
      win.webContents.send('on_off', 'OFF');
      return;
    }
    catch(e) {
      console.log(e);
      console.log('Can not open port');
    }
  }

  // 열려있으면 닫기
  if(sp.isOpen) {
    try {
      // 스트림 모드로 설정
      // 디스플레이 타이머 멈추기
      // 대기시간 타이머 멈추기
      sp.close();
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

    }
  }
})

app.whenReady().then(createWindow)

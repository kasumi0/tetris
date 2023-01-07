const field_col = 10,
  field_row = 20,
  block_size = 30,
  screen_w = block_size * field_col,
  screen_h = block_size * field_row,
  tetro_size = 4;
let game_speed = 700,
  speed = 100;
let can = document.getElementById('can'),
  con = can.getContext('2d');
let pause = document.getElementById('pause');
let reload = document.getElementById('reload');
let interval;
let playFlag = true;

can.width = 640;
can.height = 640;
can.style.border = '4px solid #555';

const tetro_types = [
  [],
  [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ],
  [
    [0, 1, 0, 0],
    [0, 1, 0, 0],
    [0, 1, 1, 0],
    [0, 0, 0, 0]
  ],
  [
    [0, 0, 1, 0],
    [0, 0, 1, 0],
    [0, 1, 1, 0],
    [0, 0, 0, 0]
  ],
  [
    [0, 1, 0, 0],
    [0, 1, 1, 0],
    [0, 1, 0, 0],
    [0, 0, 0, 0]
  ],
  [
    [0, 0, 0, 0],
    [0, 1, 1, 0],
    [0, 1, 1, 0],
    [0, 0, 0, 0]
  ],
  [
    [0, 0, 0, 0],
    [1, 1, 0, 0],
    [0, 1, 1, 0],
    [0, 0, 0, 0]
  ],
  [
    [0, 0, 0, 0],
    [0, 1, 1, 0],
    [1, 1, 0, 0],
    [0, 0, 0, 0]
  ]
];

let bgimage;
bgimage = new Image();
bgimage.src = '../img/img_1.png';
let blimage;
blimage = new Image();
blimage.src = '../img/block.png';
let bgm, se1, se2, se3;
bgm = new Audio('../se/bgm.mp3');
se1 = new Audio('../se/se1.mp3');
se2 = new Audio('../se/se2.mp3');
se3 = new Audio('../se/se3.mp3');

let voices = [];
for (let lv = 0; lv < 5; lv++) {
  voices[lv] = [];
  for (vo = 0; vo < 3; vo++) {
    voices[lv][vo] = new Audio(`../se/voices/Lv${lv + 1}-${vo + 1}.mp3`);
  }
}

const start_x = field_col / 2 - tetro_size / 2;
const start_y = 0;

let tetro;
let tetro_x = start_x,
  tetro_y = start_y;
let tetro_t;
let tetro_n;
let field = [];
let over = false;
let lines = 0;
let score = 0;
let lv = 0;
let max_lv = 4;
const offset_x = 40;
const offset_y = 20;

init();

function init() {
  for (let y = 0; y < field_row; y++) {
    field[y] = [];
    for (let x = 0; x < field_col; x++) {
      field[y][x] = 0;
    }
  }
  tetro_n = Math.floor(Math.random() * (tetro_types.length - 1)) + 1;
  setTetro();
  drawAll();
  onClearInterval();
  onSetInterval();
}

function setTetro() {
  tetro_t = tetro_n;
  tetro = tetro_types[tetro_t];
  tetro_n = Math.floor(Math.random() * (tetro_types.length - 1)) + 1;
  tetro_x = start_x;
  tetro_y = start_y;
}

function drawBlock(x, y, c) {
  let px = offset_x + x * block_size,
    py = offset_y + y * block_size;
  con.drawImage(blimage, c * block_size, 0, block_size, block_size, px, py, block_size, block_size);
}

function drawAll() {
  con.drawImage(bgimage, 0, 0);
  con.strokeStyle = 'rgba(80, 160, 255, .1)';
  con.strokeRect(offset_x - 6, offset_y - 6, screen_w + 12, screen_h + 12);
  con.strokeStyle = 'rgba(80, 160, 255, .5)';
  con.strokeRect(offset_x - 2, offset_y - 2, screen_w + 4, screen_h + 4);
  con.fillStyle = 'rgba(0, 0, 0, .4)';
  con.fillRect(offset_x, offset_y, screen_w, screen_h);

  for (let y = 0; y < field_row; y++) {
    for (let x = 0; x < field_col; x++) {
      if (field[y][x]) {
        drawBlock(x, y, field[y][x]);
      }
    }
  }

  let plus = 0;
  while (checkMove(0, plus + 1)) plus++;
  for (let y = 0; y < tetro_size; y++) {
    for (let x = 0; x < tetro_size; x++) {
      if (tetro[y][x]) {
        drawBlock(tetro_x + x, tetro_y + y + plus, 0);
        drawBlock(tetro_x + x, tetro_y + y, tetro_t);
      }
      if (tetro_types[tetro_n][y][x]) {
        drawBlock(13 + x, 3 + y, tetro_n);
      }
    }
  }
  drawInfo();
}

function getVoiceVolumeByScore(score) {
  if (score < 2000) return 0;
  const d = Math.pow(1500, 2) - 4 * 500 * -score;
  const x1 = (-1500 + Math.sqrt(d)) / (2 * 500);
  return Math.floor(x1);
}

function playVoice() {
  lv = getVoiceVolumeByScore(score);
  vo_t = Math.floor(Math.random() * 3);
  voices[lv][vo_t].play();
}

function drawInfo() {
  let w;
  con.fillStyle = 'white';
  let str = 'NEXT';
  con.font = '40px "Turret Road light"';
  con.fillText(str, 410, 90);

  str = 'SCORE';
  con.font = '40px "Turret Road light"';
  con.fillText(str, 410, 285);
  str = `${score}`;
  w = con.measureText(str).width;
  con.fillText(str, 560 - w, 330);

  str = 'LINES';
  con.font = '40px "Turret Road light"';
  con.fillText(str, 410, 405);
  str = `${lines}`;
  w = con.measureText(str).width;
  con.fillText(str, 560 - w, 450);

  str = 'LEVEL';
  con.font = '40px "Turret Road light"';
  con.fillText(str, 410, 525);
  lv = getVoiceVolumeByScore(score) + 1;
  if (lv > max_lv + 1) str = 'Excellent!!';
  else str = `${lv}`;
  w = con.measureText(str).width;
  con.fillText(str, 560 - w, 580);

  if (over) {
    str = 'GAME OVER';
    con.font = "50px 'Turret Road medium'";
    w = con.measureText(str).width;
    let x = screen_w / 2 - w / 2;
    let y = screen_h / 2 - 20;
    con.lineWidth = 10;
    con.strokeText(str, offset_x + x, y);
    con.fillStyle = 'white';
    con.fillText(str, offset_x + x, y);

    bgm.pause();
    if (getVoiceVolumeByScore(score) <= max_lv) playVoice();
    else {
      can.remove();
      const container = document.getElementById('container');
      const video = container.insertAdjacentHTML(
        'afterbegin',
        '<video src="celebration.mov" autoplay class="mov"></video>'
      );
    }
  }
}

function checkMove(mx, my, ntetro) {
  if (ntetro == undefined) ntetro = tetro;
  for (let y = 0; y < tetro_size; y++) {
    for (let x = 0; x < tetro_size; x++) {
      if (ntetro[y][x]) {
        let nx = tetro_x + mx + x,
          ny = tetro_y + my + y;
        if (nx < 0 || ny >= field_row || nx >= field_col || field[ny][nx]) {
          return false;
        }
      }
    }
  }
  return true;
}

function rotate() {
  let ntetro = [];
  for (let y = 0; y < tetro_size; y++) {
    ntetro[y] = [];
    for (let x = 0; x < tetro_size; x++) {
      ntetro[y][x] = tetro[tetro_size - x - 1][y];
    }
  }
  return ntetro;
}

function fixTetro() {
  for (let y = 0; y < tetro_size; y++) {
    for (let x = 0; x < tetro_size; x++) {
      if (tetro[y][x]) {
        se1.play();
        field[tetro_y + y][tetro_x + x] = tetro_t;
      }
    }
  }
}

function onClearInterval() {
  clearInterval(interval);
}

function onSetInterval() {
  interval = setInterval(dropTetro, game_speed - speed);
}

function dropTetro() {
  if (over) return;
  bgm.play();
  bgm.loop = true;
  if (checkMove(0, 1)) tetro_y++;
  else {
    fixTetro();
    checkLine();
    setTetro();
    if (!checkMove(0, 0)) {
      over = true;
    }
  }
  drawAll();
}

function pauseScreen() {
  const container = document.getElementById('container');
  container.insertAdjacentHTML('beforeend', '<div class="pause-screen" id="pause-screen"></div>');
  container.insertAdjacentHTML('beforeend', '<i class="fa-regular fa-circle-pause flash" id="flash-icon"></i>');
}

pause.onclick = () => {
  if (over) return;
  const ps_btn = document.getElementById('ps-btn');
  onClearInterval();
  if (playFlag) {
    bgm.pause();
    pauseScreen();
  } else {
    onSetInterval();
    document.getElementById('pause-screen').remove();
    document.getElementById('flash-icon').remove();
  }
  ps_btn.classList.replace(
    playFlag ? 'fa-circle-pause' : 'fa-circle-play',
    playFlag ? 'fa-circle-play' : 'fa-circle-pause'
  );
  playFlag = !playFlag;
};

reload.onclick = () => {
  location.reload();
};

function checkLine() {
  let linec = 0;
  for (let y = 0; y < field_row; y++) {
    let flag = true;
    for (let x = 0; x < field_col; x++) {
      if (!field[y][x]) {
        flag = false;
        break;
      }
    }
    if (flag) {
      linec++;
      for (let ny = y; ny > 0; ny--) {
        for (let nx = 0; nx < field_col; nx++) {
          field[ny][nx] = field[ny - 1][nx];
        }
      }
    }
  }
  if (linec) {
    se2.play();
    lines += linec;
    score += 100 * 2 ** (linec - 1);
    if (speed < game_speed - 10) speed += 10;
  }
}

document.onkeydown = function (e) {
  if (over) return;
  switch (e.code) {
    case 'ArrowUp':
      //if (checkMove(0, -1)) tetro_y--;
      break;
    case 'ArrowDown':
      while (checkMove(0, 1)) tetro_y++;
      break;
    case 'ArrowRight':
      if (checkMove(1, 0)) tetro_x++;
      break;
    case 'ArrowLeft':
      if (checkMove(-1, 0)) tetro_x--;
      break;
    case 'Space':
      let ntetro = rotate();
      if (checkMove(0, 0, tetro)) {
        se3.pause();
        se3.play();
        tetro = ntetro;
      }
      break;
  }
  drawAll();
};

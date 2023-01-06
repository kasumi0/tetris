const field_col = 10,
  field_row = 20,
  block_size = 30,
  screen_w = block_size * field_col,
  screen_h = block_size * field_row,
  tetro_size = 4,
  game_speed = 500;

let can = document.getElementById('can'),
  con = can.getContext('2d');

can.width = screen_w;
can.height = screen_h;
can.style.border = '4px solid #555';

const tetro_colors = ['#000', '#6cf', '#f92', '#66f', '#c5c', '#fd2', '#f44', '#5b5'];

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

const start_x = field_col / 2 - tetro_size / 2;
const start_y = 0;

let tetro;
let tetro_x = start_x,
  tetro_y = start_y;
let tetro_t;
let field = [];
let over = false;

tetro_t = Math.floor(Math.random() * (tetro_types.length - 1)) + 1;
tetro = tetro_types[tetro_t];

const init = () => {
  for (let y = 0; y < field_row; y++) {
    field[y] = [];
    for (let x = 0; x < field_col; x++) {
      field[y][x] = 0;
    }
  }
};

init();

const drawBlock = (x, y, c) => {
  let px = x * block_size,
    py = y * block_size;
  con.fillStyle = tetro_colors[c];
  con.fillRect(px, py, block_size, block_size);
  con.strokeStyle = 'black';
  con.strokeRect(px, py, block_size, block_size);
};

const drawAll = () => {
  con.clearRect(0, 0, screen_w, screen_h);
  for (let y = 0; y < field_row; y++) {
    for (let x = 0; x < field_col; x++) {
      if (field[y][x]) {
        drawBlock(x, y, field[y][x]);
      }
    }
  }
  for (let y = 0; y < tetro_size; y++) {
    for (let x = 0; x < tetro_size; x++) {
      if (tetro[y][x]) {
        drawBlock(tetro_x + x, tetro_y + y, tetro_t);
      }
    }
  }
  if (over) {
    let str = 'GAME OVER';
    con.font = "40px 'ヒラギノ角ゴ'";
    let w = con.measureText(str).width;
    let x = screen_w / 2 - w / 2;
    let y = screen_h / 2 - 20;
    con.lineWidth = 4;
    con.strokeText(str, x, y);
    con.fillStyle = 'white';
    con.fillText(str, x, y);
  }
};

drawAll();

const checkMove = (mx, my, ntetro) => {
  if (ntetro == undefined) ntetro = tetro;
  for (let y = 0; y < tetro_size; y++) {
    for (let x = 0; x < tetro_size; x++) {
      if (ntetro[y][x]) {
        let nx = tetro_x + mx + x,
          ny = tetro_y + my + y;
        if (ny < 0 || nx < 0 || ny >= field_row || nx >= field_col || field[ny][nx]) {
          return false;
        }
      }
    }
  }
  return true;
};

const rotate = () => {
  let ntetro = [];
  for (let y = 0; y < tetro_size; y++) {
    ntetro[y] = [];
    for (let x = 0; x < tetro_size; x++) {
      ntetro[y][x] = tetro[tetro_size - x - 1][y];
    }
  }
  return ntetro;
};

const fixTetro = () => {
  for (let y = 0; y < tetro_size; y++) {
    for (let x = 0; x < tetro_size; x++) {
      if (tetro[y][x]) {
        field[tetro_y + y][tetro_x + x] = tetro_t;
      }
    }
  }
};

const checkLine = () => {
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
};

const dropTetro = () => {
  if (over) return;
  if (checkMove(0, 1)) tetro_y++;
  else {
    fixTetro();
    checkLine();
    tetro_t = Math.floor(Math.random() * (tetro_types.length - 1)) + 1;
    tetro = tetro_types[tetro_t];
    tetro_x = start_x;
    tetro_y = start_y;

    if (!checkMove(0, 0)) {
      over = true;
    }
  }
  drawAll();
};

setInterval(dropTetro, game_speed);

onkeydown = (e) => {
  if (over) return;
  switch (e.code) {
    case 'ArrowUp':
      if (checkMove(0, -1)) tetro_y--;
      break;
    case 'ArrowDown':
      if (checkMove(0, 1)) tetro_y++;
      break;
    case 'ArrowRight':
      if (checkMove(1, 0)) tetro_x++;
      break;
    case 'ArrowLeft':
      if (checkMove(-1, 0)) tetro_x--;
      break;
    case 'Space':
      let ntetro = rotate();
      if (checkMove(0, 0, ntetro)) tetro = ntetro;
      break;
  }
  drawAll();
};

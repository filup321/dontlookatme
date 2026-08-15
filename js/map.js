// Valladolid overworld: tile grid, buildings, movement, rendering.

const TILE = 16;
const GRID_COLS = 10; // 160px / 16
const GRID_ROWS = 9; // 144px / 16

const BUILDINGS = [
  {
    id: 'Colegio_de_San_Nicolas',
    label: 'Colegio de San Nicolás',
    cols: [4, 5, 6],
    rows: [0, 1],
    door: { col: 5, row: 2 },
  },
  {
    id: 'El_Mercado',
    label: 'El Mercado',
    cols: [0, 1, 2],
    rows: [3, 4],
    door: { col: 1, row: 5 },
  },
  {
    id: 'La_Cantina',
    label: 'La Cantina',
    cols: [7, 8, 9],
    rows: [3, 4],
    door: { col: 8, row: 5 },
  },
];

const MapScreen = (() => {
  let ctx = null;
  let onEnterBuilding = () => {};
  let moveCooldown = false;

  function init(canvas, labelContainer, callbacks) {
    ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    onEnterBuilding = callbacks.onEnterBuilding || onEnterBuilding;
    window.addEventListener('keydown', handleKeydown);
    buildLabels(labelContainer);
  }

  function buildLabels(labelContainer) {
    BUILDINGS.forEach((b) => {
      const minCol = Math.min(...b.cols);
      const w = b.cols.length * TILE;
      const centerX = minCol * TILE + w / 2;
      const labelY = b.door.row * TILE + TILE + 8;

      const el = document.createElement('div');
      el.className = 'map-label';
      el.textContent = b.label;
      el.style.left = `${(centerX / (GRID_COLS * TILE)) * 100}%`;
      el.style.top = `${(labelY / (GRID_ROWS * TILE)) * 100}%`;
      labelContainer.appendChild(el);
    });
  }

  function buildingAt(col, row) {
    return BUILDINGS.find((b) => b.cols.includes(col) && b.rows.includes(row));
  }

  function isDoor(building, col, row) {
    return building.door.col === col && building.door.row === row;
  }

  function handleKeydown(e) {
    let dCol = 0, dRow = 0, dir = GameState.player.dir;
    if (e.key === 'ArrowUp' || e.key === 'w') { dRow = -1; dir = 'up'; }
    else if (e.key === 'ArrowDown' || e.key === 's') { dRow = 1; dir = 'down'; }
    else if (e.key === 'ArrowLeft' || e.key === 'a') { dCol = -1; dir = 'left'; }
    else if (e.key === 'ArrowRight' || e.key === 'd') { dCol = 1; dir = 'right'; }
    else return;

    e.preventDefault();
    attemptMove(dCol, dRow, dir);
  }

  const DIR_DELTAS = {
    up: { dCol: 0, dRow: -1 },
    down: { dCol: 0, dRow: 1 },
    left: { dCol: -1, dRow: 0 },
    right: { dCol: 1, dRow: 0 },
  };

  function move(dir) {
    const delta = DIR_DELTAS[dir];
    if (!delta) return;
    attemptMove(delta.dCol, delta.dRow, dir);
  }

  function attemptMove(dCol, dRow, dir) {
    if (GameState.screen !== 'map' || GameState.dialogue) return;

    GameState.player.dir = dir;
    if (moveCooldown) return;

    const targetCol = GameState.player.col + dCol;
    const targetRow = GameState.player.row + dRow;
    if (targetCol < 0 || targetCol >= GRID_COLS || targetRow < 0 || targetRow >= GRID_ROWS) {
      draw();
      return;
    }

    const doorBuilding = BUILDINGS.find((b) => isDoor(b, targetCol, targetRow));
    if (doorBuilding) {
      onEnterBuilding(doorBuilding.id);
      draw();
      return;
    }

    const building = buildingAt(targetCol, targetRow);
    if (building) {
      draw();
      return;
    }

    GameState.player.col = targetCol;
    GameState.player.row = targetRow;
    moveCooldown = true;
    setTimeout(() => { moveCooldown = false; }, 120);
    draw();
  }

  function drawGround() {
    for (let row = 0; row < GRID_ROWS; row += 1) {
      for (let col = 0; col < GRID_COLS; col += 1) {
        const light = (col + row) % 2 === 0;
        ctx.fillStyle = light ? '#5a8f4a' : '#4f7f41';
        ctx.fillRect(col * TILE, row * TILE, TILE, TILE);
      }
    }
  }

  function rectsAt(x, y, rects) {
    rects.forEach(([dx, dy, w, h, color]) => {
      ctx.fillStyle = color;
      ctx.fillRect(x + dx, y + dy, w, h);
    });
  }

  function drawColegio(x, y) {
    rectsAt(x, y, [
      [22, 0, 4, 3, '#c9a227'],
      [18, 3, 12, 7, '#7a8fa6'],
      [20, 3, 2, 7, '#95a8bb'],
      [4, 10, 40, 6, '#8b5a2b'],
      [14, 10, 20, 2, '#e8dcc0'],
      [4, 16, 40, 18, '#c9a86a'],
      [8, 16, 3, 18, '#f8f4e3'],
      [18, 16, 3, 18, '#f8f4e3'],
      [27, 16, 3, 18, '#f8f4e3'],
      [37, 16, 3, 18, '#f8f4e3'],
      [2, 34, 44, 3, '#d9d2b8'],
      [0, 37, 48, 3, '#c2baa0'],
      [4, 40, 16, 8, '#c9a86a'],
      [28, 40, 16, 8, '#c9a86a'],
      [20, 40, 8, 8, '#3b2a1a'],
    ]);
  }

  function drawCantina(x, y) {
    rectsAt(x, y, [
      [2, 0, 44, 9, '#7a2323'],
      [2, 2, 44, 1, '#9c4040'],
      [2, 5, 44, 1, '#9c4040'],
      [0, 9, 48, 1, '#5a1a1a'],
      [4, 10, 40, 16, '#c9967a'],
      [10, 13, 6, 3, '#2a1f1f'],
      [12, 11, 2, 2, '#2a1f1f'],
      [32, 13, 6, 3, '#2a1f1f'],
      [34, 11, 2, 2, '#2a1f1f'],
      [4, 16, 40, 1, '#1a1a1a'],
      [4, 16, 1, 8, '#1a1a1a'],
      [43, 16, 1, 8, '#1a1a1a'],
      [8, 17, 1, 7, '#1a1a1a'],
      [14, 17, 1, 7, '#1a1a1a'],
      [20, 17, 1, 7, '#1a1a1a'],
      [27, 17, 1, 7, '#1a1a1a'],
      [33, 17, 1, 7, '#1a1a1a'],
      [39, 17, 1, 7, '#1a1a1a'],
      [7, 21, 2, 2, '#e8b800'],
      [39, 21, 2, 2, '#e8b800'],
      [4, 26, 40, 14, '#c9967a'],
      [18, 26, 12, 2, '#3b2a1a'],
      [19, 28, 10, 12, '#3b2a1a'],
      [0, 40, 48, 8, '#5a1a1a'],
      [19, 40, 10, 8, '#2a1010'],
    ]);
  }

  function drawMercado(x, y) {
    rectsAt(x, y, [
      [0, 2, 48, 8, '#a85c2a'],
      [0, 4, 48, 1, '#c07840'],
      [0, 7, 48, 1, '#c07840'],
      [8, 0, 6, 2, '#a85c2a'],
      [34, 0, 6, 2, '#a85c2a'],
      [0, 10, 48, 4, '#1f3a5f'],
      [2, 14, 44, 24, '#f2ecd8'],
      [8, 18, 6, 3, '#2a2a2a'],
      [10, 16, 2, 2, '#2a2a2a'],
      [34, 18, 6, 3, '#2a2a2a'],
      [36, 16, 2, 2, '#2a2a2a'],
      [16, 24, 16, 2, '#1f3a5f'],
      [18, 26, 12, 12, '#3b2a1a'],
      [20, 26, 2, 2, '#f2ecd8'],
      [26, 26, 2, 2, '#f2ecd8'],
      [0, 38, 48, 10, '#d9d2b8'],
      [18, 38, 12, 10, '#3b2a1a'],
    ]);
  }

  const BUILDING_PAINTERS = {
    Colegio_de_San_Nicolas: drawColegio,
    El_Mercado: drawMercado,
    La_Cantina: drawCantina,
  };

  function drawBuilding(b) {
    const minCol = Math.min(...b.cols);
    const minRow = Math.min(...b.rows);
    BUILDING_PAINTERS[b.id](minCol * TILE, minRow * TILE);
  }

  function drawPlayer() {
    const x = GameState.player.col * TILE;
    const y = GameState.player.row * TILE;
    const HAT_CROWN = '#8a5a4a';
    const HAT_BRIM = '#5a3a3a';
    const HAT_BAND = '#2f4f7a';
    const SKIN = '#f0c090';
    const EYE = '#2f4f7a';
    const SCARF = '#c1502e';
    const SHIRT = '#6b3f3f';
    const PANTS = '#b89b72';
    const BOOTS = '#4a3222';
    const OUTLINE = '#1a1a1a';

    rectsAt(x, y, [
      [6, 0, 4, 1, HAT_CROWN],
      [5, 1, 6, 1, HAT_CROWN],
      [3, 1, 2, 1, HAT_BRIM],
      [11, 1, 2, 1, HAT_BRIM],
      [3, 2, 10, 1, HAT_BAND],
      [1, 3, 14, 1, HAT_BRIM],
      [3, 4, 2, 1, HAT_BRIM],
      [5, 4, 6, 1, SKIN],
      [11, 4, 2, 1, HAT_BRIM],
      [3, 5, 2, 1, HAT_BRIM],
      [5, 5, 6, 1, SKIN],
      [11, 5, 2, 1, HAT_BRIM],
      [3, 6, 2, 1, HAT_BRIM],
      [5, 6, 6, 1, SKIN],
      [11, 6, 2, 1, HAT_BRIM],
      [4, 7, 8, 1, SKIN],
      [4, 8, 8, 1, SCARF],
      [4, 9, 8, 2, SHIRT],
      [4, 9, 1, 2, OUTLINE],
      [11, 9, 1, 2, OUTLINE],
      [5, 11, 6, 2, PANTS],
      [4, 13, 3, 2, BOOTS],
      [9, 13, 3, 2, BOOTS],
    ]);

    // Eyes indicate facing; 'up' shows the back of the hat (no eyes).
    if (GameState.player.dir === 'down') {
      rectsAt(x, y, [[6, 5, 1, 1, EYE], [9, 5, 1, 1, EYE]]);
    } else if (GameState.player.dir === 'left') {
      rectsAt(x, y, [[6, 5, 1, 1, EYE]]);
    } else if (GameState.player.dir === 'right') {
      rectsAt(x, y, [[9, 5, 1, 1, EYE]]);
    }
  }

  function draw() {
    if (!ctx) return;
    drawGround();
    BUILDINGS.forEach(drawBuilding);
    drawPlayer();
  }

  return { init, draw, move };
})();

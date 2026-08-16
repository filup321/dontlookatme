// Overworld: tile grid, buildings, movement, rendering. Supports multiple maps (Valladolid, Veracruz).

const TILE = 16;
const GRID_COLS = 10; // 160px / 16
const GRID_ROWS = 9; // 144px / 16

function rectsAt(ctx, x, y, rects) {
  rects.forEach(([dx, dy, w, h, color]) => {
    ctx.fillStyle = color;
    ctx.fillRect(x + dx, y + dy, w, h);
  });
}

function scaledRectsAt(ctx, x, y, rects, scale, pivotX, pivotY) {
  rects.forEach(([dx, dy, w, h, color]) => {
    ctx.fillStyle = color;
    ctx.fillRect(
      x + pivotX + (dx - pivotX) * scale,
      y + pivotY + (dy - pivotY) * scale,
      w * scale,
      h * scale
    );
  });
}

// ---- Valladolid buildings ----

function drawColegio(ctx, x, y) {
  rectsAt(ctx, x, y, [
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

function drawCantina(ctx, x, y) {
  rectsAt(ctx, x, y, [
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

function drawMercado(ctx, x, y) {
  rectsAt(ctx, x, y, [
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

// ---- Veracruz buildings ----

function drawIglesia(ctx, x, y) {
  rectsAt(ctx, x, y, [
    [3, 0, 5, 2, '#c9776a'],
    [40, 0, 5, 2, '#c9776a'],
    [1, 2, 9, 3, '#c9776a'],
    [38, 2, 9, 3, '#c9776a'],
    [6, 0, 1, 2, '#3a2a2a'],
    [41, 0, 1, 2, '#3a2a2a'],
    [5, 1, 3, 1, '#3a2a2a'],
    [40, 1, 3, 1, '#3a2a2a'],
    [2, 5, 7, 11, '#f2ead8'],
    [39, 5, 7, 11, '#f2ead8'],
    [4, 8, 3, 4, '#8a5a5a'],
    [41, 8, 3, 4, '#8a5a5a'],
    [5, 9, 1, 2, '#2a1a1a'],
    [42, 9, 1, 2, '#2a1a1a'],
    [20, 4, 8, 4, '#f2ead8'],
    [16, 8, 16, 5, '#f2ead8'],
    [12, 12, 24, 1, '#a85c2a'],
    [9, 13, 30, 3, '#f2ead8'],
    [9, 15, 30, 1, '#c98a8a'],
    [23, 0, 2, 7, '#c9a227'],
    [21, 2, 6, 2, '#c9a227'],
    [9, 16, 30, 18, '#f2ead8'],
    [13, 18, 3, 18, '#c98a8a'],
    [32, 18, 3, 18, '#c98a8a'],
    [22, 20, 4, 4, '#e8d8c0'],
    [2, 34, 44, 3, '#d9d2b8'],
    [0, 37, 48, 3, '#c2baa0'],
    [4, 40, 16, 8, '#f2ead8'],
    [28, 40, 16, 8, '#f2ead8'],
    [20, 40, 8, 8, '#3b2a1a'],
  ]);
}

function drawPlaza(ctx, x, y) {
  rectsAt(ctx, x, y, [
    [0, 0, 48, 48, '#b8b0a0'],
    [22, 0, 4, 48, '#a89f8a'],
    [0, 20, 48, 4, '#a89f8a'],
    [20, 14, 8, 8, '#5a8fae'],
    [22, 15, 4, 4, '#8fc4de'],
    [2, 3, 3, 11, '#3a5a2a'],
    [43, 3, 3, 11, '#3a5a2a'],
    [18, 38, 12, 10, '#a89f8a'],
  ]);
}

function drawPuerto(ctx, x, y) {
  scaledRectsAt(ctx, x, y, [
    [0, 0, 48, 8, '#5a4632'],
    [0, 3, 48, 1, '#6a5642'],
    [0, 8, 48, 2, '#1f3a5f'],
    [2, 10, 44, 16, '#8a6a4a'],
    [2, 14, 44, 1, '#7a5a3a'],
    [2, 18, 44, 1, '#7a5a3a'],
    [2, 22, 44, 1, '#7a5a3a'],
    [4, 20, 5, 6, '#6b4a2a'],
    [38, 20, 5, 6, '#6b4a2a'],
    [2, 26, 44, 14, '#8a6a4a'],
    [18, 26, 12, 2, '#3b2a1a'],
    [19, 28, 10, 12, '#3b2a1a'],
    [0, 40, 48, 8, '#4a3a28'],
    [19, 40, 10, 8, '#2a1a10'],
  ], 0.75, 24, 24);
}

function drawShip(ctx, x, y) {
  scaledRectsAt(ctx, x, y, [
    [3, 10, 10, 3, '#8a6a4a'],
    [4, 12, 8, 1, '#1f3a5f'],
    [7, 3, 1, 8, '#4a3a28'],
    [4, 4, 3, 5, '#f2ead8'],
    [8, 5, 4, 4, '#f2ead8'],
  ], 1.5, 8, 8);
}

// ---- Ground painters ----

function drawGrassGround(ctx) {
  for (let row = 0; row < GRID_ROWS; row += 1) {
    for (let col = 0; col < GRID_COLS; col += 1) {
      const light = (col + row) % 2 === 0;
      ctx.fillStyle = light ? '#5a8f4a' : '#4f7f41';
      ctx.fillRect(col * TILE, row * TILE, TILE, TILE);
    }
  }
}

function isVeracruzWater(col, row) {
  return (col - row) >= 5;
}

function drawSandWaterGround(ctx) {
  for (let row = 0; row < GRID_ROWS; row += 1) {
    for (let col = 0; col < GRID_COLS; col += 1) {
      const light = (col + row) % 2 === 0;
      if (isVeracruzWater(col, row)) {
        ctx.fillStyle = light ? '#3f7bab' : '#356a92';
      } else {
        ctx.fillStyle = light ? '#d9bd82' : '#cdae6c';
      }
      ctx.fillRect(col * TILE, row * TILE, TILE, TILE);
    }
  }
}

// ---- Map definitions ----

const MAPS = {
  valladolid: {
    playerStart: { col: 5, row: 7 },
    drawGround: drawGrassGround,
    isTerrainBlocked: () => false,
    decorations: [],
    buildings: [
      {
        id: 'Colegio_de_San_Nicolas',
        label: 'Colegio de San Nicolás',
        cols: [4, 5, 6],
        rows: [0, 1],
        door: { col: 5, row: 2 },
        paint: drawColegio,
      },
      {
        id: 'El_Mercado',
        label: 'El Mercado',
        cols: [0, 1, 2],
        rows: [3, 4],
        door: { col: 1, row: 5 },
        paint: drawMercado,
      },
      {
        id: 'La_Cantina',
        label: 'La Cantina',
        cols: [7, 8, 9],
        rows: [3, 4],
        door: { col: 8, row: 5 },
        paint: drawCantina,
      },
    ],
  },
  veracruz: {
    playerStart: { col: 8, row: 7 },
    drawGround: drawSandWaterGround,
    isTerrainBlocked: isVeracruzWater,
    decorations: [
      { paint: drawShip, x: 8 * TILE, y: 1 * TILE },
    ],
    buildings: [
      {
        id: 'La_Iglesia',
        label: 'Iglesia',
        cols: [0, 1, 2],
        rows: [0, 1],
        door: { col: 1, row: 2 },
        paint: drawIglesia,
      },
      {
        id: 'La_Plaza',
        label: 'La Plaza',
        cols: [0, 1, 2],
        rows: [6, 7],
        door: { col: 1, row: 8 },
        paint: drawPlaza,
        blocking: false,
        labelSide: 'above',
      },
      {
        id: 'Puerto_de_Veracruz',
        label: 'Puerto de Veracruz',
        cols: [6, 7, 8],
        rows: [3, 4],
        door: { col: 7, row: 5 },
        paint: drawPuerto,
      },
    ],
  },
};

const MapScreen = (() => {
  let ctx = null;
  let labelContainer = null;
  let onEnterBuilding = () => {};
  let moveCooldown = false;
  let currentMapId = null;

  function init(canvas, labelEl, callbacks) {
    ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    labelContainer = labelEl;
    onEnterBuilding = callbacks.onEnterBuilding || onEnterBuilding;
    window.addEventListener('keydown', handleKeydown);
  }

  function currentMap() {
    return MAPS[currentMapId];
  }

  function loadMap(mapId) {
    currentMapId = mapId;
    const map = MAPS[mapId];
    GameState.currentMap = mapId;
    GameState.player.col = map.playerStart.col;
    GameState.player.row = map.playerStart.row;
    GameState.player.dir = 'down';
    buildLabels(map);
    draw();
  }

  function buildLabels(map) {
    labelContainer.innerHTML = '';
    map.buildings.forEach((b) => {
      const minCol = Math.min(...b.cols);
      const minRow = Math.min(...b.rows);
      const w = b.cols.length * TILE;
      const centerX = minCol * TILE + w / 2;
      const labelY = b.labelSide === 'above'
        ? minRow * TILE - 8
        : b.door.row * TILE + TILE + 8;

      const el = document.createElement('div');
      el.className = 'map-label';
      el.textContent = b.label;
      el.style.left = `${(centerX / (GRID_COLS * TILE)) * 100}%`;
      el.style.top = `${(labelY / (GRID_ROWS * TILE)) * 100}%`;
      labelContainer.appendChild(el);
    });
  }

  function buildingAt(map, col, row) {
    return map.buildings.find((b) => b.cols.includes(col) && b.rows.includes(row));
  }

  function isDoor(building, col, row) {
    return building.door.col === col && building.door.row === row;
  }

  function handleKeydown(e) {
    if (GameState.screen !== 'map' || GameState.dialogue) return;
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

    const map = currentMap();

    const doorBuilding = map.buildings.find((b) => isDoor(b, targetCol, targetRow));
    if (doorBuilding) {
      onEnterBuilding(doorBuilding.id);
      draw();
      return;
    }

    const building = buildingAt(map, targetCol, targetRow);
    if (building && building.blocking !== false) {
      draw();
      return;
    }

    if (!building && map.isTerrainBlocked(targetCol, targetRow)) {
      draw();
      return;
    }

    GameState.player.col = targetCol;
    GameState.player.row = targetRow;
    moveCooldown = true;
    setTimeout(() => { moveCooldown = false; }, 120);
    draw();
  }

  function drawBuilding(b) {
    const minCol = Math.min(...b.cols);
    const minRow = Math.min(...b.rows);
    b.paint(ctx, minCol * TILE, minRow * TILE);
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

    rectsAt(ctx, x, y, [
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
      rectsAt(ctx, x, y, [[6, 5, 1, 1, EYE], [9, 5, 1, 1, EYE]]);
    } else if (GameState.player.dir === 'left') {
      rectsAt(ctx, x, y, [[6, 5, 1, 1, EYE]]);
    } else if (GameState.player.dir === 'right') {
      rectsAt(ctx, x, y, [[9, 5, 1, 1, EYE]]);
    }
  }

  function draw() {
    if (!ctx || !currentMapId) return;
    const map = currentMap();
    map.drawGround(ctx);
    map.decorations.forEach((d) => d.paint(ctx, d.x, d.y));
    map.buildings.forEach(drawBuilding);
    drawPlayer();
  }

  return { init, loadMap, draw, move };
})();

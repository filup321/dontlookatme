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
    wall: '#c9a86a',
    roof: '#8b5a2b',
  },
  {
    id: 'El_Mercado',
    label: 'El Mercado',
    cols: [0, 1, 2],
    rows: [3, 4],
    door: { col: 1, row: 5 },
    wall: '#d98c3d',
    roof: '#a85c2a',
  },
  {
    id: 'La_Cantina',
    label: 'La Cantina',
    cols: [7, 8, 9],
    rows: [3, 4],
    door: { col: 8, row: 5 },
    wall: '#b23a3a',
    roof: '#7a2323',
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
    if (GameState.screen !== 'map' || GameState.dialogue) return;
    let dCol = 0, dRow = 0, dir = GameState.player.dir;
    if (e.key === 'ArrowUp' || e.key === 'w') { dRow = -1; dir = 'up'; }
    else if (e.key === 'ArrowDown' || e.key === 's') { dRow = 1; dir = 'down'; }
    else if (e.key === 'ArrowLeft' || e.key === 'a') { dCol = -1; dir = 'left'; }
    else if (e.key === 'ArrowRight' || e.key === 'd') { dCol = 1; dir = 'right'; }
    else return;

    e.preventDefault();
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

  function drawBuilding(b) {
    const minCol = Math.min(...b.cols);
    const minRow = Math.min(...b.rows);
    const w = b.cols.length * TILE;
    const h = b.rows.length * TILE;
    const x = minCol * TILE;
    const y = minRow * TILE;

    ctx.fillStyle = b.roof;
    ctx.fillRect(x, y, w, TILE);
    ctx.fillStyle = b.wall;
    ctx.fillRect(x, y + TILE, w, h - TILE);

    const doorX = b.door.col * TILE;
    const doorY = b.door.row * TILE;
    ctx.fillStyle = '#3b2a1a';
    ctx.fillRect(doorX + 3, doorY, TILE - 6, TILE);
  }

  function drawPlayer() {
    const x = GameState.player.col * TILE;
    const y = GameState.player.row * TILE;

    ctx.fillStyle = '#e8b98a';
    ctx.fillRect(x + 5, y + 2, 6, 5);

    ctx.fillStyle = '#2f4f7a';
    ctx.fillRect(x + 4, y + 7, 8, 7);

    ctx.fillStyle = '#1a1a1a';
    if (GameState.player.dir === 'down') {
      ctx.fillRect(x + 6, y + 5, 1, 1);
      ctx.fillRect(x + 9, y + 5, 1, 1);
    } else if (GameState.player.dir === 'up') {
      ctx.fillRect(x + 6, y + 3, 1, 1);
      ctx.fillRect(x + 9, y + 3, 1, 1);
    } else if (GameState.player.dir === 'left') {
      ctx.fillRect(x + 6, y + 5, 1, 1);
    } else if (GameState.player.dir === 'right') {
      ctx.fillRect(x + 9, y + 5, 1, 1);
    }
  }

  function draw() {
    if (!ctx) return;
    drawGround();
    BUILDINGS.forEach(drawBuilding);
    drawPlayer();
  }

  return { init, draw };
})();

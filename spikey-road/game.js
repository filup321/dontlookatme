// Draws a list of [dx, dy, w, h, color] rects relative to (x, y).
function rectsAt(ctx, x, y, rects) {
  rects.forEach(([dx, dy, w, h, color]) => {
    ctx.fillStyle = color;
    ctx.fillRect(x + dx, y + dy, w, h);
  });
}

// Road mini-game: overhead scrolling desert trail between Valladolid and Veracruz.
// Vertical version: the player is fixed near the bottom of a portrait screen and
// the road scrolls down toward them. Cactuses are dodged by changing lane
// (left/right), rattlesnakes span the whole road and must be shot, boulders span
// the whole road and must be jumped.

const ROAD_W = 120;
const ROAD_H = 176;
const ROAD_LANES = [20, 60, 100]; // lane centres (x)
const ROAD_PLAYER_Y = 148;
const ROAD_WIN_DISTANCE = 2600;
const ROAD_SPAWN_MIN = 650;
const ROAD_SPAWN_MAX = 1050;
const ROAD_JUMP_MS = 500;

const RoadGame = (() => {
  let ctx = null;
  let onWin = () => {};
  let onLose = () => {};
  let running = false;
  let rafId = null;
  let lastTs = 0;

  let player, obstacles, bullets, distance, speed, spawnTimer, nextSpawnAt;

  function init(canvasEl) {
    ctx = canvasEl.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    window.addEventListener('keydown', handleKeydown);
  }

  function start(callbacks) {
    onWin = callbacks.onWin || onWin;
    onLose = callbacks.onLose || onLose;
    player = { lane: 1, x: ROAD_LANES[1] - 8, jumping: false, jumpUntil: 0 };
    obstacles = [];
    bullets = [];
    distance = 0;
    speed = 70;
    spawnTimer = 0;
    nextSpawnAt = randRange(ROAD_SPAWN_MIN, ROAD_SPAWN_MAX);
    running = true;
    lastTs = performance.now();
    rafId = requestAnimationFrame(loop);
  }

  function stop() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
  }

  function randRange(min, max) {
    return min + Math.random() * (max - min);
  }

  // dir: -1 = one lane left, 1 = one lane right
  function setLane(dir) {
    if (!running) return;
    player.lane = Math.max(0, Math.min(ROAD_LANES.length - 1, player.lane + dir));
  }

  function jump() {
    if (!running) return;
    player.jumping = true;
    player.jumpUntil = performance.now() + ROAD_JUMP_MS;
  }

  function shoot() {
    if (!running) return;
    bullets.push({ x: player.x + 7, y: ROAD_PLAYER_Y - 4 });
  }

  function handleKeydown(e) {
    if (!running) return;
    if (e.key === 'ArrowLeft' || e.key === 'a') { e.preventDefault(); setLane(-1); }
    else if (e.key === 'ArrowRight' || e.key === 'd') { e.preventDefault(); setLane(1); }
    else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === ' ' || e.key === 'x') { e.preventDefault(); jump(); }
    else if (e.key === 'f' || e.key === 'z') { e.preventDefault(); shoot(); }
  }

  // o.y is the obstacle's top edge; o.h is how far it extends down the road.
  function spawnObstacle() {
    const roll = Math.random();
    if (roll < 0.4) {
      obstacles.push({ type: 'cactus', y: -30, lane: Math.floor(Math.random() * ROAD_LANES.length), h: 24 });
    } else if (roll < 0.7) {
      obstacles.push({ type: 'snake', y: -30, h: 20, dead: false });
    } else {
      obstacles.push({ type: 'boulder', y: -30, h: 22 });
    }
  }

  function update(dt) {
    distance += speed * dt;
    speed = Math.min(150, 70 + distance / 40);

    if (player.jumping && performance.now() > player.jumpUntil) player.jumping = false;
    player.x += (ROAD_LANES[player.lane] - 8 - player.x) * Math.min(1, dt * 12);

    spawnTimer += dt * 1000;
    if (spawnTimer >= nextSpawnAt) {
      spawnTimer = 0;
      nextSpawnAt = randRange(ROAD_SPAWN_MIN, ROAD_SPAWN_MAX);
      spawnObstacle();
    }

    obstacles.forEach((o) => { o.y += speed * dt; });
    bullets.forEach((b) => { b.y -= 260 * dt; });

    bullets.forEach((b) => {
      obstacles.forEach((o) => {
        if (o.type === 'snake' && !o.dead && b.y >= o.y && b.y <= o.y + o.h) {
          o.dead = true;
          b.spent = true;
        }
      });
    });
    bullets = bullets.filter((b) => !b.spent && b.y > -10);

    let hit = false;
    obstacles.forEach((o) => {
      if (o.resolved) return;
      const overlapsPlayer = o.y + o.h >= ROAD_PLAYER_Y && o.y <= ROAD_PLAYER_Y + 12;
      if (!overlapsPlayer) return;
      o.resolved = true;
      if (o.type === 'cactus') {
        if (o.lane === player.lane) hit = true;
      } else if (o.type === 'snake') {
        if (!o.dead) hit = true;
      } else if (o.type === 'boulder') {
        if (!player.jumping) hit = true;
      }
    });

    obstacles = obstacles.filter((o) => o.y < ROAD_H + 10);

    if (hit) {
      stop();
      draw();
      onLose();
      return;
    }

    if (distance >= ROAD_WIN_DISTANCE) {
      stop();
      onWin();
    }
  }

  function drawRoad() {
    const scrollA = distance % 16;
    for (let i = -1; i < 12; i += 1) {
      const y = i * 16 + scrollA;
      ctx.fillStyle = '#cdae6c';
      ctx.fillRect(0, y, ROAD_W, 16);
      ctx.fillStyle = '#c2a05f';
      ctx.fillRect(0, y, ROAD_W, 8);
    }
    const scrollB = distance % 20;
    for (let laneIdx = 0; laneIdx < ROAD_LANES.length - 1; laneIdx += 1) {
      const dividerX = (ROAD_LANES[laneIdx] + ROAD_LANES[laneIdx + 1]) / 2;
      for (let i = -1; i < 10; i += 1) {
        const y = i * 20 + scrollB;
        ctx.fillStyle = '#8a6a4a';
        ctx.fillRect(dividerX, y, 2, 10);
      }
    }
  }

  function drawCactus(o) {
    const x = ROAD_LANES[o.lane] - 7;
    rectsAt(ctx, x, o.y, [
      [4, 4, 6, 20, '#3a6a2a'],
      [0, 8, 4, 4, '#3a6a2a'],
      [0, 4, 4, 4, '#3a6a2a'],
      [10, 12, 4, 4, '#3a6a2a'],
      [10, 8, 4, 4, '#3a6a2a'],
      [5, 3, 4, 1, '#4f8a3a'],
    ]);
  }

  // Snake's hitbox spans the full road width (o.y..o.y+o.h); the body winds up
  // and down within it via a sine offset, head at the left with eyes, rattle at
  // the tail on the right.
  function drawSnake(o) {
    const bodyA = o.dead ? '#5a6a4a' : '#4f8a3a';
    const bodyB = o.dead ? '#455a3c' : '#376b28';
    const eyeColor = '#1a1a1a';
    const rattleColor = o.dead ? '#7a6a5a' : '#c9a86a';
    const cy = o.y + o.h / 2;
    const amp = Math.max(2, Math.min(6, (o.h - 6) / 2));
    const left = 10;
    const right = 110;
    const segW = 6;

    for (let x = left; x < right; x += segW) {
      const t = (x - left) / (right - left);
      const dy = Math.sin(t * Math.PI * 2.4) * amp;
      const shade = Math.floor((x - left) / segW) % 2 === 0 ? bodyA : bodyB;
      rectsAt(ctx, x, cy + dy - 4, [[0, 0, segW, 8, shade]]);
    }

    rectsAt(ctx, left - 6, cy - 5, [
      [0, 0, 8, 10, bodyA],
      [2, 2, 2, 2, eyeColor],
      [2, 6, 2, 2, eyeColor],
    ]);

    const tailT = (right - segW - left) / (right - left);
    const tailDy = Math.sin(tailT * Math.PI * 2.4) * amp;
    rectsAt(ctx, right - 2, cy + tailDy - 3, [
      [0, 0, 3, 6, rattleColor],
      [3, 1, 3, 4, rattleColor],
      [6, 0, 2, 6, rattleColor],
    ]);
  }

  // Rock hitbox is the same full-width band; drawn as a scatter of individually
  // shaped rocks (varying size) instead of one gray slab.
  function drawRock(cx, cy, size) {
    const r = size;
    const left = cx - r / 2;
    const top = cy - r / 2;
    rectsAt(ctx, left, top, [
      [r * 0.3, 0, r * 0.4, r * 0.2, '#87867e'],
      [r * 0.1, r * 0.15, r * 0.8, r * 0.2, '#87867e'],
      [0, r * 0.3, r, r * 0.4, '#87867e'],
      [r * 0.1, r * 0.65, r * 0.8, r * 0.2, '#87867e'],
      [r * 0.3, r * 0.8, r * 0.4, r * 0.2, '#87867e'],
      [r * 0.15, r * 0.15, r * 0.35, r * 0.28, '#a8a79c'],
      [r * 0.5, r * 0.48, r * 0.35, r * 0.32, '#575651'],
    ]);
  }

  function drawBoulder(o) {
    const rocks = [
      { cxFrac: 0.07, size: 13 },
      { cxFrac: 0.27, size: 20 },
      { cxFrac: 0.5, size: 15 },
      { cxFrac: 0.72, size: 22 },
      { cxFrac: 0.93, size: 14 },
    ];
    rocks.forEach((spec, i) => {
      const cx = 4 + spec.cxFrac * (ROAD_W - 8);
      const cy = o.y + o.h / 2 + (i % 2 === 0 ? -3 : 3);
      drawRock(cx, cy, spec.size);
    });
  }

  function drawBullet(b) {
    rectsAt(ctx, b.x, b.y, [
      [0, 0, 2, 5, '#f2ead2'],
      [0, 3, 2, 2, '#e8b800'],
    ]);
  }

  function drawPlayer() {
    const x = player.x;
    const y = ROAD_PLAYER_Y - (player.jumping ? 10 : 0);
    const HAT_CROWN = '#8a5a4a';
    const HAT_BRIM = '#5a3a3a';
    const HAT_BAND = '#2f4f7a';
    const SKIN = '#f0c090';
    const EYE = '#2f4f7a';
    const SCARF = '#c1502e';
    const SHIRT = '#6b3f3f';
    const PANTS = '#b89b72';
    const BOOTS = '#4a3222';

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
      [7, 5, 1, 1, EYE],
      [9, 5, 1, 1, EYE],
      [3, 6, 2, 1, HAT_BRIM],
      [5, 6, 6, 1, SKIN],
      [11, 6, 2, 1, HAT_BRIM],
      [4, 7, 8, 1, SKIN],
      [4, 8, 8, 1, SCARF],
      [4, 9, 8, 2, SHIRT],
      [5, 11, 6, 2, PANTS],
      [4, 13, 3, 2, BOOTS],
      [9, 13, 3, 2, BOOTS],
    ]);

    if (player.jumping) {
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.fillRect(x + 3, ROAD_PLAYER_Y + 13, 10, 3);
    }
  }

  function drawProgress() {
    const pct = Math.min(1, distance / ROAD_WIN_DISTANCE);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(4, 4, 60, 5);
    ctx.fillStyle = '#f8f4e3';
    ctx.fillRect(5, 5, 58, 3);
    ctx.fillStyle = '#c1502e';
    ctx.fillRect(5, 5, 58 * pct, 3);
  }

  function draw() {
    drawRoad();
    obstacles.forEach((o) => {
      if (o.type === 'cactus') drawCactus(o);
      else if (o.type === 'snake') drawSnake(o);
      else drawBoulder(o);
    });
    bullets.forEach(drawBullet);
    drawPlayer();
    drawProgress();
  }

  function loop(ts) {
    if (!running) return;
    const dt = Math.min(0.05, (ts - lastTs) / 1000);
    lastTs = ts;
    update(dt);
    if (running) {
      draw();
      rafId = requestAnimationFrame(loop);
    }
  }

  function pause() {
    if (!running) return;
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
  }

  function resume() {
    if (running || !player) return;
    running = true;
    lastTs = performance.now();
    rafId = requestAnimationFrame(loop);
  }

  function getDistance() { return distance || 0; }

  function getLane() { return player ? player.lane : 1; }

  return { init, start, stop, setLane, jump, shoot, pause, resume, getDistance, getLane };
})();

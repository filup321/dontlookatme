// Road mini-game: overhead scrolling desert trail between Valladolid and Veracruz.
// Player is fixed on the left third; obstacles scroll right-to-left. Cactuses are
// dodged by changing lane (up/down), rattlesnakes span the whole road and must be
// shot, boulders span the whole road and must be jumped.

const ROAD_LANES = [28, 72, 116];
const ROAD_PLAYER_X = 28;
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
    player = { lane: 1, y: ROAD_LANES[1], jumping: false, jumpUntil: 0 };
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
    bullets.push({ x: ROAD_PLAYER_X + 14, y: player.y + 6 });
  }

  function handleKeydown(e) {
    if (!running) return;
    if (e.key === 'ArrowUp' || e.key === 'w') { e.preventDefault(); setLane(-1); }
    else if (e.key === 'ArrowDown' || e.key === 's') { e.preventDefault(); setLane(1); }
    else if (e.key === ' ' || e.key === 'ArrowRight' || e.key === 'x') { e.preventDefault(); jump(); }
    else if (e.key === 'f' || e.key === 'z') { e.preventDefault(); shoot(); }
  }

  function spawnObstacle() {
    const roll = Math.random();
    if (roll < 0.4) {
      obstacles.push({ type: 'cactus', x: 176, lane: Math.floor(Math.random() * ROAD_LANES.length), w: 14 });
    } else if (roll < 0.7) {
      obstacles.push({ type: 'snake', x: 176, w: 20, dead: false });
    } else {
      obstacles.push({ type: 'boulder', x: 176, w: 18 });
    }
  }

  function update(dt) {
    distance += speed * dt;
    speed = Math.min(150, 70 + distance / 40);

    if (player.jumping && performance.now() > player.jumpUntil) player.jumping = false;
    player.y += (ROAD_LANES[player.lane] - player.y) * Math.min(1, dt * 10);

    spawnTimer += dt * 1000;
    if (spawnTimer >= nextSpawnAt) {
      spawnTimer = 0;
      nextSpawnAt = randRange(ROAD_SPAWN_MIN, ROAD_SPAWN_MAX);
      spawnObstacle();
    }

    obstacles.forEach((o) => { o.x -= speed * dt; });
    bullets.forEach((b) => { b.x += 260 * dt; });

    bullets.forEach((b) => {
      obstacles.forEach((o) => {
        if (o.type === 'snake' && !o.dead && b.x >= o.x && b.x <= o.x + o.w) {
          o.dead = true;
          b.spent = true;
        }
      });
    });
    bullets = bullets.filter((b) => !b.spent && b.x < 176);

    let hit = false;
    obstacles.forEach((o) => {
      if (o.resolved) return;
      const overlapsPlayer = o.x <= ROAD_PLAYER_X + 12 && o.x + o.w >= ROAD_PLAYER_X;
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

    obstacles = obstacles.filter((o) => o.x > -30);

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
    for (let i = -1; i < 11; i += 1) {
      const x = i * 16 - scrollA;
      ctx.fillStyle = '#cdae6c';
      ctx.fillRect(x, 0, 16, 144);
      ctx.fillStyle = '#c2a05f';
      ctx.fillRect(x, 0, 8, 144);
    }
    const scrollB = distance % 20;
    for (let laneIdx = 0; laneIdx < ROAD_LANES.length - 1; laneIdx += 1) {
      const dividerY = (ROAD_LANES[laneIdx] + ROAD_LANES[laneIdx + 1]) / 2;
      for (let i = -1; i < 11; i += 1) {
        const x = i * 20 - scrollB;
        ctx.fillStyle = '#8a6a4a';
        ctx.fillRect(x, dividerY, 10, 2);
      }
    }
  }

  function drawCactus(o) {
    const y = ROAD_LANES[o.lane] - 20;
    rectsAt(ctx, o.x, y, [
      [4, 4, 6, 20, '#3a6a2a'],
      [0, 8, 4, 4, '#3a6a2a'],
      [0, 4, 4, 4, '#3a6a2a'],
      [10, 12, 4, 4, '#3a6a2a'],
      [10, 8, 4, 4, '#3a6a2a'],
      [5, 3, 4, 1, '#4f8a3a'],
    ]);
  }

  // Snake's hitbox is still the full-height vertical bar (o.x..o.x+o.w); the
  // body just winds side to side within it via a sine offset, head at the
  // top with eyes, rattle at the tail.
  function drawSnake(o) {
    const bodyA = o.dead ? '#5a6a4a' : '#4f8a3a';
    const bodyB = o.dead ? '#455a3c' : '#376b28';
    const eyeColor = '#1a1a1a';
    const rattleColor = o.dead ? '#7a6a5a' : '#c9a86a';
    const cx = o.x + o.w / 2;
    const amp = Math.max(2, Math.min(7, (o.w - 6) / 2));
    const top = 8;
    const bottom = 128;
    const segH = 7;

    for (let y = top; y < bottom; y += segH) {
      const t = (y - top) / (bottom - top);
      const dx = Math.sin(t * Math.PI * 2.4) * amp;
      const shade = Math.floor((y - top) / segH) % 2 === 0 ? bodyA : bodyB;
      rectsAt(ctx, cx + dx - 4, y, [[0, 0, 8, segH, shade]]);
    }

    const headDx = Math.sin(0) * amp;
    rectsAt(ctx, cx + headDx - 5, top - 6, [
      [0, 0, 10, 8, bodyA],
      [2, 2, 2, 2, eyeColor],
      [6, 2, 2, 2, eyeColor],
    ]);

    const tailT = (bottom - segH - top) / (bottom - top);
    const tailDx = Math.sin(tailT * Math.PI * 2.4) * amp;
    rectsAt(ctx, cx + tailDx - 3, bottom - 2, [
      [0, 0, 6, 3, rattleColor],
      [1, 3, 4, 3, rattleColor],
      [0, 6, 6, 2, rattleColor],
    ]);
  }

  // Rock hitbox is the same full-height vertical bar; drawn as a scatter of
  // individually shaped rocks (varying size) instead of one gray slab.
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
      { cyFrac: 0.08, size: 13 },
      { cyFrac: 0.27, size: 20 },
      { cyFrac: 0.5, size: 15 },
      { cyFrac: 0.71, size: 22 },
      { cyFrac: 0.92, size: 14 },
    ];
    rocks.forEach((spec, i) => {
      const cx = o.x + o.w / 2 + (i % 2 === 0 ? -3 : 3);
      const cy = 4 + spec.cyFrac * 136;
      drawRock(cx, cy, spec.size);
    });
  }

  function drawBullet(b) {
    rectsAt(ctx, b.x, b.y, [
      [0, 0, 5, 2, '#f2ead2'],
      [0, 0, 2, 2, '#e8b800'],
    ]);
  }

  function drawPlayer() {
    const x = ROAD_PLAYER_X;
    const y = player.y - (player.jumping ? 10 : 0);
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
      ctx.fillRect(x + 3, ROAD_LANES[player.lane] + 12, 10, 3);
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

  return { init, start, stop, setLane, jump, shoot };
})();

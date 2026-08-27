// Night road mini-game: overhead scrolling dirt road between Veracruz and
// Pueblo, at night. Mirrors RoadGame's structure but reversed: the world
// scrolls left-to-right and the player sits on the right side of the
// screen (moving "left" through the world). All hazards enter from the
// left, ahead of the player; coyotes just close the gap faster than
// quicksand or bandits do, so they demand a quicker reaction.

const NIGHT_LANES = [28, 72, 116];
const NIGHT_PLAYER_X = 122;
const NIGHT_WIN_DISTANCE = 2600;
const NIGHT_SPAWN_MIN = 650;
const NIGHT_SPAWN_MAX = 1050;
const NIGHT_HIDE_MS = 500;
const NIGHT_COYOTE_CATCHUP = 1.15;
const NIGHT_COYOTE_SPAWN_X = -40;

const NightRoadGame = (() => {
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
    player = { lane: 1, y: NIGHT_LANES[1], hiding: false, hideUntil: 0 };
    obstacles = [];
    bullets = [];
    distance = 0;
    speed = 70;
    spawnTimer = 0;
    nextSpawnAt = randRange(NIGHT_SPAWN_MIN, NIGHT_SPAWN_MAX);
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
    player.lane = Math.max(0, Math.min(NIGHT_LANES.length - 1, player.lane + dir));
  }

  function hide() {
    if (!running) return;
    player.hiding = true;
    player.hideUntil = performance.now() + NIGHT_HIDE_MS;
  }

  function fire() {
    if (!running) return;
    bullets.push({ x: NIGHT_PLAYER_X - 4, y: player.y + 6 });
  }

  function handleKeydown(e) {
    if (!running) return;
    if (e.key === 'ArrowUp' || e.key === 'w') { e.preventDefault(); setLane(-1); }
    else if (e.key === 'ArrowDown' || e.key === 's') { e.preventDefault(); setLane(1); }
    else if (e.key === ' ' || e.key === 'ArrowRight' || e.key === 'x') { e.preventDefault(); hide(); }
    else if (e.key === 'f' || e.key === 'z') { e.preventDefault(); fire(); }
  }

  function spawnObstacle() {
    const roll = Math.random();
    if (roll < 0.35) {
      obstacles.push({ type: 'quicksand', x: -24, lane: Math.floor(Math.random() * NIGHT_LANES.length), w: 20 });
    } else if (roll < 0.65) {
      obstacles.push({ type: 'coyote', x: NIGHT_COYOTE_SPAWN_X, lane: Math.floor(Math.random() * NIGHT_LANES.length), w: 22, dead: false });
    } else {
      obstacles.push({ type: 'bandit', x: -30, w: 26 });
    }
  }

  function update(dt) {
    distance += speed * dt;
    speed = Math.min(150, 70 + distance / 40);

    if (player.hiding && performance.now() > player.hideUntil) player.hiding = false;
    player.y += (NIGHT_LANES[player.lane] - player.y) * Math.min(1, dt * 10);

    spawnTimer += dt * 1000;
    if (spawnTimer >= nextSpawnAt) {
      spawnTimer = 0;
      nextSpawnAt = randRange(NIGHT_SPAWN_MIN, NIGHT_SPAWN_MAX);
      spawnObstacle();
    }

    obstacles.forEach((o) => {
      o.x += o.type === 'coyote' ? speed * NIGHT_COYOTE_CATCHUP * dt : speed * dt;
    });
    bullets.forEach((b) => { b.x -= 260 * dt; });

    bullets.forEach((b) => {
      obstacles.forEach((o) => {
        if (o.type === 'coyote' && !o.dead && b.x >= o.x && b.x <= o.x + o.w) {
          o.dead = true;
          b.spent = true;
        }
      });
    });
    bullets = bullets.filter((b) => !b.spent && b.x > -20);

    let hit = null;
    obstacles.forEach((o) => {
      if (o.resolved) return;
      const overlapsPlayer = o.x <= NIGHT_PLAYER_X + 12 && o.x + o.w >= NIGHT_PLAYER_X;
      if (!overlapsPlayer) return;
      o.resolved = true;
      if (o.type === 'quicksand') {
        if (o.lane === player.lane) hit = 'quicksand';
      } else if (o.type === 'coyote') {
        if (!o.dead) hit = 'coyote';
      } else if (o.type === 'bandit') {
        if (!player.hiding) hit = 'bandit';
      }
    });

    obstacles = obstacles.filter((o) => o.x > -40 && o.x < 200);

    if (hit) {
      stop();
      draw();
      onLose(hit);
      return;
    }

    if (distance >= NIGHT_WIN_DISTANCE) {
      stop();
      onWin();
    }
  }

  function drawNightRoad() {
    const scrollA = distance % 16;
    for (let i = -1; i < 11; i += 1) {
      const x = i * 16 + scrollA;
      ctx.fillStyle = '#241f30';
      ctx.fillRect(x, 0, 16, 144);
      ctx.fillStyle = '#1c1826';
      ctx.fillRect(x, 0, 8, 144);
    }
    const scrollB = distance % 20;
    for (let laneIdx = 0; laneIdx < NIGHT_LANES.length - 1; laneIdx += 1) {
      const dividerY = (NIGHT_LANES[laneIdx] + NIGHT_LANES[laneIdx + 1]) / 2;
      for (let i = -1; i < 11; i += 1) {
        const x = i * 20 + scrollB;
        ctx.fillStyle = '#4a4058';
        ctx.fillRect(x, dividerY, 10, 2);
      }
    }
  }

  function drawMoon() {
    rectsAt(ctx, 12, 8, [
      [4, 0, 8, 2, '#f4efe0'],
      [2, 2, 12, 2, '#f4efe0'],
      [0, 4, 16, 8, '#f4efe0'],
      [2, 12, 12, 2, '#f4efe0'],
      [4, 14, 8, 2, '#f4efe0'],
      [5, 5, 2, 2, '#dcd3b8'],
      [9, 8, 2, 2, '#dcd3b8'],
      [6, 9, 2, 2, '#dcd3b8'],
    ]);
  }

  function drawQuicksand(o) {
    const laneY = NIGHT_LANES[o.lane] - 10;
    rectsAt(ctx, o.x, laneY, [
      [0, 0, 20, 20, '#3a2c1c'],
      [2, 2, 16, 16, '#4a3a24'],
      [5, 5, 10, 10, '#5a4a30'],
      [8, 8, 4, 4, '#6a5838'],
    ]);
  }

  function drawCoyote(o) {
    const y = NIGHT_LANES[o.lane] - 24;
    const CO_BODY = o.dead ? '#5a5248' : '#c9a876';
    const CO_DARK = o.dead ? '#453f38' : '#8a6a4a';
    const CO_LEG = o.dead ? '#332f2a' : '#5a4530';
    const CO_NOSE = '#2a1a14';
    rectsAt(ctx, o.x, y, [
      [2, 5, 14, 6, CO_BODY],
      [14, 4, 5, 5, CO_DARK],
      [17, 2, 5, 3, CO_DARK],
      [0, 3, 5, 5, CO_BODY],
      [0, 5, 2, 2, CO_NOSE],
      [1, 0, 2, 3, CO_DARK],
      [4, 0, 2, 3, CO_DARK],
      [3, 11, 2, 4, CO_LEG],
      [8, 11, 2, 4, CO_LEG],
      [13, 11, 2, 4, CO_LEG],
      [17, 11, 2, 4, CO_LEG],
    ]);
  }

  function drawBanditHorse(o) {
    const y = 20;
    const HORSE_BODY = '#8a5a3a';
    const HORSE_DARK = '#6b4530';
    const HORSE_MANE = '#d9c9a0';
    const JACKET = '#5a4030';
    const CAP = '#8a3a2a';
    const CAP_DARK = '#6b2c1f';
    const GUN = '#3a3632';
    rectsAt(ctx, o.x, y, [
      [2, 30, 3, 8, HORSE_DARK],
      [7, 30, 3, 8, HORSE_DARK],
      [3, 18, 14, 12, HORSE_BODY],
      [15, 14, 3, 10, HORSE_BODY],
      [19, 16, 3, 8, HORSE_BODY],
      [17, 8, 6, 8, HORSE_BODY],
      [13, 9, 4, 7, HORSE_MANE],
      [0, 18, 4, 8, HORSE_MANE],
      [8, 8, 6, 10, JACKET],
      [9, 4, 5, 3, CAP],
      [8, 2, 7, 2, CAP_DARK],
      [13, 3, 7, 2, JACKET],
      [19, 1, 2, 3, GUN],
    ]);
  }

  function drawBanditWarning() {
    const activeBandit = obstacles.some((o) => o.type === 'bandit' && !o.resolved);
    if (!activeBandit) return;
    const text = 'bandits approaching';
    ctx.font = 'bold 7px monospace';
    ctx.textAlign = 'center';
    const textWidth = ctx.measureText(text).width;
    ctx.fillStyle = 'rgba(20,16,10,0.75)';
    ctx.fillRect(80 - textWidth / 2 - 3, 24, textWidth + 6, 9);
    ctx.fillStyle = '#f2ead2';
    ctx.fillText(text, 80, 31);
    ctx.textAlign = 'left';
  }

  function drawBullet(b) {
    rectsAt(ctx, b.x, b.y, [
      [0, 0, 2, 2, '#e8b800'],
      [2, 0, 3, 2, '#f2ead2'],
    ]);
  }

  function drawPlayer() {
    const x = NIGHT_PLAYER_X;
    const y = player.y + (player.hiding ? 4 : 0);
    const HAT_CROWN = '#8a5a4a';
    const HAT_BRIM = '#5a3a3a';
    const HAT_BAND = '#2f4f7a';
    const SKIN = '#f0c090';
    const EYE = '#2f4f7a';
    const SCARF = '#c1502e';
    const SHIRT = '#6b3f3f';
    const PANTS = '#b89b72';
    const BOOTS = '#4a3222';

    ctx.save();
    ctx.globalAlpha = player.hiding ? 0.55 : 1;

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
      [6, 5, 1, 1, EYE],
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

    ctx.restore();
  }

  function drawProgress() {
    const pct = Math.min(1, distance / NIGHT_WIN_DISTANCE);
    ctx.fillStyle = '#f2ead2';
    ctx.fillRect(96, 4, 60, 5);
    ctx.fillStyle = '#241f30';
    ctx.fillRect(97, 5, 58, 3);
    ctx.fillStyle = '#c1502e';
    ctx.fillRect(97, 5, 58 * pct, 3);
  }

  function draw() {
    drawNightRoad();
    drawMoon();
    obstacles.forEach((o) => {
      if (o.type === 'quicksand') drawQuicksand(o);
      else if (o.type === 'coyote') drawCoyote(o);
      else drawBanditHorse(o);
    });
    bullets.forEach(drawBullet);
    drawPlayer();
    drawProgress();
    drawBanditWarning();
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

  return { init, start, stop, setLane, hide, fire };
})();

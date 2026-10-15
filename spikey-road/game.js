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
const ROAD_LANES = [34, 60, 86]; // lane centres (x), all on the dirt track
const ROAD_PLAYER_Y = 148;
const ROAD_JUMP_MS = 500;

// ---- Tuning: change these to adjust how the run feels --------------------
// The run never ends by distance; it speeds up in steps as you pass milestones.
// Score is shown in metres: 1 m = 10 distance units.
const ROAD_START_SPEED = 70;   // units per second at the start
const ROAD_SPEED_STEP = 10;    // added to the speed at every milestone (no top speed)
const ROAD_MILESTONE_M = 100;  // a milestone every this many metres
const ROAD_QUIET_STEPS = 2;    // the first this-many speed-ups happen without a "Faster!" banner
const ROAD_GAP_MIN = 60;       // gap between obstacles, in distance units (min)
const ROAD_GAP_MAX = 95;       // ... and max
const ROAD_MIN_GAP_MS = 600;   // never spawn closer together in time than this
const ROAD_STORY_M = 260;      // the old finish line, now just a banner

const RoadGame = (() => {
  let ctx = null;
  let onWin = () => {};
  let onLose = () => {};
  let running = false;
  let rafId = null;
  let lastTs = 0;

  let player, obstacles, bullets, distance, speed, spawnTimer, spawnDist, nextGap, snakeCount;
  let milestone, banner, storyShown, bestMetres = 0;

  // ?start=<metres> begins the run that far along (for testing later speeds).
  const startMetres = Math.max(0, Number((/[?&]start=(\d+)/.exec(window.location.search) || [])[1]) || 0);

  // First-encounter tips: the first time each kind of obstacle approaches, a
  // short instruction is flashed. Which kinds were already shown is owned by the
  // caller (so it can be remembered between visits).
  let tipConfig = { seen: {}, text: {}, onSeen: () => {} };
  let currentTip = null; // { obstacle, text }

  function setTips(config) {
    tipConfig = Object.assign({ seen: {}, text: {}, onSeen: () => {} }, config);
  }

  // The canvas is ROAD_SCALE times denser than the logical 120x176 road, so the
  // detailed snake art stays sharp. All game code keeps using logical units.
  const ROAD_SCALE = 3;
  // Obstacle sprites are hard-edged pixel art drawn at this many screen pixels per
  // art pixel, so their grain matches the road backdrop.
  const ART_PX = 2;
  const SPRITES = {};

  function loadSprite(key, src) {
    const img = new Image();
    img.src = src;
    SPRITES[key] = img;
  }

  function sprite(key) {
    const img = SPRITES[key];
    return img && img.complete && img.naturalWidth ? img : null;
  }

  function init(canvasEl) {
    canvasEl.width = ROAD_W * ROAD_SCALE;
    canvasEl.height = ROAD_H * ROAD_SCALE;
    ctx = canvasEl.getContext('2d');
    ctx.setTransform(ROAD_SCALE, 0, 0, ROAD_SCALE, 0, 0);
    ctx.imageSmoothingEnabled = false;
    loadSprite('snake', 'assets/rattlesnake.png');
    loadSprite('snakeDead', 'assets/rattlesnake-dead.png');
    loadSprite('rocks', 'assets/rocks-row.png');
    loadSprite('cactus', 'assets/cactus-obstacle.png');
    loadSprite('road', 'assets/road-bg.png');
    window.addEventListener('keydown', handleKeydown);
  }

  function start(callbacks) {
    onWin = callbacks.onWin || onWin;
    onLose = callbacks.onLose || onLose;
    player = { lane: 1, x: ROAD_LANES[1] - 8, jumping: false, jumpUntil: 0 };
    obstacles = [];
    bullets = [];
    currentTip = null;
    snakeCount = 0;
    distance = startMetres * 10;
    milestone = Math.floor(startMetres / ROAD_MILESTONE_M);
    speed = targetSpeed();
    spawnTimer = 0;
    spawnDist = 0;
    nextGap = randRange(ROAD_GAP_MIN, ROAD_GAP_MAX);
    banner = null;
    storyShown = startMetres >= ROAD_STORY_M;
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
      obstacles.push({ type: 'cactus', y: -34, lane: Math.floor(Math.random() * ROAD_LANES.length), h: 29 });
    } else if (roll < 0.7) {
      obstacles.push({ type: 'snake', y: -30, h: 24, dead: false, facingLeft: snakeCount++ % 2 === 1 });
    } else {
      obstacles.push({ type: 'boulder', y: -30, h: 22 });
    }
  }

  function metres() { return Math.floor(distance / 10); }

  function targetSpeed() {
    const steps = Math.floor(metres() / ROAD_MILESTONE_M);
    return ROAD_START_SPEED + ROAD_SPEED_STEP * steps;
  }

  function showBanner(text, sub) {
    banner = { text, sub, until: performance.now() + 1900 };
  }

  function update(dt) {
    distance += speed * dt;

    // Speed goes up in steps at each milestone, eased in over about a second.
    const reached = Math.floor(metres() / ROAD_MILESTONE_M);
    if (reached > milestone) {
      milestone = reached;
      // The first ROAD_QUIET_STEPS speed-ups are silent; after that each one says "Faster!".
      if (milestone > ROAD_QUIET_STEPS) showBanner(metres() + ' m', 'Faster!');
    }
    if (!storyShown && metres() >= ROAD_STORY_M) {
      storyShown = true;
      showBanner('Bienvenidos', 'a Veracruz');
    }
    speed += (targetSpeed() - speed) * Math.min(1, dt * 3);

    if (player.jumping && performance.now() > player.jumpUntil) player.jumping = false;
    player.x += (ROAD_LANES[player.lane] - 8 - player.x) * Math.min(1, dt * 12);

    // Obstacles are spaced by distance, so the gaps look the same at any speed,
    // but never closer together in time than ROAD_MIN_GAP_MS.
    spawnTimer += dt * 1000;
    spawnDist += speed * dt;
    if (spawnDist >= nextGap && spawnTimer >= ROAD_MIN_GAP_MS) {
      spawnTimer = 0;
      spawnDist = 0;
      nextGap = randRange(ROAD_GAP_MIN, ROAD_GAP_MAX);
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

    updateTip();

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

  }

  function tipStillNeeded(o) {
    if (o.resolved || o.y > ROAD_PLAYER_Y - 28) return false;
    if (o.type === 'cactus') return o.lane === player.lane;
    if (o.type === 'snake') return !o.dead;
    return !player.jumping;
  }

  function updateTip() {
    if (currentTip) {
      if (!tipStillNeeded(currentTip.obstacle)) currentTip = null;
      return;
    }
    const o = obstacles.find((ob) => !tipConfig.seen[ob.type] && !ob.resolved
      && ob.y >= 10 && ob.y < ROAD_PLAYER_Y - 28
      && (ob.type !== 'cactus' || ob.lane === player.lane));
    if (!o) return;
    tipConfig.seen[o.type] = true;
    tipConfig.onSeen(o.type);
    const text = tipConfig.text[o.type];
    if (text) currentTip = { obstacle: o, text };
  }

  function drawTip() {
    if (!currentTip) return;
    const pulse = 0.85 + 0.15 * Math.sin(performance.now() / 120);
    ctx.save();
    ctx.globalAlpha = pulse;
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    const w = Math.min(ROAD_W - 8, ctx.measureText(currentTip.text).width + 14);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(ROAD_W / 2 - w / 2 - 1, 107, w + 2, 18);
    ctx.fillStyle = '#f8f4e3';
    ctx.fillRect(ROAD_W / 2 - w / 2, 108, w, 16);
    ctx.fillStyle = '#c1502e';
    ctx.fillText(currentTip.text, ROAD_W / 2, 119);
    ctx.restore();
  }

  // The desert backdrop is one tall picture. It scrolls down and repeats; every
  // other copy is flipped upside down so the join is seamless.
  let roadFlipped = null;

  function flippedRoad(img) {
    if (!roadFlipped) {
      roadFlipped = document.createElement('canvas');
      roadFlipped.width = img.naturalWidth;
      roadFlipped.height = img.naturalHeight;
      const g = roadFlipped.getContext('2d');
      g.translate(0, img.naturalHeight);
      g.scale(1, -1);
      g.drawImage(img, 0, 0);
    }
    return roadFlipped;
  }

  function drawRoad() {
    const img = sprite('road');
    if (!img) {
      ctx.fillStyle = '#c98a4b';
      ctx.fillRect(0, 0, ROAD_W, ROAD_H);
      return;
    }
    const tileH = img.naturalHeight / ROAD_SCALE;
    const n = Math.floor(distance / tileH);
    const pos = distance - n * tileH;
    // tile n sits at [pos, pos + tileH]; the next tile (n + 1) is just above it
    const pick = (i) => (i % 2 === 0 ? img : flippedRoad(img));
    ctx.drawImage(pick(n), 0, pos, ROAD_W, tileH);
    ctx.drawImage(pick(n + 1), 0, pos - tileH, ROAD_W, tileH);
  }

  // The cactus stands in its lane, centred on the lane's x.
  function drawCactus(o) {
    const img = sprite('cactus');
    if (!img) return;
    const w = img.naturalWidth * ART_PX / ROAD_SCALE;
    const h = img.naturalHeight * ART_PX / ROAD_SCALE;
    ctx.drawImage(img, ROAD_LANES[o.lane] - w / 2, o.y + (o.h - h) / 2, w, h);
  }

  // The cactus, snake and rocks are pixel-art sprites. The snake is drawn facing right, or
  // mirrored to face left (they alternate); a shot snake is greyed out.
  function drawSnake(o) {
    const img = sprite(o.dead ? 'snakeDead' : 'snake');
    if (!img) return;
    const w = img.naturalWidth * ART_PX / ROAD_SCALE;
    const h = img.naturalHeight * ART_PX / ROAD_SCALE;
    const x = (ROAD_W - w) / 2;
    const y = o.y + (o.h - h) / 2;
    ctx.save();
    if (o.facingLeft) {
      ctx.translate(ROAD_W, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(img, x, y, w, h);
    ctx.restore();
  }

  // A row of rocks of different sizes with shrubs between them, centred on the track.
  function drawBoulder(o) {
    const img = sprite('rocks');
    if (!img) return;
    const w = img.naturalWidth * ART_PX / ROAD_SCALE;
    const h = img.naturalHeight * ART_PX / ROAD_SCALE;
    ctx.drawImage(img, (ROAD_W - w) / 2, o.y + (o.h - h) / 2, w, h);
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

  // Score pill (top-left) and the milestone banner beneath it.
  function drawHud() {
    const score = metres() + ' m';
    ctx.save();
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'left';
    const newBest = bestMetres > 0 && metres() > bestMetres;
    const label = newBest ? score + '  NEW BEST' : score;
    const w = ctx.measureText(label).width + 10;
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(4, 4, w + 2, 15);
    ctx.fillStyle = '#f8f4e3';
    ctx.fillRect(5, 5, w, 13);
    ctx.fillStyle = newBest ? '#c1502e' : '#1a1a1a';
    ctx.fillText(label, 10, 15);

    if (banner && performance.now() < banner.until) {
      const lines = banner.sub ? [banner.text, banner.sub] : [banner.text];
      ctx.textAlign = 'center';
      const bw = Math.min(ROAD_W - 8, Math.max(...lines.map((t) => ctx.measureText(t).width)) + 16);
      const bh = lines.length * 11 + 6;
      const by = 28;
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(ROAD_W / 2 - bw / 2 - 1, by - 1, bw + 2, bh + 2);
      ctx.fillStyle = '#f8f4e3';
      ctx.fillRect(ROAD_W / 2 - bw / 2, by, bw, bh);
      ctx.fillStyle = '#c1502e';
      lines.forEach((t, i) => ctx.fillText(t, ROAD_W / 2, by + 12 + i * 11));
    }
    ctx.restore();
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
    drawHud();
    drawTip();
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

  function getScore() { return distance ? metres() : 0; }

  function setBest(m) { bestMetres = m || 0; }

  function getLane() { return player ? player.lane : 1; }

  return { init, start, stop, setLane, jump, shoot, pause, resume, getDistance, getScore, getLane, setTips, setBest };
})();

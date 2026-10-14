// Game shell: title / win / lose overlay, touch controls, best score, pause.

(function main() {
  const GAME = RoadGame;
  const WIN_DISTANCE = ROAD_WIN_DISTANCE;
  const BEST_KEY = 'spikey-road-best';
  const INTRO_LINES = [
    'The journey to Veracruz is long and dangerous',
    '',
    { text: 'Shoot the rattlesnakes in your path', icon: 'assets/snake.png' },
    '',
    { text: 'Avoid spikey cactuses', icon: 'assets/cactus.png' },
    '',
    { text: 'Jump over rocks and boulders', icon: 'assets/rock.png' },
  ];
  const LOSE_TEXT = {default:'The road got the better of you.'};

  const canvas = document.getElementById('road-canvas');
  const overlay = document.getElementById('overlay');
  const titleEl = document.getElementById('overlay-title');
  const subEl = document.getElementById('overlay-sub');
  const bodyEl = document.getElementById('overlay-body');
  const bestEl = document.getElementById('overlay-best');
  const button = document.getElementById('overlay-button');

  let state = 'title'; // 'title' | 'playing' | 'paused' | 'over'

  function loadBest() {
    try { return Number(localStorage.getItem(BEST_KEY)) || 0; } catch (e) { return 0; }
  }

  function saveBest(value) {
    try { localStorage.setItem(BEST_KEY, String(value)); } catch (e) { /* storage unavailable */ }
  }

  function pct(distance) {
    return Math.min(100, Math.floor((distance / WIN_DISTANCE) * 100));
  }

  // lines: strings, or { text, icon } for a line with a picture after it.
  // intro: true gives the white instructions-screen look; false is the plain card.
  function showOverlay(title, sub, lines, buttonLabel, intro) {
    overlay.classList.toggle('intro', !!intro);
    titleEl.textContent = title;
    subEl.textContent = sub;
    bodyEl.innerHTML = '';
    lines.forEach((line) => {
      const p = document.createElement('p');
      const text = typeof line === 'string' ? line : line.text;
      if (!text) p.className = 'gap';
      p.appendChild(document.createTextNode(text));
      if (line.icon) {
        const img = document.createElement('img');
        img.src = line.icon;
        img.alt = '';
        p.appendChild(img);
      }
      bodyEl.appendChild(p);
    });
    const best = loadBest();
    bestEl.textContent = best ? 'best: ' + best + '%' : '';
    button.textContent = buttonLabel;
    overlay.classList.remove('hidden');
    button.focus();
  }

  function finish(won, reason) {
    state = 'over';
    const reached = won ? 100 : pct(GAME.getDistance());
    if (reached > loadBest()) saveBest(reached);
    if (won) {
      showOverlay('Bienvenidos a Veracruz', 'You made it!', ['100% of the road travelled.'], 'play again');
    } else {
      showOverlay('Game over', LOSE_TEXT[reason] || LOSE_TEXT.default, ['You travelled ' + reached + '% of the road.'], 'try again');
    }
  }

  function begin() {
    overlay.classList.add('hidden');
    state = 'playing';
    GAME.start({ onWin: () => finish(true), onLose: (reason) => finish(false, reason) });
  }

  function togglePause() {
    if (state === 'playing') {
      GAME.pause();
      state = 'paused';
      showOverlay('Paused', '', [], 'resume');
    } else if (state === 'paused') {
      resume();
    }
  }

  function resume() {
    overlay.classList.add('hidden');
    state = 'playing';
    GAME.resume();
  }

  button.addEventListener('click', () => {
    if (state === 'paused') resume();
    else begin();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'p' || e.key === 'P') { togglePause(); return; }
    if (state === 'playing' && (e.key === ' ' || e.key.startsWith('Arrow'))) e.preventDefault();
  });

  // Keep the game from running while the tab is hidden.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && state === 'playing') togglePause();
  });

  // Touch controls (touch devices only; desktop uses the keyboard).
  //   tap the road above / below the player -> change lane
  //   shoot bar down the right side           -> shoot
  //   jump bar under the road                 -> jump
  const root = document.getElementById('game-root');
  const hint = document.getElementById('touch-hint');
  const jumpBar = document.getElementById('jump-bar');
  const shootBar = document.getElementById('shoot-bar');
  const HINT_KEY = 'spikey-road-hint-seen';
  const TOUCH = window.matchMedia('(pointer: coarse)').matches;

  // Lane the tap landed in, picked from where the tap fell on the 144px-tall road.
  function tappedLane(clientY) {
    const rect = root.getBoundingClientRect();
    const y = ((clientY - rect.top) / rect.height) * 144;
    let nearest = 0;
    ROAD_LANES.forEach((laneY, i) => {
      if (Math.abs(laneY + 8 - y) < Math.abs(ROAD_LANES[nearest] + 8 - y)) nearest = i;
    });
    return nearest;
  }

  function hintSeen() {
    try { return localStorage.getItem(HINT_KEY) === '1'; } catch (e) { return false; }
  }

  function dismissHint() {
    if (hint.classList.contains('hidden')) return;
    hint.classList.add('hidden');
    try { localStorage.setItem(HINT_KEY, '1'); } catch (e) { /* storage unavailable */ }
  }

  if (TOUCH) {
    document.body.classList.add('touch');

    // Anywhere on the road except the shoot bar: tap above / below the player to move.
    root.addEventListener('pointerdown', (e) => {
      if (e.target.closest('#shoot-bar')) return;
      if (state !== 'playing') return;
      e.preventDefault();
      dismissHint();
      const lane = tappedLane(e.clientY);
      const current = GAME.getLane();
      if (lane !== current) GAME.setLane(lane < current ? -1 : 1);
    });

    shootBar.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      if (state !== 'playing') return;
      dismissHint();
      GAME.shoot();
    });

    jumpBar.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      if (state !== 'playing') return;
      dismissHint();
      GAME.jump();
    });

    // First run only: show the hint over the road once the game starts.
    button.addEventListener('click', () => {
      if (state === 'playing' && !hintSeen()) hint.classList.remove('hidden');
    });
  }

  GAME.init(canvas);
  showOverlay('Road to Veracruz', '', INTRO_LINES, 'vamos', true);
})();

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
  //   swipe left / right -> move one lane
  //   swipe up           -> jump
  //   tap                -> shoot
  const root = document.getElementById('game-root');
  const hint = document.getElementById('touch-hint');
  const HINT_KEY = 'spikey-road-hint-seen';
  const TOUCH = window.matchMedia('(pointer: coarse)').matches;
  const SWIPE_PX = 24;

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

    // A swipe fires the moment the finger has travelled SWIPE_PX, so it feels
    // instant, and each touch gives at most one gesture (one swipe = one lane).
    // A touch that never travels that far is a tap (shoot) on release.
    let touch = null;

    root.addEventListener('pointerdown', (e) => {
      if (state !== 'playing') return;
      e.preventDefault();
      dismissHint();
      touch = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: false };
      if (root.setPointerCapture) root.setPointerCapture(e.pointerId);
    });

    root.addEventListener('pointermove', (e) => {
      if (!touch || touch.moved || e.pointerId !== touch.id || state !== 'playing') return;
      const dx = e.clientX - touch.x;
      const dy = e.clientY - touch.y;
      if (Math.abs(dx) >= SWIPE_PX && Math.abs(dx) > Math.abs(dy)) {
        GAME.setLane(dx < 0 ? -1 : 1);
      } else if (dy <= -SWIPE_PX && Math.abs(dy) > Math.abs(dx)) {
        GAME.jump();
      } else if (Math.hypot(dx, dy) < SWIPE_PX) {
        return; // still just a touch; wait to see if it becomes a swipe
      }
      touch.moved = true; // any drag (including swipe down) is not a tap
    });

    root.addEventListener('pointerup', (e) => {
      if (!touch || e.pointerId !== touch.id) return;
      const wasTap = !touch.moved;
      touch = null;
      if (wasTap && state === 'playing') GAME.shoot();
    });

    root.addEventListener('pointercancel', () => { touch = null; });

    // First run only: show the hint over the road once the game starts.
    button.addEventListener('click', () => {
      if (state === 'playing' && !hintSeen()) hint.classList.remove('hidden');
    });
  }

  GAME.init(canvas);
  showOverlay('Road to Veracruz', '', INTRO_LINES, 'vamos', true);
})();

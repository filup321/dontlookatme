// Shares the memory game's online leaderboard (Firebase Realtime Database, REST).
// Road to Veracruz scores are stored under scores/veracruz/<player>, in metres.
// The database URL and the player-name storage key match the memory game's
// index.html; keep them in sync if either changes.

const Leaderboard = (() => {
  const FIREBASE_URL = 'https://memory-game-c88cc-default-rtdb.firebaseio.com';
  const NAME_KEY = 'memoryGame.playerName';
  const MODE = 'veracruz';
  const TIMEOUT_MS = 5000;

  function cleanName(raw) {
    return String(raw).replace(/[\u0000-\u001f\u007f]/g, '').replace(/\s+/g, ' ').trim().slice(0, 20);
  }

  // The same name in any capitalisation is the same player.
  function playerKey(name) {
    return name.toLowerCase().replace(/[.$#\[\]\/\s]+/g, '_').slice(0, 20) || 'player';
  }

  function getName() {
    try {
      const raw = localStorage.getItem(NAME_KEY);
      return raw ? cleanName(JSON.parse(raw)) : '';
    } catch (e) { return ''; }
  }

  function setName(name) {
    try { localStorage.setItem(NAME_KEY, JSON.stringify(name)); } catch (e) { /* storage blocked */ }
  }

  async function request(path, options) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(`${FIREBASE_URL}/${path}`, Object.assign({ signal: controller.signal }, options));
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return await res.json();
    } finally {
      clearTimeout(timer);
    }
  }

  // Saves metres as this player's score if it beats their saved best.
  // Resolves to 'saved', 'not-better' or 'failed'.
  async function submit(name, metres) {
    if (!name || metres <= 0) return 'failed';
    try {
      const path = `scores/${MODE}/${encodeURIComponent(playerKey(name))}.json`;
      const existing = await request(path);
      if (existing && existing.streak >= metres) return 'not-better';
      await request(path, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, streak: metres, ts: Date.now() }),
      });
      return 'saved';
    } catch (e) {
      console.warn("Couldn't save the score online.", e);
      return 'failed';
    }
  }

  return { cleanName, getName, setName, submit };
})();

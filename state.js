// Game state and effect application

const GameState = {
  screen: 'menu', // menu | intro1 | intro2 | map | travel | road | gameover
  currentMap: null, // 'valladolid' | 'veracruz'
  player: { col: 5, row: 7, dir: 'down' },
  inventory: [],
  silverReales: 3,
  flags: {},
  dialogue: null, // { locationId, nodeId, sequenceIndex }
};

function resetGame() {
  GameState.screen = 'intro1';
  GameState.currentMap = null;
  GameState.player = { col: 5, row: 7, dir: 'down' };
  GameState.inventory = [];
  GameState.silverReales = 3;
  GameState.flags = {};
  GameState.dialogue = null;
}

function applyEffects(effects) {
  if (!effects) return;
  effects.forEach((effect) => {
    if (effect.give_item) GameState.inventory.push(effect.give_item);
    if (effect.remove_item) {
      const idx = GameState.inventory.indexOf(effect.remove_item);
      if (idx !== -1) GameState.inventory.splice(idx, 1);
    }
    if (effect.remove_silver_reales) {
      GameState.silverReales -= effect.remove_silver_reales;
    }
    if (effect.set_flag) GameState.flags[effect.set_flag] = true;
  });
}

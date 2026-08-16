// Game state and effect application

const GameState = {
  screen: 'intro1', // intro1 | intro2 | map | travel | gameover
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
    if (effect.remove_silver_reales) {
      GameState.silverReales -= effect.remove_silver_reales;
    }
  });
}

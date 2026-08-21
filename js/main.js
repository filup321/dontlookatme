// Screen manager / bootstrap.

(function main() {
  const ROAD_INSTRUCTIONS = [
    'Instructions',
    '',
    'The journey to Veracruz is long and dangerous',
    '',
    'press: "shoot" to kill rattlesnakes in your path',
    'press: "up/down" to avoid spikey cactuses',
    'press: "jump" to jump over rocks and boulders',
  ];

  const screens = {
    intro: document.getElementById('screen-intro'),
    map: document.getElementById('screen-map'),
    road: document.getElementById('screen-road'),
    gameover: document.getElementById('screen-gameover'),
  };

  const introEls = {
    text: document.getElementById('intro-text'),
    button: document.getElementById('intro-button'),
  };

  const dialogueEls = {
    overlay: document.getElementById('dialogue-overlay'),
    speaker: document.getElementById('dialogue-speaker'),
    text: document.getElementById('dialogue-text'),
    choices: document.getElementById('dialogue-choices'),
    inputForm: document.getElementById('dialogue-input-form'),
    inputField: document.getElementById('dialogue-input-field'),
    continuePrompt: document.getElementById('dialogue-continue'),
  };

  const canvas = document.getElementById('game-canvas');
  const mapLabels = document.getElementById('map-labels');
  const playAgainButton = document.getElementById('play-again-button');
  const dpad = document.getElementById('dpad');

  const roadCanvas = document.getElementById('road-canvas');
  const roadControls = document.getElementById('road-controls');
  const roadLoseOverlay = document.getElementById('road-lose-overlay');
  const roadLoseText = document.getElementById('road-lose-text');
  const roadTryAgainButton = document.getElementById('road-try-again-button');

  function showScreen(name) {
    Object.values(screens).forEach((el) => el.classList.add('hidden'));
    screens[name].classList.remove('hidden');
  }

  function startMap() {
    GameState.screen = 'map';
    showScreen('map');
    dpad.classList.remove('hidden');
    MapScreen.loadMap('valladolid');
  }

  IntroSequence.init(introEls, {
    onComplete: startMap,
  });

  function runRoadGame() {
    roadLoseOverlay.classList.add('hidden');
    roadControls.classList.remove('hidden');
    RoadGame.start({
      onWin: () => {
        roadControls.classList.add('hidden');
        showScreen('intro');
        IntroSequence.showCustom(['Bienvenidos a Veracruz'], 'vamos', () => {
          GameState.screen = 'map';
          showScreen('map');
          dpad.classList.remove('hidden');
          MapScreen.loadMap('veracruz');
        });
      },
      onLose: () => {
        roadControls.classList.add('hidden');
        roadLoseText.textContent = 'The road got the better of you.';
        roadLoseOverlay.classList.remove('hidden');
      },
    });
  }

  function startRoadToVeracruz() {
    dpad.classList.add('hidden');
    showScreen('intro');
    IntroSequence.showCustom(ROAD_INSTRUCTIONS, 'vamos', () => {
      GameState.screen = 'road';
      showScreen('road');
      runRoadGame();
    });
  }

  RoadGame.init(roadCanvas);
  roadTryAgainButton.addEventListener('click', runRoadGame);

  MapScreen.init(canvas, mapLabels, {
    onEnterBuilding: (locationId) => {
      if (locationId === 'Camino_a_Veracruz') {
        startRoadToVeracruz();
        return;
      }
      dpad.classList.add('hidden');
      DialogueEngine.open(locationId);
    },
  });

  DialogueEngine.init(dialogueEls, {
    onClosed: () => {
      dpad.classList.remove('hidden');
      MapScreen.draw();
    },
    onGameOver: () => {
      GameState.screen = 'gameover';
      dpad.classList.add('hidden');
      showScreen('gameover');
    },
  });

  document.getElementById('road-up').addEventListener('click', () => RoadGame.setLane(-1));
  document.getElementById('road-down').addEventListener('click', () => RoadGame.setLane(1));
  document.getElementById('road-shoot').addEventListener('click', () => RoadGame.shoot());
  document.getElementById('road-jump').addEventListener('click', () => RoadGame.jump());

  ['up', 'down', 'left', 'right'].forEach((dir) => {
    document.getElementById(`dpad-${dir}`).addEventListener('click', () => {
      MapScreen.move(dir);
    });
  });

  dialogueEls.inputForm.addEventListener('submit', (e) => {
    e.preventDefault();
    DialogueEngine.submitInput();
  });

  playAgainButton.addEventListener('click', () => {
    resetGame();
    dpad.classList.add('hidden');
    showScreen('intro');
    IntroSequence.show('intro1');
  });

  showScreen('intro');
  IntroSequence.show('intro1');
})();

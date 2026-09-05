// Screen manager / bootstrap.

(function main() {
  function roadInstructions(destination) {
    return [
      'Instructions',
      '',
      `The journey to ${destination} is long and dangerous`,
      '',
      'press: "shoot" to kill rattlesnakes in your path',
      'press: "up/down" to avoid spikey cactuses',
      'press: "jump" to jump over rocks and boulders',
    ];
  }

  const ROAD_INSTRUCTIONS = roadInstructions('Veracruz');
  const DOLORES_ROAD_INSTRUCTIONS = roadInstructions('Dolores');
  const NIGHT_ROAD_INSTRUCTIONS = [
    'Instructions',
    '',
    'The journey to Pueblo is long and dangerous',
    '',
    'press: "fire" to scare off coyotes',
    'press: "up/down" to avoid quicksand',
    'press: "hide" to hide from bandits',
  ];

  const screens = {
    menu: document.getElementById('screen-menu'),
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
    box: document.getElementById('dialogue-box'),
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
  const roadShootButton = document.getElementById('road-shoot');
  const roadJumpButton = document.getElementById('road-jump');

  let activeGame = 'desert'; // 'desert' | 'night' — which module the on-screen buttons drive

  function showScreen(name) {
    Object.values(screens).forEach((el) => el.classList.add('hidden'));
    screens[name].classList.remove('hidden');
  }

  function enterMap(mapId) {
    GameState.screen = 'map';
    showScreen('map');
    dpad.classList.remove('hidden');
    MapScreen.loadMap(mapId);
  }

  function startMap() {
    enterMap('valladolid');
  }

  IntroSequence.init(introEls, {
    onComplete: startMap,
  });

  let activeRoadRetry = null;

  function runRoadGame() {
    activeRoadRetry = runRoadGame;
    activeGame = 'desert';
    roadShootButton.textContent = 'shoot';
    roadJumpButton.textContent = 'jump';
    roadLoseOverlay.classList.add('hidden');
    roadControls.classList.remove('hidden');
    RoadGame.start({
      onWin: () => {
        roadControls.classList.add('hidden');
        showScreen('intro');
        IntroSequence.showCustom(['Bienvenidos a Veracruz'], 'vamos', () => {
          enterMap('veracruz');
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

  function runDoloresRoadGame() {
    activeRoadRetry = runDoloresRoadGame;
    activeGame = 'desert';
    roadShootButton.textContent = 'shoot';
    roadJumpButton.textContent = 'jump';
    roadLoseOverlay.classList.add('hidden');
    roadControls.classList.remove('hidden');
    RoadGame.start({
      onWin: () => {
        roadControls.classList.add('hidden');
        showScreen('intro');
        IntroSequence.showCustom(['To be continued...'], 'ok', () => {
          enterMap('pueblo');
        });
      },
      onLose: () => {
        roadControls.classList.add('hidden');
        roadLoseText.textContent = 'The road got the better of you.';
        roadLoseOverlay.classList.remove('hidden');
      },
    });
  }

  function startRoadToDolores() {
    dpad.classList.add('hidden');
    showScreen('intro');
    IntroSequence.showCustom(DOLORES_ROAD_INSTRUCTIONS, 'vamos', () => {
      GameState.screen = 'road';
      showScreen('road');
      runDoloresRoadGame();
    });
  }

  const NIGHT_LOSE_TEXT = {
    quicksand: 'You sank into the quicksand.',
    coyote: 'The coyotes caught you.',
    bandit: 'The bandits got you.',
  };

  function runPuebloNightGame() {
    activeRoadRetry = runPuebloNightGame;
    activeGame = 'night';
    roadShootButton.textContent = 'fire';
    roadJumpButton.textContent = 'hide';
    roadLoseOverlay.classList.add('hidden');
    roadControls.classList.remove('hidden');
    NightRoadGame.start({
      onWin: () => {
        roadControls.classList.add('hidden');
        showScreen('intro');
        IntroSequence.showCustom(['Bienvenidos a Pueblo'], 'vamos', () => {
          enterMap('pueblo');
        });
      },
      onLose: (reason) => {
        roadControls.classList.add('hidden');
        roadLoseText.textContent = NIGHT_LOSE_TEXT[reason] || 'The night got the better of you.';
        roadLoseOverlay.classList.remove('hidden');
      },
    });
  }

  function startRoadToPueblo() {
    dpad.classList.add('hidden');
    showScreen('intro');
    IntroSequence.showCustom(NIGHT_ROAD_INSTRUCTIONS, 'vamos', () => {
      GameState.screen = 'road';
      showScreen('road');
      runPuebloNightGame();
    });
  }

  RoadGame.init(roadCanvas);
  NightRoadGame.init(roadCanvas);
  roadTryAgainButton.addEventListener('click', () => {
    if (activeRoadRetry) activeRoadRetry();
  });

  MapScreen.init(canvas, mapLabels, {
    onEnterBuilding: (locationId) => {
      if (locationId === 'Camino_a_Veracruz') {
        startRoadToVeracruz();
        return;
      }
      if (locationId === 'Camino_a_Pueblo') {
        startRoadToPueblo();
        return;
      }
      if (locationId === 'Horse_Bojangles') {
        startRoadToDolores();
        return;
      }
      if (locationId === 'La_Huerta_Backyard_Exit') {
        enterMap('pueblo');
        return;
      }
      if (locationId === 'El_Rancho' && !GameState.flags.pueblo_rancho_unlocked) {
        dpad.classList.add('hidden');
        DialogueEngine.open('El_Rancho_Sign');
        return;
      }
      if (locationId === 'La_Huerta' && !GameState.flags.pueblo_huerta_unlocked) {
        dpad.classList.add('hidden');
        DialogueEngine.open('La_Huerta_Sign');
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
    onEnterMap: (mapId) => {
      enterMap(mapId);
    },
  });

  document.getElementById('road-up').addEventListener('click', () => {
    if (activeGame === 'night') NightRoadGame.setLane(-1); else RoadGame.setLane(-1);
  });
  document.getElementById('road-down').addEventListener('click', () => {
    if (activeGame === 'night') NightRoadGame.setLane(1); else RoadGame.setLane(1);
  });
  roadShootButton.addEventListener('click', () => {
    if (activeGame === 'night') NightRoadGame.fire(); else RoadGame.shoot();
  });
  roadJumpButton.addEventListener('click', () => {
    if (activeGame === 'night') NightRoadGame.hide(); else RoadGame.jump();
  });

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

  // Landing page / main menu. Each button hands off to an entry point that
  // already exists below; the menu only gates which one runs first.
  function showMenu() {
    GameState.screen = 'menu';
    dpad.classList.add('hidden');
    roadControls.classList.add('hidden');
    showScreen('menu');
  }

  function startNewGame() {
    resetGame();
    dpad.classList.add('hidden');
    showScreen('intro');
    IntroSequence.show('intro1');
  }

  document.getElementById('menu-new-game').addEventListener('click', startNewGame);
  document.getElementById('menu-minigame-1').addEventListener('click', startRoadToVeracruz);
  document.getElementById('menu-minigame-2').addEventListener('click', startRoadToPueblo);

  const startMapId = new URLSearchParams(window.location.search).get('start');
  if (startMapId && MAPS[startMapId]) {
    if (startMapId === 'pueblo') {
      GameState.flags.pueblo_rancho_unlocked = true;
      GameState.flags.pueblo_huerta_unlocked = true;
    }
    enterMap(startMapId);
  } else {
    showMenu();
  }
})();

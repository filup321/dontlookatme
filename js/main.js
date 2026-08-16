// Screen manager / bootstrap.

(function main() {
  const screens = {
    intro: document.getElementById('screen-intro'),
    map: document.getElementById('screen-map'),
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

  MapScreen.init(canvas, mapLabels, {
    onEnterBuilding: (locationId) => {
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
    onTravel: (destination) => {
      dpad.classList.add('hidden');
      showScreen('intro');
      IntroSequence.showCustom(['Bienvenidos a Veracruz'], 'vamos', () => {
        GameState.screen = 'map';
        showScreen('map');
        dpad.classList.remove('hidden');
        MapScreen.loadMap(destination);
      });
    },
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

  showScreen('intro');
  IntroSequence.show('intro1');
})();

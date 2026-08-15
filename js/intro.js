// Intro / loading screen sequence, verbatim text from the script.

const INTRO_SCREENS = [
  {
    id: 'intro1',
    lines: [
      'Buenos días amigo!',
      'Bienvenidos a Mexico',
      '',
      'The year is 1808',
      '',
      'The fate of this nation is at a turning point',
      '',
      'Spanish rule has left the majority of its subjects in desperate positions, while enriching the small population of Peninsulares',
    ],
    button: 'next',
    next: 'intro2',
  },
  {
    id: 'intro2',
    lines: [
      'But there is hope',
      '',
      'News has arrived that Napoleon has invaded Spain and deposed the Spanish king, Ferdinand VII',
      '',
      'And word has spread of a Criollos priest named Miguel Hidalgo rallying people to a fight for independence',
      '',
      'Rumor has it this priest is from Valladolid in the Michoacán region',
      '',
      'Go to the Colegio de San Nicolás in Valladolid and see what you can find out about this priest.',
      '',
      '¡Con todo!',
    ],
    button: 'Vamos!',
    next: 'map',
  },
];

const IntroSequence = (() => {
  let els = null;
  let onComplete = () => {};

  function init(elements, callbacks) {
    els = elements;
    onComplete = callbacks.onComplete || onComplete;
  }

  function show(screenId) {
    const screen = INTRO_SCREENS.find((s) => s.id === screenId);
    if (!screen) return;
    GameState.screen = screen.id;
    els.text.innerHTML = '';
    screen.lines.forEach((line) => {
      const p = document.createElement('p');
      p.textContent = line === '' ? ' ' : line;
      els.text.appendChild(p);
    });
    els.button.textContent = screen.button;
    els.button.onclick = () => {
      if (screen.next === 'map') {
        onComplete();
      } else {
        show(screen.next);
      }
    };
  }

  return { init, show };
})();

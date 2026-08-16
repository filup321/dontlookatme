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

  // Blank entries in a screen's `lines` array render as a full blank line
  // (via the blank-line CSS class) rather than an actual space character,
  // since a lone space collapses to zero height under normal CSS whitespace rules.
  function renderLines(lines, buttonText, onClick) {
    els.text.innerHTML = '';
    lines.forEach((line) => {
      const p = document.createElement('p');
      if (line === '') {
        p.className = 'blank-line';
      } else {
        p.textContent = line;
      }
      els.text.appendChild(p);
    });
    els.button.textContent = buttonText;
    els.button.onclick = onClick;
  }

  function show(screenId) {
    const screen = INTRO_SCREENS.find((s) => s.id === screenId);
    if (!screen) return;
    GameState.screen = screen.id;
    renderLines(screen.lines, screen.button, () => {
      if (screen.next === 'map') {
        onComplete();
      } else {
        show(screen.next);
      }
    });
  }

  function showCustom(lines, buttonText, onContinue) {
    GameState.screen = 'travel';
    renderLines(lines, buttonText, onContinue);
  }

  return { init, show, showCustom };
})();

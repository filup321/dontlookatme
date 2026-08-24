// Generic node-graph dialogue player. Reads DIALOGUE_TREES, drives the dialogue DOM overlay.

const DialogueEngine = (() => {
  let els = null;
  let onClosed = () => {};
  let onGameOver = () => {};

  function init(elements, callbacks) {
    els = elements;
    onClosed = callbacks.onClosed || onClosed;
    onGameOver = callbacks.onGameOver || onGameOver;
  }

  function open(locationId) {
    const tree = DIALOGUE_TREES[locationId];
    if (!tree) return;
    GameState.dialogue = { locationId, nodeId: tree.start, sequenceIndex: 0 };
    els.overlay.classList.remove('hidden');
    renderNode();
  }

  function close() {
    GameState.dialogue = null;
    els.overlay.classList.add('hidden');
    onClosed();
  }

  function currentTree() {
    return DIALOGUE_TREES[GameState.dialogue.locationId];
  }

  function goto(target) {
    if (target === 'EXIT') {
      close();
      return;
    }
    if (target === 'GAME_OVER') {
      close();
      onGameOver();
      return;
    }
    GameState.dialogue.nodeId = target;
    GameState.dialogue.sequenceIndex = 0;
    renderNode();
  }

  function renderLines(speaker, lines) {
    els.speaker.textContent = speaker || '';
    els.speaker.classList.toggle('hidden', !speaker);
    els.text.innerHTML = '';
    lines.forEach((line) => {
      const p = document.createElement('p');
      p.textContent = line.text;
      p.className = line.type === 'action' ? 'line-action'
        : line.type === 'narration' ? 'line-narration'
        : 'line-speech';
      els.text.appendChild(p);
    });
  }

  function clearInteraction() {
    els.choices.innerHTML = '';
    els.choices.classList.add('hidden');
    els.inputForm.classList.add('hidden');
    els.continuePrompt.classList.add('hidden');
  }

  function renderNode() {
    const tree = currentTree();
    const node = tree.nodes[GameState.dialogue.nodeId];
    clearInteraction();

    if (node.type === 'sequence') {
      renderSequenceStep(node);
      return;
    }

    if (node.effects) applyEffects(node.effects);

    if (node.type === 'input') {
      renderLines(node.speaker, node.lines);
      els.inputForm.classList.remove('hidden');
      els.inputField.value = '';
      els.inputField.focus();
      return;
    }

    renderLines(node.speaker, node.lines);

    if (node.choices && node.choices.length > 0) {
      renderChoices(node.choices);
      return;
    }

    if (node.next) {
      els.continuePrompt.classList.remove('hidden');
      els.continuePrompt.onclick = () => goto(node.next);
      return;
    }

    if (node.autoExit) {
      els.continuePrompt.classList.remove('hidden');
      els.continuePrompt.onclick = () => goto('EXIT');
      return;
    }

    if (node.goto) {
      els.continuePrompt.classList.remove('hidden');
      els.continuePrompt.onclick = () => goto(node.goto);
    }
  }

  function renderChoices(choices) {
    els.choices.classList.remove('hidden');
    choices.forEach((choice) => {
      const btn = document.createElement('button');
      btn.className = 'dialogue-choice';
      btn.textContent = choice.text;
      btn.addEventListener('click', () => goto(choice.goto));
      els.choices.appendChild(btn);
    });
  }

  function renderSequenceStep(node) {
    const idx = GameState.dialogue.sequenceIndex;
    if (idx >= node.steps.length) {
      if (node.choices && node.choices.length > 0) {
        renderChoices(node.choices);
        return;
      }
      goto(node.goto);
      return;
    }
    const step = node.steps[idx];
    const label = step.speaker === 'Player' ? 'You' : step.speaker;
    renderLines(label, [step]);
    els.continuePrompt.classList.remove('hidden');
    els.continuePrompt.onclick = () => {
      GameState.dialogue.sequenceIndex += 1;
      renderNode();
    };
  }

  function submitInput() {
    const tree = currentTree();
    const node = tree.nodes[GameState.dialogue.nodeId];
    if (node.type !== 'input') return;
    const answer = els.inputField.value.trim().toLowerCase();
    const isCorrect = node.accept.some((accepted) => accepted.toLowerCase() === answer);
    goto(isCorrect ? node.correctGoto : node.wrongGoto);
  }

  return { init, open, close, submitInput };
})();

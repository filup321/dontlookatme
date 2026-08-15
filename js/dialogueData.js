// Dialogue trees, verbatim from the provided script.
// Line types: 'speech' (spoken, in quotes) | 'action' (italic stage direction) | 'narration' (unattributed narrator text)
// Node shapes:
//   choice node: { speaker, lines, choices: [{text, goto}] }
//   auto-advance node (no choices): { speaker, lines, choices: [], autoExit: true }  -> tap closes dialogue
//   auto-advance to another node: { speaker, lines, choices: [], next: 'nodeId' }
//   sequence node: { type: 'sequence', steps: [{speaker, type, text}], goto: 'EXIT' | nodeId }
//   input node: { type: 'input', speaker, lines, accept: [...], correctGoto, wrongGoto }
//   narration -> special target: { lines, choices: [], goto: 'GAME_OVER' }

const DIALOGUE_TREES = {
  El_Mercado: {
    start: 'mercado_greeting',
    nodes: {
      mercado_greeting: {
        speaker: 'Merchant',
        lines: [
          { type: 'speech', text: 'You look hungry Amigo. What kind of dessert do you want... Cause I got it!' },
        ],
        choices: [
          { text: "I'll take one rice pudding", goto: 'mercado_buy_pudding' },
          { text: 'I’m looking for the Colegio de San Nicolás, know where that is?', goto: 'mercado_directions_without_buying_pudding' },
          { text: 'Leave', goto: 'EXIT' },
        ],
      },
      mercado_buy_pudding: {
        speaker: 'Merchant',
        lines: [
          { type: 'speech', text: 'One silver reale, por favor' },
        ],
        effects: [{ give_item: 'rice_pudding' }, { remove_silver_reales: 1 }],
        choices: [
          { text: 'This is just the type of chum I need for my adventure. Thank you!', goto: 'mercado_thank_you' },
        ],
      },
      mercado_thank_you: {
        speaker: 'Merchant',
        lines: [
          { type: 'speech', text: 'De Nada. ¿Algo mas?' },
        ],
        choices: [
          { text: 'I’m looking for the Colegio de San Nicolás, know where that is?', goto: 'mercado_directions_with_buying_pudding' },
          { text: 'No i’m good. This rice pudding is very tasty. I’m tempted to quit my adventure and spend the rest of my life eating rice pudding', goto: 'EXIT' },
        ],
      },
      mercado_directions_without_buying_pudding: {
        speaker: 'Merchant',
        lines: [
          { type: 'speech', text: 'no se' },
        ],
        choices: [],
        autoExit: true,
      },
      mercado_directions_with_buying_pudding: {
        speaker: 'Merchant',
        lines: [
          { type: 'speech', text: 'When you exit this building, It’s the big building in the top middle of the screen. You can’t miss it' },
        ],
        choices: [
          { text: 'what happens if I do miss it?', goto: 'missed_directions' },
          { text: 'thank you and thank you for the rice pudding. I’m going to have dreams about it forsure', goto: 'EXIT' },
        ],
      },
      missed_directions: {
        type: 'sequence',
        speaker: 'Merchant',
        steps: [
          { speaker: 'Merchant', type: 'speech', text: 'are you trying be smart with me' },
          { speaker: 'Merchant', type: 'action', text: '*merchant pulls out a pistol*' },
          { speaker: 'Player', type: 'speech', text: 'no not at all, kind of a little bit but meant nothing of it' },
          { speaker: 'Merchant', type: 'speech', text: 'ahhh i’m just kidding amigo. I would never shoot you. Just a joke see. returning the favor.' },
          { speaker: 'Player', type: 'speech', text: 'ok i better get going' },
        ],
        goto: 'EXIT',
      },
    },
  },

  La_Cantina: {
    start: 'bartender_greeting',
    nodes: {
      bartender_greeting: {
        speaker: 'Bartender',
        lines: [
          { type: 'speech', text: 'Hola Horseneck ¿Qué quieres beber?' },
        ],
        choices: [
          { text: '*confused* "did you just call me a horseneck?"', goto: 'bartender_horseneck' },
          { text: '¿cerveza?', goto: 'bartender_cerveza' },
          { text: 'leave', goto: 'EXIT' },
        ],
      },
      bartender_horseneck: {
        speaker: 'Bartender',
        lines: [
          { type: 'speech', text: 'pshhhh' },
          { type: 'action', text: '*bartender flicks his hand at you and turns away*' },
        ],
        choices: [],
        autoExit: true,
      },
      bartender_cerveza: {
        speaker: 'Bartender',
        lines: [
          { type: 'speech', text: 'here you go horseneck' },
          { type: 'action', text: '*pours beer and slides it to you*' },
        ],
        choices: [
          { text: 'why are you calling me a horseneck?', goto: 'bartender_horseneck' },
          { text: 'thanks horseneck', goto: 'bartender_happy' },
        ],
      },
      bartender_happy: {
        speaker: 'Bartender',
        lines: [
          { type: 'action', text: 'Bartender laughs and walks away to take care of other customers' },
        ],
        choices: [
          { text: 'leave', goto: 'EXIT' },
          { text: 'stay and get hammered', goto: 'bad_decisions' },
        ],
      },
      bad_decisions: {
        lines: [
          { type: 'narration', text: 'Congratulations, you blackout, picked a fight with a vaquero, got shot in the chest and bleed out behind the cantina. You’re dead.' },
        ],
        choices: [],
        goto: 'GAME_OVER',
      },
    },
  },

  Colegio_de_San_Nicolas: {
    start: 'professor_greeting',
    nodes: {
      professor_greeting: {
        speaker: 'Professor',
        lines: [
          { type: 'speech', text: '¿hola, what brings you in?' },
        ],
        choices: [
          { text: 'I’m looking for a priest named Miguel Hidalgo. I heard he studied here. Know where he might be?', goto: 'professor_riddle' },
        ],
      },
      professor_riddle: {
        speaker: 'Professor',
        lines: [
          { type: 'speech', text: 'i’ll tell you but only if you can answer this riddle and prove your not some milk brained Peninsulare. Listen carefully:' },
        ],
        choices: [],
        next: 'riddle_display',
      },
      riddle_display: {
        type: 'input',
        speaker: 'Professor',
        lines: [
          {
            type: 'speech',
            text: 'I’m New Spain’s biggest export\nI’m optimism in the face bad events\nI’m a quick fix in a difficult situation\nI’m a reward for second place\nDid that last one make it too easy?\nWhat am I?',
          },
        ],
        accept: ['silver', 'plata'],
        correctGoto: 'correct_answer',
        wrongGoto: 'wrong_answer',
      },
      wrong_answer: {
        speaker: 'Professor',
        lines: [
          { type: 'speech', text: 'wow you’re dumber than the bartender at La Cantina.' },
        ],
        choices: [],
        autoExit: true,
      },
      correct_answer: {
        speaker: 'Professor',
        lines: [
          { type: 'speech', text: 'congrats, I heard the priest was in Veracruz recently. You may want to head there and ask around' },
        ],
        choices: [],
        autoExit: true,
      },
    },
  },
};

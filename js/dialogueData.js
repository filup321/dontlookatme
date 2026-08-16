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
          { text: 'order tequila shots', goto: 'bad_decisions' },
        ],
      },
      bad_decisions: {
        speaker: 'You',
        lines: [
          { type: 'speech', text: 'who else do you know that wakes up in the morning and orders tequila shots like me?! Nobody! That’s who. I’m the only one you know who wakes up and orders tequila shots' },
          { type: 'narration', text: 'Congratulations, you took 9 tequila shots, passed out behind the cantina, got bit by a rattlesnake and died. You’re dead.' },
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
          { type: 'speech', text: 'ay caramba… I see you are not the brightest tool in the shed.' },
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
        goto: 'TRAVEL_VERACRUZ',
      },
    },
  },

  Puerto_de_Veracruz: {
    start: 'dock_worker_intro',
    nodes: {
      dock_worker_intro: {
        lines: [
          { type: 'narration', text: 'You see a dock worker loading sturdy looking wooden chests onto a ship' },
        ],
        choices: [
          { text: 'get his attention', goto: 'dock_worker_greeting' },
          { text: 'leave', goto: 'EXIT' },
        ],
      },
      dock_worker_greeting: {
        type: 'sequence',
        steps: [
          { speaker: 'Dock Worker', type: 'speech', text: 'what do you want' },
          { speaker: 'Player', type: 'speech', text: 'what’s in the chests?' },
          { speaker: 'Dock Worker', type: 'speech', text: 'i’m not telling you that, ¡vete a la mierda!' },
          { speaker: 'Player', type: 'speech', text: 'ahh so must be something valuable' },
          { speaker: 'Dock Worker', type: 'speech', text: 'everything being shipped is valuable, how else do you think we pay for the voyage. ¡idiota!' },
          { speaker: 'Player', type: 'speech', text: 'and I suppose the crown gets its cut and everyone is happy' },
          { speaker: 'Dock Worker', type: 'action', text: '*looks at you suspiciously*' },
          { speaker: 'Dock Worker', type: 'speech', text: 'who are you? what do you want?' },
          { speaker: 'Player', type: 'speech', text: 'i’m looking for a priest named Miguel Hidalgo. Heard he was in Veracruz recently' },
          { speaker: 'Dock Worker', type: 'speech', text: 'for what purpose?' },
        ],
        choices: [
          { text: 'tell the truth', goto: 'dock_worker_truth' },
          { text: 'lie', goto: 'dock_worker_lie' },
        ],
      },
      dock_worker_truth: {
        type: 'sequence',
        steps: [
          { speaker: 'Player', type: 'speech', text: 'i’ve heard he’s been rallying people to his cause against the crown. I’m interested in joining' },
          { speaker: 'Dock Worker', type: 'speech', text: 'ahhh big risk telling me that. How do you know i’m not a peninsulare?' },
          { speaker: 'Player', type: 'speech', text: 'just a hunch. So do you know anything or not?' },
          { speaker: 'Dock Worker', type: 'speech', text: 'last I heard he was in Dolores. Or was it Pueblo? It was one of those two but not sure which.' },
          { speaker: 'Player', type: 'speech', text: 'ok thank you' },
        ],
        goto: 'EXIT',
      },
      dock_worker_lie: {
        type: 'sequence',
        steps: [
          { speaker: 'Player', type: 'speech', text: 'i’m looking to join the church and I want to study under Father Hidalgo' },
          { speaker: 'Dock Worker', type: 'speech', text: 'well I wish you luck. Last I heard he was more focused on helping people beekeep and make bricks than worship. That’s all I know' },
        ],
        goto: 'EXIT',
      },
    },
  },

  La_Plaza: {
    start: 'plaza_enter',
    nodes: {
      plaza_enter: {
        lines: [
          { type: 'narration', text: 'You see a man standing by himself in the plaza, starting off in the distance.' },
        ],
        choices: [
          { text: 'get his attention', goto: 'plaza_greeting' },
          { text: 'leave', goto: 'EXIT' },
        ],
      },
      plaza_greeting: {
        type: 'sequence',
        steps: [
          { speaker: 'Player', type: 'speech', text: 'Hey, what are you doing?' },
          { speaker: 'Man', type: 'action', text: 'the man turns to look at you, sighs, and speaks in a defeated voice' },
          { speaker: 'Man', type: 'speech', text: 'no se' },
        ],
        choices: [
          { text: 'you look down, what happened', goto: 'plaza_man_story' },
          { text: 'do you know anything about a priest named Miguel Hidalgo? I heard he was in Veracruz recently', goto: 'plaza_question' },
        ],
      },
      plaza_man_story: {
        type: 'sequence',
        steps: [
          { speaker: 'Man', type: 'speech', text: 'well because of King Ferdinand’s Bourbon reforms,' },
          { speaker: 'Man', type: 'action', text: '*spits at the ground in disgust*' },
          { speaker: 'Man', type: 'speech', text: 'the silver mine I owned in Zacatecas has become unprofitable, now i’m here to try and get a foothold in the shipping business' },
          { speaker: 'Player', type: 'speech', text: 'i’m looking for a priest named Miguel Hidalgo. Seems like you might be sympathetic to his cause. Heard anything?' },
          { speaker: 'Man', type: 'speech', text: 'yes, i know of him. Last I heard he was in Dolores helping them make wine, silk, and brick. I’d suggest going to the local priest here. He will know more.' },
        ],
        goto: 'EXIT',
      },
      plaza_question: {
        speaker: 'Man',
        lines: [
          { type: 'speech', text: 'I don’t know what i’m going to do… I put everything into that mine… and just like that…' },
          { type: 'action', text: 'the man turns and walks away' },
        ],
        choices: [],
        autoExit: true,
      },
    },
  },

  La_Iglesia: {
    start: 'iglesia_greeting',
    nodes: {
      iglesia_greeting: {
        type: 'sequence',
        steps: [
          { speaker: 'Priest', type: 'speech', text: 'Buenos días, hijo' },
          { speaker: 'Player', type: 'speech', text: 'Hello father, i’ve heard you might be able to help me. I’m looking for a priest named Miguel Hidalgo. Know where he is?' },
        ],
        goto: 'iglesia_trivia_start',
      },
      iglesia_trivia_start: {
        type: 'sequence',
        steps: [
          { speaker: 'Priest', type: 'speech', text: 'ok. I need to ask you some questions to make sure I can trust you' },
          { speaker: 'Player', type: 'speech', text: 'fair, what do you want to talk about?' },
          { speaker: 'Priest', type: 'speech', text: 'What city did you just come from?' },
        ],
        choices: [
          { text: 'Valladolid', goto: 'iglesia_correct_answer_1' },
          { text: 'Mexico City', goto: 'iglesia_wrong_answer' },
          { text: 'Dolores', goto: 'iglesia_wrong_answer' },
          { text: 'Pueblo', goto: 'iglesia_wrong_answer' },
        ],
      },
      iglesia_correct_answer_1: {
        speaker: 'Priest',
        lines: [
          { type: 'speech', text: 'very good. Who is the Spanish king that Napoleon just disposed of?' },
        ],
        choices: [
          { text: 'Ferdinand VII', goto: 'iglesia_correct_answer_2' },
          { text: 'Tsar Paul I', goto: 'iglesia_wrong_answer' },
          { text: 'Emperor Francis II', goto: 'iglesia_wrong_answer' },
          { text: 'King Frederick William III', goto: 'iglesia_wrong_answer' },
        ],
      },
      iglesia_correct_answer_2: {
        speaker: 'Priest',
        lines: [
          { type: 'speech', text: '¡Qué listo eres! What were the three buildings in Valladolid' },
        ],
        choices: [
          { text: 'La Cantina, El Colegio, y El Mercado', goto: 'iglesia_correct_answer_3' },
          { text: 'La Cantina, El Puerta de Valladolid, y El Colegio', goto: 'iglesia_wrong_answer' },
          { text: 'La Cantina, Horseneck Saloon, El Mercado', goto: 'iglesia_wrong_answer' },
          { text: 'La Cantina, La Plaza, El Colegio', goto: 'iglesia_wrong_answer' },
        ],
      },
      iglesia_correct_answer_3: {
        speaker: 'Priest',
        lines: [
          { type: 'speech', text: 'Ok, 100% trust you now. Head to Pueblo to find Father Hidalgo' },
        ],
        choices: [],
        autoExit: true,
      },
      iglesia_wrong_answer: {
        lines: [
          { type: 'narration', text: 'WRONG' },
        ],
        choices: [
          { text: 'try again', goto: 'iglesia_trivia_start' },
          { text: 'leave', goto: 'EXIT' },
        ],
      },
    },
  },
};

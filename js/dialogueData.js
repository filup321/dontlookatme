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
            text: 'I’m formed in the earth but i’m not a plant\nI’m used in jewelry, currencies, and utensils\nI’m a reward for second place\nWhat am I?',
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
        effects: [{ set_flag: 'road_to_veracruz_unlocked' }],
        choices: [],
        goto: 'EXIT',
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
        effects: [{ set_flag: 'road_to_pueblo_unlocked' }],
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

  El_Rancho_Sign: {
    start: 'sign',
    nodes: {
      sign: {
        lines: [
          { type: 'narration', text: 'A wooden paneled sign reads:' },
          { type: 'speech', text: 'Estas tierras tienen dueño. Ningún forastero pase sin permiso.' },
        ],
        choices: [],
        autoExit: true,
      },
    },
  },

  La_Huerta_Sign: {
    start: 'sign',
    nodes: {
      sign: {
        lines: [
          { type: 'narration', text: 'A sign reads:' },
          { type: 'speech', text: 'no randos' },
        ],
        choices: [],
        autoExit: true,
      },
    },
  },

  Fabrica_Textil: {
    start: 'fabrica_textile_enter',
    nodes: {
      fabrica_textile_enter: {
        lines: [
          { type: 'narration', text: 'You see various fabrics being woven out of silk and wool, and a man leaning over a desk reading documents.' },
        ],
        choices: [
          { text: 'approach el Jefe', goto: 'jefe_greeting' },
          { text: 'leave', goto: 'EXIT' },
        ],
      },
      jefe_greeting: {
        type: 'sequence',
        steps: [
          { type: 'narration', text: 'You approach el Jefe. He is stacking documents with the word "Independencia" as a heading.' },
          { speaker: 'El Jefe', type: 'speech', text: 'Who are you? And what do you want?' },
        ],
        choices: [
          { text: "And I'm looking for Father Hidalgo, a priest in Veracruz told me he was here. I'm just a guy", goto: 'jefe_independence' },
          { text: 'My name is Chris Bosh', goto: 'jefe_chris_bosh' },
        ],
      },
      jefe_independence: {
        speaker: 'El Jefe',
        lines: [
          { type: 'speech', text: "He's in Dolores now. I'll tell you how to get there if you help me distribute these documents across town." },
        ],
        choices: [
          { text: 'Sure thing Jefe', goto: 'jefe_map_distribution' },
          { text: 'That sounds like a lot of work. No thanks', goto: 'EXIT' },
        ],
      },
      jefe_map_distribution: {
        speaker: 'El Jefe',
        lines: [
          { type: 'action', text: 'He hands you a stack of papers.' },
          { type: 'speech', text: 'Start with the owner of El Rancho.' },
        ],
        effects: [{ give_item: 'jefe_documents' }, { set_flag: 'pueblo_rancho_unlocked' }],
        choices: [],
        autoExit: true,
      },
      jefe_chris_bosh: {
        speaker: 'El Jefe',
        lines: [
          { type: 'speech', text: "That is not your name. You're a liar, and a horseneck, get out of my factory." },
        ],
        choices: [],
        autoExit: true,
      },
    },
  },

  El_Rancho: {
    start: 'El_rancho_greeting',
    nodes: {
      El_rancho_greeting: {
        type: 'sequence',
        steps: [
          { speaker: 'Ranchero', type: 'speech', text: 'I saw you come into town earlier.' },
          { speaker: 'Ranchero', type: 'action', text: 'He looks at your stack of papers.' },
          { speaker: 'Ranchero', type: 'speech', text: 'What did el Jefe give you?' },
        ],
        choices: [
          { text: 'hand over a document', goto: 'el_rancho_document' },
          { text: "he told me to distribute these across town and he'd tell me how to get to Dolores", goto: 'el_rancho_dolores' },
        ],
      },
      el_rancho_document: {
        speaker: 'Ranchero',
        lines: [
          { type: 'speech', text: 'Why are you helping him distribute these?' },
        ],
        choices: [
          { text: "I'm trying to find a priest named Miguel Hidalgo. El Jefe said he was in Dolores and he'd give me a map if I helped him.", goto: 'el_rancho_dolores' },
          { text: "I'm just a really nice person looking to make friends", goto: 'el_rancho_dolores' },
        ],
      },
      el_rancho_dolores: {
        type: 'sequence',
        steps: [
          { speaker: 'Ranchero', type: 'speech', text: "Give them to me, I'll get these passed out across town." },
          { speaker: 'Ranchero', type: 'action', text: 'He takes the stack from you.' },
          { speaker: 'Ranchero', type: 'speech', text: "El Jefe has no idea how to get to Dolores. He scammed you. Go talk to El Dueño de La Huerta. He will give you a map and a horse that I've lent him." },
          { speaker: 'Ranchero', type: 'speech', text: 'Oh, I almost forgot.' },
          { speaker: 'Ranchero', type: 'action', text: 'He hands you a bottle of tequila and a box of six baby chicks. "Make sure you present these to el Dueño when you get there."' },
          { type: 'narration', text: 'You receive a box of baby chicks and a bottle of tequila.' },
        ],
        effects: [{ give_item: 'tequila_bottle' }, { give_item: 'baby_chicks' }, { set_flag: 'pueblo_huerta_unlocked' }],
        goto: 'EXIT',
      },
    },
  },

  La_Huerta: {
    start: 'La_huerta_greeting',
    nodes: {
      La_huerta_greeting: {
        speaker: 'El Dueño',
        lines: [
          { type: 'speech', text: 'Who do you know here?' },
        ],
        choices: [
          { text: 'El Ranchero sent me (hand over tequila and baby chicks)', goto: 'la_huerta_welcome' },
          { text: 'I know Chris Bosh and the Horseneck Ranchero. They said you could help me get to Dolores', goto: 'la_huerta_not_welcome' },
        ],
      },
      la_huerta_not_welcome: {
        speaker: 'El Dueño',
        lines: [
          { type: 'speech', text: 'You, a rando, show up to my house without any chicks or alcohol and expect me to help you out. Get out of my face.' },
        ],
        choices: [],
        autoExit: true,
      },
      la_huerta_welcome: {
        speaker: 'El Dueño',
        lines: [
          { type: 'speech', text: 'Anyone who shows up to my house with chicks and alcohol is a friend. How can I be of service?' },
        ],
        effects: [{ remove_item: 'tequila_bottle' }, { remove_item: 'baby_chicks' }],
        choices: [
          { text: "I'm looking for directions to Dolores. Can you help me?", goto: 'la_huerta_dolores_directions' },
          { text: "I'm supposed to get to Dolores but I'm kinda down to shoot some tequila real quick. You wanna start drinking?", goto: 'la_huerta_drinking' },
        ],
      },
      la_huerta_dolores_directions: {
        type: 'sequence',
        steps: [
          { speaker: 'El Dueño', type: 'action', text: 'He hands over a map.' },
          { speaker: 'El Dueño', type: 'speech', text: "Also, why don't you borrow the stallion out back? His name is Bojangles. Good luck." },
        ],
        effects: [{ give_item: 'dolores_map' }],
        goto: 'MAP:la_huerta_backyard',
      },
      la_huerta_drinking: {
        speaker: 'El Dueño',
        lines: [
          { type: 'speech', text: "Man, I've been drinking." },
          { type: 'action', text: 'He takes a pull from the tequila bottle and passes it back to you.' },
        ],
        choices: [
          { text: 'start chugging tequila', goto: 'la_huerta_game_over_1' },
        ],
      },
      la_huerta_game_over_1: {
        lines: [{ type: 'narration', text: 'You take a swig of tequila.' }],
        choices: [{ text: 'chug more tequila', goto: 'la_huerta_game_over_2' }],
      },
      la_huerta_game_over_2: {
        lines: [{ type: 'narration', text: 'You take another swig. It burns going down.' }],
        choices: [{ text: 'chug more tequila', goto: 'la_huerta_game_over_3' }],
      },
      la_huerta_game_over_3: {
        lines: [{ type: 'narration', text: 'Your vision starts to blur at the edges.' }],
        choices: [{ text: 'chug more tequila', goto: 'la_huerta_game_over_4' }],
      },
      la_huerta_game_over_4: {
        lines: [{ type: 'narration', text: 'The room is spinning a little now.' }],
        choices: [{ text: 'chug more tequila', goto: 'la_huerta_game_over_5' }],
      },
      la_huerta_game_over_5: {
        lines: [{ type: 'narration', text: "You can barely stand, but you keep drinking." }],
        choices: [{ text: 'chug more tequila', goto: 'la_huerta_training_complete' }],
      },
      la_huerta_training_complete: {
        lines: [{ type: 'narration', text: 'Good job, you are no longer in training.' }],
        choices: [],
        autoExit: true,
      },
    },
  },
};

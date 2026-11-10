import type { LabContext } from '@/types/pedagogy';

export const contexts: LabContext[] = [
  {
    "id": "condition-weekend",
    "title": "Plans for Saturday",
    "topic": "Loisirs",
    "text": "If it rains on Saturday, Alex will stay home. If the weather is good, he will visit a friend. His plans depend on the weather.",
    "vocabulary": [],
    "exercises": [
      {
        "id": "condition-weekend-read",
        "kind": "comprehension",
        "prompt": "What will Alex do if it rains?",
        "accepted": [
          "He will stay home",
          "Alex will stay home",
          "If it rains he will stay home"
        ],
        "explanation": "Cette réponse respecte la construction et la consigne de cette activité.",
        "hint": "Relis les informations du texte."
      },
      {
        "id": "condition-weekend-transform",
        "kind": "transformation",
        "prompt": "Relie ces idées avec if et will.",
        "accepted": [
          "If it rains I will stay home",
          "I will stay home if it rains"
        ],
        "explanation": "Cette réponse respecte la construction et la consigne de cette activité.",
        "source": "It rains. I stay home.",
        "hint": "Vérifie le temps et l’accord avec le sujet."
      },
      {
        "id": "condition-weekend-correct",
        "kind": "error_correction",
        "prompt": "Corrige cette phrase.",
        "accepted": [
          "If it rains I will stay home"
        ],
        "explanation": "Cette réponse respecte la construction et la consigne de cette activité.",
        "source": "If it will rain, I will stay home.",
        "knownErrors": [
          {
            "answer": "If it will rain, I will stay home.",
            "category": "auxiliary",
            "explanation": "Vérifie l’auxiliaire et la forme du verbe dans la réponse proposée."
          }
        ]
      },
      {
        "id": "condition-weekend-write",
        "kind": "production",
        "prompt": "Explique ce que tu feras s’il pleut demain.",
        "accepted": [
          "If it rains tomorrow I will stay home",
          "If it rains I will read a book",
          "If it rains I will stay home"
        ],
        "explanation": "Cette réponse respecte la construction et la consigne de cette activité."
      }
    ],
    "transfer": {
      "id": "condition-weekend-transfer",
      "kind": "transfer",
      "prompt": "Tes plans dépendent de la pluie. Exprime une condition et sa conséquence.",
      "accepted": [
        "If it rains tomorrow I will stay home",
        "If it rains I will read a book",
        "If it rains I will stay home"
      ],
      "explanation": "Cette réponse respecte la construction et la consigne de cette activité."
    }
  },
  {
    "id": "condition-work",
    "title": "A busy afternoon",
    "topic": "Travail",
    "text": "If Kim finishes the report early, she will call the client. If she needs help, she will ask her manager. She wants to organise her afternoon.",
    "vocabulary": [],
    "exercises": [
      {
        "id": "condition-work-read",
        "kind": "comprehension",
        "prompt": "What will Kim do if she finishes early?",
        "accepted": [
          "She will call the client",
          "Kim will call the client"
        ],
        "explanation": "Cette réponse respecte la construction et la consigne de cette activité.",
        "hint": "Relis les informations du texte."
      },
      {
        "id": "condition-work-transform",
        "kind": "transformation",
        "prompt": "Relie ces idées avec if et will.",
        "accepted": [
          "If I have time I will call you",
          "I will call you if I have time"
        ],
        "explanation": "Cette réponse respecte la construction et la consigne de cette activité.",
        "source": "I have time. I call you.",
        "hint": "Vérifie le temps et l’accord avec le sujet."
      },
      {
        "id": "condition-work-correct",
        "kind": "error_correction",
        "prompt": "Corrige cette phrase.",
        "accepted": [
          "If I have time I will call you"
        ],
        "explanation": "Cette réponse respecte la construction et la consigne de cette activité.",
        "source": "If I will have time, I will call you.",
        "knownErrors": [
          {
            "answer": "If I will have time, I will call you.",
            "category": "auxiliary",
            "explanation": "Vérifie l’auxiliaire et la forme du verbe dans la réponse proposée."
          }
        ]
      },
      {
        "id": "condition-work-write",
        "kind": "production",
        "prompt": "Dis ce que tu feras si tu as le temps au travail.",
        "accepted": [
          "If I have time I will call you",
          "If I have time I will finish the report",
          "If I have time I will help my colleague"
        ],
        "explanation": "Cette réponse respecte la construction et la consigne de cette activité."
      }
    ],
    "transfer": {
      "id": "condition-work-transfer",
      "kind": "transfer",
      "prompt": "Explique à un collègue une action qui dépend du temps disponible.",
      "accepted": [
        "If I have time I will call you",
        "If I have time I will finish the report",
        "If I have time I will help my colleague"
      ],
      "explanation": "Cette réponse respecte la construction et la consigne de cette activité."
    }
  }
];

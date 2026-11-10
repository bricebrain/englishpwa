import type { LabContext } from '@/types/pedagogy';

export const contexts: LabContext[] = [
  {
    "id": "past-travel",
    "title": "A trip to York",
    "topic": "Voyage",
    "text": "Mia visited York last weekend. She travelled by train and stayed with a friend. On Sunday, they walked around the city.",
    "vocabulary": [],
    "exercises": [
      {
        "id": "past-travel-read",
        "kind": "comprehension",
        "prompt": "Where did Mia go last weekend?",
        "accepted": [
          "She visited York",
          "Mia visited York"
        ],
        "explanation": "Cette réponse respecte la construction et la consigne de cette activité.",
        "hint": "Relis les informations du texte."
      },
      {
        "id": "past-travel-transform",
        "kind": "transformation",
        "prompt": "Passe cette phrase au passé avec yesterday.",
        "accepted": [
          "I visited a friend yesterday",
          "Yesterday I visited a friend"
        ],
        "explanation": "Cette réponse respecte la construction et la consigne de cette activité.",
        "source": "I visit a friend.",
        "hint": "Vérifie le temps et l’accord avec le sujet."
      },
      {
        "id": "past-travel-correct",
        "kind": "error_correction",
        "prompt": "Corrige cette phrase.",
        "accepted": [
          "I went to London yesterday",
          "Yesterday I went to London"
        ],
        "explanation": "Cette réponse respecte la construction et la consigne de cette activité.",
        "source": "I go to London yesterday.",
        "knownErrors": [
          {
            "answer": "I go to London yesterday.",
            "category": "auxiliary",
            "explanation": "Vérifie l’auxiliaire et la forme du verbe dans la réponse proposée."
          }
        ]
      },
      {
        "id": "past-travel-write",
        "kind": "production",
        "prompt": "Raconte une visite que tu as faite hier.",
        "accepted": [
          "I visited a friend yesterday",
          "I visited my sister yesterday",
          "I visited a museum yesterday"
        ],
        "explanation": "Cette réponse respecte la construction et la consigne de cette activité."
      }
    ],
    "transfer": {
      "id": "past-travel-transfer",
      "kind": "transfer",
      "prompt": "Un ami te demande ce que tu as visité hier. Réponds en une phrase.",
      "accepted": [
        "I visited a friend yesterday",
        "I visited my sister yesterday",
        "I visited a museum yesterday"
      ],
      "explanation": "Cette réponse respecte la construction et la consigne de cette activité."
    }
  },
  {
    "id": "past-work",
    "title": "Yesterday at work",
    "topic": "Travail",
    "text": "Tom finished a report yesterday. He sent it to his manager before lunch. In the afternoon, he called a client.",
    "vocabulary": [],
    "exercises": [
      {
        "id": "past-work-read",
        "kind": "comprehension",
        "prompt": "What did Tom finish yesterday?",
        "accepted": [
          "He finished a report",
          "Tom finished a report",
          "He finished a report yesterday"
        ],
        "explanation": "Cette réponse respecte la construction et la consigne de cette activité.",
        "hint": "Relis les informations du texte."
      },
      {
        "id": "past-work-transform",
        "kind": "transformation",
        "prompt": "Passe cette phrase au passé avec yesterday.",
        "accepted": [
          "I finished a report yesterday",
          "Yesterday I finished a report"
        ],
        "explanation": "Cette réponse respecte la construction et la consigne de cette activité.",
        "source": "I finish a report.",
        "hint": "Vérifie le temps et l’accord avec le sujet."
      },
      {
        "id": "past-work-correct",
        "kind": "error_correction",
        "prompt": "Corrige cette phrase.",
        "accepted": [
          "She sent the report yesterday",
          "Yesterday she sent the report"
        ],
        "explanation": "Cette réponse respecte la construction et la consigne de cette activité.",
        "source": "She send the report yesterday.",
        "knownErrors": [
          {
            "answer": "She send the report yesterday.",
            "category": "auxiliary",
            "explanation": "Vérifie l’auxiliaire et la forme du verbe dans la réponse proposée."
          }
        ]
      },
      {
        "id": "past-work-write",
        "kind": "production",
        "prompt": "Raconte une tâche que tu as terminée hier.",
        "accepted": [
          "I finished a report yesterday",
          "I finished my work yesterday",
          "I sent an email yesterday"
        ],
        "explanation": "Cette réponse respecte la construction et la consigne de cette activité."
      }
    ],
    "transfer": {
      "id": "past-work-transfer",
      "kind": "transfer",
      "prompt": "Un collègue te demande ce que tu as fait hier. Décris une tâche terminée.",
      "accepted": [
        "I finished a report yesterday",
        "I finished my work yesterday",
        "I sent an email yesterday"
      ],
      "explanation": "Cette réponse respecte la construction et la consigne de cette activité."
    }
  }
];

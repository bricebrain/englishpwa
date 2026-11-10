import type { LabContext } from '@/types/pedagogy';

export const contexts: LabContext[] = [
  {
    "id": "experience-travel",
    "title": "Places we know",
    "topic": "Voyage",
    "text": "Leo has visited London twice. His sister has visited Paris. They enjoy talking about their experiences. They hope to travel together soon.",
    "vocabulary": [],
    "exercises": [
      {
        "id": "experience-travel-read",
        "kind": "comprehension",
        "prompt": "Which city has Leo visited?",
        "accepted": [
          "He has visited London",
          "Leo has visited London"
        ],
        "explanation": "Cette réponse respecte la construction et la consigne de cette activité.",
        "hint": "Relis les informations du texte."
      },
      {
        "id": "experience-travel-transform",
        "kind": "transformation",
        "prompt": "Remplace I par She.",
        "accepted": [
          "She has visited Paris"
        ],
        "explanation": "Cette réponse respecte la construction et la consigne de cette activité.",
        "source": "I have visited Paris.",
        "hint": "Vérifie le temps et l’accord avec le sujet."
      },
      {
        "id": "experience-travel-correct",
        "kind": "error_correction",
        "prompt": "Corrige cette phrase.",
        "accepted": [
          "She has visited London"
        ],
        "explanation": "Cette réponse respecte la construction et la consigne de cette activité.",
        "source": "She have visited London.",
        "knownErrors": [
          {
            "answer": "She have visited London.",
            "category": "subject_agreement",
            "explanation": "Vérifie l’auxiliaire et la forme du verbe dans la réponse proposée."
          }
        ]
      },
      {
        "id": "experience-travel-write",
        "kind": "production",
        "prompt": "Écris une expérience de voyage, sans indiquer de date passée précise.",
        "accepted": [
          "I have visited London",
          "I have visited Paris",
          "I have travelled by train",
          "I have been to Spain"
        ],
        "explanation": "Cette réponse respecte la construction et la consigne de cette activité."
      }
    ],
    "transfer": {
      "id": "experience-travel-transfer",
      "kind": "transfer",
      "prompt": "Présente une expérience de voyage à un nouvel ami, sans date précise.",
      "accepted": [
        "I have visited London",
        "I have visited Paris",
        "I have travelled by train",
        "I have been to Spain"
      ],
      "explanation": "Cette réponse respecte la construction et la consigne de cette activité."
    }
  },
  {
    "id": "experience-food",
    "title": "Trying something new",
    "topic": "Cuisine",
    "text": "Nora has tried sushi. Her brother has made fresh pasta. They like discovering new food and sharing their experiences.",
    "vocabulary": [],
    "exercises": [
      {
        "id": "experience-food-read",
        "kind": "comprehension",
        "prompt": "What has Nora tried?",
        "accepted": [
          "She has tried sushi",
          "Nora has tried sushi"
        ],
        "explanation": "Cette réponse respecte la construction et la consigne de cette activité.",
        "hint": "Relis les informations du texte."
      },
      {
        "id": "experience-food-transform",
        "kind": "transformation",
        "prompt": "Remplace I par He.",
        "accepted": [
          "He has tried sushi"
        ],
        "explanation": "Cette réponse respecte la construction et la consigne de cette activité.",
        "source": "I have tried sushi.",
        "hint": "Vérifie le temps et l’accord avec le sujet."
      },
      {
        "id": "experience-food-correct",
        "kind": "error_correction",
        "prompt": "Corrige cette phrase.",
        "accepted": [
          "He has made pasta"
        ],
        "explanation": "Cette réponse respecte la construction et la consigne de cette activité.",
        "source": "He have made pasta.",
        "knownErrors": [
          {
            "answer": "He have made pasta.",
            "category": "subject_agreement",
            "explanation": "Vérifie l’auxiliaire et la forme du verbe dans la réponse proposée."
          }
        ]
      },
      {
        "id": "experience-food-write",
        "kind": "production",
        "prompt": "Présente une expérience culinaire sans date précise.",
        "accepted": [
          "I have tried sushi",
          "I have made pasta",
          "I have cooked a curry",
          "I have tried Indian food"
        ],
        "explanation": "Cette réponse respecte la construction et la consigne de cette activité."
      }
    ],
    "transfer": {
      "id": "experience-food-transfer",
      "kind": "transfer",
      "prompt": "Tu échanges sur les plats déjà goûtés ou préparés. Décris une expérience sans date.",
      "accepted": [
        "I have tried sushi",
        "I have made pasta",
        "I have cooked a curry",
        "I have tried Indian food"
      ],
      "explanation": "Cette réponse respecte la construction et la consigne de cette activité."
    }
  }
];

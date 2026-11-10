import type { ConstructionId, LabContext, LabExercise } from '@/types/pedagogy';

import { extendedLabContent } from './extendedLabContent';

function exercise(
  id: string, kind: LabExercise['kind'], prompt: string, accepted: string[],
  explanation: string, extra: Partial<LabExercise> = {},
): LabExercise {
  return { id, kind, prompt, accepted, explanation, ...extra };
}

export const labContent: Record<ConstructionId, LabContext[]> = {
  ...extendedLabContent,
  want_to_verb: [
    {
      id: 'learning', title: 'A new project', topic: 'Apprentissage', vocabulary: ['learn', 'project', 'website'],
      text: 'Maya has a new project. She wants to build a website. Her friend Tom wants to help. They want to learn together.',
      exercises: [
        exercise('learning-read', 'comprehension', 'What does Maya want to build? Réponds par une phrase.',
          ['She wants to build a website', 'Maya wants to build a website'], 'Maya souhaite construire un site.', { hint: 'Commence par She wants…' }),
        exercise('learning-transform', 'transformation', 'Remplace I par She.', ['She wants to learn English'],
          'Avec she, want prend un s ; learn reste à sa base.', { source: 'I want to learn English.', hint: 'She wants to + verbe.' }),
        exercise('learning-correct', 'error_correction', 'Corrige cette phrase.', ['I want to learn English'],
          'Après want, ajoute to avant le verbe.', { source: 'I want learn English.', hint: 'Il manque un petit mot avant learn.', knownErrors: [
            { answer: 'I want learn English', category: 'missing_word', explanation: 'Il manque to avant learn.' },
          ] }),
        exercise('learning-write', 'production', 'Écris une phrase sur quelque chose que tu souhaites apprendre.',
          ['I want to learn English', 'I want to learn Spanish', 'I want to learn to cook', 'I want to learn how to code'],
          'Tu as exprimé une intention avec want to. La prochaine étape sera de la retrouver après quelques jours.'),
      ],
      transfer: exercise('learning-transfer', 'transfer', 'Tu te présentes à un cours. Écris ce que tu souhaites apprendre.',
        ['I want to learn English', 'I want to learn Spanish', 'I want to learn to cook', 'I want to learn how to code'],
        'Tu as retrouvé want to dans un contexte d’apprentissage.'),
    },
    {
      id: 'travel', title: 'A weekend away', topic: 'Voyage', vocabulary: ['visit', 'coast', 'train'],
      text: 'Ben wants to visit the coast. His sister wants to come too. They want to travel by train. They have two free days.',
      exercises: [
        exercise('travel-read', 'comprehension', 'How do they want to travel? Réponds par une phrase.',
          ['They want to travel by train'], 'Ils souhaitent voyager en train.', { hint: 'They want to travel…' }),
        exercise('travel-transform', 'transformation', 'Remplace They par He.', ['He wants to visit London'],
          'Avec he, utilise wants to.', { source: 'They want to visit London.', hint: 'Ajoute s au verbe want.' }),
        exercise('travel-correct', 'error_correction', 'Corrige cette phrase.', ['She wants to travel'],
          'She demande wants au présent simple.', { source: 'She want to travel.', hint: 'Vérifie l’accord avec she.', knownErrors: [
            { answer: 'She want to travel', category: 'subject_agreement', explanation: 'Avec she, utilise wants.' },
          ] }),
        exercise('travel-write', 'production', 'Écris une phrase sur un endroit que tu souhaites visiter.',
          ['I want to visit London', 'I want to visit Paris', 'I want to visit Japan', 'I want to visit the coast'],
          'Tu as exprimé ton intention de voyage.'),
      ],
      transfer: exercise('travel-transfer', 'transfer', 'Tu prépares tes vacances. Écris une envie de voyage.',
        ['I want to visit London', 'I want to visit Paris', 'I want to visit Japan', 'I want to travel by train'],
        'Tu as retrouvé want to pour parler de vacances.'),
    },
  ],
  would_like_to_verb: [
    {
      id: 'restaurant', title: 'Dinner with friends', topic: 'Restaurant', vocabulary: ['book', 'table', 'dinner'],
      text: 'Anna is planning dinner with friends. She would like to book a table. Her friends would like to eat outside. The restaurant has a small garden.',
      exercises: [
        exercise('restaurant-read', 'comprehension', 'What would Anna like to book?',
          ['She would like to book a table', 'Anna would like to book a table'], 'Anna souhaite réserver une table.', { hint: 'She would like to…' }),
        exercise('restaurant-transform', 'transformation', 'Exprime cette envie avec would like.', ['I would like to book a table'],
          'Would like to rend la demande plus polie.', { source: 'I want to book a table.', hint: 'I would like to + verbe.' }),
        exercise('restaurant-correct', 'error_correction', 'Corrige cette phrase.', ['I would like to eat outside'],
          'Il faut to entre like et eat.', { source: 'I would like eat outside.', hint: 'Quel mot manque avant eat ?', knownErrors: [
            { answer: 'I would like eat outside', category: 'missing_word', explanation: 'Ajoute to avant eat.' },
          ] }),
        exercise('restaurant-write', 'production', 'Tu écris au restaurant. Formule poliment ce que tu souhaites faire.',
          ['I would like to book a table', 'I would like to eat outside', 'I would like to see the menu'],
          'Ta demande utilise would like to.'),
      ],
      transfer: exercise('restaurant-transfer', 'transfer', 'Écris au restaurant pour exprimer poliment une envie ou une demande.',
        ['I would like to book a table', 'I would like to eat outside', 'I would like to see the menu'],
        'Tu as retrouvé la construction de demande polie.'),
    },
    {
      id: 'weekend', title: 'Saturday plans', topic: 'Loisirs', vocabulary: ['museum', 'walk', 'park'],
      text: 'Sam has a free Saturday. He would like to visit a museum. His friend would like to go for a walk. They can do both.',
      exercises: [
        exercise('weekend-read', 'comprehension', 'What would Sam like to visit?',
          ['He would like to visit a museum', 'Sam would like to visit a museum'], 'Sam aimerait visiter un musée.', { hint: 'He would like to visit…' }),
        exercise('weekend-transform', 'transformation', 'Remplace I par They.', ['They would like to go for a walk'],
          'Would reste identique avec tous les sujets.', { source: 'I would like to go for a walk.', hint: 'Would ne prend jamais de s.' }),
        exercise('weekend-correct', 'error_correction', 'Corrige cette phrase.', ['She would like to visit a museum'],
          'Ajoute to avant visit.', { source: 'She would like visit a museum.', hint: 'Vérifie ce qui suit like.', knownErrors: [
            { answer: 'She would like visit a museum', category: 'missing_word', explanation: 'Il manque to avant visit.' },
          ] }),
        exercise('weekend-write', 'production', 'Écris ce que tu aimerais faire ce week-end, avec une formulation polie.',
          ['I would like to visit a museum', 'I would like to go for a walk', 'I would like to relax', 'I would like to read a book'],
          'Tu as exprimé une envie personnelle.'),
      ],
      transfer: exercise('weekend-transfer', 'transfer', 'Un ami te demande tes envies pour samedi. Réponds avec politesse.',
        ['I would like to visit a museum', 'I would like to go for a walk', 'I would like to relax', 'I would like to read a book'],
        'Tu as réutilisé une construction polie pour organiser une sortie.'),
    },
  ],
  present_simple_negative: [
    {
      id: 'work', title: 'A different schedule', topic: 'Travail', vocabulary: ['office', 'home', 'Sunday'],
      text: 'Lea works from home. She does not work in an office. Her brother works in a shop. They do not work on Sundays.',
      exercises: [
        exercise('work-read', 'comprehension', 'Does Lea work in an office? Réponds par une phrase complète.',
          ['No she does not work in an office', 'She does not work in an office'],
          'Lea ne travaille pas dans un bureau.', { hint: 'No, she doesn’t…' }),
        exercise('work-transform', 'transformation', 'Mets cette phrase à la forme négative.', ['She does not work in London'],
          'Does not est suivi de work, sans s.', { source: 'She works in London.', hint: 'She doesn’t + base du verbe.' }),
        exercise('work-correct', 'error_correction', 'Corrige cette phrase.', ['She does not work here'],
          'Does porte l’accord : work reste à sa base.', { source: "She doesn't works here.", hint: 'Regarde le verbe après doesn’t.', knownErrors: [
            { answer: "She doesn't works here", category: 'subject_agreement', explanation: 'Retire le s de works après doesn’t.' },
          ] }),
        exercise('work-write', 'production', 'Écris une chose que tu ne fais pas habituellement au travail.',
          ['I do not work on Sundays', 'I do not work at night', 'I do not work in an office', 'I do not drink coffee at work'],
          'Tu as utilisé la négation pour parler d’une habitude.'),
      ],
      transfer: exercise('work-transfer', 'transfer', 'Présente ton rythme de travail : indique une chose que tu ne fais pas.',
        ['I do not work on Sundays', 'I do not work at night', 'I do not work in an office', 'I do not drink coffee at work'],
        'Tu as retrouvé la négation dans le contexte du travail.'),
    },
    {
      id: 'habits', title: 'Evenings at home', topic: 'Vie quotidienne', vocabulary: ['evening', 'cook', 'television'],
      text: 'Dan likes quiet evenings. He does not watch television. His friends do not cook every day. Dan cooks at home and reads a book.',
      exercises: [
        exercise('habits-read', 'comprehension', 'Does Dan watch television? Réponds par une phrase complète.',
          ['No he does not watch television', 'He does not watch television'],
          'Dan ne regarde pas la télévision.', { hint: 'No, he doesn’t…' }),
        exercise('habits-transform', 'transformation', 'Mets cette phrase à la forme négative.', ['They do not cook every day'],
          'Avec they, utilise do not ou don’t.', { source: 'They cook every day.', hint: 'They don’t + verbe.' }),
        exercise('habits-correct', 'error_correction', 'Corrige cette phrase.', ['He does not watch television'],
          'Avec he, utilise doesn’t.', { source: "He don't watch television.", hint: 'Vérifie l’auxiliaire avec he.', knownErrors: [
            { answer: "He don't watch television", category: 'auxiliary', explanation: 'Remplace don’t par doesn’t avec he.' },
          ] }),
        exercise('habits-write', 'production', 'Écris une chose que tu ne fais pas habituellement le soir.',
          ['I do not watch television', 'I do not cook every evening', 'I do not drink coffee in the evening', 'I do not work at night'],
          'Tu as décrit une habitude avec une phrase négative.'),
      ],
      transfer: exercise('habits-transfer', 'transfer', 'Un ami découvre tes habitudes du soir. Indique une chose que tu ne fais pas.',
        ['I do not watch television', 'I do not cook every evening', 'I do not drink coffee in the evening', 'I do not work at night'],
        'Tu as réutilisé la négation dans ta vie quotidienne.'),
    },
  ],
};

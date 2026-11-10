import type { Construction } from '@/types/pedagogy';

import { extendedConstructions } from './extendedConstructions';

export const CATALOG_VERSION = 2;

// Niveaux indicatifs : petit corpus pilote à relire avant son extension.
export const constructions: Construction[] = [
  {
    id: 'want_to_verb', level: 'A2', category: 'verb_patterns',
    objective: 'Exprimer un souhait ou une intention', pattern: 'want to + base verb',
    description: 'Après want, utilise to puis la base du verbe. Avec he, she ou it, want devient wants.',
    examples: ['I want to learn English.', 'She wants to travel.', "They don't want to leave."],
    commonErrors: [
      { sentence: 'I want learn English.', category: 'missing_word', explanation: 'Il manque to entre want et learn.' },
      { sentence: 'She want to travel.', category: 'subject_agreement', explanation: 'Avec she au présent, utilise wants.' },
    ],
    prerequisites: [], related: ['would_like_to_verb', 'present_simple_negative'],
    exerciseTypes: ['comprehension', 'transformation', 'error_correction', 'production', 'transfer'],
    masteryCriteria: { delayedTransfers: 2, minimumDelayDays: 2, distinctContexts: 2 },
  },
  {
    id: 'would_like_to_verb', level: 'A2', category: 'verb_patterns',
    objective: 'Exprimer une envie avec politesse', pattern: 'would like to + base verb',
    description: 'Would like to exprime une envie. Would ne change pas avec le sujet. I would peut se contracter en I’d.',
    examples: ['I would like to book a table.', "She'd like to visit London."],
    commonErrors: [
      { sentence: 'I would like book a table.', category: 'missing_word', explanation: 'Il manque to avant book.' },
    ],
    prerequisites: [], related: ['want_to_verb'],
    exerciseTypes: ['comprehension', 'transformation', 'error_correction', 'production', 'transfer'],
    masteryCriteria: { delayedTransfers: 2, minimumDelayDays: 2, distinctContexts: 2 },
  },
  {
    id: 'present_simple_negative', level: 'A2', category: 'negation',
    objective: 'Dire ce que l’on ne fait pas habituellement', pattern: 'do / does + not + base verb',
    description: 'Utilise don’t avec I, you, we, they ; doesn’t avec he, she, it. Le verbe qui suit reste à sa base.',
    examples: ["I don't work on Sundays.", "She doesn't work here."],
    commonErrors: [
      { sentence: "She doesn't works here.", category: 'subject_agreement', explanation: 'Does porte déjà l’accord : utilise work, sans s.' },
      { sentence: "She don't work here.", category: 'auxiliary', explanation: 'Avec she, utilise does not ou doesn’t.' },
    ],
    prerequisites: [], related: ['want_to_verb'],
    exerciseTypes: ['comprehension', 'transformation', 'error_correction', 'production', 'transfer'],
    masteryCriteria: { delayedTransfers: 2, minimumDelayDays: 2, distinctContexts: 2 },
  },
  ...extendedConstructions,
];

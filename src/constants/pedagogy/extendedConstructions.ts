import type { Construction } from '@/types/pedagogy';

export const extendedConstructions: Construction[] = [
  {
    id: 'past_simple', level: 'A2', category: 'tense', objective: 'Raconter un événement terminé',
    pattern: 'subject + past simple', description: 'Pour un événement terminé et daté, emploie le prétérit. Certains verbes sont irréguliers : go devient went.',
    examples: ['I visited a friend yesterday.', 'She went to London last week.'],
    commonErrors: [{ sentence: 'I go to London yesterday.', category: 'auxiliary', explanation: 'Yesterday situe le départ dans le passé : utilise went.' }],
    prerequisites: [], related: ['present_perfect'],
    exerciseTypes: ['comprehension', 'transformation', 'error_correction', 'production', 'transfer'],
    masteryCriteria: { delayedTransfers: 2, minimumDelayDays: 2, distinctContexts: 2 },
  },
  {
    id: 'present_perfect', level: 'B1', category: 'tense', objective: 'Parler d’une expérience sans date passée précise',
    pattern: 'have / has + past participle', description: 'Le present perfect relie une expérience au présent. Avec he ou she, utilise has. Pour un moment passé terminé comme yesterday, utilise le prétérit.',
    examples: ['I have visited London.', 'She has tried sushi.'],
    commonErrors: [{ sentence: 'She have visited London.', category: 'subject_agreement', explanation: 'Avec she, utilise has.' }],
    prerequisites: [], related: ['past_simple'],
    exerciseTypes: ['comprehension', 'transformation', 'error_correction', 'production', 'transfer'],
    masteryCriteria: { delayedTransfers: 2, minimumDelayDays: 2, distinctContexts: 2 },
  },
  {
    id: 'first_conditional', level: 'B1', category: 'condition', objective: 'Exprimer une condition future possible',
    pattern: 'if + present simple, will + base verb', description: 'Pour une condition future possible, emploie le présent après if et will dans la conséquence.',
    examples: ['If it rains, I will stay home.', 'If I have time, I will call you.'],
    commonErrors: [{ sentence: 'If it will rain, I will stay home.', category: 'auxiliary', explanation: 'Dans cette condition, utilise le présent rains après if.' }],
    prerequisites: [], related: [],
    exerciseTypes: ['comprehension', 'transformation', 'error_correction', 'production', 'transfer'],
    masteryCriteria: { delayedTransfers: 2, minimumDelayDays: 2, distinctContexts: 2 },
  },
];

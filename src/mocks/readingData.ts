import type { ReadingItem, ReadingSegment } from '@/types/reading';

export const readingItemsMock: ReadingItem[] = [
  { id: 'article-remote-work', title: 'How remote work is changing cities', category: 'Société', level: 'B1', description: 'Housing, transport and new ways of working.', summaryFr: 'L’impact du télétravail sur les centres-villes et les mobilités.', sourceTitle: 'English Fluency Reader', segmentCount: 2, wordCount: 420, audioUrl: null },
  { id: 'article-green-finance', title: 'Can finance accelerate the green transition?', category: 'Économie', level: 'B2', description: 'A concise look at sustainable investment.', summaryFr: 'Les leviers et limites de la finance durable.', sourceTitle: 'English Fluency Reader', segmentCount: 2, wordCount: 510, audioUrl: null },
];

export const readingSegmentsMock: Record<string, ReadingSegment[]> = {
  'article-remote-work': [
    { id: 'rw-1', itemId: 'article-remote-work', title: 'A quieter city centre', text: 'Remote work has reduced the number of daily commuters in many cities. Local businesses have had to adapt, while residential neighbourhoods have become more active during the day.', summaryFr: 'Les déplacements quotidiens diminuent et l’activité se déplace vers les quartiers résidentiels.', level: 'B1', segmentIndex: 0, wordCount: 34, vocabulary: ['commuter', 'adapt', 'residential neighbourhood'], questions: [{ question: 'Why have local businesses had to adapt?', answer: 'Because fewer commuters visit city centres every day.', type: 'comprehension' }] },
    { id: 'rw-2', itemId: 'article-remote-work', title: 'A new balance', text: 'Companies are now experimenting with hybrid schedules. The outcome may be a better balance between flexibility, social contact and the needs of urban economies.', summaryFr: 'Les entreprises cherchent un équilibre grâce au travail hybride.', level: 'B1', segmentIndex: 1, wordCount: 29, vocabulary: ['hybrid schedule', 'outcome', 'balance'], questions: [{ question: 'What are companies experimenting with?', answer: 'Hybrid schedules.', type: 'comprehension' }] },
  ],
  'article-green-finance': [
    { id: 'gf-1', itemId: 'article-green-finance', title: 'Directing capital', text: 'Sustainable finance aims to direct capital towards projects that reduce emissions or strengthen climate resilience. Clear standards are essential to prevent greenwashing.', summaryFr: 'La finance durable oriente les capitaux, mais nécessite des standards clairs.', level: 'B2', segmentIndex: 0, wordCount: 31, vocabulary: ['direct capital', 'climate resilience', 'greenwashing'], questions: [{ question: 'What is needed to prevent greenwashing?', answer: 'Clear standards.', type: 'comprehension' }] },
  ],
};

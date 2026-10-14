import type {
  DashboardData,
  LingvistCard,
  PreparedContent,
  StatisticsData,
} from '@/types/learning';

export const dashboardMock: DashboardData = {
  reviewedToday: 8,
  dueCount: 12,
  learnedCount: 684,
  totalCount: 1240,
  streak: 16,
  activeDays: [true, true, false, true, true, true, true],
  preparedContentCount: 4,
};

export const lingvistCardsMock: LingvistCard[] = [
  {
    id: 'lingvist-withstand',
    lemma: 'withstand',
    expectedAnswer: 'withstand',
    sentenceWithGap: 'This material can ___ extreme temperatures.',
    sentenceFull: 'This material can withstand extreme temperatures.',
    translationFr: 'Ce matériau peut résister à des températures extrêmes.',
    grammarHint: 'Verbe après un modal : base verbale',
    level: 'B2',
  },
  {
    id: 'lingvist-although',
    lemma: 'although',
    expectedAnswer: 'although',
    sentenceWithGap: '___ the task was difficult, she completed it on time.',
    sentenceFull: 'Although the task was difficult, she completed it on time.',
    translationFr: 'Bien que la tâche soit difficile, elle l’a terminée à temps.',
    grammarHint: 'Conjonction qui introduit une concession',
    level: 'B1',
  },
  {
    id: 'lingvist-reliable',
    lemma: 'reliable',
    expectedAnswer: 'reliable',
    sentenceWithGap: 'We need a ___ source of information.',
    sentenceFull: 'We need a reliable source of information.',
    translationFr: 'Nous avons besoin d’une source d’information fiable.',
    grammarHint: 'Adjectif placé avant le nom',
    level: 'B1',
  },
  {
    id: 'lingvist-outcome',
    lemma: 'outcome',
    expectedAnswer: 'outcome',
    sentenceWithGap: 'The final ___ depends on several factors.',
    sentenceFull: 'The final outcome depends on several factors.',
    translationFr: 'Le résultat final dépend de plusieurs facteurs.',
    grammarHint: 'Nom dénombrable au singulier',
    level: 'B2',
  },
  {
    id: 'lingvist-improve',
    lemma: 'improve',
    expectedAnswer: 'improve',
    sentenceWithGap: 'Regular practice will ___ your fluency.',
    sentenceFull: 'Regular practice will improve your fluency.',
    translationFr: 'Une pratique régulière améliorera ton aisance.',
    grammarHint: 'Base verbale après will',
    level: 'A2',
  },
];

export const preparedContentMock: PreparedContent[] = [
  {
    id: 'medicaments-mondial',
    title: 'Médicaments : un marché mondial',
    source: 'ARTE · Le Dessous des cartes',
    durationLabel: '12 min',
    language: 'Anglais',
    publishedAt: '2026-10-12',
    body: 'The global pharmaceutical market is changing rapidly. Production, research and access to medicines reveal strong geopolitical dependencies.',
    audioUrl: '/audio/arte-medicaments.mp3',
    audioR2Key: null,
    type: 'script_audio',
  },
  {
    id: 'can-deux-ans',
    title: 'Why the Africa Cup of Nations is changing',
    source: 'Podcast préparé',
    durationLabel: '9 min',
    language: 'Anglais',
    publishedAt: '2026-10-10',
    body: 'The tournament calendar is evolving. This script focuses on frequency, sporting pressure and the economic context.',
    audioUrl: '/audio/can-frequency.mp3',
    audioR2Key: null,
    type: 'script_audio',
  },
];

export const statisticsMock: StatisticsData = {
  ...dashboardMock,
  retentionRate: 87,
  weeklyReviews: [14, 20, 0, 18, 24, 17, 8],
  strengths: ['Vocabulaire professionnel', 'Compréhension contextuelle'],
  focusAreas: ['Phrasal verbs', 'Choix des temps', 'Activation orale libre'],
};

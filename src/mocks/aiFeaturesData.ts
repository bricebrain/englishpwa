import type { DailySentences, DailyStory, LiveAnalysis, SemanticResult, WordContext } from '@/types/aiFeatures';

/** Données de démonstration (mode sans Worker) des fonctions IA. */

export const semanticCorpusMock: SemanticResult[] = [
  { score: 0, source: 'reading', refId: 'r1', parentId: 'money', title: 'Saving money — Budget', text: 'Prices range from ten to twenty euros. Saving money is hard when prices rise every month.', textFr: 'Économiser devient difficile quand les prix augmentent.', level: 'B1' },
  { score: 0, source: 'srt', refId: 's1', parentId: 'ep1', title: 'Pilot', text: 'I am sorry, I didn’t mean to interrupt you. Please, go on.', level: 'B1' },
  { score: 0, source: 'content', refId: 'c1#0', parentId: 'cyber', title: 'WTF is happening with Cybersecurity?', text: 'Hackers rarely break in; they log in with stolen passwords. A reliable password manager makes a huge difference.', textFr: 'Les pirates entrent rarement par effraction ; ils se connectent avec des mots de passe volés.', level: 'B2' },
  { score: 0, source: 'reading', refId: 'r2', parentId: 'work', title: 'Remote work — Decisions', text: 'Before making a decision, the team took into account the cost and the time it would take.', textFr: 'Avant de décider, l’équipe a tenu compte du coût et du temps nécessaire.', level: 'B1' },
];

function overlap(query: string, text: string) {
  const words = query.toLowerCase().match(/[a-zà-ÿ]+/g) ?? [];
  const haystack = text.toLowerCase();
  return words.filter((word) => word.length > 2 && haystack.includes(word)).length;
}

export function searchSemanticMock(query: string): SemanticResult[] {
  return semanticCorpusMock
    .map((item) => ({ ...item, score: Math.min(0.95, 0.55 + overlap(query, `${item.text} ${item.textFr ?? ''}`) * 0.1) }))
    .sort((a, b) => b.score - a.score);
}

export function wordContextsMock(word: string): WordContext[] {
  const pattern = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:s|es|ed|d|ing)?\\b`, 'i');
  return semanticCorpusMock.flatMap((item) => item.text.split(/(?<=[.!?])\s+/)
    .filter((sentence) => pattern.test(sentence))
    .map((sentence) => ({ source: item.source, parentId: item.parentId, title: item.title, sentence }))).slice(0, 3);
}

export const dailySentencesMock: DailySentences = {
  day: new Date().toISOString().slice(0, 10),
  targets: ['range', 'reliable', 'interrupt', 'decision'],
  exercises: [
    { prompt: 'Les prix vont de dix à vingt euros.', expected: 'Prices range from ten to twenty euros', hint: 'Présent simple', distractors: ['ranged', 'between', 'at'] },
    { prompt: 'C’est une collègue fiable.', expected: 'She is a reliable colleague', hint: 'Adjectif + nom', distractors: ['reliability', 'an', 'rely'] },
    { prompt: 'Je ne voulais pas t’interrompre.', expected: 'I did not mean to interrupt you', hint: 'Prétérit + to + base verbale', distractors: ['interrupting', 'meant', 'do'] },
    { prompt: 'Nous devons prendre une décision aujourd’hui.', expected: 'We have to make a decision today', hint: 'Have to + base verbale', distractors: ['take', 'decide', 'has'] },
  ],
};

export const dailyStoryMock: DailyStory = {
  day: new Date().toISOString().slice(0, 10),
  title: 'The Broken Laptop',
  textEn: 'On Monday morning, Emma’s laptop refused to start. She had a presentation at ten, so she had to make a decision quickly. Her colleague Tom, who is always reliable, offered to lend her his computer. Prices for a new laptop range from four hundred to a thousand euros, and Emma did not want to spend that much. She tried not to interrupt Tom’s work, but he insisted on helping. In the end, the presentation went well, and Emma promised to back up her files every week.',
  textFr: 'Lundi matin, l’ordinateur portable d’Emma a refusé de démarrer. Elle avait une présentation à dix heures, elle a donc dû prendre une décision rapidement. Son collègue Tom, toujours fiable, a proposé de lui prêter son ordinateur. Les prix d’un nouvel ordinateur vont de quatre cents à mille euros, et Emma ne voulait pas dépenser autant. Elle a essayé de ne pas interrompre le travail de Tom, mais il a insisté pour l’aider. Finalement, la présentation s’est bien passée, et Emma a promis de sauvegarder ses fichiers chaque semaine.',
  wordsUsed: ['decision', 'reliable', 'range', 'interrupt'],
  questions: [
    { question: 'Why did Emma need a computer quickly?', answer: 'She had a presentation at ten.' },
    { question: 'Who lent her a computer?', answer: 'Her colleague Tom.' },
    { question: 'What did Emma promise at the end?', answer: 'To back up her files every week.' },
  ],
};

export const liveAnalysisMock: LiveAnalysis = {
  summaryFr: 'Conversation fluide avec de bons connecteurs logiques. Quelques erreurs de structure reviennent souvent.',
  strengths: ['Tu relances la conversation naturellement', 'Bon usage de however et moreover'],
  errors: [
    { wrong: 'I am agree', correct: 'I agree', explanationFr: '« agree » est un verbe : pas de « am ».' },
    { wrong: 'since three years', correct: 'for three years', explanationFr: '« for » + durée, « since » + point de départ.' },
  ],
  expressions: [
    { en: 'make a decision', fr: 'prendre une décision', example: 'We need to make a decision today.' },
    { en: 'take into account', fr: 'tenir compte de', example: 'You should take the cost into account.' },
    { en: 'a win-win situation', fr: 'une situation gagnant-gagnant', example: 'This deal is a win-win situation.' },
  ],
};

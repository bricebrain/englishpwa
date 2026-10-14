import type { AssimilLesson, AssimilPreparedLesson, AssimilProgress } from '@/types/learning';

export const assimilLessonsMock: AssimilLesson[] = [
  { id: 'assimil-40', index: 40, code: 'L040', title: 'Making plans', titleEn: 'Making plans', titleFr: 'Faire des projets', level: 'B1', stageLabel: 'Consolidation', audioUrl: '', available: true, status: 'generated', artifactAvailable: true },
  { id: 'assimil-41', index: 41, code: 'L041', title: 'At the office', titleEn: 'At the office', titleFr: 'Au bureau', level: 'B1', stageLabel: 'Activation', audioUrl: '', available: true, status: 'transcript_ready', artifactAvailable: true },
  { id: 'assimil-42', index: 42, code: 'L042', title: 'A change of plan', titleEn: 'A change of plan', titleFr: 'Un changement de programme', level: 'B1', stageLabel: 'Activation', audioUrl: '', available: true, status: 'audio_ready', artifactAvailable: false },
  { id: 'assimil-70', index: 70, code: 'L070', title: 'A difficult decision', titleEn: 'A difficult decision', titleFr: 'Une décision difficile', level: 'B2', stageLabel: 'Perfectionnement', audioUrl: '', available: true, status: 'generated', artifactAvailable: true },
];

export const assimilProgressMock: AssimilProgress[] = [
  { index: 40, listened: true, guided: true, exercises: 2, kept: 2, lastAt: '2026-10-12T18:00:00Z' },
  { index: 41, listened: true, guided: false, exercises: 0, kept: 0, lastAt: '2026-10-14T18:00:00Z' },
];

export function getAssimilPreparedMock(index: number): AssimilPreparedLesson {
  const lesson = assimilLessonsMock.find((item) => item.index === index) ?? assimilLessonsMock[0]!;
  return {
    ...lesson,
    transcriptSource: 'demo',
    generatedBy: 'local-demo',
    transcript: 'Would you like to meet on Thursday? I am afraid I cannot make it then. How about Friday morning? That would be perfect.',
    artifact: {
      titleEn: lesson.titleEn ?? lesson.title,
      titleFr: lesson.titleFr ?? lesson.title,
      summaryFr: 'Un dialogue pour proposer un rendez-vous, décliner poliment et suggérer une autre solution.',
      objectives: ['Proposer une date', 'Décliner poliment', 'Utiliser “How about…?”'],
      sentences: [
        { id: 's1', textEn: 'Would you like to meet on Thursday?', textFr: 'Voudriez-vous nous voir jeudi ?', focus: 'Would you like to…?', pronunciationTipFr: 'Réduire “would you” à l’oral.' },
        { id: 's2', textEn: 'I am afraid I cannot make it then.', textFr: 'J’ai bien peur de ne pas pouvoir à ce moment-là.', focus: 'I am afraid…', pronunciationTipFr: 'Lier “cannot” et “make it”.' },
      ],
      exercises: [
        { id: 'e1', type: 'fill_blank', instructionFr: 'Complétez la phrase.', items: [{ prompt: 'How ___ Friday morning?', answer: 'about', hintFr: 'Pour faire une suggestion.' }] },
        { id: 'e2', type: 'translation', instructionFr: 'Traduisez en anglais.', items: [{ prompt: 'Cela me conviendrait parfaitement.', answer: 'That would be perfect', hintFr: 'Utilisez would.' }] },
      ],
      recyclingTargets: [
        { term: 'make it', reasonFr: 'Expression très fréquente pour parler de disponibilité.', skill: 'vocabulary' },
        { term: 'How about…?', reasonFr: 'Structure utile pour proposer une alternative.', skill: 'grammar' },
      ],
    },
  };
}
